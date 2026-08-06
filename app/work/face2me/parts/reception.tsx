"use client";

import { useEffect, type RefObject } from "react";
import {
  emitReception,
  onReception,
  installDevHook,
  type CardTopic,
} from "./reception-events";

/**
 * The call itself. This file is the only place that knows Daily and the
 * Tavus interactions protocol; everything it learns it repeats onto the
 * reception bus, and the only bus messages it acts on are UI intents
 * (hangup-request, left-stage, lead-submitted).
 *
 * Camera goes on with the mic — one permission prompt, like walking up to
 * a kiosk that can see you. Denial is not an error: the call proceeds
 * voice-only and Tavus's perception degrades softly.
 */

type TavusMessage = {
  message_type?: string;
  event_type?: string;
  conversation_id?: string;
  properties?: Record<string, unknown>;
};

type DailyCall = {
  join: (o: { url: string }) => Promise<unknown>;
  leave: () => Promise<unknown>;
  destroy: () => void;
  participants: () => Record<string, { session_id: string; local: boolean }>;
  sendAppMessage: (msg: unknown, to: string) => void;
  on: (ev: string, fn: (e?: any) => void) => void;
};

const CARD_TOPICS: readonly CardTopic[] = ["pricing", "spec", "languages", "bundle"];

export function Reception({ callBtnRef }: { callBtnRef: RefObject<HTMLButtonElement | null> }) {
  useEffect(() => {
    installDevHook();
    const btn = callBtnRef.current;
    let call: DailyCall | null = null;
    let conversationId = "";
    let busy = false;
    let callGen = 0; // bumps on every wake AND every hangup: a stale wake sees it move
    let disposed = false;
    const video = document.createElement("video");
    video.muted = false;
    video.playsInline = true;

    const send = (event_type: string, properties: Record<string, unknown>) => {
      call?.sendAppMessage(
        { message_type: "conversation", event_type, conversation_id: conversationId, properties },
        "*",
      );
    };

    if (process.env.NODE_ENV !== "production") {
      // rehearsal-only remote: lets a script talk to the live agent by text
      // and hang up, without a microphone (fake-media diagnostic calls)
      (window as unknown as Record<string, unknown>).__renLive = {
        say: (text: string) => send("conversation.respond", { text }),
        hangup: () => emitReception({ type: "hangup-request" }),
      };
    }

    const hangUp = (phase: "over" | "closed" = "over", reason?: "minutes" | "denied") => {
      if (!call && !busy) return; // reentrant guard: absorbs destroy()'s own leave echo and idle no-ops
      callGen++;
      const c = call;
      call = null;
      busy = false;
      video.srcObject = null;
      emitReception({ type: "selfview", stream: null });
      emitReception({ type: "dismiss" });
      emitReception({ type: "phase", phase, reason });
      c?.destroy();
    };

    const onMessage = (msg: TavusMessage) => {
      // dev wiretap: the protocol docs and the live account disagreed once
      // already (closed captions) — log every frame so mismatches show
      // themselves instead of being guessed at
      if (process.env.NODE_ENV !== "production") {
        console.log("[tavus:in]", JSON.stringify(msg).slice(0, 600));
      }
      const p = msg.properties ?? {};
      switch (msg.event_type) {
        case "conversation.tool_call": {
          const name = String(p.name ?? "");
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(String(p.arguments ?? "{}"));
          } catch {}
          if (name === "show_card") {
            const topic = args.topic as CardTopic;
            if (CARD_TOPICS.includes(topic)) emitReception({ type: "card", card: topic });
          } else if (name === "open_lead_form") {
            emitReception({ type: "lead-form" });
          } else if (name === "dismiss_cards") {
            emitReception({ type: "dismiss" });
          }
          send("conversation.tool_result", {
            tool_call_id: p.tool_call_id,
            output: "shown",
            status: "success",
          });
          break;
        }
        case "conversation.utterance.streaming":
        case "conversation.utterance": {
          const who = p.role === "user" ? "user" : "pal"; // "pal" | legacy "replica"
          emitReception({ type: "caption", who, text: String(p.speech ?? "") });
          break;
        }
        case "conversation.started_speaking":
        case "conversation.stopped_speaking": {
          const who = p.role === "user" ? "user" : "pal";
          emitReception({
            type: "speaking",
            who,
            on: msg.event_type === "conversation.started_speaking",
            interrupted: p.interrupted === true,
          });
          break;
        }
        case "system.shutdown":
          hangUp("over");
          break;
      }
    };

    const wake = async () => {
      if (busy) return;
      busy = true;
      const gen = ++callGen; // this wake's ticket; any hangup or newer wake voids it
      emitReception({ type: "phase", phase: "connecting" });

      let url = "";
      let cap = 180;
      try {
        const res = await fetch("/api/reception", { method: "POST" });
        if (!res.ok) throw new Error("closed");
        const data = (await res.json()) as { url: string; id?: string; seconds?: number };
        url = data.url;
        conversationId = data.id ?? "";
        cap = data.seconds ?? 180;
      } catch {
        busy = false;
        // the pool is dry: the desk closes honestly, the note still works
        emitReception({ type: "phase", phase: "closed", reason: "minutes" });
        return;
      }
      // cancelled mid-fetch (unmount, a hangup, or a newer call superseding this one)
      if (disposed || gen !== callGen) return;

      try {
        const { default: Daily } = await import("@daily-co/daily-js");
        if (disposed || gen !== callGen) return;
        // camera on by request; if the visitor denies it, Daily falls back
        // to mic-only on its own — denial must not kill the call
        const frame = Daily.createCallObject({
          audioSource: true,
          videoSource: true,
          dailyConfig: { userMediaVideoConstraints: { width: 640, height: 480 } },
        }) as unknown as DailyCall;
        call = frame;
        let announced = false;

        frame.on("track-started", (ev) => {
          if (frame !== call) return;
          if (!ev?.participant) return;
          if (ev.participant.local) {
            if (ev.track.kind === "video")
              emitReception({ type: "selfview", stream: new MediaStream([ev.track]) });
            return;
          }
          if (ev.track.kind !== "video") return;
          if (announced) return; // a mid-call video track restart must not re-announce live
          announced = true;
          video.srcObject = new MediaStream([ev.track]);
          void video.play();
          emitReception({ type: "video", el: video });
          emitReception({ type: "phase", phase: "live", seconds: cap });
        });
        frame.on("app-message", (ev) => {
          if (frame !== call) return;
          onMessage(ev?.data ?? {});
        });
        frame.on("left-meeting", () => {
          if (frame !== call) return;
          hangUp("over");
        });
        // a call that breaks mid-air ends like a call that ended (spec §8):
        // "over", with the form as the standing invitation — not "closed"
        frame.on("error", () => {
          if (frame !== call) return;
          hangUp("over");
        });

        await frame.join({ url });
        if (disposed || gen !== callGen) {
          frame.destroy();
          if (call === frame) call = null;
          return;
        }
      } catch (err) {
        // denied permissions get their own honest word; anything else is a
        // dropped call. hangUp is safe to skip if a bus hangup already ran
        // (the generation moved on), so no double phase emit.
        if (!disposed && gen === callGen) {
          const denied = /NotAllowed|Permission|denied/i.test(String(err));
          if (denied) hangUp("closed", "denied");
          else hangUp("over");
        }
      }
    };

    const offBus = onReception((d) => {
      if (d.type === "hangup-request") hangUp("over");
      else if (d.type === "call-request") void wake();
      else if (d.type === "left-stage") hangUp("over");
      else if (d.type === "lead-submitted") {
        send("conversation.respond", {
          text:
            `I just submitted the contact form. Name: ${d.name}, email: ${d.email}` +
            (d.note ? `, my place: ${d.note}` : "") +
            `. Please confirm you got it.`,
        });
      }
    });

    const onClick = () => void wake();
    btn?.addEventListener("click", onClick);

    return () => {
      disposed = true;
      btn?.removeEventListener("click", onClick);
      offBus();
      call?.destroy();
    };
    // refs are stable for the life of the hero
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

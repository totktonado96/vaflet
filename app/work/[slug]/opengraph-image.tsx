import { ImageResponse } from "next/og";
import { PROJECTS } from "@/lib/projects";

export const alt = "Vaflet LLC case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000",
          color: "#fff",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <span>Vaflet LLC</span>
          <span>{p?.year ?? "Selected work"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 118,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
            }}
          >
            {p?.title ?? "Selected work"}
          </span>
          <span
            style={{
              marginTop: 24,
              fontSize: 34,
              fontWeight: 300,
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            {p?.desc ?? "Design, code and AI under one roof."}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {(p?.tags ?? []).map((tag) => (
            <span
              key={tag}
              style={{
                border: "2px solid #fff",
                borderRadius: 999,
                padding: "10px 22px",
                background: tag === "Open source" ? "#fff" : "transparent",
                color: tag === "Open source" ? "#000" : "#fff",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

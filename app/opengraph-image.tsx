import { ImageResponse } from "next/og";

export const alt = "Vaflet LLC — Design. Code. AI. End-to-end.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            alignItems: "center",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <span>Vaflet LLC</span>
          <span>New Jersey, USA</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            We build
            <span
              style={{
                width: 148,
                height: 64,
                borderRadius: 999,
                background: "#fff",
                marginLeft: 26,
              }}
            />
          </span>
          <span>digital products</span>
          <span>end-to-end</span>
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
          {["Design", "Code", "AI agents", "Automation"].map((tag) => (
            <span
              key={tag}
              style={{
                border: "2px solid #fff",
                borderRadius: 999,
                padding: "10px 22px",
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

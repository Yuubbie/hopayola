import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hopayola — Plan and coordinate your fashion project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 30%, #3D1D5C 0%, #0A0A0A 75%)",
          color: "#FAFAF8",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 600, display: "flex" }}>
          Hopayola
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#C9A9E8",
            marginTop: 24,
            display: "flex",
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          Your fashion idea, planned and coordinated from start to finish.
        </div>
      </div>
    ),
    { ...size }
  );
}
import { SITE_SHORT_DESCRIPTION } from "@/lib/site";

export function SocialCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f8f7ff 0%, #ecebff 44%, #e7f4ff 100%)",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
        padding: "64px 70px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 430,
          height: 430,
          borderRadius: 999,
          top: -240,
          left: -150,
          background: "rgba(124, 116, 255, 0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 999,
          right: -190,
          bottom: -320,
          background: "rgba(56, 189, 248, 0.16)",
        }}
      />

      <div
        style={{
          width: "64%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(145deg, #7c74ff, #4c46e5)",
              boxShadow: "0 18px 42px rgba(76, 70, 229, 0.28)",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 64 64" fill="none">
              <rect x="23" y="8" width="18" height="32" rx="9" fill="white" />
              <path
                d="M15 31C15 40.4 22.6 48 32 48C41.4 48 49 40.4 49 31"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M32 48V57M24 57H40"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2 }}>
              Bolo
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#5b5bd6",
                letterSpacing: 2.5,
              }}
            >
              VOICE-FIRST COMMUNICATION
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -4,
            }}
          >
            <span>Speak. Listen.</span>
            <span style={{ color: "#5b52e8" }}>Connect.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: "#4b5563",
              maxWidth: 650,
            }}
          >
            {SITE_SHORT_DESCRIPTION}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Speech → Text", "Paste → Voice", "One-tap Copy"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 18px",
                borderRadius: 999,
                border: "1px solid rgba(91, 82, 232, 0.20)",
                background: "rgba(255, 255, 255, 0.72)",
                color: "#34336e",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 68,
          top: 82,
          width: 330,
          height: 468,
          borderRadius: 48,
          border: "2px solid rgba(99, 91, 255, 0.16)",
          background: "rgba(255, 255, 255, 0.86)",
          boxShadow: "0 34px 80px rgba(50, 49, 120, 0.20)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            width: 174,
            height: 174,
            borderRadius: 999,
            border: "9px solid white",
            background: "linear-gradient(145deg, #7c74ff, #4c46e5)",
            boxShadow: "0 24px 54px rgba(76, 70, 229, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="94" height="94" viewBox="0 0 64 64" fill="none">
            <rect x="23" y="8" width="18" height="32" rx="9" fill="white" />
            <path
              d="M15 31C15 40.4 22.6 48 32 48C41.4 48 49 40.4 49 31"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M32 48V57M24 57H40"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 10 }}>
          {[24, 42, 58, 34, 52, 30, 46].map((height, index) => (
            <div
              key={`${height}-${index}`}
              style={{
                width: 9,
                height,
                borderRadius: 999,
                background: index % 2 === 0 ? "#786cff" : "#a49cff",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            padding: "11px 20px",
            borderRadius: 999,
            background: "#eef0ff",
            color: "#4c46b8",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Free • Accessible • Simple
        </div>
      </div>
    </div>
  );
}

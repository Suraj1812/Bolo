export function BrandIcon({ iconSize }: { iconSize: number }) {
  const microphoneSize = Math.round(iconSize * 0.58);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: Math.round(iconSize * 0.245),
        background: "linear-gradient(145deg, #8178ff 0%, #4c46e5 100%)",
      }}
    >
      <svg
        width={microphoneSize}
        height={microphoneSize}
        viewBox="0 0 64 64"
        fill="none"
      >
        <rect x="23" y="7" width="18" height="33" rx="9" fill="white" />
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
  );
}


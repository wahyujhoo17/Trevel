export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.15]">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="flight-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 0L0 10v10l20-10L40 20V10L20 0z"
              fill="currentColor"
              className="text-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#flight-pattern)" />
      </svg>
    </div>
  );
}

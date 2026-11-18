/**
 * Campus Basket spinner: a ring whose tail fades in to a bright round head.
 * tone "brand"  → leaf-green tail, yolk head (on light backgrounds)
 * tone "onDark" → white tail, yolk head (on green/dark buttons and photos)
 * tone "current"→ follows the surrounding text colour (inside outlined/light buttons)
 */
export function Spinner({
  size = 40,
  tone = "brand",
  label = "Loading",
  className = "",
}: {
  size?: number;
  tone?: "brand" | "onDark" | "current";
  label?: string;
  className?: string;
}) {
  const colors =
    tone === "brand"
      ? { color: "#2f9a57", ["--cb-head" as string]: "#f6b92b" }
      : tone === "onDark"
        ? { color: "#ffffff", ["--cb-head" as string]: "#f6b92b" }
        : { ["--cb-head" as string]: "currentColor" };
  return (
    <span
      role="status"
      aria-label={label}
      className={`cb-spinner ${className}`}
      style={{ ["--cb-s" as string]: `${size}px`, ...colors }}
    >
      <span className="cb-spinner-head" aria-hidden />
    </span>
  );
}

/** Full-area loader for route loading screens: just a small spinner, centred. */
export function PageLoader({ label = "Loading", dark = false, full = false }: { label?: string; dark?: boolean; full?: boolean }) {
  return (
    <div className={`grid place-items-center ${full ? "min-h-svh" : "min-h-[60svh]"}`}>
      <Spinner size={26} tone={dark ? "onDark" : "brand"} label={label} />
    </div>
  );
}

/** Inline "spinner + text" for buttons while something saves. */
export function Busy({ text, tone = "onDark" }: { text: string; tone?: "brand" | "onDark" | "current" }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Spinner size={16} tone={tone} label={text} />
      {text}
    </span>
  );
}

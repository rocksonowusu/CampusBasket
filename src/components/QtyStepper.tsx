"use client";

export function QtyStepper({
  qty,
  max,
  onChange,
  size = "md",
}: {
  qty: number;
  max: number;
  onChange: (q: number) => void;
  size?: "sm" | "md";
}) {
  const btn =
    size === "sm"
      ? "h-7 w-7 text-base"
      : "h-9 w-9 text-lg";
  return (
    <div className="flex items-center rounded-full border-2 border-forest bg-white">
      <button
        type="button"
        aria-label="Remove one"
        onClick={() => onChange(qty - 1)}
        className={`${btn} grid place-items-center rounded-full font-bold text-forest hover:bg-mint`}
      >
        −
      </button>
      <span className="min-w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Add one"
        disabled={qty >= max}
        onClick={() => onChange(qty + 1)}
        className={`${btn} grid place-items-center rounded-full font-bold text-forest hover:bg-mint disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}

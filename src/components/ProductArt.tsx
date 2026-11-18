import type { ArtKind } from "@/lib/types";

// Flat, hand-built illustrations so the MVP doesn't depend on stock photos.
// Drop real photos in /public/products and set `image` on a product to replace these.

const INK = "#18201b";
const stroke = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Shadow() {
  return <ellipse cx="60" cy="104" rx="34" ry="5" fill={INK} opacity="0.12" />;
}

const arts: Record<ArtKind, React.ReactNode> = {
  tomato: (
    <>
      <Shadow />
      <path d="M60 36c22 0 36 14 36 32s-15 32-36 32-36-14-36-32 14-32 36-32z" fill="#e0483b" {...stroke} />
      <path d="M44 56c3-6 8-9 14-10" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" fill="none" />
      <path d="M60 42l-9-8 10 3 4-9 2 10 10-2-8 7" fill="#2e7d4a" {...stroke} />
      <path d="M60 36v-8" {...stroke} fill="none" />
    </>
  ),
  onion: (
    <>
      <Shadow />
      <path d="M60 24c4 12 34 26 34 50 0 16-14 26-34 26S26 90 26 74c0-24 30-38 34-50z" fill="#9b3b5a" {...stroke} />
      <path d="M60 30c-6 14-20 28-20 46M60 30c6 14 20 28 20 46M60 32v62" stroke="#f3c9d6" strokeWidth="2" fill="none" opacity=".7" />
      <path d="M56 100l-2 6M60 100v7M64 100l2 6" {...stroke} fill="none" />
    </>
  ),
  pepper: (
    <>
      <Shadow />
      <path
        d="M34 62c0-12 10-18 26-18s26 6 26 18c0 6-3 9-3 14 0 6 3 10 0 16-4 8-14 10-23 10s-19-2-23-10c-3-6 0-10 0-16 0-5-3-8-3-14z"
        fill="#f28c28"
        {...stroke}
      />
      <path d="M46 56c-3 8-3 22 0 34M74 56c3 8 3 22 0 34" stroke={INK} strokeWidth="1.8" opacity=".35" fill="none" />
      <path d="M50 46c4-4 16-4 20 0l-4 4h-12z" fill="#2e7d4a" {...stroke} />
      <path d="M60 44c0-8 4-14 10-16" {...stroke} fill="none" />
    </>
  ),
  carrot: (
    <>
      <Shadow />
      <path d="M48 40c8-6 24-4 26 6L58 102c-3 3-6 2-6-2L44 48c0-3 1-6 4-8z" fill="#f08a24" {...stroke} />
      <path d="M50 58h8M54 72h7M54 86h5" {...stroke} fill="none" />
      <path d="M58 40c-6-10-14-14-18-14 2 8 8 14 18 14zM62 38c0-12 6-18 12-20 0 10-4 16-12 20zM66 42c6-8 16-10 22-8-4 6-12 10-22 8z" fill="#2e7d4a" {...stroke} />
    </>
  ),
  cabbage: (
    <>
      <Shadow />
      <circle cx="60" cy="66" r="36" fill="#9fd08a" {...stroke} />
      <path d="M60 32c-14 10-18 26-14 46M60 32c14 10 18 26 14 46M30 70c10-6 22-6 30 4 8-10 20-10 30-4" stroke="#2e7d4a" strokeWidth="2.5" fill="none" />
      <path d="M40 46c6-4 14-4 20 2 6-6 14-6 20-2" stroke="#fff" strokeWidth="3" opacity=".5" fill="none" strokeLinecap="round" />
    </>
  ),
  leaf: (
    <>
      <Shadow />
      <path d="M58 102c-4-24-20-34-28-58 18 2 30 16 32 40" fill="#3f9a5c" {...stroke} />
      <path d="M62 102c2-30 12-48 30-62 2 24-12 44-28 52" fill="#2e7d4a" {...stroke} />
      <path d="M60 102c0-34 0-56 2-74 10 14 12 40 2 60" fill="#56b06f" {...stroke} />
      <rect x="50" y="92" width="22" height="8" rx="2" fill="#f6b92b" {...stroke} />
    </>
  ),
  plantain: (
    <>
      <Shadow />
      <path d="M28 44c8 30 30 52 62 50 4 0 4-6 0-6-26-2-44-20-54-46-2-4-9-2-8 2z" fill="#e8b81f" {...stroke} />
      <path d="M36 38c12 28 32 44 58 42 4 0 4-6 0-6-22-2-38-16-50-40-2-4-9 0-8 4z" fill="#f2c94c" {...stroke} />
      <path d="M44 32c14 24 30 36 52 34 4 0 4-6 0-6-18-2-32-12-45-32-2-4-9 0-7 4z" fill="#f6d36b" {...stroke} />
      <path d="M28 44l-4-6M36 38l-4-6M44 32l-3-6" stroke="#5a3a1a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="64" cy="76" r="2" fill="#5a3a1a" />
      <circle cx="72" cy="64" r="2" fill="#5a3a1a" />
    </>
  ),
  banana: (
    <>
      <Shadow />
      <path d="M34 34c-4 34 18 62 54 60 4 0 4-7 0-7-26-2-44-24-44-52 0-4-10-5-10-1z" fill="#ffd84d" {...stroke} />
      <path d="M46 30c0 30 16 50 44 50 4 0 4-7 0-7-22-2-34-20-34-42 0-4-10-5-10-1z" fill="#ffe27a" {...stroke} />
      <path d="M36 34l2-10M48 30l2-10" stroke="#4b3a1a" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  orange: (
    <>
      <Shadow />
      <circle cx="60" cy="68" r="32" fill="#f39a1e" {...stroke} />
      <circle cx="48" cy="58" r="2" fill="#c96f05" />
      <circle cx="70" cy="80" r="2" fill="#c96f05" />
      <circle cx="56" cy="84" r="2" fill="#c96f05" />
      <circle cx="74" cy="60" r="2" fill="#c96f05" />
      <path d="M60 36c4-10 14-14 24-12-4 10-14 14-24 12z" fill="#2e7d4a" {...stroke} />
      <path d="M44 54c3-6 8-8 12-9" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".5" fill="none" />
    </>
  ),
  pineapple: (
    <>
      <Shadow />
      <path d="M60 48c-10-6-14-16-12-24 6 4 10 10 12 16 2-8 6-16 12-20 0 8-2 16-6 22 6-4 14-4 18 0-8 4-16 8-24 6z" fill="#2e7d4a" {...stroke} />
      <ellipse cx="60" cy="76" rx="26" ry="28" fill="#e9a825" {...stroke} />
      <path d="M40 60l40 40M36 76l28 28M48 50l36 36M80 60L40 100M84 76l-28 28M72 50L36 86" stroke="#9a5d12" strokeWidth="1.8" opacity=".7" />
    </>
  ),
  sack: (
    <>
      <Shadow />
      <path d="M34 44c-6 18-8 40-4 56h60c4-16 2-38-4-56z" fill="#d9c39a" {...stroke} />
      <path d="M38 44c4-8 8-12 10-18h24c2 6 6 10 10 18z" fill="#cdb284" {...stroke} />
      <path d="M44 42h32" stroke="#a6461d" strokeWidth="5" strokeLinecap="round" />
      <rect x="42" y="62" width="36" height="22" rx="3" fill="#fbf8f1" {...stroke} />
      <path d="M48 70h24M48 77h16" stroke="#2e7d4a" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  egg: (
    <>
      <Shadow />
      <path d="M40 48c8 0 14 14 14 26s-6 22-14 22-14-10-14-22 6-26 14-26z" fill="#f3e3c3" {...stroke} />
      <path d="M80 48c8 0 14 14 14 26s-6 22-14 22-14-10-14-22 6-26 14-26z" fill="#e9cfa1" {...stroke} />
      <path d="M60 34c9 0 16 16 16 30s-7 26-16 26-16-12-16-26 7-30 16-30z" fill="#fff8ea" {...stroke} />
      <path d="M52 52c2-6 5-9 8-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
    </>
  ),
  bottle: (
    <>
      <Shadow />
      <rect x="52" y="20" width="16" height="10" rx="2" fill="#2e7d4a" {...stroke} />
      <path d="M54 30h12v10c10 6 14 14 14 24v34c0 3-2 5-5 5H45c-3 0-5-2-5-5V64c0-10 4-18 14-24z" fill="#f6c94a" {...stroke} />
      <rect x="44" y="64" width="32" height="22" rx="2" fill="#fbf8f1" {...stroke} />
      <path d="M50 72h20M50 79h12" stroke="#e0483b" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  bread: (
    <>
      <Shadow />
      <path d="M24 72c0-20 16-32 36-32s36 12 36 32v22c0 3-2 6-6 6H30c-4 0-6-3-6-6z" fill="#d68a3c" {...stroke} />
      <path d="M40 50l6 10M56 46l4 12M72 48l2 12" stroke="#8a4b17" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 64c4-10 12-16 22-18" stroke="#f3c48a" strokeWidth="4" strokeLinecap="round" opacity=".7" fill="none" />
    </>
  ),
  jar: (
    <>
      <Shadow />
      <rect x="40" y="28" width="40" height="12" rx="3" fill="#e0483b" {...stroke} />
      <path d="M38 40h44c4 0 6 4 6 8v46c0 4-3 8-8 8H40c-5 0-8-4-8-8V48c0-4 2-8 6-8z" fill="#7a3b1c" {...stroke} />
      <rect x="38" y="58" width="44" height="26" rx="3" fill="#fbf8f1" {...stroke} />
      <path d="M46 67h28M46 75h18" stroke="#2e7d4a" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  box: (
    <>
      <Shadow />
      <circle cx="46" cy="48" r="14" fill="#e0483b" {...stroke} />
      <path d="M66 50c-2-14 4-22 12-26 2 10-2 20-12 26zM70 52c4-10 14-14 22-12-4 8-12 12-22 12z" fill="#2e7d4a" {...stroke} />
      <path d="M56 54c10-14 22-18 30-14" fill="none" {...stroke} />
      <path d="M58 40l18 6" stroke="#f6b92b" strokeWidth="7" strokeLinecap="round" />
      <path d="M22 56h76l-6 44H28z" fill="#c9a26b" {...stroke} />
      <path d="M22 56l8-10h60l8 10" fill="#b38a52" {...stroke} />
      <rect x="44" y="70" width="32" height="16" rx="2" fill="#fbf8f1" {...stroke} />
      <path d="M50 78h20" stroke="#2e7d4a" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  chicken: (
    <>
      <Shadow />
      <path d="M44 62c-6-10-8-22-2-30 6 2 10 14 10 24" fill="#d98b42" {...stroke} />
      <path d="M76 62c6-10 8-22 2-30-6 2-10 14-10 24" fill="#d98b42" {...stroke} />
      <circle cx="40" cy="30" r="4" fill="#fbf8f1" {...stroke} />
      <circle cx="80" cy="30" r="4" fill="#fbf8f1" {...stroke} />
      <path d="M22 76c0-14 16-22 38-22s38 8 38 22c0 14-16 24-38 24S22 90 22 76z" fill="#e7a35b" {...stroke} />
      <path d="M34 70c8-6 18-8 28-8" stroke="#f9d6a8" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M20 96h80" {...stroke} fill="none" />
      <path d="M24 96c4 6 10 8 36 8s32-2 36-8" fill="#fbf8f1" {...stroke} />
    </>
  ),
  beans: (
    <>
      <Shadow />
      {[
        [38, 70, -20],
        [56, 62, 15],
        [74, 72, -10],
        [48, 86, 30],
        [66, 88, -25],
        [84, 86, 10],
        [32, 88, 5],
        [60, 76, 0],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="10" ry="7" fill="#f3ead3" {...stroke} strokeWidth={2} />
          <ellipse cx={x} cy={y} rx="3" ry="2.2" fill={INK} />
        </g>
      ))}
    </>
  ),
};

const tints: Record<string, string> = {
  boxes: "#f1e4c9",
  veg: "#e3f1dc",
  fruit: "#fff0c9",
  grains: "#f3e8d8",
  protein: "#fdeee0",
  pantry: "#f9e3dc",
};

export function ProductArt({
  art,
  category,
  image,
  alt,
  className = "",
}: {
  art: ArtKind;
  category?: string;
  image?: string;
  alt: string;
  className?: string;
}) {
  const bg = tints[category ?? ""] ?? "#eef6ea";
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} style={{ background: bg }} />;
  }
  return (
    <div className={`grid place-items-center ${className}`} style={{ background: bg }} role="img" aria-label={alt}>
      <svg viewBox="0 0 120 120" className="h-[78%] w-[78%]" aria-hidden>
        {arts[art]}
      </svg>
    </div>
  );
}

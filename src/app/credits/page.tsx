import type { Metadata } from "next";
import credits from "../../../public/photos/credits.json";

export const metadata: Metadata = { title: "Photo credits · Campus Basket" };

interface Credit {
  file: string;
  title: string;
  artist: string;
  license: string;
  licenseUrl?: string;
  page: string;
}

export default function CreditsPage() {
  const list = credits as Credit[];
  return (
    <div className="wrap max-w-4xl py-14">
      <p className="font-hand text-2xl text-leaf">Thank you</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-forest">Photo credits</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Photos on this site come from Wikimedia Commons and Openverse and are used under the licences listed below.
        Swap them for your own photos of the real produce whenever you have them.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.file} className="flex gap-3 rounded-xl bg-white p-3 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/photos/${c.file}`} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
            <div className="min-w-0 text-sm">
              <a href={c.page} target="_blank" rel="noreferrer" className="block truncate font-semibold hover:text-leaf">
                {c.title}
              </a>
              <p className="truncate text-muted">by {c.artist || "unknown"}</p>
              {c.licenseUrl ? (
                <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="text-xs text-leaf hover:underline">
                  {c.license}
                </a>
              ) : (
                <span className="text-xs text-leaf">{c.license}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

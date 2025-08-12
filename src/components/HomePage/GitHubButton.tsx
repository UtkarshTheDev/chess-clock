"use client";

import { useEffect, useMemo, useState } from "react";
import { Github, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface GitHubButtonProps {
  owner?: string;
  repo?: string;
  className?: string;
}

// Compact formatter: 1200 -> 1.2k
const formatStars = (n: number | null) => {
  if (n == null) return "—";
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n % 1000 < 100 ? 1 : 1)}k`;
};

export default function GitHubButton({
  owner = "UtkarshTheDev",
  repo = "ChessTicks",
  className,
}: GitHubButtonProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const repoUrl = useMemo(() => `https://github.com/${owner}/${repo}`, [owner, repo]);

  useEffect(() => {
    let cancelled = false;
    const fetchStars = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
          cache: "force-cache",
        });
        if (!res.ok) throw new Error("Failed to fetch stars");
        const data = (await res.json()) as { stargazers_count?: number };
        if (!cancelled) setStars(data.stargazers_count ?? null);
      } catch {
        if (!cancelled) setStars(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStars();
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-3 rounded-lg",
        "border border-neutral-700/50 bg-neutral-900/40 backdrop-blur",
        "px-3.5 py-2 text-sm text-neutral-100 hover:bg-neutral-900/65",
        "shadow-sm hover:shadow transition-all duration-300",
        "outline-none ring-0 focus-visible:ring-2 focus-visible:ring-white/15",
        "relative overflow-hidden",
        className
      )}
      aria-label="Star ChessTicks on GitHub"
    >
      {/* Subtle rainbow line at the bottom */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-70 group-hover:opacity-100"
      />

      <Github className="size-4 text-neutral-200" />
      <span className="font-medium">Star on GitHub</span>

      <span className="ml-2 inline-flex items-center gap-1 text-neutral-200/90">
        <Star className="size-4 text-amber-400" />
        <span className="tabular-nums font-semibold">
          {loading ? "—" : formatStars(stars)}
        </span>
      </span>
    </a>
  );
}


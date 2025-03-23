import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(duration: string) {
  // Example duration: "PT2H30M"
  const hours = duration.match(/(\d+)H/)?.[1] || "0";
  const minutes = duration.match(/(\d+)M/)?.[1] || "0";

  return `${hours}h ${minutes}m`;
}

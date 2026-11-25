const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function resolveMediaUrl(
  pathOrUrl?: string | null,
  fallbackBase = API_BASE_URL,
): string {
  if (!pathOrUrl) return "";
  const trimmed = pathOrUrl.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const cleanBase = fallbackBase.replace(/\/$/, "");
  const cleanPath = trimmed.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

export function formatFileSizeKb(sizeKb: number): string {
  if (!sizeKb || sizeKb <= 0) return "0 KB";
  if (sizeKb < 1024) return `${Math.round(sizeKb)} KB`;
  const mb = sizeKb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

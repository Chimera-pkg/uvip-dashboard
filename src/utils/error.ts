import { isAxiosError } from "axios";

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ detail?: unknown; message?: unknown }>(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    const msg = err.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) {
      return msg;
    }
    if (err.message) {
      return err.message;
    }
  } else if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

import { useState, useCallback } from "react";
import { message } from "antd";
import { streetVideosService } from "../api/street-videos.service";
import type { PaginatedStreetVideos } from "../api/street-videos.service";

export function useStreetVideos() {
  const [data, setData] = useState<PaginatedStreetVideos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreetVideos = useCallback(
    async (projectId: string, page = 1, size = 10) => {
      setLoading(true);
      setError(null);
      try {
        const response = await streetVideosService.getStreetVideos(
          projectId,
          page,
          size,
        );
        setData(response);
      } catch (err: any) {
        console.error("Fetch street videos error:", err);
        const errMsg =
          err.response?.data?.detail || "Failed to fetch street videos";
        setError(errMsg);
        message.error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    data,
    loading,
    error,
    fetchStreetVideos,
  };
}

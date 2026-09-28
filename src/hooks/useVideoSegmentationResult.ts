import { useState, useCallback } from "react";
import { videoSegmentationResultsService } from "../api/video-segmentation-results.service";
import { message } from "antd";

export function useVideoSegmentationResult() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideoSegmentationResult = useCallback(async (videoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result =
        await videoSegmentationResultsService.getByVideoId(videoId);
      setData(result);
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.detail ||
        "Failed to fetch video segmentation result";
      setError(errMsg);
      message.error(errMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchVideoSegmentationResult };
}

import { useState, useCallback } from "react";
import { segmentationResultsService } from "../api/segmentation-results.service";
import type { SegmentationResult } from "../api/segmentation-results.service";
import { message } from "antd";

export function useSegmentationResult() {
  const [data, setData] = useState<SegmentationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSegmentationResult = useCallback(async (photoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await segmentationResultsService.getByPhotoId(photoId);
      setData(result);
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.detail || "Failed to fetch segmentation result";
      setError(errMsg);
      message.error(errMsg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchSegmentationResult };
}

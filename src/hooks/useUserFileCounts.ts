import { useState, useCallback, useRef, useEffect } from "react";
import { streetPhotosService } from "../api/street-photos.service";
import { streetVideosService } from "../api/street-videos.service";
import { getApiErrorMessage } from "../utils/error";

const MEDIA_PAGE_SIZE = 100;
const CONCURRENT_BATCH_SIZE = 5;

export interface UserMediaItem {
  id: string;
  mediaType: "photo" | "video";
  originalFilename: string;
  filePath: string;
  fileSizeKb: number;
  streetName: string | null;
  projectName: string | null;
  projectId: string | null;
  source: string;
  processingStatus: string;
  capturedAt: string;
  createdAt: string;
}

export interface UserFileStats {
  userId: string;
  photoCount: number;
  videoCount: number;
  totalFiles: number;
  photoSizeKb: number;
  videoSizeKb: number;
  totalSizeKb: number;
  lastUploadAt: string | null;
  files: UserMediaItem[];
}

export interface FileCountSummary {
  totalPhotos: number;
  totalVideos: number;
  totalFiles: number;
  totalPhotoSizeKb: number;
  totalVideoSizeKb: number;
  totalSizeKb: number;
}

export interface CountProgress {
  loadedPages: number;
  totalPages: number;
}

interface PaginatedMediaResponse<T> {
  total_data: number;
  total_pages: number;
  current_page: number;
  data: T[];
}

interface RawMediaRecord {
  id: string;
  uploaded_by?: string | null;
  project_id?: string | null;
  source?: string;
  original_filename?: string | null;
  file_path?: string;
  file_size_kb?: number | null;
  street_name?: string | null;
  processing_status?: string;
  captured_at?: string;
  created_at?: string;
  project?: {
    name?: string;
  } | null;
}

function createEmptyStats(userId: string): UserFileStats {
  return {
    userId,
    photoCount: 0,
    videoCount: 0,
    totalFiles: 0,
    photoSizeKb: 0,
    videoSizeKb: 0,
    totalSizeKb: 0,
    lastUploadAt: null,
    files: [],
  };
}

/**
 * Fetch all pages for a paginated media endpoint with bounded concurrency.
 */
async function fetchAllMediaPages<T>(
  fetchPage: (page: number, size: number) => Promise<PaginatedMediaResponse<T>>,
  onPageLoaded: (totalPagesHint: number) => void,
  isCancelled: () => boolean,
): Promise<{ items: T[]; totalData: number }> {
  const firstPage = await fetchPage(1, MEDIA_PAGE_SIZE);
  if (isCancelled()) return { items: [], totalData: 0 };

  const totalPages = Math.max(1, firstPage.total_pages || 1);
  onPageLoaded(totalPages);

  const items: T[] = [...(firstPage.data || [])];

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, idx) => idx + 2,
    );

    for (let i = 0; i < remainingPages.length; i += CONCURRENT_BATCH_SIZE) {
      if (isCancelled()) return { items: [], totalData: 0 };
      const batch = remainingPages.slice(i, i + CONCURRENT_BATCH_SIZE);
      const responses = await Promise.all(
        batch.map(async (page) => {
          const res = await fetchPage(page, MEDIA_PAGE_SIZE);
          onPageLoaded(0);
          return res;
        }),
      );
      for (const res of responses) {
        if (res.data?.length) {
          items.push(...res.data);
        }
      }
    }
  }

  return {
    items,
    totalData: firstPage.total_data ?? items.length,
  };
}

function accumulateMedia(
  statsMap: Record<string, UserFileStats>,
  records: RawMediaRecord[],
  mediaType: "photo" | "video",
): { count: number; sizeKb: number } {
  let totalSizeKb = 0;

  for (const item of records) {
    const userId = item.uploaded_by || "unknown";
    if (!statsMap[userId]) {
      statsMap[userId] = createEmptyStats(userId);
    }

    const stats = statsMap[userId];
    const sizeKb = Number(item.file_size_kb) || 0;
    const timestamp = item.created_at || item.captured_at || null;

    if (mediaType === "photo") {
      stats.photoCount += 1;
      stats.photoSizeKb += sizeKb;
    } else {
      stats.videoCount += 1;
      stats.videoSizeKb += sizeKb;
    }

    stats.totalFiles += 1;
    stats.totalSizeKb += sizeKb;
    totalSizeKb += sizeKb;

    if (
      timestamp &&
      (!stats.lastUploadAt || timestamp > stats.lastUploadAt)
    ) {
      stats.lastUploadAt = timestamp;
    }

    stats.files.push({
      id: item.id,
      mediaType,
      originalFilename: item.original_filename || `${mediaType}-${item.id}`,
      filePath: item.file_path || "",
      fileSizeKb: sizeKb,
      streetName: item.street_name || null,
      projectName: item.project?.name || null,
      projectId: item.project_id || null,
      source: item.source || "-",
      processingStatus: item.processing_status || "-",
      capturedAt: item.captured_at || "",
      createdAt: item.created_at || "",
    });
  }

  return { count: records.length, sizeKb: totalSizeKb };
}

export function useUserFileCounts() {
  const [statsByUser, setStatsByUser] = useState<Record<string, UserFileStats>>(
    {},
  );
  const [summary, setSummary] = useState<FileCountSummary>({
    totalPhotos: 0,
    totalVideos: 0,
    totalFiles: 0,
    totalPhotoSizeKb: 0,
    totalVideoSizeKb: 0,
    totalSizeKb: 0,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<CountProgress>({
    loadedPages: 0,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      // Cancel in-flight updates on unmount
      requestIdRef.current += 1;
    };
  }, []);

  const fetchCounts = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    const isCancelled = () => requestIdRef.current !== currentRequestId;

    setLoading(true);
    setError(null);
    setProgress({ loadedPages: 0, totalPages: 2 });

    let loadedPages = 0;
    let totalPages = 2; // Initial estimate: at least page 1 of photos + page 1 of videos

    const handlePageLoaded = (totalPagesHint: number) => {
      if (isCancelled()) return;
      if (totalPagesHint > 0) {
        // Replace initial estimate of 1 for this stream with actual totalPages
        totalPages += totalPagesHint - 1;
      }
      loadedPages += 1;
      setProgress({
        loadedPages: Math.min(loadedPages, totalPages),
        totalPages,
      });
    };

    try {
      const [photosResult, videosResult] = await Promise.all([
        fetchAllMediaPages(
          (page, size) => streetPhotosService.getStreetPhotos(undefined, page, size),
          handlePageLoaded,
          isCancelled,
        ),
        fetchAllMediaPages(
          (page, size) => streetVideosService.getStreetVideos(undefined, page, size),
          handlePageLoaded,
          isCancelled,
        ),
      ]);

      if (isCancelled()) return;

      const nextStatsMap: Record<string, UserFileStats> = {};
      const photoTotals = accumulateMedia(
        nextStatsMap,
        photosResult.items,
        "photo",
      );
      const videoTotals = accumulateMedia(
        nextStatsMap,
        videosResult.items,
        "video",
      );

      // Sort each user's files newest first
      Object.values(nextStatsMap).forEach((stats) => {
        stats.files.sort((a, b) =>
          (b.createdAt || b.capturedAt).localeCompare(
            a.createdAt || a.capturedAt,
          ),
        );
      });

      setStatsByUser(nextStatsMap);
      setSummary({
        totalPhotos: photosResult.totalData || photoTotals.count,
        totalVideos: videosResult.totalData || videoTotals.count,
        totalFiles:
          (photosResult.totalData || photoTotals.count) +
          (videosResult.totalData || videoTotals.count),
        totalPhotoSizeKb: photoTotals.sizeKb,
        totalVideoSizeKb: videoTotals.sizeKb,
        totalSizeKb: photoTotals.sizeKb + videoTotals.sizeKb,
      });
      setLastUpdated(new Date().toISOString());
    } catch (err: unknown) {
      if (isCancelled()) return;
      console.error("Failed to count user files:", err);
      setError(getApiErrorMessage(err, "Gagal menghitung file pengguna"));
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }, []);

  return {
    statsByUser,
    summary,
    loading,
    progress,
    error,
    lastUpdated,
    fetchCounts,
  };
}

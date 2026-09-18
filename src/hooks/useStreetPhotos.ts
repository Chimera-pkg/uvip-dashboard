import { useState, useCallback } from "react";
import { message } from "antd";
import {
  streetPhotosService,
  type StreetPhotoRequest,
  type PaginatedStreetPhotos,
} from "../api/street-photos.service";

export function useStreetPhotos() {
  const [data, setData] = useState<PaginatedStreetPhotos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreetPhotos = useCallback(
    async (projectId: string, page = 1, size = 10) => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await streetPhotosService.getStreetPhotos(
          projectId,
          page,
          size,
        );
        setData(response);
      } catch (err: any) {
        const msg =
          err.response?.data?.detail || "Failed to fetch street photos";
        setError(msg);
        message.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createStreetPhoto = async (
    requestData: StreetPhotoRequest,
  ): Promise<boolean> => {
    try {
      await streetPhotosService.createStreetPhoto(requestData);
      message.success("Street photo created successfully");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to create street photo";
      message.error(msg);
      return false;
    }
  };

  const updateStreetPhoto = async (
    id: string,
    requestData: StreetPhotoRequest,
  ): Promise<boolean> => {
    try {
      await streetPhotosService.updateStreetPhoto(id, requestData);
      message.success("Street photo updated successfully");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to update street photo";
      message.error(msg);
      return false;
    }
  };

  const deleteStreetPhoto = async (id: string): Promise<boolean> => {
    try {
      await streetPhotosService.deleteStreetPhoto(id);
      message.success("Street photo deleted successfully");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to delete street photo";
      message.error(msg);
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    fetchStreetPhotos,
    createStreetPhoto,
    updateStreetPhoto,
    deleteStreetPhoto,
  };
}

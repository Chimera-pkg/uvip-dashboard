import { useState, useEffect, useCallback } from 'react';
import { photosService, type StreetPhoto } from '../api/photos.service';

export function usePhotos(page: number = 1, limit: number = 20) {
  const [photos, setPhotos] = useState<StreetPhoto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await photosService.getPhotos(page, limit);
      setPhotos(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch photos');
      console.error('Photos fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const deletePhoto = async (id: string) => {
    try {
      await photosService.deletePhoto(id);
      setPhotos(photos.filter(p => p.id !== id));
      setTotal(total - 1);
    } catch (err: any) {
      console.error('Delete photo error:', err);
      throw err;
    }
  };

  return { photos, total, loading, error, deletePhoto, refresh: fetchPhotos };
}

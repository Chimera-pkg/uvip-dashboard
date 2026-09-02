import { useState, useEffect } from 'react';
import { geoService, type GeoCollection } from '../api/geo.service';

export function useGeoData() {
  const [corridors, setCorridors] = useState<GeoCollection | null>(null);
  const [surveyPoints, setSurveyPoints] = useState<GeoCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [corridorsData, pointsData] = await Promise.all([
          geoService.getCorridors(),
          geoService.getSurveyPoints(),
        ]);
        setCorridors(corridorsData);
        setSurveyPoints(pointsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch geo data');
        console.error('Geo data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshSurveyPoints = async (corridorId?: string) => {
    try {
      const data = await geoService.getSurveyPoints(corridorId);
      setSurveyPoints(data);
    } catch (err: any) {
      console.error('Refresh survey points error:', err);
    }
  };

  return { corridors, surveyPoints, loading, error, refreshSurveyPoints };
}

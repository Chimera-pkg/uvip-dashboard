import { useState, useEffect } from 'react';
import { missionsService, type SurveyMission } from '../api/missions.service';

export function useMissions() {
  const [missions, setMissions] = useState<SurveyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await missionsService.getMissions();
      setMissions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch missions');
      console.error('Missions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const createMission = async (data: Partial<SurveyMission>) => {
    try {
      const newMission = await missionsService.createMission(data);
      setMissions([...missions, newMission]);
      return newMission;
    } catch (err: any) {
      console.error('Create mission error:', err);
      throw err;
    }
  };

  const updateMission = async (id: string, data: Partial<SurveyMission>) => {
    try {
      const updated = await missionsService.updateMission(id, data);
      setMissions(missions.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err: any) {
      console.error('Update mission error:', err);
      throw err;
    }
  };

  const deleteMission = async (id: string) => {
    try {
      await missionsService.deleteMission(id);
      setMissions(missions.filter(m => m.id !== id));
    } catch (err: any) {
      console.error('Delete mission error:', err);
      throw err;
    }
  };

  const completeMission = async (id: string) => {
    try {
      const updated = await missionsService.completeMission(id);
      setMissions(missions.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err: any) {
      console.error('Complete mission error:', err);
      throw err;
    }
  };

  return {
    missions,
    loading,
    error,
    createMission,
    updateMission,
    deleteMission,
    completeMission,
    refresh: fetchMissions,
  };
}

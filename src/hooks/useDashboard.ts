import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats, type KpiData } from '../api/dashboard.service';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, kpiData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getKpiData(),
        ]);
        setStats(statsData);
        setKpi(kpiData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, kpi, loading, error };
}

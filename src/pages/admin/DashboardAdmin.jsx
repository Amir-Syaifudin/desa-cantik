// src/pages/admin/DashboardAdmin.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, FileText, Map, Activity } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

export default function DashboardAdmin() {
  const [summary, setSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard summary dari backend
      const response = await apiClient.get('/dashboard/admin');
      
      // Set data summary dari backend
      setSummary(response.data.summary || {});
      setRecentActivities(response.data.recent_activities || []);
      
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
      
      // Fallback ke data dummy jika backend error (temporary)
      setSummary({
        total_villages: 0,
        active_villages: 0,
        inactive_villages: 0,
        total_users: 0,
        active_users: 0,
        total_statistics: 0,
        total_publications: 0,
        total_thematic_maps: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Gagal Memuat Dashboard</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin BPS</h1>
        <p className="text-gray-600 mt-1">Overview sistem informasi statistik desa</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card: Total Desa */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Desa</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_villages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.active_villages || 0} aktif, {summary?.inactive_villages || 0} nonaktif
            </p>
          </CardContent>
        </Card>

        {/* Card: Pengguna */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.admin_count || 0} Admin BPS, {summary?.village_officer_count || 0} Perangkat Desa
            </p>
          </CardContent>
        </Card>

        {/* Card: Data Statistik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Statistik</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_statistics || 0}</div>
            <p className="text-xs text-muted-foreground">Data statistik desa</p>
          </CardContent>
        </Card>

        {/* Card: Peta Tematik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peta Tematik</CardTitle>
            <Map className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_thematic_maps || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.total_map_data || 0} data peta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
          <CardDescription>Log aktivitas pengguna sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Belum ada aktivitas</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

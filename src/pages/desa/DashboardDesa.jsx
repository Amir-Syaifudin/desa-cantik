// src/pages/desa/DashboardDesa.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChartHorizontalBig, BookCopy, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { validationFlowService } from "@/services/validationFlowService";

// --- Data Dummy untuk Chart ---
const chartDataStatus = [
  { name: "Terverifikasi", value: 79, fill: "#22c55e" }, // Hijau
  { name: "Menunggu", value: 15, fill: "#f59e0b" }, // Kuning
  { name: "Ditolak", value: 6, fill: "#ef4444" }, // Merah
];

const chartDataKategori = [
  { name: "Demografi", value: 16, fill: "#22c55e" }, 
  { name: "Ekonomi", value: 12, fill: "#3b82f6" }, 
  { name: "Pendidikan", value: 15, fill: "#f59e0b" }, 
  { name: "Pertanian", value: 25, fill: "#14b8a6" }, 
  { name: "Lainnya", value: 32, fill: "#6366f1" }, 
];
// ------------------------------

// --- Data Dummy untuk Tabel ---
const recentStats = [
  {
    id: 1,
    indicator: "Jumlah Penduduk",
    subject: "Demografi",
    updated: "2025-11-15",
    status: "Terverifikasi",
  },
  {
    id: 2,
    indicator: "Angka Partisipasi Sekolah",
    subject: "Pendidikan",
    updated: "2025-11-14",
    status: "Perlu Validasi",
  },
  {
    id: 3,
    indicator: "Tingkat Kemiskinan",
    subject: "Ekonomi",
    updated: "2025-11-14",
    status: "Terverifikasi",
  },
  {
    id: 4,
    indicator: "Angka Harapan Hidup",
    subject: "Kesehatan",
    updated: "2025-11-13",
    status: "Ditolak",
  },
  {
    id: 5,
    indicator: "Produksi Padi",
    subject: "Pertanian",
    updated: "2025-11-12",
    status: "Terverifikasi",
  },
];
// ------------------------------

export default function DashboardDesa() {
  const [flowSteps, setFlowSteps] = useState([]);
  const [loadingFlow, setLoadingFlow] = useState(true);

  useEffect(() => {
    const loadFlow = async () => {
      try {
        setLoadingFlow(true);
        const steps = await validationFlowService.getFlow();
        setFlowSteps(steps);
      } catch (error) {
        console.error("Gagal memuat alur validasi:", error);
      } finally {
        setLoadingFlow(false);
      }
    };

    loadFlow();
  }, []);
  
  // Fungsi helper untuk menentukan warna Badge
  const getStatusVariant = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "default"; // hijau/biru di shadcn
      case "Perlu Validasi":
        return "secondary"; // abu-abu/kuning
      case "Ditolak":
        return "destructive"; // merah
      default:
        return "outline";
    }
  };
  
  // Helper class tambahan untuk warna spesifik (opsional, jika variant default kurang pas)
  const getStatusClassName = (status) => {
     switch (status) {
      case "Terverifikasi": return "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white";
      case "Perlu Validasi": return "bg-amber-500 hover:bg-amber-600 border-transparent text-white";
      case "Ditolak": return "bg-red-500 hover:bg-red-600 border-transparent text-white";
      default: return "";
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Desa</h1>
          <p className="text-muted-foreground">Ringkasan data dan aktivitas desa Anda.</p>
        </div>
      </div>

      {/* --- Baris Atas: Stat & Chart --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1: Stat Cards (Stacked) */}
        <div className="space-y-6">
          <Card className="shadow-sm border-l-4 border-l-[#1C6EA4]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Indikator Statistik
              </CardTitle>
              <BarChartHorizontalBig className="h-5 w-5 text-[#1C6EA4]" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-800">120</div>
              <p className="text-xs text-muted-foreground mt-1">+5 dari bulan lalu</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dokumen Publikasi
              </CardTitle>
              <BookCopy className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-800">24</div>
              <p className="text-xs text-muted-foreground mt-1">6 dokumen tahun ini</p>
            </CardContent>
          </Card>

           <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Layer Peta
              </CardTitle>
              <FileText className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-800">8</div>
              <p className="text-xs text-muted-foreground mt-1">2 diupdate minggu ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Chart Status (Donut) */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Status Data</CardTitle>
            <CardDescription>
              Persentase data berdasarkan status validasi
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={5}
                    paddingAngle={2}
                  >
                    {chartDataStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  {/* Custom Legend sederhana di tengah bisa ditambahkan di sini jika perlu */}
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Valid</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Pending</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Ditolak</div>
            </div>
          </CardContent>
        </Card>

        {/* Kolom 3: Chart Kategori (Pie) */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Kategori Statistik</CardTitle>
            <CardDescription>
              Sebaran data per sektor
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataKategori}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    labelLine={false}
                  >
                    {chartDataKategori.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
             <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs text-muted-foreground">
                {chartDataKategori.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></div> 
                        {item.name}
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Baris Bawah: Tabel Statistik Terkini --- */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>Aktivitas Upload Terkini</CardTitle>
          <CardDescription>Data statistik yang baru saja diunggah atau diperbarui.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Indikator</TableHead>
                <TableHead>Subjek</TableHead>
                <TableHead>Tanggal Update</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentStats.map((stat, index) => (
                <TableRow key={stat.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{stat.indicator}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {stat.subject}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{stat.updated}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={getStatusVariant(stat.status)}
                        className={cn("font-normal", getStatusClassName(stat.status))}
                    >
                      {stat.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Alur Validasi Data Statistik (API) --- */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>Alur Validasi Data Statistik</CardTitle>
          <CardDescription>
            Tahapan validasi sesuai kebijakan BPS dan perangkat desa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFlow ? (
            <div className="text-gray-500">Memuat alur validasi...</div>
          ) : flowSteps.length === 0 ? (
            <div className="text-gray-500">Belum ada data alur validasi.</div>
          ) : (
            <div className="space-y-4">
              {flowSteps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">
                    {step.order || idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800">{step.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {step.role || "-"}
                      </Badge>
                      {step.slaDays ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                          SLA {step.slaDays} hari
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

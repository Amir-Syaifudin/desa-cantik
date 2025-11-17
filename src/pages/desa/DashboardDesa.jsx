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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChartHorizontalBig, BookCopy } from "lucide-react";

// --- Data Dummy untuk Chart ---
const chartDataStatus = [
  { name: "Batal Terbit", value: 21, fill: "hsl(var(--primary))" },
  { name: "Lainnya", value: 79, fill: "hsl(var(--muted))" },
];

const chartDataKategori = [
  { name: "Demografi", value: 16, fill: "#22c55e" }, // green-500
  { name: "Ekonomi", value: 12, fill: "#3b82f6" }, // blue-500
  { name: "Pendidikan", value: 15, fill: "#f59e0b" }, // amber-500
  { name: "Pertanian", value: 25, fill: "#14b8a6" }, // teal-500
  { name: "Lainnya", value: 32, fill: "#6366f1" }, // indigo-500
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
  
  // Fungsi helper untuk menentukan warna Badge
  const getStatusVariant = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "default"; // hijau/biru 
      case "Perlu Validasi":
        return "secondary"; // abu-abu
      case "Ditolak":
        return "destructive"; // merah
      default:
        return "outline";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* --- Baris Atas: Stat & Chart --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1: Stat Cards (Stacked) */}
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jumlah Indikator
              </CardTitle>
              <BarChartHorizontalBig className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#1C6EA4]">120</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jumlah Modul Desa
              </CardTitle>
              <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#1C6EA4]">6</div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Chart 1 (Donut) */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Publikasi Desa</CardTitle>
            <CardDescription>
              Rekapitulasi publikasi desa menurut status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartDataStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    strokeWidth={5}
                  >
                    {chartDataStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Kolom 3: Chart 2 (Pie) */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Kategori Statistik</CardTitle>
            <CardDescription>
              Distribusi indikator menurut subjek
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartDataKategori}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                  >
                    {chartDataKategori.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- Baris Bawah: Tabel Statistik Terkini --- */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Statistik Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Statistik (Indikator)</TableHead>
                <TableHead>Subjek</TableHead>
                <TableHead>Tanggal Diperbarui</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentStats.map((stat, index) => (
                <TableRow key={stat.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{stat.indicator}</TableCell>
                  <TableCell>{stat.subject}</TableCell>
                  <TableCell>{stat.updated}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(stat.status)}>
                      {stat.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
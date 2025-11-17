// src/pages/public/VillageDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
// 1. Impor MapContainer dan komponen Leaflet
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

// --- Impor ikon dan komponen Pagination ---
import { MapPin, Users, BarChart3, Image as ImageIcon, FileText, Layers, CalendarDays, ArrowRight, ListFilter, Landmark, HeartPulse, Briefcase, Download } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// --- Impor untuk Section Data ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
// ---------------------------------------------------

// --- Impor komponen Filter ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { villageService } from '@/services/villageService';
import VillageDetailNavbar from '@/components/shared/VillageDetailNavbar';
import Footer from '@/components/shared/Footer';

// --- Data Dummy GeoJSON (kita ambil dari PetaTematik.jsx) ---
const dataLayer1 = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature", "properties": { "name": "Zona Kepadatan Tinggi", "value": 3000 },
      "geometry": { "type": "Polygon", "coordinates": [[[-6.200, 106.800], [-6.200, 106.810], [-6.210, 106.810], [-6.210, 106.800], [-6.200, 106.800]]] }
    }
  ]
};
const dataLayer2 = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature", "properties": { "name": "Zona Kepadatan Rendah", "value": 500 },
      "geometry": { "type": "Polygon", "coordinates": [[[-6.220, 106.820], [-6.220, 106.830], [-6.230, 106.830], [-6.230, 106.820], [-6.220, 106.820]]] }
    }
  ]
};
const styleLayer1 = { fillColor: "red", color: "#FF0000", weight: 2, opacity: 1, fillOpacity: 0.5 };
const styleLayer2 = { fillColor: "green", color: "#008000", weight: 2, opacity: 1, fillOpacity: 0.5 };
const layerOptions = [
  { id: 'kepadatan', label: 'Kepadatan Penduduk', data: dataLayer1, style: styleLayer1 },
  { id: 'lahan', label: 'Penggunaan Lahan', data: dataLayer2, style: styleLayer2 },
];
// -----------------------------------------------------------------

// --- Data Dummy untuk Publikasi---
const dummyPublications = [
  {
    id: 1,
    title: 'Statistik Pelabuhan Perikanan 2024',
    date: '7 November 2025',
    description: 'Publikasi ini menyajikan data statistik terkini mengenai pelabuhan perikanan di seluruh Indonesia.',
    imageUrl: 'https://placehold.co/300x400/BFDBFE/1E3A8A?text=Cover+1' 
  },
  {
    id: 2,
    title: 'Statistik Pendaratan Ikan Tradisional 2024',
    date: '7 November 2025',
    description: 'Data mengenai pendaratan ikan oleh nelayan tradisional, mencakup volume dan nilai produksi.',
    imageUrl: 'https://placehold.co/300x400/A5F3FC/0E7490?text=Cover+2'
  },
  {
    id: 3,
    title: 'Benchmark Indeks Konstruksi (2016=100), 2018–2023',
    date: '31 Oktober 2025',
    description: 'Analisis dan benchmark indeks harga konstruksi sebagai acuan inflasi sektor infrastruktur.',
    imageUrl: 'https://placehold.co/300x400/FDE68A/B45309?text=Cover+3'
  },
  {
    id: 4,
    title: 'Cerita Data Statistik untuk Indonesia',
    date: '31 Oktober 2025',
    description: 'Kajian mismatch antara pendidikan dan pekerjaan pemuda Indonesia, serta implikasinya.',
    imageUrl: 'https://placehold.co/300x400/D1FAE5/065F46?text=Cover+4'
  },
  {
    id: 5,
    title: 'Statistik Perdagangan Luar Negeri Bulanan Impor',
    date: '31 Oktober 2025',
    description: 'Laporan bulanan data impor Indonesia, dirinci berdasarkan komoditas dan negara asal.',
    imageUrl: 'https://placehold.co/300x400/FECACA/991B1B?text=Cover+5'
  },
  {
    id: 6,
    title: 'Direktori Industri Manufaktur 2025',
    date: '31 Oktober 2025',
    description: 'Direktori lengkap perusahaan industri manufaktur skala besar dan sedang di Indonesia.',
    imageUrl: 'https://placehold.co/300x400/E9D5FF/5B21B6?text=Cover+6'
  }
];

const monthOptions = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
  { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

const yearOptions = ['2025', '2024', '2023', '2022'];
// -------------------------------------------------------

// --- Data Dummy untuk Section Data Statistik ---
// 1. Data mentah untuk semua tabel
const allTables = {
  // Wilayah
  rt_rw: {
    title: 'Jumlah Rukun Tetangga dan Rukun Warga',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Tahun', 'Jumlah Rukun Tetangga (RT)', 'Jumlah Rukun Warga (RW)'],
      rows: [
          [2024, 0, 0],
          [2025, 11, 0]
      ]
      }
  },
  aparatur: {
    title: 'Jumlah Aparatur Lembang di Lembang Nonongan Selatan',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Jabatan', 'Jumlah Orang'],
      rows: [['Kepala Lembang', 1], ['Sekretaris Lembang', 1], ['Kaur', 3], ['Kepala Dusun', 3]]
    }
  },
  peraturan: {
    title: 'Jumlah Peraturan Desa di Lembang Nonongan Selatan',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Jenis Peraturan', 'Jumlah'],
      rows: [['Peraturan Desa (Perdes)', 5], ['Peraturan Kepala Desa (Perkades)', 12]]
    }
  },
  // Penduduk
  distribusi: {
    title: 'Penduduk, Distribusi Persentase Penduduk, Kepadatan Penduduk, Rasio Jenis Kelamin',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Indikator', 'Nilai'],
      rows: [['Jumlah Penduduk', '1.580 Jiwa'], ['Kepadatan', '500 jiwa/km²'], ['Rasio Jenis Kelamin', 102]]
    }
  },
  keluarga: {
    title: 'Jumlah Keluarga di Lembang Nonongan Selatan',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Tahun', 'Jumlah KK'],
      rows: [[2021, 400], [2022, 410], [2023, 420]]
    }
  },
  // Sosial
  pendidikan: {
    title: 'Jumlah Fasilitas Pendidikan Menurut Jenjang Pendidikan',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Jenjang', 'Jumlah'],
      rows: [['PAUD', 3], ['SD Sederajat', 1], ['SMP Sederajat', 1]]
    }
  },
  imunisasi: {
    title: 'Cakupan Imunisasi Dasar Lengkap pada Bayi',
    source: 'Dinas Kesehatan Kabupaten',
    data: {
      headers: ["Tahun", "BCG", "DPT", "Polio4", "HB0", "HB", "HiB3", "Campak/MMR", "Imunisasi Dasar Lengkap"],
      rows: [
        [2021, 41, 32, 30, 44, 32, 32, 45, 45],
        [2022, 42, 43, 40, 40, 0, 0, 41, 41],
        [2023, 31, 38, 35, 40, 38, 38, 48, 48]
      ]
    }
  },
  // Ekonomi
  fasilitas_usaha: {
    title: 'Jumlah Fasilitas Usaha (Toko, Penginapan, Warung, dll)',
    source: 'Kantor Lembang Nonongan Selatan',
    data: {
      headers: ['Tahun', 'Toko/Warung Kelontong', 'Penginapan (losmen/wisma)', 'Hotel', 'Warung/Kedai Makanan Minuman', 'Restoran / Rumah Makan', 'Minimarket / swalayan', 'Pasar'],
      rows: [
        [2024, 7, 2, 0, 1, 0, 0, 0],
        [2025, '', '', '', '', '', '', '']
      ]
    }
  }
};

// 2. Struktur menu untuk kolom kiri
const subjectGroups = [
  {
    id: 'wilayah',
    name: 'Wilayah dan Pemerintahan',
    icon: Landmark,
    tables: [
      { id: 'rt_rw', title: allTables.rt_rw.title },
      { id: 'aparatur', title: allTables.aparatur.title },
      { id: 'peraturan', title: allTables.peraturan.title }
    ]
  },
  {
    id: 'penduduk',
    name: 'Penduduk',
    icon: Users,
    tables: [
      { id: 'distribusi', title: allTables.distribusi.title },
      { id: 'keluarga', title: allTables.keluarga.title }
    ]
  },
  {
    id: 'sosial',
    name: 'Sosial dan Kesejahteraan Rakyat',
    icon: HeartPulse,
    tables: [
      { id: 'pendidikan', title: allTables.pendidikan.title },
      { id: 'imunisasi', title: allTables.imunisasi.title } 
    ]
  },
  {
    id: 'ekonomi',
    name: 'Ekonomi dan Pariwisata',
    icon: Briefcase,
    tables: [
      { id: 'fasilitas_usaha', title: allTables.fasilitas_usaha.title }
    ]
  }
];
// -------------------------------------------------------

export default function VillageDetail() {
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('tentang'); 
  
  const { id } = useParams(); 

  // --- State untuk Peta ---
  const [activeLayerId, setActiveLayerId] = useState('kepadatan');
  const [layerVisibility, setLayerVisibility] = useState({
    kepadatan: true,
    lahan: true,
  });

  // --- State untuk Publikasi ---
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  // ---------------------------------------

  // --- State untuk Data Statistik ---
  const [activeSubjectId, setActiveSubjectId] = useState('wilayah');
  const [activeTableId, setActiveTableId] = useState('rt_rw'); 
  // --------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      if (!id || id === "undefined") return; 
      try {
        setLoading(true);
        const villageData = await villageService.getVillageById(id);
        if (villageData) {
          setVillage(villageData);
        } else {
          console.error("Desa tidak ditemukan");
        }
      } catch (error) {
        console.error('Error loading village data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]); 

  // 5. Update scroll-spy untuk memantau SEMUA section
  useEffect(() => {
    const sections = ['tentang', 'data', 'publikasi', 'peta', 'dokumentasi'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; 
      let currentSection = 'tentang'; 
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = sectionId;
            break; 
          }
        }
      }
      setActiveSection(currentSection);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -120; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // --- 6. Handler untuk Peta ---
  const handleLayerChange = (layerId) => setActiveLayerId(layerId);
  const handleVisibilityChange = (layerId) => {
    setLayerVisibility(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<b>${feature.properties.name}</b><br>Nilai: ${feature.properties.value}`);
    }
  };
  // ------------------------------

// --- Handler untuk mengubah Subjek ---
  const handleSubjectChange = (newSubjectId) => {
    // 1. Cari data subjek yang baru
    const newSubject = subjectGroups.find(s => s.id === newSubjectId);
    if (!newSubject || newSubject.tables.length === 0) return; 

    // 2. Set subjek baru
    setActiveSubjectId(newSubjectId);
    
    // 3. Set tabel aktif ke tabel PERTAMA dari subjek baru itu
    setActiveTableId(newSubject.tables[0].id);
  };
  // ----------------------------------------------

  // --- Fungsi untuk mengunduh CSV ---
  const handleDownloadCSV = (tableData) => {
    if (!tableData || !tableData.data) return;

    const { headers, rows } = tableData.data;

    // 1. Buat header CSV
    const headerString = headers.join(',');

    // 2. Buat baris CSV (menangani koma di dalam data)
    const rowStrings = rows.map(row =>
      row.map(cell => {
        const strCell = String(cell);
        // Jika sel berisi koma, bungkus dengan tanda kutip
        if (strCell.includes(',')) {
          return `"${strCell}"`;
        }
        return strCell;
      }).join(',')
    );

    // 3. Gabungkan header dan baris dengan newline
    const csvString = [headerString, ...rowStrings].join('\n');

    // 4. Buat file dan picu unduhan
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    // Buat nama file yang dinamis, cth: "jumlah_rukun_tetangga.csv"
    const fileName = tableData.title.toLowerCase().replace(/[\s,]+/g, '_') + '.csv';
    link.setAttribute('download', fileName);

    // Tambahkan ke DOM, klik, lalu hapus
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ------------------------------------------

  // --- Helper variables ---
  // Cari subjek yang sedang aktif
  const currentSubject = subjectGroups.find(s => s.id === activeSubjectId) || subjectGroups[0];
  // Ambil data tabel yang sedang aktif
  const currentTable = allTables[activeTableId] || allTables[subjectGroups[0].tables[0].id];
  // ------------------------------------

  // Guard clause untuk 'id'
  if (!id || id === "undefined") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          Memuat ID...
        </div>
      </div>
    );
  }
  
  // Guard clause untuk 'loading'
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          Memuat data desa...
        </div>
      </div>
    );
  }

  // Guard clause untuk 'village'
  if (!village) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Desa tidak ditemukan</p>
          <Button asChild className="mt-4 bg-[#1C6EA4]">
            <Link to="/">Kembali</Link>
          </Button>
        </div>
      </div>
    );
  }

  const documentationImages = [
    village.image,
    'https://placehold.co/800x600/67e8f9/ffffff?text=Dokumentasi+1',
    'https://placehold.co/800x600/fde047/ffffff?text=Dokumentasi+2',
    'https://placehold.co/800x600/a3e635/ffffff?text=Dokumentasi+3',
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>
        {`
          @keyframes marquee-slow {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); } 
          }
          .animate-marquee-slow {
            animation: marquee-slow 30s linear infinite; 
          }
        `}
      </style>

      {/* 7. Panggil Navbar (tanpa villageId) */}
      <VillageDetailNavbar 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#4BADE4] via-[#33A1E0] to-[#1C6EA4] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center pt-8"> 
              <span className="bg-white/20 text-white px-6 py-2 text-lg mb-4 backdrop-blur-sm rounded-full inline-block">
                Profil Desa
              </span>
              <h1 className="text-5xl mb-6 mt-4" style={{ textShadow: 'rgba(0,0,0,0.25) 2px 4px 8px' }}>
                {village.name}
              </h1>
              <div className="flex items-center justify-center gap-8 text-lg flex-wrap">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5" />
                  <span>{village.district}, {village.regency}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Users className="h-5 w-5" />
                  <span>{village.population.toLocaleString('id-ID')} jiwa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section "Tentang Desa" */}
      <section id="tentang" className="py-20 bg-gradient-to-b from-white to-gray-50 scroll-mt-28">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl text-[#154D71] mb-4">Tentang Desa</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#33A1E0]/20 to-[#1C6EA4]/20 rounded-3xl blur-2xl"></div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={village.image}
                    alt={village.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-[#1C6EA4] to-[#33A1E0] text-white">
                    <CardTitle className="text-2xl">{village.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-lg leading-relaxed text-gray-700">
                      {village.name} merupakan salah satu desa yang terletak di {village.district}, {village.regency}. 
                      Desa ini juga memiliki julukan sebagai Desa Wisata. {village.name} berjarak sekitar 5 (lima) 
                      kilometer dari Kota Kabupaten.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-[#33A1E0] to-[#4BADE4] text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      Penduduk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-lg leading-relaxed text-gray-700">
                      Jumlah penduduk {village.name} mencapai <span className="text-[#1C6EA4]">{village.population.toLocaleString('id-ID')} jiwa</span> dengan 
                      kepadatan {Math.round(village.population / village.area)} jiwa/km².
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section "Data" --- */}
      <section id="data" className="py-20 bg-gray-50 scroll-mt-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#154D71] mb-4">Data Statistik</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] mx-auto rounded-full"></div>
          </div>

          {/* (1) Filter Subjek (Dropdown) */}
          <Card className="mb-8 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="w-full md:w-1/2">
                <Label htmlFor="subject-filter" className="text-base font-semibold text-gray-700">Pilih Subjek Data</Label>
                <Select value={activeSubjectId} onValueChange={handleSubjectChange}>
                  <SelectTrigger id="subject-filter" className="w-full mt-2 text-base py-6">
                    <SelectValue placeholder="Pilih subjek..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id} className="text-base py-2">
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* (2) Layout Dua Kolom */}
          <div className="flex flex-col md:flex-row gap-8 relative">
            
            {/* KOLOM KIRI: Daftar Indikator/Tabel*/}
            <div className="w-full md:w-1/3">
              <Card className="border-0 shadow-lg sticky top-36">
                <CardHeader className="bg-gray-100">
                  <CardTitle className="text-lg text-[#154D71]">
                    Statistik - {currentSubject.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-1">
                  {currentSubject.tables.map((table) => (
                    <Button
                      key={table.id}
                      variant="ghost"
                      onClick={() => setActiveTableId(table.id)}
                      className={cn(
                        "w-full text-left justify-start h-auto p-3 text-base leading-snug whitespace-normal", 
                        activeTableId === table.id
                          ? "bg-[#1C6EA4]/10 text-[#1C6EA4] hover:bg-[#1C6EA4]/20 hover:text-[#1C6EA4]"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    > 
                      {table.title}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* KOLOM KANAN: Tampilan Tabel Data */}
            <div className="w-full md:w-2/3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gray-100">
                  <CardTitle className="text-lg text-[#154D71]">
                    {currentTable.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          {currentTable.data.headers.map((header, idx) => (
                            <TableHead key={idx} className="font-bold text-gray-600">{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTable.data.rows.map((row, rowIdx) => (
                          <TableRow key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                              <TableCell 
                                key={cellIdx} 
                                className={cellIdx === 0 ? "font-medium" : ""}
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 mt-2 flex items-center justify-between">
                  {/* Kiri: Sumber Data */}
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Sumber:</span> {currentTable.source}
                  </p>
                  
                  {/* Kanan: Tombol Unduh */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadCSV(currentTable)}
                    className="bg-white hover:bg-gray-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Unduh CSV
                  </Button>
                </CardFooter>
              </Card>
            </div>

          </div>
        </div>
      </section>
      {/* --- AKHIR MODIFIKASI --- */}

      {/* --- Section "Publikasi" --- */}
      <section id="publikasi" className="py-20 bg-white scroll-mt-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#154D71] mb-4">Publikasi</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] mx-auto rounded-full">
            </div>
          </div>

          {/* (1) Filter Section */}
          <Card className="mb-10 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListFilter className="h-5 w-5" />
                Filter Publikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
            {/* Dropdown Tahun */}
              <div className="space-y-2 w-full md:w-[280px]">
                <Label htmlFor="pub-year">Pilih Tahun</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="pub-year" className="w-full">
                    <SelectValue placeholder="Pilih tahun..." />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Bulan */}
              <div className="space-y-2 w-full md:w-[280px]">
                <Label htmlFor="pub-month">Pilih Bulan</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="pub-month" className="w-full">
                    <SelectValue placeholder="Pilih bulan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* (2) Content Grid (2x3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {dummyPublications.map(pub => (
              <Card key={pub.id} className="flex overflow-hidden shadow-lg border-0 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                {/* Kiri: Gambar Cover */}
                <div className="w-1/3 flex-shrink-0 bg-gray-200">
                  <img
                    src={pub.imageUrl}
                    alt={pub.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Kanan: Konten Teks */}
                <div className="w-2/3 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight text-[#154D71]">{pub.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2 text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      {pub.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {pub.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button asChild size="sm" className="ml-auto bg-[#1C6EA4] hover:bg-[#154D71]">
                      <Link to="#">
                        Baca Selengkapnya
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>

          {/* (3) Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={currentPage === 1} onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={currentPage === 2} onClick={(e) => { e.preventDefault(); setCurrentPage(2); }}>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={currentPage === 3} onClick={(e) => { e.preventDefault(); setCurrentPage(3); }}>3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive={currentPage === 4} onClick={(e) => { e.preventDefault(); setCurrentPage(4); }}>4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => p + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

        </div>
      </section>

      {/* --- 10. ISI Section "Peta" --- */}
      <section id="peta" className="py-20 bg-gray-50 scroll-mt-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#154D71] mb-4">Peta Tematik</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] mx-auto rounded-full"></div>
          </div>
          
          {/* Filter Card */}
          <Card className="mb-6 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Filter Peta
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 items-center">
              <div className="space-y-2">
                <Label>Pilih Layer Utama</Label>
                {/* Kode ini sekarang aman karena 'activeLayerId' sudah ada */}
                <Select value={activeLayerId} onValueChange={handleLayerChange}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Pilih layer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {layerOptions.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 pt-6">
                <Label>Visibilitas Layer</Label>
                <div className="flex gap-4">
                  {layerOptions.map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`check-detail-${opt.id}`}
                        checked={layerVisibility[opt.id]} // <-- Kode ini sekarang aman
                        onCheckedChange={() => handleVisibilityChange(opt.id)}
                      />
                      <Label
                        htmlFor={`check-detail-${opt.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peta Card */}
          <Card className="overflow-hidden shadow-lg border-0">
            <CardContent className="p-0">
              {/* Kita harus cek !loading DULU sebelum render MapContainer */}
              {!loading && (
                <MapContainer 
                  center={[-3.05, 119.93]} // <-- Ganti ke koordinat Toraja Utara
                  zoom={12} 
                  scrollWheelZoom={true} 
                  style={{ height: '600px', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {layerVisibility.kepadatan && (
                    <GeoJSON 
                      data={dataLayer1} 
                      style={styleLayer1} 
                      onEachFeature={onEachFeature}
                    />
                  )}
                  {layerVisibility.lahan && (
                    <GeoJSON 
                      data={dataLayer2} 
                      style={styleLayer2} 
                      onEachFeature={onEachFeature}
                    />
                  )}
                </MapContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* --- Section "Dokumentasi" (tetap sama) --- */}
      <section id="dokumentasi" className="py-20 bg-white scroll-mt-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#154D71] mb-4">Dokumentasi</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#33A1E0] to-[#1C6EA4] mx-auto rounded-full"></div>
          </div>
          
          <div className="group w-full overflow-hidden">
            <div className="flex animate-marquee-slow [animation-play-state:running] group-hover:[animation-play-state:paused]">
              {[...documentationImages, ...documentationImages].map((img, index) => (
                <div key={index} className="flex-shrink-0 w-full md:w-1/2 p-3">
                  <Card className="overflow-hidden group/item cursor-pointer shadow-lg hover:shadow-2xl transition-all border-0">
                    <div className="aspect-[3/2] bg-gray-200 overflow-hidden">
                      <img
                        src={img}
                        alt={`Dokumentasi ${index + 1}`}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        onError={(e) => e.target.src = 'https://placehold.co/800x600/cccccc/ffffff?text=Gambar'}
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer scrollToVillages={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </div>
  );
}
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { 
  MapPin, Users, Layers, CalendarDays, 
  ArrowRight, Landmark, Download, Eye 
} from 'lucide-react';

// IMPORT UI COMPONENTS (Path Relatif Manual)
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination.jsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table.jsx";
import { cn } from "../../lib/utils.js";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../../components/ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Checkbox } from '../../components/ui/checkbox.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Button } from '../../components/ui/button.jsx';

// IMPORT SERVICES (Path Relatif Manual)
import { villageService } from '../../services/villageService.js';
import { geoService } from '../../services/geoService.js';
import { publicationService } from '../../services/publicationService.js'; 
import { statisticService } from '../../services/statisticService.js';
import { documentationService } from '../../services/documentationService.js';

// IMPORT SHARED COMPONENTS
import VillageDetailNavbar from '../../components/shared/VillageDetailNavbar.jsx';
import Footer from '../../components/shared/Footer.jsx';

const monthOptions = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
  { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

// Generate tahun dinamis (5 tahun terakhir)
const currentYear = new Date().getFullYear();
const yearOptions = ['All', ...Array.from({length: 5}, (_, i) => (currentYear - i).toString())];

export default function VillageDetail() {
  const { id } = useParams();
  
  // State Data Utama
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('tentang');

  // State Peta
  const [mapData, setMapData] = useState([]); 
  const [localLayerVisibility, setLocalLayerVisibility] = useState({});
  const [documentation, setDocumentation] = useState([]);

  // State Publikasi
  const [publications, setPublications] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  // State Statistik (Dinamis)
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [allTables, setAllTables] = useState({});
  const [activeSubjectId, setActiveSubjectId] = useState('');
  const [activeTableId, setActiveTableId] = useState('');

  // 1. Load Data Desa
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await villageService.getVillageById(id);
        setVillage(data);
      } catch (err) {
        console.error("Gagal memuat data desa:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 2. Load Peta dari GeoService
  useEffect(() => {
    const loadMapData = async () => {
      if (!id) return;
      try {
        const [layers, geos] = await Promise.all([
            geoService.getLayersByVillage(id),
            geoService.getGeospatialByVillage(id)
        ]);

        const combinedData = layers.map(layer => {
          // Sesuaikan field ID jika backend menggunakan geo_id atau geoId
          const geoIdTarget = layer.geo_id || layer.geoId;
          const geo = geos.find(g => g.id === parseInt(geoIdTarget));
          
          if (!geo) return null;
          
          // Handle GeoJSON string atau object
          let geometryData = null;
          if (geo.geojson) {
              geometryData = typeof geo.geojson === 'string' ? JSON.parse(geo.geojson) : geo.geojson;
          } else if (geo.geometry) {
              geometryData = typeof geo.geometry === 'string' ? JSON.parse(geo.geometry) : geo.geometry;
          }

          if (!geometryData) return null;
          
          return { ...layer, geometry: geometryData };
        }).filter(Boolean);

        setMapData(combinedData);

        const initialVisibility = {};
        combinedData.forEach(layer => {
          initialVisibility[layer.id] = layer.is_visible ?? layer.isVisible ?? true; 
        });
        setLocalLayerVisibility(initialVisibility);
      } catch (err) {
        console.error("Gagal memuat peta:", err);
      }
    };
    loadMapData();
  }, [id]);

  // 3. Load Publikasi
  useEffect(() => {
    const loadPublications = async () => {
        if(!id) return;
        try {
             const data = await publicationService.getPublications(id);
             const list = Array.isArray(data) ? data : (data.data || []);

             const formatted = list.map(item => ({
                 id: item.id,
                 title: item.title,
                 subject: item.category || 'Umum',
                 date: new Date(item.created_at || item.createdAt || item.publishedAt).toLocaleDateString('id-ID'),
                 year: new Date(item.created_at || item.createdAt || item.publishedAt).getFullYear().toString(),
                 month: (new Date(item.created_at || item.createdAt || item.publishedAt).getMonth() + 1).toString(),
                 description: item.description,
                 imageUrl: item.imageUrl || item.cover_url || 'https://placehold.co/300x400/BFDBFE/1E3A8A?text=PDF',
                 fileUrl: item.fileUrl || item.downloadUrl || item.file_url
             }));
             setPublications(formatted);
        } catch (err) {
            console.error("Gagal memuat publikasi:", err);
        }
    };
    loadPublications();
  }, [id]);

  // 4. Load Statistik (Transformasi Data Backend ke Struktur Tabel)
  useEffect(() => {
    const loadStats = async () => {
        if (!id) return;
        try {
            // Ambil data statistik mentah
            const rawStats = await statisticService.getStatisticsByVillage(id);
            const listStats = Array.isArray(rawStats) ? rawStats : (rawStats.data || []);

            // --- LOGIKA TRANSFORMASI DATA ---
            // Kita akan mengelompokkan data berdasarkan Tipe (misal: Kependudukan)
            // Lalu di dalam tipe, kita kelompokkan berdasarkan Judul Indikator untuk menjadi Tabel
            
            const groups = {}; // { 'Kependudukan': { id: 'cat-1', name: 'Kependudukan', tables: [] } }
            const tables = {}; // { 'table-1': { title: '...', data: { headers: [], rows: [] } } }

            listStats.forEach(stat => {
                // Ambil nama kategori/tipe
                const typeName = stat.type?.name || stat.statistic_type?.name || 'Lainnya';
                const typeId = `subject-${typeName.replace(/\s+/g, '-').toLowerCase()}`;

                // Inisialisasi Grup jika belum ada
                if (!groups[typeId]) {
                    groups[typeId] = {
                        id: typeId,
                        name: typeName,
                        icon: Landmark, // Icon default
                        tables: []
                    };
                }

                // Gunakan Nama Indikator sebagai ID Tabel (misal: 'Jumlah Penduduk')
                // Kita asumsikan satu indikator punya banyak entry tahun
                const indicatorName = stat.name || stat.title || 'Data Statistik';
                const tableId = `table-${typeId}-${indicatorName.replace(/\s+/g, '-').toLowerCase()}`;
                
                // Jika tabel belum ada di list grup, tambahkan
                if (!groups[typeId].tables.find(t => t.id === tableId)) {
                    groups[typeId].tables.push({ id: tableId, title: indicatorName });
                }

                // Inisialisasi Data Tabel jika belum ada
                if (!tables[tableId]) {
                    tables[tableId] = {
                        title: indicatorName,
                        source: stat.source || 'BPS / Kantor Desa',
                        data: {
                            headers: ['Tahun', 'Nilai', 'Satuan'],
                            rows: []
                        }
                    };
                }

                // Masukkan baris data (Tahun, Nilai, Satuan)
                tables[tableId].data.rows.push([
                    stat.year || '-', 
                    Number(stat.value).toLocaleString('id-ID'), 
                    stat.unit || ''
                ]);
            });

            // Konversi groups object ke array dan sort tabel rows berdasarkan tahun
            const subjectGroupsArray = Object.values(groups);
            
            // Sort rows descending by year
            Object.values(tables).forEach(tbl => {
                tbl.data.rows.sort((a, b) => b[0] - a[0]);
            });

            setSubjectGroups(subjectGroupsArray);
            setAllTables(tables);

            // Set default active tab
            if (subjectGroupsArray.length > 0) {
                setActiveSubjectId(subjectGroupsArray[0].id);
                if (subjectGroupsArray[0].tables.length > 0) {
                    setActiveTableId(subjectGroupsArray[0].tables[0].id);
                }
            }

        } catch (err) {
            console.error("Gagal memuat statistik:", err);
        }
    };
    loadStats();
  }, [id]);

  // 5. Load Dokumentasi/Galeri
  useEffect(() => {
    const loadDocs = async () => {
      if (!id) return;
      try {
        const data = await documentationService.getVillageDocumentation(id);
        const list = Array.isArray(data) ? data : (data.data || []);
        setDocumentation(list);
      } catch (err) {
        console.error('Gagal memuat dokumentasi:', err);
      }
    };

    loadDocs();
  }, [id]);

  // 5. Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['tentang', 'data', 'publikasi', 'peta', 'dokumentasi'];
      const scrollPosition = window.scrollY + 150;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(sectionId);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // UI Helpers
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const matchYear = selectedYear === 'All' || pub.year === selectedYear;
      const matchMonth = selectedMonth === 'all' || pub.month === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [publications, selectedYear, selectedMonth]);

  const totalPages = Math.ceil(filteredPublications.length / ITEMS_PER_PAGE);
  const currentPublications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPublications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPublications, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [selectedYear, selectedMonth]);

  // Helper Statistik
  const currentSubject = subjectGroups.find(s => s.id === activeSubjectId) || (subjectGroups.length > 0 ? subjectGroups[0] : null);
  // Fallback jika data kosong
  const emptyTable = { title: 'Data tidak tersedia', source: '-', data: { headers: ['Info'], rows: [['Belum ada data']] } };
  const currentTable = allTables[activeTableId] || (currentSubject && currentSubject.tables.length > 0 ? allTables[currentSubject.tables[0].id] : emptyTable) || emptyTable;

  const handleSubjectChange = (val) => {
    setActiveSubjectId(val);
    const subj = subjectGroups.find(s => s.id === val);
    if (subj && subj.tables.length > 0) setActiveTableId(subj.tables[0].id);
  };

  const handleDownloadCSV = () => {
    // Implementasi simpel generate CSV di client side
    const csvContent = [
        currentTable.data.headers.join(","),
        ...currentTable.data.rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${currentTable.title}.csv`;
    link.click();
  };

  const handleLocalLayerToggle = (layerId) => {
    setLocalLayerVisibility(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-[#154D71]">Memuat data desa...</div>;
  if (!village) return <div className="h-screen flex items-center justify-center text-red-500">Data desa tidak ditemukan.</div>;

  // Dokumentasi dari endpoint backend
  const documentationImages = documentation.length > 0
    ? documentation.map((item) => item.url || item.imageUrl).filter(Boolean)
    : [village.image_url || village.logo_url].filter(Boolean);

  if (documentationImages.length === 0) {
    documentationImages.push('https://placehold.co/800x600/e2e8f0/94a3b8?text=Belum+Ada+Dokumentasi');
  }

  return (
    <div className="min-h-screen bg-white">
      <style>
        {`
          @keyframes marquee-slow {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); } 
          }
          .animate-marquee-slow {
            animation: marquee-slow 40s linear infinite; 
          }
        `}
      </style>

      <VillageDetailNavbar activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#4BADE4] via-[#33A1E0] to-[#1C6EA4] text-white py-20">
        <div className="container mx-auto px-6 text-center relative z-10">
          <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">Profil Desa</span>
          <h1 className="text-5xl font-bold mb-4">{village.name}</h1>
          <div className="flex justify-center gap-6 text-lg">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5"/> {village.district}, {village.regency}</div>
            {/* MENAMPILKAN JUMLAH JIWA DARI DATABASE */}
            {village.population ? (
                <div className="flex items-center gap-2"><Users className="h-5 w-5"/> {Number(village.population).toLocaleString('id-ID')} Jiwa</div>
            ) : null}
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="py-16 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl h-[400px]">
            <img 
                src={village.image_url || village.logo_url || 'https://placehold.co/800x600?text=No+Image'} 
                alt={village.name} 
                className="w-full h-full object-cover" 
                onError={(e) => e.target.src = 'https://placehold.co/800x600?text=Image+Error'}
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#154D71] mb-6">Tentang Desa</h2>
            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
              {village.description || `Desa ${village.name} adalah salah satu desa binaan BPS di ${village.district}. Belum ada deskripsi detail.`}
            </p>
          </div>
        </div>
      </section>

      {/* DATA STATISTIK (REAL DATA) */}
      <section id="data" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#154D71]">Data Statistik</h2>
            <div className="w-20 h-1 bg-[#33A1E0] mx-auto mt-2 rounded-full"></div>
          </div>

          {subjectGroups.length > 0 ? (
             <>
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                 <Label className="mb-2 block">Pilih Kategori Data</Label>
                 <Select value={activeSubjectId} onValueChange={handleSubjectChange}>
                    <SelectTrigger className="w-full md:w-[300px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {subjectGroups.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                 <div className="w-full md:w-1/4 space-y-2">
                    {currentSubject && currentSubject.tables.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTableId(t.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all",
                          activeTableId === t.id ? "bg-[#1C6EA4] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {t.title}
                      </button>
                    ))}
                 </div>
                 <div className="w-full md:w-3/4">
                   <Card className="border-0 shadow-md">
                     <CardHeader className="bg-gray-50 border-b pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg text-[#154D71]">{currentTable.title}</CardTitle>
                          <Button size="sm" variant="outline" onClick={handleDownloadCSV}><Download className="w-4 h-4 mr-2"/> CSV</Button>
                        </div>
                     </CardHeader>
                     <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {currentTable.data.headers.map((h, i) => <TableHead key={i} className="font-bold">{h}</TableHead>)}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentTable.data.rows.length > 0 ? (
                                currentTable.data.rows.map((row, i) => (
                                  <TableRow key={i}>
                                    {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                                  </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">Belum ada data untuk indikator ini.</TableCell>
                                </TableRow>
                            )}
                          </TableBody>
                        </Table>
                     </CardContent>
                     <CardFooter className="bg-gray-50 text-xs text-gray-500 py-3">
                        Sumber: {currentTable.source}
                     </CardFooter>
                   </Card>
                 </div>
              </div>
             </>
          ) : (
              <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm">
                  <p>Belum ada data statistik yang diinput untuk desa ini.</p>
              </div>
          )}
        </div>
      </section>

      {/* PUBLIKASI (REAL DATA) */}
      <section id="publikasi" className="py-16 container mx-auto px-6">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#154D71]">Publikasi Desa</h2>
            <div className="w-20 h-1 bg-[#33A1E0] mx-auto mt-2 rounded-full"></div>
         </div>
         
         <div className="bg-gray-50 p-6 rounded-xl mb-8 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-48">
               <Label className="mb-2 block">Tahun</Label>
               <Select value={selectedYear} onValueChange={setSelectedYear}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
            <div className="w-full md:w-48">
               <Label className="mb-2 block">Bulan</Label>
               <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    {monthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
            <div className="text-sm text-gray-500 pb-2 ml-auto">
              Menampilkan {currentPublications.length} dari {filteredPublications.length} dokumen
            </div>
         </div>

         {currentPublications.length > 0 ? (
           <div className="grid md:grid-cols-2 gap-6 mb-8">
              {currentPublications.map(pub => (
                <Card key={pub.id} className="flex overflow-hidden hover:shadow-lg transition-shadow border-0 bg-gray-50">
                  <div className="w-32 bg-gray-200 shrink-0">
                    <img 
                        src={pub.imageUrl} 
                        alt={pub.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => e.target.src = 'https://placehold.co/300x400/BFDBFE/1E3A8A?text=No+Cover'}
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between w-full">
                    <div>
                      <h3 className="font-bold text-[#154D71] line-clamp-2 mb-2">{pub.title}</h3>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {pub.date}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{pub.description}</p>
                    </div>
                    {pub.fileUrl && (
                        <Button asChild size="sm" variant="link" className="px-0 text-[#33A1E0] self-start mt-2">
                            <a href={pub.fileUrl} target="_blank" rel="noreferrer">
                                Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1"/>
                            </a>
                        </Button>
                    )}
                  </div>
                </Card>
              ))}
           </div>
         ) : (
           <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">Tidak ada publikasi ditemukan untuk filter ini.</div>
         )}

         {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={currentPage === i + 1} 
                      onClick={() => setCurrentPage(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
         )}
      </section>

      {/* PETA TEMATIK (REAL DATA) */}
      <section id="peta" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
             <h2 className="text-3xl font-bold text-[#154D71]">Peta Tematik</h2>
             <div className="w-20 h-1 bg-[#33A1E0] mx-auto mt-2 rounded-full"></div>
             <p className="mt-4 text-gray-600">Visualisasi data geospasial wilayah {village.name}.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Kontrol Layer (Interaktif untuk Publik) */}
            <Card className="lg:col-span-1 h-fit shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-[#154D71]"/> Layer Peta</CardTitle>
                <CardDescription>Centang layer untuk ditampilkan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mapData.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Belum ada data peta dari admin.</p>
                ) : (
                  mapData.map(layer => (
                    <div key={layer.id} className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox 
                        id={`pub-layer-${layer.id}`} 
                        checked={localLayerVisibility[layer.id] ?? false} 
                        onCheckedChange={() => handleLocalLayerToggle(layer.id)}
                      />
                      <div className="grid gap-1.5 leading-none cursor-pointer">
                         <label 
                            htmlFor={`pub-layer-${layer.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                         >
                            {layer.name}
                         </label>
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }}></div>
                            <span className="text-xs text-muted-foreground">{layer.color}</span>
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Map Container */}
            <Card className="lg:col-span-3 overflow-hidden h-[500px] z-0 shadow-lg border-0">
               <MapContainer center={[-2.9739, 119.9045]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapData.map(layer => (
                   localLayerVisibility[layer.id] && layer.geometry && (
                    <GeoJSON 
                      key={layer.id} 
                      data={layer.geometry} 
                      style={{ color: layer.color, fillColor: layer.color, weight: 2, fillOpacity: 0.4 }} 
                      onEachFeature={(feature, l) => {
                        l.bindPopup(`
                          <div class="text-sm">
                            <p class="font-bold mb-1">${layer.name}</p>
                            <p>Tipe: ${layer.geometry.type}</p>
                          </div>
                        `);
                      }} 
                    />
                   )
                ))}
              </MapContainer>
            </Card>
          </div>
        </div>
      </section>

      {/* DOKUMENTASI (GENERATED DARI GAMBAR YANG ADA) */}
      <section id="dokumentasi" className="py-16 container mx-auto px-6">
        <div className="text-center mb-10">
           <h2 className="text-3xl font-bold text-[#154D71]">Dokumentasi</h2>
           <div className="w-20 h-1 bg-[#33A1E0] mx-auto mt-2 rounded-full"></div>
        </div>
        
        {documentationImages.length > 0 ? (
            <div className="group w-full overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="flex animate-marquee-slow [animation-play-state:running] group-hover:[animation-play-state:paused]">
                {/* Duplikasi array agar marquee terlihat endless */}
                {[...documentationImages, ...documentationImages].map((img, index) => (
                  <div key={index} className="flex-shrink-0 w-full md:w-1/3 p-2">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group/item cursor-pointer">
                      <img
                        src={img}
                        alt={`Dokumentasi ${index + 1}`}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        onError={(e) => e.target.src = 'https://placehold.co/800x600?text=Image'}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-colors flex items-center justify-center">
                         <Eye className="text-white opacity-0 group-hover/item:opacity-100 transition-opacity w-8 h-8 drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        ) : (
            <div className="text-center text-gray-400 italic py-8">Belum ada dokumentasi kegiatan.</div>
        )}
      </section>

      <Footer />
    </div>
  );
}

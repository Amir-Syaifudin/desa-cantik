// src/pages/admin/DataStatistikDesa.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Edit, Trash, Plus, Calendar as CalendarIcon, FileText,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { dataApi } from '@/services/dataApi';

// --- Data Dummy ---
const dummyStatistics = []; // Cleared dummy data

const subjectOptions = ['Demografi', 'Ekonomi', 'Pendidikan', 'Kesehatan', 'Pemerintahan'];
const statusOptions = ['Terverifikasi', 'Menunggu Validasi', 'Ditolak'];

const defaultFormState = {
  title: '',
  subject: subjectOptions[0],
  updatedDate: new Date(),
  status: statusOptions[0],
  file: null, 
  fileName: '',
  fileUrl: '',
};

export default function DataStatistikDesa() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statisticTypes, setStatisticTypes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null); 
  
  // --- State Filter (BARU) ---
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    if (user?.village_id) {
      loadData();
    }
  }, [user?.village_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, typesData] = await Promise.all([
        dataApi.listStatistics(user.village_id, { per_page: 100 }),
        dataApi.listStatisticTypes()
      ]);
      
      const formattedStats = statsData.items.map(item => ({
        ...item,
        updatedDate: item.updatedDate ? new Date(item.updatedDate) : new Date(),
      }));

      setStatistics(formattedStats);
      setStatisticTypes(typesData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper warna badge status
  const getStatusVariant = (status) => {
    switch (status) {
      case "Terverifikasi": return "default"; // Biasanya hitam/gelap di shadcn, bisa di-custom class
      case "Menunggu Validasi": return "secondary";
      case "Ditolak": return "destructive";
      default: return "outline";
    }
  };

  // Helper custom class untuk warna badge lebih spesifik
  const getStatusClassName = (status) => {
    switch (status) {
      case "Terverifikasi": return "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white";
      case "Menunggu Validasi": return "bg-amber-500 hover:bg-amber-600 border-transparent text-white";
      case "Ditolak": return "bg-red-500 hover:bg-red-600 border-transparent text-white";
      default: return "";
    }
  };

  // --- Handlers Form ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    if (date) setFormState((prev) => ({ ...prev, updatedDate: date }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Buat object URL untuk file baru
      const objectUrl = URL.createObjectURL(file);
      setFormState((prev) => ({ 
        ...prev, 
        file: file, 
        fileName: file.name,
        fileUrl: objectUrl 
      }));
    }
  };

  // --- Handlers Dialog ---
  const handleOpenTambah = () => {
    setFormState(defaultFormState);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (stat) => {
    setEditingId(stat.id);
    setFormState({
      ...stat,
      file: null, // Reset input file fisik
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (isOpen) => {
    if (!isOpen) {
      // Cleanup memory jika batal simpan
      if (formState.fileUrl && formState.file) {
        URL.revokeObjectURL(formState.fileUrl);
      }
      setFormState(defaultFormState);
      setEditingId(null);
    }
    setIsDialogOpen(isOpen);
  };

  // --- CRUD Actions ---
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('indicator_name', formState.title);
      
      // Find type ID
      const typeId = statisticTypes.find(t => t.category === formState.subject || t.name === formState.subject)?.id || 1;
      formData.append('statistic_type_id', typeId);
      
      formData.append('value', 0);
      formData.append('year', formState.updatedDate.getFullYear());
      formData.append('status', formState.status);
      
      if (formState.file) {
        formData.append('file', formState.file);
      }

      if (editingId) {
        await dataApi.updateStatistic(user.village_id, editingId, formData);
      } else {
        await dataApi.createStatistic(user.village_id, formData);
      }
      
      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save", error);
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await dataApi.deleteStatistic(user.village_id, id);
        loadData();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Gagal menghapus data");
      }
    }
  };

  const availableSubjects = useMemo(() => {
    const subjects = statistics.map(s => s.subject);
    // Set otomatis menghapus duplikat, lalu kita urutkan abjad
    return Array.from(new Set(subjects)).sort();
  }, [statistics]);

  // 2. Ambil Tahun Unik dari Data yang ada
  const availableYears = useMemo(() => {
    const years = statistics.map(s => s.updatedDate.getFullYear());
    // Hapus duplikat dan urutkan dari terbaru (descending)
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [statistics]);
  
  // --- Logika Filter ---
  const filteredStatistics = statistics.filter((stat) => {
    const matchSubject = filterSubject === 'all' || stat.subject === filterSubject;
    const statYear = stat.updatedDate.getFullYear().toString();
    const matchYear = filterYear === 'all' || statYear === filterYear;
    return matchSubject && matchYear;
  });

  return (
    <div className="p-8 space-y-6">
      
      {/* --- Header & Filters --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4">
          
          {/* Filter Subjek Dinamis */}
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Semua Subjek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Subjek</SelectItem>
              {availableSubjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter Tahun Dinamis */}
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {availableYears.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        <Button onClick={handleOpenTambah} className="bg-[#1C6EA4] hover:bg-[#154D71] shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Statistik
        </Button>
      </div>

      {/* --- Tabel Statistik --- */}
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[50px] font-semibold text-slate-600">No.</TableHead>
                <TableHead className="font-semibold text-slate-600">Nama Statistik</TableHead>
                <TableHead className="font-semibold text-slate-600">Subjek</TableHead>
                <TableHead className="font-semibold text-slate-600">Tanggal Diperbarui</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Berkas (CSV)</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStatistics.length > 0 ? (
                filteredStatistics.map((stat, index) => (
                  <TableRow key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-slate-500">{index + 1}</TableCell>
                    <TableCell className="font-medium text-slate-800">{stat.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {stat.subject}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(stat.updatedDate, 'dd LLL yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(stat.status)}
                        className={cn("font-normal", getStatusClassName(stat.status))}
                      >
                        {stat.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {stat.fileUrl ? (
                        <a
                          href={stat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline max-w-[150px] truncate"
                          title={stat.fileName}
                        >
                          <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{stat.fileName}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Tidak ada file</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2 pr-6">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200"
                        onClick={() => handleOpenEdit(stat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(stat.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    Tidak ada data statistik yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* --- Pagination --- */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredStatistics.length} data
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">Halaman 1</div>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* --- Dialog Form Tambah/Edit --- */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Data Statistik' : 'Tambah Data Statistik Baru'}
            </DialogTitle>
            <DialogDescription>
              Lengkapi detail data statistik di bawah ini. Pastikan data yang diinput sudah valid.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nama Statistik</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                placeholder="Contoh: Data Penduduk Lembang 2025"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subjek</Label>
                <Select
                  name="subject"
                  value={formState.subject}
                  onValueChange={(value) => handleSelectChange('subject', value)}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Pilih subjek" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formState.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Diperbarui</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formState.updatedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.updatedDate ? (
                      format(formState.updatedDate, 'dd LLL yyyy', { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.updatedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Berkas CSV</Label>
              {/* Preview file saat ini */}
              {(editingId || formState.fileUrl) && formState.fileName && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="truncate font-medium">{formState.fileName}</span>
                  <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">
                    {formState.file ? '(File Baru)' : '(File Saat Ini)'}
                  </span>
                </div>
              )}
              <Input
                id="file"
                name="file"
                type="file"
                accept=".csv, text/csv, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Format wajib: .csv</p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-[#1C6EA4] hover:bg-[#154D71]">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
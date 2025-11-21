// src/pages/admin/PublikasiDesa.jsx
import { useState, useMemo, useEffect } from 'react';
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
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight // Impor baru
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { dataApi } from '@/services/dataApi';

// --- Data Dummy ---
// const dummyPublications = []; 

// Opsi untuk form select
const subjectOptions = ['Statistik Desa', 'Sosial', 'Ekonomi Lokal', 'Pemerintahan'];
const statusOptions = ['Rilis', 'Diarsipkan'];
// --------------------

const defaultFormState = {
  title: '',
  subject: subjectOptions[0],
  releaseDate: new Date(),
  status: statusOptions[0],
  file: null, 
  fileName: '',
  fileUrl: '',
};

export default function PublikasiDesa() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null); 

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
      const data = await dataApi.listPublications(user.village_id, { per_page: 100 });
      const formatted = data.items.map(item => ({
        ...item,
        subject: item.category,
        releaseDate: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      }));
      setPublications(formatted);
    } catch (error) {
      console.error("Failed to load publications", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Ambil Subjek Unik dari Data yang ada
  const availableSubjects = useMemo(() => {
    const subjects = publications.map(s => s.subject);
    return Array.from(new Set(subjects)).sort();
  }, [publications]);

  // 2. Ambil Tahun Unik dari Data yang ada
  const availableYears = useMemo(() => {
    const years = publications.map(s => s.releaseDate.getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [publications]);


  // --- Handlers untuk Form ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormState((prev) => ({ ...prev, releaseDate: date }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormState((prev) => ({ 
        ...prev, 
        file: file, 
        fileName: file.name,
        fileUrl: URL.createObjectURL(file) 
      }));
    }
  };

  // --- Handlers untuk Dialog ---
  const handleOpenTambah = () => {
    setFormState(defaultFormState);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (pub) => {
    setEditingId(pub.id);
    setFormState({
      ...pub,
      file: null, // Reset file input
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    // Revoke URL lokal agar tidak terjadi memory leak
    if (formState.fileUrl && formState.file) {
      URL.revokeObjectURL(formState.fileUrl);
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setFormState(defaultFormState);
  };

  // --- CRUD Actions ---
  const handleSubmit = async () => {
    try {
      const payload = {
        title: formState.title,
        category: formState.subject,
        published_at: format(formState.releaseDate, 'yyyy-MM-dd'),
        status: formState.status,
        description: '',
      };

      if (editingId) {
        await dataApi.updatePublication(user.village_id, editingId, payload);
        if (formState.file) {
          await dataApi.replacePublicationFile(user.village_id, editingId, formState.file);
        }
      } else {
        const createPayload = {
          ...payload,
          file: formState.file
        };
        await dataApi.uploadPublication(user.village_id, createPayload);
      }
      
      loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save", error);
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) {
      try {
        await dataApi.deletePublication(user.village_id, id);
        loadData();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Gagal menghapus data");
      }
    }
  };

  // --- Logika Filter Data ---
  const filteredPublications = publications.filter((pub) => {
    const matchSubject = filterSubject === 'all' || pub.subject === filterSubject;
    // Filter tahun berdasarkan releaseDate
    const pubYear = pub.releaseDate.getFullYear().toString();
    const matchYear = filterYear === 'all' || pubYear === filterYear;
    
    return matchSubject && matchYear;
  });
  return (
    <div className="p-8 space-y-6">
      {/* --- Filter dan Tombol Tambah --- */}
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
        <Button onClick={handleOpenTambah} className="bg-[#1C6EA4] hover:bg-[#154D71]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Publikasi
        </Button>
      </div>

      {/* --- Tabel Publikasi --- */}
      <Card className="shadow-lg border-0 rounded-x1 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] font-semibold text-slate-600">No.</TableHead>
                <TableHead className="font-semibold text-slate-600">Judul Publikasi</TableHead>
                <TableHead className="font-semibold text-slate-600">Subjek</TableHead>
                <TableHead className="font-semibold text-slate-600">Tanggal Rilis</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Berkas</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredPublications.length > 0 ? (
                filteredPublications.map((pub, index) => (
                <TableRow key={pub.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-slate-500">{index + 1}</TableCell>
                  <TableCell className="font-medium  text-slate-800">{pub.title}</TableCell>
                  <TableCell>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {pub.subject}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(pub.releaseDate, 'dd LLL yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pub.status === 'Rilis' ? 'default' : 'secondary'} className={cn("font-normal", pub.status === 'Rilis' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-400 hover:bg-slate-500")}>
                        {pub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pub.fileUrl ? (
                        <a
                          href={pub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline max-w-[150px] truncate"
                          title={pub.fileName}
                        >
                          <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{pub.fileName}</span>
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
                        onClick={() => handleOpenEdit(pub)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(pub.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    Tidak ada publikasi yang ditemukan.
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
          Menampilkan {filteredPublications.length} data
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
              {editingId ? 'Edit Publikasi' : 'Tambah Publikasi Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi detail dokumen publikasi di bawah ini. Klik simpan untuk perubahan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Publikasi</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
                placeholder="Masukkan judul publikasi"
              />
            </div>

            {/* Subjek */}
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

            {/* Tanggal Rilis */}
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Tanggal Rilis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formState.releaseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.releaseDate ? (
                      format(formState.releaseDate, 'dd LLL yyyy', { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" allign="start">
                  <Calendar
                    mode="single"
                    selected={formState.releaseDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
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

            {/* Berkas PDF */}
            <div className="space-y-2">
              <Label htmlFor="file">Berkas PDF</Label>
              {/* Tampilkan berkas saat ini atau pratinjau */}
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
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Maksimal ukuran file 5MB. Format .pdf</p>
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
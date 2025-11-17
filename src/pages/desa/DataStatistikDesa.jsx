// src/pages/admin/DataStatistikDesa.jsx

import { useState } from 'react';
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

// --- Data Dummy ---
const dummyStatistics = [
  {
    id: 1,
    title: 'Data Penduduk Lembang Nonongan Selatan 2024',
    subject: 'Demografi',
    updatedDate: new Date('2025-11-15'),
    status: 'Terverifikasi',
    fileName: 'data-penduduk-2024.csv',
    fileUrl: '/mock-files/data-penduduk-2024.csv', // URL mock
  },
  {
    id: 2,
    title: 'Data UMKM Lembang Nonongan Selatan 2024',
    subject: 'Ekonomi',
    updatedDate: new Date('2025-11-10'),
    status: 'Menunggu Validasi',
    fileName: 'data-umkm-2024.csv',
    fileUrl: '/mock-files/data-umkm-2024.csv', // URL mock
  },
  {
    id: 3,
    title: 'Data Fasilitas Pendidikan 2024',
    subject: 'Pendidikan',
    updatedDate: new Date('2025-11-05'),
    status: 'Ditolak',
    fileName: 'data-fasilitas-pendidikan-2024.csv',
    fileUrl: '/mock-files/data-fasilitas-pendidikan-2024.csv', // URL mock
  },
];

// Opsi untuk form select
const subjectOptions = ['Demografi', 'Ekonomi', 'Pendidikan', 'Kesehatan', 'Pemerintahan'];
const statusOptions = ['Terverifikasi', 'Menunggu Validasi', 'Ditolak'];
// --------------------

// Nilai default untuk form 'Tambah'
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
  const [statistics, setStatistics] = useState(dummyStatistics);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null); 

  // Fungsi helper untuk menentukan warna Badge
  const getStatusVariant = (status) => {
    switch (status) {
      case "Terverifikasi":
        return "default";
      case "Menunggu Validasi":
        return "secondary";
      case "Ditolak":
        return "destructive";
      default:
        return "outline";
    }
  };

  // --- Handlers untuk Form ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormState((prev) => ({ ...prev, updatedDate: date }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const handleOpenEdit = (stat) => {
    setEditingId(stat.id);
    setFormState({
      ...stat,
      file: null, // Reset file input
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (formState.fileUrl && formState.file) {
      URL.revokeObjectURL(formState.fileUrl);
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setFormState(defaultFormState);
  };

  // --- Handler untuk Aksi ---
  const handleSubmit = () => {
    if (editingId) {
      // Logika Edit
      setStatistics(
        statistics.map((stat) =>
          stat.id === editingId
            ? { ...stat, 
                ...formState, 
                fileName: formState.file ? formState.file.name : stat.fileName,
                fileUrl: formState.file ? formState.fileUrl : stat.fileUrl
              }
            : stat
        )
      );
    } else {
      // Logika Tambah
      const newStatistic = {
        ...formState,
        id: Date.now(), 
        fileName: formState.file ? formState.file.name : 'Belum ada berkas',
      };
      setStatistics([newStatistic, ...statistics]);
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setFormState(defaultFormState);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data statistik ini?')) {
      const statToDelete = statistics.find(p => p.id === id);
      if (statToDelete && statToDelete.fileUrl && statToDelete.fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(statToDelete.fileUrl);
      }
      setStatistics(statistics.filter((stat) => stat.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Data Statistik Desa</h1>

      {/* --- Filter dan Tombol Tambah --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Subjek" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Subjek</SelectItem>
              {subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue="2025">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleOpenTambah} className="bg-[#1C6EA4] hover:bg-[#154D71]">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Statistik
        </Button>
      </div>

      {/* --- Tabel Statistik --- */}
      <Card className="shadow-lg border-0">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Nama Statistik</TableHead>
                <TableHead>Subjek</TableHead>
                <TableHead>Tanggal Diperbarui</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Berkas (CSV)</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat, index) => (
                <TableRow key={stat.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{stat.title}</TableCell>
                  <TableCell>{stat.subject}</TableCell>
                  <TableCell>
                    {format(stat.updatedDate, 'dd LLL yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(stat.status)}>
                      {stat.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 truncate max-w-[200px]">
                    <a
                      href={stat.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center hover:underline",
                        stat.fileUrl ? "text-blue-600 hover:text-blue-800" : "text-muted-foreground cursor-not-allowed"
                      )}
                      onClick={(e) => !stat.fileUrl && e.preventDefault()} 
                    >
                      <FileText className="h-4 w-4 inline-block mr-1 flex-shrink-0" />
                      <span className="truncate">{stat.fileName}</span>
                    </a>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(stat)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(stat.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* --- Pagination --- */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">
              Baris per halaman
            </Label>
            <Select defaultValue="10">
              <SelectTrigger className="w-[80px]" id="rows-per-page">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            1-{statistics.length} dari {statistics.length} baris
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" disabled>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            defaultValue="1"
            className="w-12 h-9 text-center"
            readOnly
          />
          <span className="text-sm text-muted-foreground">dari 1</span>
          <Button variant="outline" size="icon" className="h-9 w-9" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" disabled>
            <ChevronsRight className="h-4 w-4" />
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
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Judul/Nama Statistik */}
            <div className="space-y-2">
              <Label htmlFor="title">Nama Statistik</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleFormChange}
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

            {/* Tanggal Diperbarui */}
            <div className="space-y-2">
              <Label htmlFor="updatedDate">Tanggal Diperbarui</Label>
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
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.updatedDate}
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

            {/* Berkas CSV */}
            <div className="space-y-2">
              <Label htmlFor="file">Berkas CSV</Label>
              {(editingId || formState.fileUrl) && formState.fileName && (
                <div className="text-sm text-muted-foreground">
                  Berkas saat ini: 
                  <a 
                    href={formState.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline ml-1"
                  >
                    {formState.fileName}
                  </a>
                </div>
              )}
              <Input
                id="file"
                name="file"
                type="file"
                accept="text/csv, .csv" 
                onChange={handleFileChange}
              />
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
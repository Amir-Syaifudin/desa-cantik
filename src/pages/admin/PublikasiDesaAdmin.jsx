// src/pages/dashboard/PublikasiDesaAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  BookOpen, 
  MapPin, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText, 
  Download,
  Search
} from 'lucide-react';
import { dataApi } from '@/services/dataApi';
import { publicationService } from '@/services/publicationService';

export default function PublikasiDesaAdmin() {
  // State
  const [villages, setVillages] = useState([]);
  const [selectedDesa, setSelectedDesa] = useState(null);
  const [publications, setPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);

  // Load villages list
  useEffect(() => {
    const loadVillages = async () => {
      try {
        const response = await dataApi.listVillages({ per_page: 100, is_active: 'all' });
        const items = response.items || [];
        setVillages(items);
      } catch (error) {
        console.error('Gagal memuat desa:', error);
      }
    };

    loadVillages();
  }, []);

  // Efek: ambil publikasi dari backend saat desa berubah
  useEffect(() => {
    const loadPublications = async () => {
      if (!selectedDesa) {
        setPublications([]);
        return;
      }
      try {
        const data = await publicationService.getPublications(selectedDesa, { per_page: 100 });
        const list = Array.isArray(data) ? data : (data.data || []);
        setPublications(list);
      } catch (error) {
        console.error('Gagal memuat publikasi desa:', error);
        setPublications([]);
      }
    };

    loadPublications();
  }, [selectedDesa]);

  // Handler CRUD
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!selectedDesa) return;
    if (confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) {
      try {
        await publicationService.deletePublication(selectedDesa, id);
        setPublications((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Gagal menghapus publikasi:', error);
        alert('Gagal menghapus publikasi.');
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (!selectedDesa) return;

      if (modalType === 'add') {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('category', data.category || 'Umum');
        formData.append('published_at', `${data.year || new Date().getFullYear()}-01-01`);
        if (data.file instanceof File) {
          formData.append('file', data.file);
        }

        const created = await publicationService.createPublication(selectedDesa, formData);
        const createdData = created.data || created;
        setPublications([createdData, ...publications]);
      } else if (currentItem?.id) {
        await publicationService.updatePublication(selectedDesa, currentItem.id, {
          title: data.title,
          category: data.category,
          published_at: `${data.year || new Date().getFullYear()}-01-01`,
        });
        setPublications((prev) => prev.map((p) => (p.id === currentItem.id ? { ...p, ...data } : p)));
      }
    } catch (error) {
      console.error('Gagal menyimpan publikasi:', error);
      alert('Gagal menyimpan publikasi.');
    }
    setIsModalOpen(false);
  };

  // Filter pencarian lokal
  const filteredPublications = publications.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. PILIH DESA (Wajib) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pilih Desa
          </CardTitle>
          <CardDescription>
            Pilih desa untuk mengelola publikasi dan dokumen statistik mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedDesa} value={selectedDesa || ''}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Pilih desa..." />
            </SelectTrigger>
            <SelectContent>
              {villages.map(desa => (
                <SelectItem key={desa.id} value={String(desa.id)}>
                  {desa.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 2. KONTEN UTAMA (Hanya muncul jika desa dipilih) */}
      {selectedDesa && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Daftar Publikasi</CardTitle>
                <CardDescription>
                  Dokumen yang diterbitkan untuk {villages.find(d => String(d.id) === String(selectedDesa))?.name || '-'}.
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenModal('add')}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Publikasi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            
            {/* Search Bar */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Cari judul publikasi..." 
                className="pl-10 max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tabel Data */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul Publikasi</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="w-[50px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublications.length > 0 ? (
                    filteredPublications.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>{item.year}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <FileText className="h-3 w-3" />
                            {item.file}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenModal('edit', item)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert(`Download ${item.file}`)}>
                                <Download className="mr-2 h-4 w-4" /> Unduh
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        Belum ada publikasi untuk desa ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL ADD/EDIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalType === 'add' ? 'Tambah Publikasi Baru' : 'Edit Publikasi'}
              </DialogTitle>
              <DialogDescription>
                Isi detail dokumen publikasi di bawah ini.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Publikasi</Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={currentItem?.title} 
                  placeholder="Contoh: Kecamatan Dalam Angka 2024" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input 
                    id="year" 
                    name="year" 
                    type="number"
                    defaultValue={currentItem?.year || new Date().getFullYear()} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" defaultValue={currentItem?.category || "Laporan Statistik"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laporan Statistik">Laporan Statistik</SelectItem>
                      <SelectItem value="Profil Desa">Profil Desa</SelectItem>
                      <SelectItem value="Infografis">Infografis</SelectItem>
                      <SelectItem value="Berita Resmi">Berita Resmi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi Singkat (Opsional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Penjelasan singkat tentang isi dokumen..." 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file">Upload File (PDF)</Label>
                <Input 
                  id="file" 
                  name="file" 
                  type="file" 
                  accept=".pdf"
                  required={modalType === 'add'} 
                />
                {modalType === 'edit' && currentItem?.file && (
                  <p className="text-xs text-gray-500">File saat ini: {currentItem.file}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

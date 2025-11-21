// src/pages/admin/DataStatistikAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  FileText,
  Search,
  Loader2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dataApi } from '@/services/dataApi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DataStatistikAdmin() {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'view'
  const [selectedStatistic, setSelectedStatistic] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load villages
  useEffect(() => {
    const loadVillages = async () => {
      try {
        const response = await dataApi.listVillages({ per_page: 100, is_active: 'all' });
        setVillages(response.items || []);
      } catch (error) {
        console.error('Gagal memuat desa:', error);
      }
    };
    loadVillages();
  }, []);

  // Load statistics
  const loadStatistics = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: 100,
      };
      
      if (selectedVillage !== 'all') {
        params.village_id = selectedVillage;
      }
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response = await dataApi.listAllStatistics(params);
      setStatistics(response.items || []);
    } catch (error) {
      console.error('Gagal memuat data statistik:', error);
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVillage, filterStatus]);

  // Filter by search term
  const filteredStatistics = useMemo(() => {
    if (!searchTerm) return statistics;
    
    const term = searchTerm.toLowerCase();
    return statistics.filter(stat => 
      stat.indicator_name?.toLowerCase().includes(term) ||
      stat.village?.name?.toLowerCase().includes(term) ||
      stat.statistic_type?.category?.toLowerCase().includes(term)
    );
  }, [statistics, searchTerm]);

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terverifikasi':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">{status}</Badge>;
      case 'Menunggu Validasi':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">{status}</Badge>;
      case 'Ditolak':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">{status}</Badge>;
      default:
        return <Badge variant="outline">{status || '-'}</Badge>;
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!selectedStatistic) return;
    
    setIsSubmitting(true);
    try {
      await dataApi.approveStatistic(
        selectedStatistic.village_id,
        selectedStatistic.id
      );
      await loadStatistics();
      setIsModalOpen(false);
      setSelectedStatistic(null);
    } catch (error) {
      console.error('Gagal menyetujui statistik:', error);
      alert('Gagal menyetujui statistik. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedStatistic) return;
    
    if (!rejectReason.trim()) {
      alert('Harap masukkan alasan penolakan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dataApi.rejectStatistic(
        selectedStatistic.village_id,
        selectedStatistic.id,
        rejectReason
      );
      await loadStatistics();
      setIsModalOpen(false);
      setSelectedStatistic(null);
      setRejectReason('');
    } catch (error) {
      console.error('Gagal menolak statistik:', error);
      alert('Gagal menolak statistik. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal
  const openModal = (type, statistic) => {
    setModalType(type);
    setSelectedStatistic(statistic);
    setRejectReason('');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Data Statistik - Validasi</CardTitle>
          <CardDescription>
            Kelola dan validasi data statistik dari semua desa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama statistik, desa, atau kategori..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Desa */}
            <Select value={selectedVillage} onValueChange={setSelectedVillage}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Desa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Desa</SelectItem>
                {villages.map((village) => (
                  <SelectItem key={village.id} value={String(village.id)}>
                    {village.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Menunggu Validasi">Menunggu Validasi</SelectItem>
                <SelectItem value="Terverifikasi">Terverifikasi</SelectItem>
                <SelectItem value="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Nama Statistik</TableHead>
                <TableHead>Desa</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStatistics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    Tidak ada data statistik yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStatistics.map((stat, index) => (
                  <TableRow key={stat.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {stat.indicator_name || stat.title || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {stat.village?.name || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {stat.statistic_type?.category || stat.subject || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {stat.year || '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(stat.status)}
                    </TableCell>
                    <TableCell>
                      {stat.file_url || stat.file ? (
                        <a
                          href={stat.file_url || stat.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Lihat File
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openModal('view', stat)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          {stat.status === 'Menunggu Validasi' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => openModal('approve', stat)}
                                className="text-emerald-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Setujui
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openModal('reject', stat)}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Tolak
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {modalType === 'view' && selectedStatistic && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Data Statistik</DialogTitle>
                <DialogDescription>
                  Informasi lengkap data statistik
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm font-semibold">Nama Statistik</Label>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedStatistic.indicator_name || selectedStatistic.title || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Desa</Label>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedStatistic.village?.name || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Kategori</Label>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedStatistic.statistic_type?.category || selectedStatistic.subject || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Tahun</Label>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedStatistic.year || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedStatistic.status)}
                  </div>
                </div>
                {selectedStatistic.file_url || selectedStatistic.file ? (
                  <div>
                    <Label className="text-sm font-semibold">File</Label>
                    <a
                      href={selectedStatistic.file_url || selectedStatistic.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Buka File
                    </a>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Tutup</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}

          {modalType === 'approve' && selectedStatistic && (
            <>
              <DialogHeader>
                <DialogTitle>Setujui Data Statistik</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menyetujui data statistik ini?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-slate-700">
                  <strong>{selectedStatistic.indicator_name || selectedStatistic.title}</strong> dari{' '}
                  <strong>{selectedStatistic.village?.name}</strong> akan disetujui dan statusnya berubah menjadi "Terverifikasi".
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting}>Batal</Button>
                </DialogClose>
                <Button 
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyetujui...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Setujui
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {modalType === 'reject' && selectedStatistic && (
            <>
              <DialogHeader>
                <DialogTitle>Tolak Data Statistik</DialogTitle>
                <DialogDescription>
                  Masukkan alasan penolakan data statistik ini
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm text-slate-700 mb-2">
                    Data statistik: <strong>{selectedStatistic.indicator_name || selectedStatistic.title}</strong>
                  </p>
                  <p className="text-sm text-slate-700">
                    Dari desa: <strong>{selectedStatistic.village?.name}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rejectReason">Alasan Penolakan *</Label>
                  <Textarea
                    id="rejectReason"
                    placeholder="Masukkan alasan penolakan..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting}>Batal</Button>
                </DialogClose>
                <Button 
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menolak...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}


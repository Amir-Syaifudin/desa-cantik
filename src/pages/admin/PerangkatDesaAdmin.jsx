// src/pages/admin/PerangkatDesaAdmin.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Save,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PerangkatDesaAdmin() {
  // ==================== STATE ====================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ FIX: Pisahkan state pagination untuk hindari infinite loop
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage] = useState(10);
  
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input field terpisah

  // State untuk Dialog CRUD
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // State untuk Villages (dropdown)
  const [villages, setVillages] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    password_confirmation: '',
    village_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // ==================== FETCH DATA ====================
  
  // 1. Fetch Villages (Load 1x saat mount)
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const response = await apiClient.get('/villages', {
          params: { per_page: 100 },
        });
        setVillages(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching villages:', error);
        setVillages([]);
      }
    };
    fetchVillages();
  }, []);

  // 2. Fetch Users (Perangkat Desa)
  // ✅ FIX: useEffect dengan dependency yang benar
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/users', {
          params: {
            role: 'village_officer',
            page: currentPage,
            per_page: perPage,
            search: search || undefined, // Kirim undefined jika kosong
          },
        });

        console.log('API Response:', response.data); // Debug

        // ✅ FIX: Set data dengan fallback empty array
        setUsers(response.data?.data || []);
        setTotalPages(response.data?.meta?.last_page || 1);
        setTotalUsers(response.data?.meta?.total || 0);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, search, perPage]); // ✅ Dependency: currentPage, search

  // ==================== HANDLERS ====================

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput); // Trigger useEffect dengan search baru
    setCurrentPage(1); // Reset ke halaman 1
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      full_name: '',
      password: '',
      password_confirmation: '',
      village_id: '',
    });
    setFormErrors({});
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      full_name: user.full_name || '',
      password: '',
      password_confirmation: '',
      village_id: user.village?.id?.toString() || '',
    });
    setFormErrors({});
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error untuk field yang diubah
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleVillageChange = (value) => {
    setFormData((prev) => ({ ...prev, village_id: value }));
    if (formErrors.village_id) {
      setFormErrors((prev) => ({ ...prev, village_id: null }));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormErrors({});

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        village_id: parseInt(formData.village_id),
        role_id: 2, // Hardcode role_id untuk village_officer (sesuaikan dengan ID di database)
      };

      // Tambahkan password hanya jika diisi
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      if (dialogMode === 'add') {
        await apiClient.post('/users', payload);
      } else {
        // Untuk update, password optional
        await apiClient.put(`/users/${selectedUser.id}`, payload);
      }

      setIsDialogOpen(false);
      setCurrentPage(1); // Reset ke halaman 1 setelah berhasil
      // ✅ Trigger re-fetch dengan mengubah search (force refresh)
      setSearch((prev) => prev); // Trigger useEffect tanpa ubah value
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert('Gagal menyimpan data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun perangkat desa ini?')) {
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
      
      // Jika halaman current jadi kosong, pindah ke halaman sebelumnya
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // ✅ Force refresh dengan toggle search
        setSearch((prev) => prev);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus data: ' + (error.response?.data?.message || error.message));
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Perangkat Desa</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kelola akun dan akses untuk perangkat desa.
          </p>
        </CardHeader>
        <CardContent>
          {/* Search & Add Button */}
          <div className="flex items-center gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
            </form>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Akun
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Desa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Memuat data...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Belum ada data perangkat desa.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {(currentPage - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.village?.name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {!loading && totalUsers > 0 && (
          <CardFooter className="flex items-center justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
              Menampilkan {(currentPage - 1) * perPage + 1} -{' '}
              {Math.min(currentPage * perPage, totalUsers)} dari {totalUsers}{' '}
              data
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={cn(
                      currentPage === 1 && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
                
                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and adjacent pages
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Show ellipsis if gap
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <PaginationItem>
                            <span className="px-2">...</span>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={cn(
                      currentPage === totalPages &&
                        'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add'
                ? 'Tambah Akun Perangkat Desa'
                : 'Edit Akun Perangkat Desa'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                placeholder="username_desa"
                required
                disabled={formLoading}
              />
              {formErrors.username && (
                <p className="text-sm text-destructive">
                  {formErrors.username[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="email@desacantik.id"
                required
                disabled={formLoading}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email[0]}</p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleFormChange}
                placeholder="Nama Lengkap Perangkat"
                required
                disabled={formLoading}
              />
              {formErrors.full_name && (
                <p className="text-sm text-destructive">
                  {formErrors.full_name[0]}
                </p>
              )}
            </div>

            {/* Desa Binaan */}
            <div className="space-y-2">
              <Label htmlFor="village_id">
                Desa Binaan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.village_id}
                onValueChange={handleVillageChange}
                required
                disabled={formLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih desa..." />
                </SelectTrigger>
                <SelectContent>
                  {villages.map((village) => (
                    <SelectItem key={village.id} value={village.id.toString()}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.village_id && (
                <p className="text-sm text-destructive">
                  {formErrors.village_id[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password
                {dialogMode === 'add' && (
                  <span className="text-destructive"> *</span>
                )}
                {dialogMode === 'edit' && (
                  <span className="text-muted-foreground text-xs">
                    {' '}
                    (Kosongkan jika tidak ingin mengubah)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Minimal 8 karakter"
                  required={dialogMode === 'add'}
                  disabled={formLoading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-destructive">
                  {formErrors.password[0]}
                </p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Konfirmasi Password
                {dialogMode === 'add' && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleFormChange}
                placeholder="Ulangi password"
                required={dialogMode === 'add' || formData.password !== ''}
                disabled={formLoading}
                minLength={8}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={formLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Batal
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
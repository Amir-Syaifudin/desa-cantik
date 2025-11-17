// src/pages/admin/ProfilUmumDesa.jsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Save } from 'lucide-react';

export default function ProfilUmumDesa() {
// 1. State utama untuk data profil desa
  const [profile, setProfile] = useState({
    name: 'Lembang Nonongan Selatan',
    description: 'Lembang Nonongan Selatan merupakan terletak di Kecamatan Sopai, Kabupaten Toraja Utara. Desa ini juga memiliki julukan sebagai Desa Wisata. Lembang Nonongan Selatan berjarak sekitar 5 (lima) kilometer dari Kota Kabupaten. Desa Wisata Nonongan Selatan adalah desa wisata berbasis Budaya dan Alam. Desa Wisata ini masuk ke dalam 50 desa wisata terbaik yang memiliki daya tarik wisata sehingga dapat menjadi destinasi unggulan.',
    imageUrl: 'https://placehold.co/800x450/67e8f9/1C6EA4?text=Foto+Desa'
  });

  // 2. State terpisah untuk form (tanpa gambar)
  const [formState, setFormState] = useState({
    name: profile.name,
    description: profile.description,
  });
  
  // 3. State baru untuk file gambar yang dipilih di form
  const [selectedFile, setSelectedFile] = useState(null);
  
  // 4. State baru untuk URL pratinjau gambar
  const [previewUrl, setPreviewUrl] = useState(profile.imageUrl);

  // 5. State untuk mengontrol visibilitas dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

// 6. Handler untuk membuka dialog dan menyinkronkan data form
  const handleOpenEdit = () => {
    // Salin data teks profil saat ini ke dalam form
    setFormState({
      name: profile.name,
      description: profile.description,
    });
    // Atur pratinjau ke gambar profil saat ini
    setPreviewUrl(profile.imageUrl);
    // Hapus file yang mungkin dipilih sebelumnya
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  // 7. Handler untuk perubahan input TEKS
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 8. Handler untuk perubahan input FILE
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Buat URL pratinjau lokal untuk file yang baru dipilih
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 9. Handler untuk menyimpan perubahan dari dialog
  const handleSubmit = () => {
    // Terapkan perubahan dari form ke profil utama
    setProfile({
      name: formState.name,
      description: formState.description,
      imageUrl: previewUrl, // Gunakan URL pratinjau sebagai URL gambar baru
    });
    // Tutup dialog
    setIsDialogOpen(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Profil Umum</h1>

      {/* Tampilan Gambar */}
      <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Tampilan Konten (Card) */}
      <Card className="shadow-lg border-t-4 border-[#1C6EA4]">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-gray-900">
            {profile.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed">
            {profile.description}
          </p>
        </CardContent>
      </Card>

      {/* Tombol Aksi */}
      <div className="flex justify-end gap-4">
        {/* Tombol "Edit" ini akan memicu Dialog */}
        <Button onClick={handleOpenEdit} className="bg-[#1C6EA4] hover:bg-[#154D71]">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* --- Dialog Form Edit --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profil Umum Desa</DialogTitle>
            <DialogDescription>
              Perbarui informasi desa Anda. Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>
          
          {/* Form di dalam Dialog */}
          <div className="grid gap-6 py-4">
            
            {/* Pratinjau Gambar */}
            <div className="space-y-2">
              <Label>Pratinjau Gambar</Label>
              <div className="w-full h-40 rounded-md overflow-hidden bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Pratinjau"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Input Ganti Gambar (File Upload) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageFile" className="text-right">
                Gambar
              </Label>
              <Input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/png, image/jpeg, image/webp" // Opsi: batasi tipe file
                onChange={handleFileChange} // Gunakan handler file baru
                className="col-span-3"
              />
            </div>

            {/* Input Nama Desa */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Desa
              </Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleTextChange} // Gunakan handler teks baru
                className="col-span-3"
              />
            </div>
            
            {/* Input Deskripsi */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleTextChange} // Gunakan handler teks baru
                className="col-span-3"
                rows={8}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSubmit} className="bg-[#1C6EA4] hover:bg-[#154D71]">
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
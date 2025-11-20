import React, { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
import { dataApi } from '@/services/dataApi';
import { apiClient } from '@/services/apiClient';

const StatusToggle = ({ value, onChange }) => (
  <div className="flex items-center gap-3">
    {['show', 'hide'].map((state) => (
      <button
        key={state}
        type="button"
        onClick={() => onChange?.(state === 'show')}
        className={cn(
          'w-16 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold transition-all',
          state === value
            ? 'bg-slate-200 text-slate-900 shadow-sm'
            : 'bg-white text-slate-400'
        )}
      >
        {state === 'show' ? 'Tampil' : 'Tidak'}
      </button>
    ))}
  </div>
);

const ModulDesaAdmin = () => {
  const [villages, setVillages] = React.useState([]);
  const [modules, setModules] = React.useState([]);
  const [selectedVillage, setSelectedVillage] = React.useState('');

  useEffect(() => {
    const loadVillages = async () => {
      try {
        const response = await dataApi.listVillages({ per_page: 100, is_active: 'all' });
        const items = response.items || [];
        setVillages(items);
        if (items.length > 0) {
          setSelectedVillage(String(items[0].id));
        }
      } catch (error) {
        console.error('Gagal memuat desa:', error);
      }
    };

    loadVillages();
  }, []);

  useEffect(() => {
    const loadModules = async () => {
      if (!selectedVillage) return;
      try {
        const response = await apiClient.get(`/villages/${selectedVillage}/modules`);
        setModules(response.data || []);
      } catch (error) {
        console.error('Gagal memuat modul desa:', error);
        setModules([]);
      }
    };

    loadModules();
  }, [selectedVillage]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">Pilih Desa</h2>
          <Select value={selectedVillage} onValueChange={setSelectedVillage}>
            <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {villages.map((village) => (
                <SelectItem key={village.id} value={String(village.id)}>
                  {village.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Edit Modul Desa</h3>
            </div>
          <ModuleDialog mode="add" />
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-lg">
            <CardHeader className="sr-only">
              <CardTitle>Edit Modul Desa</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-slate-200">
                    <TableHead className="text-center text-xs font-semibold uppercase text-slate-500">
                      No
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">
                      Nama Modul
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">
                      Deskripsi
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase text-slate-500">
                      Aksi
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase text-slate-500">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow
                      key={module.id}
                      className={cn(
                        'text-sm',
                        module.id === 1 ? 'font-semibold text-slate-900' : 'text-slate-700'
                      )}
                    >
                      <TableCell className="text-center text-base font-semibold">
                        {module.id}
                      </TableCell>
                      <TableCell className="text-base font-semibold">
                        {module.module_name || module.name}
                      </TableCell>
                      <TableCell>{module.description}</TableCell>
                      <TableCell className="text-center">
                        <ModuleDialog mode="edit" module={module} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusToggle
                          value={module.is_enabled || module.visibility ? 'show' : 'hide'}
                          onChange={async (isEnabled) => {
                            try {
                              await apiClient.put(`/villages/${selectedVillage}/modules/${module.module_name || module.name}/toggle`, {
                                is_enabled: isEnabled,
                              });
                              setModules((prev) => prev.map((m) => m.id === module.id ? { ...m, is_enabled: isEnabled } : m));
                            } catch (error) {
                              console.error('Gagal mengganti status modul:', error);
                              alert('Gagal mengganti status modul.');
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-5">
              <Button className="flex items-center gap-2 rounded-full bg-emerald-200 px-8 text-emerald-900 hover:bg-emerald-300">
                <Save className="h-4 w-4" />
                Simpan
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ModulDesaAdmin;

const ModuleDialog = ({ mode, module }) => {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: module?.name || '',
    description: module?.description || '',
  });

  useEffect(() => {
    if (open) {
      setFormValues({
        name: module?.name || '',
        description: module?.description || '',
      });
    }
  }, [open, module]);

  const title = mode === 'add' ? 'Tambah Modul Desa' : 'Edit Modul Desa';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate with API
    setOpen(false);
  };

  const trigger =
    mode === 'add' ? (
      <Button
        variant="outline"
        className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-white"
      >
        Tambah
      </Button>
    ) : (
      <Button
        className={cn(
          buttonVariants({ variant: 'default', size: 'sm' }),
          'rounded-full bg-sky-200 text-slate-800 hover:bg-sky-300'
        )}
      >
        Edit
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {title}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">Nama</label>
            <Input
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="rounded-xl border-slate-300 focus-visible:ring-slate-300"
              placeholder="Masukkan nama modul"
              required
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700">
              Deskripsi
            </label>
            <Textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              className="rounded-xl border-slate-300 focus-visible:ring-slate-300"
              placeholder="Masukkan deskripsi modul"
              rows={3}
              required
            />
          </div>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="submit"
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-full bg-emerald-200 text-emerald-900 hover:bg-emerald-300"
            >
              <Save className="h-4 w-4" />
              Simpan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex min-w-[120px] items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
            >
              <XCircle className="h-4 w-4" />
              Kembali
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

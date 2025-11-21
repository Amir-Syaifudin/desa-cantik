// src/pages/admin/PetaTematikAdmin.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// --- IMPOR KEMBALI SELECT (DROPDOWN) ---
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Map, 
  Layers, 
  Database, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Info,
  MapPin,
  Loader2
} from 'lucide-react';
import { dataApi } from '@/services/dataApi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function PetaTematikAdmin() {
  const mapRef = useRef(null); 
  const layerGroupRef = useRef(null); 

  const [selectedDesa, setSelectedDesa] = useState(null);
  const [villages, setVillages] = useState([]);
  const [geospatialData, setGeospatialData] = useState([]);
  const [layerData, setLayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGeo, setLoadingGeo] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [currentItem, setCurrentItem] = useState(null); 

  // Load villages list
  useEffect(() => {
    const loadVillages = async () => {
      try {
        const response = await dataApi.listVillages({ per_page: 100, is_active: 'all' });
        setVillages(response.items || []);
      } catch (error) {
        console.error('Gagal memuat desa:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVillages();
  }, []);

  // Load geospatial and layer data when village is selected
  const loadMapData = useCallback(async () => {
    if (!selectedDesa) {
      setGeospatialData([]);
      setLayerData([]);
      return;
    }
    
    setLoadingGeo(true);
    try {
      const [geoData, mapData] = await Promise.all([
        dataApi.listGeospatial(selectedDesa),
        dataApi.listThematicMaps(selectedDesa)
      ]);
      setGeospatialData(geoData || []);
      setLayerData(mapData || []);
    } catch (error) {
      console.error('Gagal memuat data peta:', error);
      setGeospatialData([]);
      setLayerData([]);
    } finally {
      setLoadingGeo(false);
    }
  }, [selectedDesa]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Inisialisasi Peta (Cleanup)
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render Peta saat desa dipilih
  useEffect(() => {
    // Jangan render peta jika tidak ada desa yang dipilih
    // TAPI: Karena dropdown ada di sini, kita biarkan komponen tetap me-render UI utama
    if (!selectedDesa) {
      if (layerGroupRef.current) layerGroupRef.current.clearLayers();
      return;
    }
    
    if (!mapRef.current && document.getElementById('mapPreview')) {
      mapRef.current = L.map('mapPreview', { 
        center: [-2.9739, 119.9045], 
        zoom: 11,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    if (!mapRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const layerPromises = layerData.map(layer => {
      if (!layer.isVisible && layer.isVisible !== undefined) return Promise.resolve(null);
      
      const geoId = layer.geoId || layer.geospatial_id;
      const geoData = geospatialData.find(g => g.id === parseInt(geoId) || g.id === geoId);
      
      if (geoData) {
        // Real data: geoData.geojson_data or geoData.geometry
        const jsonData = geoData.geojson_data || geoData.geometry;
        
        if (jsonData) {
          try {
            const geoJsonLayer = L.geoJSON(jsonData, {
              style: () => ({
                color: layer.color || '#FF0000',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.3
              }),
              pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                  radius: 6,
                  fillColor: layer.color || '#FF0000',
                  color: "#000",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                });
              }
            });
            return Promise.resolve(geoJsonLayer);
          } catch (err) {
            console.error('Load layer failed:', err);
            return Promise.resolve(null);
          }
        }
      }
      return Promise.resolve(null);
    });

    Promise.all(layerPromises).then(loadedLayers => {
      loadedLayers.forEach(layer => {
        if (layer) layerGroupRef.current.addLayer(layer);
      });
    });

  }, [selectedDesa, layerData, geospatialData]); 

  // --- CRUD Handlers ---
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (!selectedDesa) return;
    
    if (!confirm(`Apakah Anda yakin ingin menghapus ${type === 'geo' ? 'data geospatial' : 'layer'} ini?`)) {
      return;
    }

    try {
      if (type === 'geo') {
        await dataApi.deleteGeospatial(selectedDesa, id);
        setGeospatialData(geospatialData.filter(item => item.id !== id));
      } else {
        await dataApi.deleteThematicMap(selectedDesa, id);
        setLayerData(layerData.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      alert('Gagal menghapus data.');
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDesa) return;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (modalType === 'addGeo') {
        const payload = {
          name: data.name,
          type: data.type,
          geojson_data: data.geojson_data || null,
        };
        const created = await dataApi.createGeospatial(selectedDesa, payload);
        setGeospatialData([...geospatialData, created]);
      } else if (modalType === 'editGeo') {
        const payload = {
          name: data.name,
          type: data.type,
          geojson_data: data.geojson_data || null,
        };
        const updated = await dataApi.updateGeospatial(selectedDesa, currentItem.id, payload);
        setGeospatialData(geospatialData.map(item => item.id === currentItem.id ? updated : item));
      } else if (modalType === 'addLayer') {
        const payload = {
          name: data.name,
          geospatial_id: parseInt(formGeoId || data.geoId),
          color: data.color,
          is_visible: true,
        };
        const created = await dataApi.createThematicMap(selectedDesa, payload);
        setLayerData([...layerData, created]);
      } else if (modalType === 'editLayer') {
        const payload = {
          name: data.name,
          geospatial_id: parseInt(formGeoId || data.geoId),
          color: data.color,
        };
        const updated = await dataApi.updateThematicMap(selectedDesa, currentItem.id, payload);
        setLayerData(layerData.map(item => item.id === currentItem.id ? updated : item));
      }
      setIsModalOpen(false);
      loadMapData(); // Refresh data
    } catch (error) {
      console.error('Gagal menyimpan data:', error);
      alert('Gagal menyimpan data. Pastikan data sudah benar.');
    }
  };

  const [formGeoId, setFormGeoId] = useState('');

  useEffect(() => {
    if (isModalOpen && modalType?.includes('Layer')) {
      setFormGeoId(currentItem?.geoId?.toString() || currentItem?.geospatial_id?.toString() || '');
    }
  }, [isModalOpen, modalType, currentItem]);

  const renderModalContent = () => {
    let title = '';
    let content = null;
    
    if (modalType?.includes('Geo')) {
      title = modalType === 'addGeo' ? 'Tambah Data Geospatial' : 'Edit Data Geospatial';
      content = (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Data</Label>
            <Input name="name" defaultValue={currentItem?.name} required />
          </div>
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Input name="type" defaultValue={currentItem?.type} placeholder="Polygon, Point, Line" required />
          </div>
          <div className="space-y-2">
            <Label>GeoJSON Data (JSON string)</Label>
            <Input name="geojson_data" defaultValue={currentItem?.geojson_data ? JSON.stringify(currentItem.geojson_data) : ''} placeholder='{"type":"FeatureCollection",...}' />
            <p className="text-xs text-gray-500">Masukkan data GeoJSON sebagai string JSON</p>
          </div>
        </div>
      );
    } else {
      title = modalType === 'addLayer' ? 'Tambah Layer Peta' : 'Edit Layer Peta';
      content = (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Layer</Label>
            <Input name="name" defaultValue={currentItem?.name} required />
          </div>
          <div className="space-y-2">
            <Label>Data Geo ID</Label>
            <Select 
              value={formGeoId} 
              onValueChange={setFormGeoId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Data Geospatial" />
              </SelectTrigger>
              <SelectContent>
                {geospatialData.map((geo) => (
                  <SelectItem key={geo.id} value={geo.id.toString()}>
                    {geo.name} (ID: {geo.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="hidden" name="geoId" value={formGeoId} />
          </div>
          <div className="space-y-2">
            <Label>Warna (HEX)</Label>
            <Input name="color" defaultValue={currentItem?.color} placeholder="#FF0000" required />
          </div>
        </div>
      );
    }

    return (
      <DialogContent>
        <form onSubmit={handleFormSubmit}>
          <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
          <div className="py-4">{content}</div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    );
  };

  const currentDesaName = villages.find(d => String(d.id) === String(selectedDesa))?.name || 'Pilih Desa';

  return (
    <div className="space-y-6 w-full">
      
      {/* --- HEADER & FILTER SEJAJAR --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Bagian Kiri: Judul & Deskripsi */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
             Peta Tematik
             {selectedDesa && <span className="text-gray-500 font-normal hidden sm:inline"> | {currentDesaName}</span>}
          </h2>
          <p className="text-sm text-muted-foreground">
            Kelola data geospatial dan layer peta untuk desa terpilih.
          </p>
        </div>

        {/* Bagian Kanan: Filter Dropdown */}
        <div className="w-full sm:w-auto min-w-[200px]">
          <Select 
            value={selectedDesa || ""} 
            onValueChange={(val) => setSelectedDesa(val)}
            disabled={loading}
          >
            <SelectTrigger className="w-full bg-white shadow-sm">
              <SelectValue placeholder={loading ? "Memuat..." : "Pilih Desa..."} />
            </SelectTrigger>
            <SelectContent align="end">
              {villages.map((desa) => (
                <SelectItem key={desa.id} value={String(desa.id)}>
                  {desa.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KONTEN UTAMA - Hanya Tampil Jika Desa Dipilih */}
      {!selectedDesa ? (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50 rounded-xl border border-dashed">
          <div className="p-4 bg-white rounded-full shadow-sm mb-3">
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Belum Ada Desa Dipilih</h3>
          <p className="text-slate-500 max-w-sm text-center mt-1">
            Silakan pilih desa pada menu dropdown di atas untuk mulai mengelola data peta.
          </p>
        </div>
      ) : loadingGeo ? (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50 rounded-xl border border-dashed">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-slate-500">Memuat data peta...</p>
        </div>
      ) : (
        <>
          {/* 1. Manajemen Data (CRUD) */}
          <Tabs defaultValue="geospatial" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geospatial"><Database className="mr-2 h-4 w-4"/> Data Geospatial</TabsTrigger>
              <TabsTrigger value="layer"><Layers className="mr-2 h-4 w-4"/> Layer Peta Tematik</TabsTrigger>
            </TabsList>
            
            {/* TAB 1: DATA GEO */}
            <TabsContent value="geospatial">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Data Geospatial</CardTitle>
                    <CardDescription>Sumber data mentah (GeoJSON).</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => handleOpenModal('addGeo')}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Data</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Sumber</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {geospatialData.length > 0 ? geospatialData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.type || '-'}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {item.geojson_data ? 'GeoJSON tersedia' : '-'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenModal('editGeo', item)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete('geo', item.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Hapus</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="text-center h-24 text-gray-500">Belum ada data geospatial.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: LAYER */}
            <TabsContent value="layer">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Layer Peta</CardTitle>
                    <CardDescription>Layer visualisasi di atas peta.</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => handleOpenModal('addLayer')}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Layer</TableHead>
                        <TableHead>Geo ID</TableHead>
                        <TableHead>Warna</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {layerData.length > 0 ? layerData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.geoId || item.geospatial_id || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: item.color || '#FF0000' }} />
                              {item.color || '#FF0000'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenModal('editLayer', item)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete('layer', item.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Hapus</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="text-center h-24 text-gray-500">Belum ada layer peta.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* 2. Preview Peta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Preview Peta: {currentDesaName}
              </CardTitle>
              <CardDescription>
                Preview berdasarkan data di atas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="mapPreview" className="h-[400px] w-full rounded-md z-0" />
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {renderModalContent()}
      </Dialog>
    </div>
  );
}
// src/pages/desa/PetaTematikDesa.jsx
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Map as MapIcon, 
  Layers, 
  Database, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  FileJson,
  MapPin,
  PenTool,
  Undo,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dataApi } from '@/services/dataApi';

// Fix icon default Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function PetaTematikDesa() { 
  // Refs
  const mapRef = useRef(null); 
  const layerGroupRef = useRef(null); 
  const pickerMapRef = useRef(null);
  const pickerLayerGroupRef = useRef(null);

  // Data States
  const { user } = useAuth();
  const [geospatialData, setGeospatialData] = useState([]);
  const [layerData, setLayerData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [currentItem, setCurrentItem] = useState(null); 
  const [showMap, setShowMap] = useState(false); // Lazy load map

  const loadData = useCallback(async () => {
    if (!user?.village_id) return;
    setLoading(true);
    try {
      const [geoData, mapData] = await Promise.all([
        dataApi.listGeospatial(user.village_id),
        dataApi.listThematicMaps(user.village_id)
      ]);
      setGeospatialData(geoData);
      setLayerData(mapData);
    } catch (error) {
      console.error("Failed to load map data", error);
    } finally {
      setLoading(false);
    }
  }, [user?.village_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form States (untuk Modal)
  const [formDataName, setFormDataName] = useState('');
  const [formDataType, setFormDataType] = useState('point'); 
  const [pickerMode, setPickerMode] = useState('upload'); // 'upload' | 'manual'
  
  // Data Entry States
  const [uploadedGeoJson, setUploadedGeoJson] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [polygonPoints, setPolygonPoints] = useState([]); 

  // --- CLEANUP MAPS ---
  useEffect(() => {
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      if (pickerMapRef.current) { pickerMapRef.current.remove(); pickerMapRef.current = null; }
    };
  }, []); 

  // --- RENDER MAIN MAP ---
  useEffect(() => {
    if (showMap && document.getElementById('mapPreview')) {
      if (!mapRef.current) {
        mapRef.current = L.map('mapPreview', { center: [-2.9739, 119.9045], zoom: 11 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(mapRef.current);
        layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
      }

      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        
        const layerPromises = layerData.map(layer => {
          if (!layer.isVisible) return Promise.resolve(null);

          const geoData = geospatialData.find(g => g.id === parseInt(layer.geoId));
          if (geoData) {
            // Real data: geoData.geojson_data
            const jsonData = geoData.geojson_data || geoData.geometry;
            
            if (jsonData) {
                const geoJsonLayer = L.geoJSON(jsonData, {
                  style: () => ({ color: layer.color, weight: 3, opacity: 1, fillOpacity: 0.3 }),
                  pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, { radius: 6, fillColor: layer.color, color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8 });
                  }
                });
                return Promise.resolve(geoJsonLayer);
            }
          }
          return Promise.resolve(null);
        });

        Promise.all(layerPromises).then(loadedLayers => {
          loadedLayers.forEach(layer => { if (layer) layerGroupRef.current.addLayer(layer); });
        });
      }
    } else {
      // Hancurkan map jika disembunyikan
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; layerGroupRef.current = null; }
    }
  }, [showMap, layerData, geospatialData]); 

  // --- RENDER PICKER MAP (MODAL) ---
  useEffect(() => {
    if (isModalOpen && pickerMode === 'manual' && document.getElementById('pickerMap')) {
      if (pickerMapRef.current) { pickerMapRef.current.remove(); pickerMapRef.current = null; }
      
      const map = L.map('pickerMap', { center: [-2.9739, 119.9045], zoom: 13 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const layerGroup = L.layerGroup().addTo(map);
      
      pickerMapRef.current = map;
      pickerLayerGroupRef.current = layerGroup;

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (formDataType === 'point') {
          setManualLat(lat.toFixed(6));
          setManualLng(lng.toFixed(6));
          layerGroup.clearLayers();
          L.marker([lat, lng]).addTo(layerGroup);
        } else {
          setPolygonPoints(prev => [...prev, [lat, lng]]);
        }
      });
    }
  }, [isModalOpen, pickerMode, formDataType]);

  // Visualisasi Gambar Polygon saat input manual
  useEffect(() => {
    if (!pickerLayerGroupRef.current) return;
    const lg = pickerLayerGroupRef.current;
    if (formDataType !== 'point') {
      lg.clearLayers();
      polygonPoints.forEach(pt => L.circleMarker(pt, { radius: 4, color: 'blue' }).addTo(lg));
      if (polygonPoints.length > 1) {
        if (formDataType === 'boundary') L.polygon(polygonPoints, { color: 'blue' }).addTo(lg);
        else L.polyline(polygonPoints, { color: 'blue' }).addTo(lg);
      }
    }
  }, [polygonPoints, formDataType]);

  // --- HANDLERS ---
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    // Reset Form
    setPickerMode('upload');
    setUploadedGeoJson(null);
    setUploadedFileName('');
    setManualLat('');
    setManualLng('');
    setPolygonPoints([]);
    
    if (item) {
      setFormDataName(item.name);
      setFormDataType(item.type || 'point');
    } else {
      setFormDataName('');
      setFormDataType('point');
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setUploadedGeoJson(json);
      setUploadedFileName(file.name);
    } catch (err) {
      console.error(err);
      alert("File tidak valid. Pastikan format .geojson atau .json");
    }
  };

  const handleResetPolygon = () => setPolygonPoints([]);
  const handleUndoPolygon = () => setPolygonPoints(prev => prev.slice(0, -1));

  const handleDelete = async (type, id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        if (type === 'geo') {
          await dataApi.deleteGeospatial(user.village_id, id);
        } else if (type === 'layer') {
          await dataApi.deleteThematicMap(user.village_id, id);
        }
        loadData();
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Gagal menghapus data");
      }
    }
  };

  const handleToggleLayer = async (id, checked) => {
    // Optimistic update
    setLayerData(prev => prev.map(l => l.id === id ? { ...l, isVisible: checked } : l));
    
    try {
        const layer = layerData.find(l => l.id === id);
        if (!layer) return;

        const payload = {
            village_id: user.village_id,
            name: layer.name,
            geoId: layer.geoId,
            color: layer.color,
            isVisible: checked
        };
        
        await dataApi.updateThematicMap(user.village_id, id, payload);
    } catch (error) {
        console.error("Failed to update layer visibility", error);
        // Revert on error
        setLayerData(prev => prev.map(l => l.id === id ? { ...l, isVisible: !checked } : l));
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (modalType === 'addGeo') {
      let finalGeometry = null;
      let sourceName = 'Manual Input';

      // Logika Pembentukan JSON Geometry
      if (pickerMode === 'upload') {
        if (!uploadedGeoJson) { alert("Upload file dulu!"); return; }
        finalGeometry = uploadedGeoJson;
        sourceName = uploadedFileName;
      } else {
        // Build GeoJSON dari Input Manual
        if (formDataType === 'point') {
           if(!manualLat || !manualLng) { alert("Koordinat belum lengkap!"); return; }
           finalGeometry = {
             type: "FeatureCollection",
             features: [{
               type: "Feature",
               properties: { name: formDataName },
               geometry: { type: "Point", coordinates: [parseFloat(manualLng), parseFloat(manualLat)] }
             }]
           };
        } else {
           if(polygonPoints.length < 3) { alert("Minimal 3 titik untuk area!"); return; }
           const coordinates = polygonPoints.map(pt => [pt[1], pt[0]]); // Flip LatLng to LngLat for GeoJSON
           if (formDataType === 'boundary') coordinates.push(coordinates[0]); // Close loop
           
           finalGeometry = {
             type: "FeatureCollection",
             features: [{
               type: "Feature",
               properties: { name: formDataName },
               geometry: { 
                 type: formDataType === 'boundary' ? "Polygon" : "LineString", 
                 coordinates: formDataType === 'boundary' ? [coordinates] : coordinates 
               }
             }]
           };
        }
      }
      
      // Simpan ke API
      const payload = {
        village_id: user.village_id,
        name: formDataName,
        type: formDataType,
        geometry: finalGeometry,
        description: sourceName
      };
      
      try {
        await dataApi.createGeospatial(user.village_id, payload);
        loadData();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to create geospatial data", error);
        alert("Gagal menyimpan data geospatial");
      }

    } else if (modalType === 'addLayer') {
      const payload = {
        village_id: user.village_id,
        name: data.name,
        geoId: parseInt(data.geoId),
        color: data.color,
        isVisible: true
      };
      
      try {
        await dataApi.createThematicMap(user.village_id, payload);
        loadData();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to create thematic map", error);
        alert("Gagal menyimpan peta tematik");
      }
    }
  };

  // --- RENDER CONTENT ---
  const renderModalContent = () => {
    if (modalType === 'addGeo' || modalType === 'editGeo') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Data</Label>
              <Input value={formDataName} onChange={(e) => setFormDataName(e.target.value)} placeholder="Contoh: Kantor Desa" required />
            </div>
            <div className="space-y-2">
              <Label>Tipe Geometri</Label>
              <Select value={formDataType} onValueChange={setFormDataType} disabled={modalType === 'editGeo'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="point">Titik Lokasi (Point)</SelectItem>
                  <SelectItem value="boundary">Area / Wilayah (Polygon)</SelectItem>
                  <SelectItem value="line">Jalur / Jalan (Line)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {modalType === 'addGeo' && (
            <Tabs value={pickerMode} onValueChange={setPickerMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload"><FileJson className="w-4 h-4 mr-2"/> Upload File</TabsTrigger>
                <TabsTrigger value="manual"><MapPin className="w-4 h-4 mr-2"/> Gambar di Peta</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="pt-4 space-y-4">
                 <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50">
                    <Input type="file" accept=".geojson,.json" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="bg-blue-100 p-3 rounded-full mb-2"><FileJson className="h-6 w-6 text-blue-600" /></div>
                      <span className="text-sm font-medium text-slate-700">Klik untuk upload file .geojson</span>
                      <span className="text-xs text-slate-500 mt-1">{uploadedFileName || "Belum ada file dipilih"}</span>
                    </Label>
                 </div>
              </TabsContent>

              <TabsContent value="manual" className="pt-2 space-y-4">
                <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800 flex items-start gap-2">
                   <PenTool className="w-4 h-4 mt-0.5 shrink-0"/>
                   {formDataType === 'point' 
                     ? "Klik di peta untuk titik lokasi, atau isi koordinat manual."
                     : "Klik di peta berulang kali untuk membentuk area."}
                </div>

                {formDataType === 'point' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><Label className="text-xs">Lat</Label><Input value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="-2.xxxxx" /></div>
                     <div className="space-y-1"><Label className="text-xs">Lng</Label><Input value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="119.xxxxx" /></div>
                  </div>
                )}

                {formDataType !== 'point' && (
                   <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={handleUndoPolygon} disabled={polygonPoints.length === 0}><Undo className="w-3 h-3 mr-1"/> Undo</Button>
                      <Button type="button" size="sm" variant="destructive" onClick={handleResetPolygon} disabled={polygonPoints.length === 0}><X className="w-3 h-3 mr-1"/> Reset</Button>
                      <span className="text-xs text-slate-500 self-center ml-auto">{polygonPoints.length} Titik</span>
                   </div>
                )}

                <div className="h-[300px] w-full rounded-md border overflow-hidden relative">
                   <div id="pickerMap" className="h-full w-full z-0"></div>
                   <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400] opacity-20">
                      <div className="w-4 h-4 border-l-2 border-t-2 border-black"></div>
                   </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      );
    } else if (modalType?.includes('Layer')) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Layer</Label>
            <Input name="name" defaultValue={currentItem?.name} required />
          </div>
          <div className="space-y-2">
            <Label>Sumber Data Geospatial</Label>
            <Select name="geoId" defaultValue={currentItem?.geoId?.toString()}>
              <SelectTrigger><SelectValue placeholder="Pilih Data" /></SelectTrigger>
              <SelectContent>
                {geospatialData.map((geo) => (
                  <SelectItem key={geo.id} value={geo.id.toString()}>{geo.name} ({geo.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Warna (HEX)</Label>
            <div className="flex gap-2">
              <Input name="color" defaultValue={currentItem?.color} type="color" className="w-12 p-1 h-10" required />
              <Input name="color_text" defaultValue={currentItem?.color} placeholder="#FF0000" className="flex-1" readOnly />
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Peta Tematik Desa</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola data spasial dan visualisasi peta desa Anda.</p>
        </div>
      </header>

      <Tabs defaultValue="geospatial" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geospatial"><Database className="mr-2 h-4 w-4"/> Data Geospatial</TabsTrigger>
          <TabsTrigger value="layer"><Layers className="mr-2 h-4 w-4"/> Layer Peta Tematik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geospatial">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
               <div><CardTitle>Tabel Data Geospatial</CardTitle><CardDescription>Data geometri mentah (JSON).</CardDescription></div>
               <Button size="sm" onClick={() => handleOpenModal('addGeo')} className="bg-[#1C6EA4] hover:bg-[#154D71]"><Plus className="mr-2 h-4 w-4"/> Tambah Data</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nama Data</TableHead><TableHead>Tipe</TableHead><TableHead>Sumber</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {geospatialData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell><span className="uppercase text-xs font-bold bg-slate-100 px-2 py-1 rounded">{item.type}</span></TableCell>
                      <TableCell className="text-sm text-slate-500">{item.source || 'Manual/API'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDelete('geo', item.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layer">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
               <div><CardTitle>Tabel Layer Peta</CardTitle><CardDescription>Konfigurasi visual peta.</CardDescription></div>
               <Button size="sm" onClick={() => handleOpenModal('addLayer')} className="bg-[#1C6EA4] hover:bg-[#154D71]"><Plus className="mr-2 h-4 w-4"/> Tambah Layer</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nama Layer</TableHead><TableHead>Data Sumber</TableHead><TableHead>Warna</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {layerData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{geospatialData.find(g => g.id === item.geoId)?.name || '-'}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{backgroundColor: item.color}}></div>{item.color}</div></TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <Switch checked={item.isVisible} onCheckedChange={(c) => handleToggleLayer(item.id, c)} />
                            <span className="text-xs text-slate-500">{item.isVisible ? 'Tampil' : 'Sembunyi'}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Button variant="ghost" size="sm" onClick={() => handleDelete('layer', item.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapIcon className="h-5 w-5"/> Preview Peta Tematik</CardTitle>
          <CardDescription>Tekan tombol di bawah untuk memuat peta.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
            <Button variant={showMap ? "outline" : "default"} className={`w-full mb-4 ${!showMap ? 'bg-[#1C6EA4]' : ''}`} onClick={() => setShowMap(!showMap)}>
              {showMap ? <><EyeOff className="mr-2 h-4 w-4"/> Sembunyikan Peta</> : <><Eye className="mr-2 h-4 w-4"/> Tampilkan Peta</>}
            </Button>
            {showMap && <div id="mapPreview" className="h-[500px] w-full rounded-md z-0 border" />}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader><DialogTitle>{modalType?.includes('add') ? 'Tambah' : 'Edit'} Data</DialogTitle></DialogHeader>
            <div className="py-4">{renderModalContent()}</div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
              <Button type="submit" className="bg-[#1C6EA4] hover:bg-[#154D71]">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// src/pages/public/Tentang.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Users, Target, TrendingUp, Shield } from 'lucide-react';

// Impor komponen layout
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const Tentang = () => {
  const pengelola = [
    { name: 'Pengelola 1', role: 'Koordinator Program' },
    { name: 'Pengelola 2', role: 'Fasilitator Lapangan' },
    { name: 'Pengelola 3', role: 'Analis Data' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrollToVillages={scrollToTop} /> 

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#33A1E0] to-[#1C6EA4] text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl mb-6" style={{ textShadow: '2px 4px 8px rgba(0,0,0,0.3)' }}>
              Tentang Program <span className="text-[#FFF9AF]">Desa Cantik</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Program pembinaan BPS untuk meningkatkan kualitas data dan literasi statistik di tingkat desa
            </p>
          </div>
        </div>
      </section>

      {/* Konten Utama */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="bg-[#33A1E0] text-white px-4 py-2 text-lg rounded-full">Program BPS</span>
                </div>
                
                <h2 className="text-4xl text-[#154D71]">
                  Apa itu Desa Cantik?
                </h2>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Desa Cantik (Cinta Statistik) adalah program pembinaan yang dikembangkan oleh Badan Pusat 
                  Statistik untuk meningkatkan kualitas dan ketersediaan data statistik di tingkat desa. 
                  Program ini penting karena desa merupakan unit terkecil dalam sistem pemerintahan yang 
                  memerlukan data akurat untuk perencanaan pembangunan yang efektif.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Melalui program ini, pemerintah desa akan mendapat pendampingan dalam pengelolaan data, 
                  pelatihan literasi statistik, dan dukungan teknis untuk menghasilkan publikasi data yang 
                  berkualitas. Hal ini akan membantu desa dalam pengambilan keputusan yang berbasis data dan 
                  meningkatkan transparansi pengelolaan pembangunan desa.
                </p>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#33A1E0]/20 to-[#1C6EA4]/20 rounded-3xl blur-2xl"></div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                    alt="Tentang Desa Cantik"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = 'https://placehold.co/800x600/33A1E0/ffffff?text=Tentang+Program'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tujuan & Manfaat Section */}
          <section className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#1C6EA4] to-[#33A1E0]"></div>
              <CardContent className="p-8">
                <h3 className="text-3xl text-[#1C6EA4] mb-6 flex items-center gap-3">
                  <Target className="h-8 w-8" />
                  Tujuan Program
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Meningkatkan literasi statistik perangkat desa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Meningkatkan kualitas data tingkat desa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Mendorong pengambilan keputusan berbasis data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Meningkatkan transparansi pengelolaan desa</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#33A1E0] to-[#4BADE4]"></div>
              <CardContent className="p-8">
                <h3 className="text-3xl text-[#33A1E0] mb-6 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8" />
                  Manfaat Program
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Perencanaan pembangunan yang lebih tepat sasaran</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Monitoring dan evaluasi program yang lebih baik</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Publikasi data desa yang mudah diakses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#C0D959] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Peningkatan akuntabilitas pemerintah desa</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Pengelola Section */}
          <section className="bg-gradient-to-br from-[#33A1E0] to-[#4BADE4] rounded-3xl py-16 px-8 mb-20 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl text-white mb-4">
                Tim Pengelola Program
              </h2>
              <div className="w-24 h-1 bg-[#FFF9AF] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pengelola.map((person, index) => (
                <Card key={index} className="text-center border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <CardContent className="p-8">
                    <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl overflow-hidden flex items-center justify-center">
                      <Users className="w-20 h-20 text-gray-400" />
                    </div>
                    <h3 className="text-xl text-[#154D71] mb-2">
                      {person.name}
                    </h3>
                    <p className="text-gray-600">
                      {person.role}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Surat Keputusan Section */}
          <section className="bg-gradient-to-br from-[#FFF9AF] to-[#FFE680] rounded-3xl p-12 shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl text-[#154D71] mb-6 flex items-center gap-3">
                <Download className="h-10 w-10" />
                Surat Keputusan Desa Cantik
              </h2>

              <div className="space-y-6 text-lg text-[#154D71] leading-relaxed">
                <p>
                  Program Desa Cantik (Cinta Statistik) secara resmi ditetapkan melalui Surat Keputusan 
                  Kepala Badan Pusat Statistik yang mengatur tentang pelaksanaan program pembinaan desa 
                  dalam rangka meningkatkan literasi statistik dan kualitas data di tingkat desa.
                </p>
                <p>
                  Surat keputusan ini mencakup pedoman teknis pelaksanaan program, kriteria pemilihan desa 
                  binaan, mekanisme pendampingan, serta indikator keberhasilan program yang harus dicapai 
                  oleh setiap desa yang menjadi peserta program Desa Cantik.
                </p>

                <div className="pt-6">
                  <Button 
                    className="bg-[#1C6EA4] hover:bg-[#154D71] text-white text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Surat Keputusan
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer scrollToVillages={scrollToTop} />
    </div>
  );
}

export default Tentang;
# Desa Cantik Frontend

**Sistem Informasi Desa Cinta Statistik - Frontend Application**

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![React](https://img.shields.io/badge/React-19.0.0--rc.1-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-cyan)
![License](https://img.shields.io/badge/license-Academic-green)

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tim Pengembang](#tim-pengembang)
- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Struktur Proyek](#struktur-proyek)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Tentang Proyek

Desa Cantik Frontend adalah aplikasi web berbasis React untuk **Sistem Informasi Desa Cinta Statistik (Desa Cantik)** BPS Kabupaten Toraja Utara. Aplikasi ini menyediakan antarmuka pengguna untuk:

- **Pengelolaan Data Desa** (Nonongan Selatan & Rindingbatu)
- **Visualisasi Data Statistik** dengan grafik interaktif
- **Peta Tematik** menggunakan Leaflet.js dan GeoJSON
- **Dashboard Role-Based** untuk Admin BPS, Perangkat Desa, dan Masyarakat
- **Upload dan Kelola Publikasi** dokumentasi desa

**Backend API:** [desa-cantik-api](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api)

---

## Tim Pengembang

**Tim 4  Kelas 3SI1**

| Nama | NIM | Role |
|------|-----|------|
| Teguh Christianto Simbolon | 222313403 | Project Lead, Backend |
| Amir Syaifudin | 222312968 | Frontend Lead |
| Anggita Cristin Meylani | 222312982 | Frontend |
| Nyimas Virna Salsa Lestari Risqia | 222313307 | Frontend |
| Alif Zakiansyah As Syauqi | 222312958 | Backend Lead |
| Ahmad Adib Husaini Al Munawwar | 222312948 | Backend | 


---

## Tech Stack

### Core
- **[React](https://react.dev)** 19.1.1 - UI Library
- **[Vite](https://vitejs.dev)** 7.2.2 - Build Tool & Dev Server
- **[React Router](https://reactrouter.com/)** 7.9.5 - Routing

### Styling
- **[TailwindCSS](https://tailwindcss.com/)** 3.4.18 - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Component Library
- **[Lucide React](https://lucide.dev/)** - Icon Library
- **[tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate)** - Animation utilities

### Data Fetching & Maps
- **[Axios](https://axios-http.com/)** - HTTP Client
- **[Leaflet](https://leafletjs.com/)** - Interactive Maps
- **[React-Leaflet](https://react-leaflet.js.org/)** - React wrapper for Leaflet

### Development Tools
- **[ESLint](https://eslint.org/)** 9.36.0 - Linting
- **[PostCSS](https://postcss.org/)** - CSS Processing
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS Vendor Prefixing

---

## Fitur Utama

### 1. **Authentication & Authorization**
   - JWT-based login via backend API
   - Role-based access control (RBAC):
     - **Admin BPS**: Mengelola semua desa dan validasi data
     - **Perangkat Desa**: Mengelola data desa masing-masing
     - **Masyarakat**: Hanya melihat data publik
   - Protected routes dengan `ProtectedRoute` component
   - Auto token refresh dan logout

### 2. **Dashboard Role-Based**
   - **Dashboard Admin BPS**: Overview semua desa, statistik agregat, aktivitas terkini
   - **Dashboard Perangkat Desa**: Overview desa masing-masing, statistik lokal
   - Visualisasi dengan Recharts (pie chart, bar chart)

### 3. **Manajemen Desa (Admin BPS)**
   - **Daftar Desa**: CRUD data desa, toggle status aktif/nonaktif
   - **Perangkat Desa**: Kelola akun perangkat desa (tambah, edit, hapus)
   - **Modul Desa**: Kelola modul/fitur yang tersedia untuk setiap desa
   - Pagination dan search untuk semua daftar

### 4. **Data Statistik dengan Validasi**
   - **Perangkat Desa**: 
     - Input data statistik (CSV upload)
     - Status otomatis "Menunggu Validasi" saat create
     - Tidak bisa mengubah status (hanya admin yang bisa)
     - Filter berdasarkan subjek dan tahun
   - **Admin BPS**:
     - Lihat semua data statistik dari semua desa
     - Validasi data (Setujui/Tolak)
     - Filter berdasarkan desa dan status
     - Alasan penolakan saat reject
     - Search data statistik
   
   **Alur Validasi:**
   1. Perangkat Desa menambah data → Status: "Menunggu Validasi"
   2. Admin BPS melihat data di halaman Data Statistik
   3. Admin BPS bisa:
      - **Setujui** → Status: "Terverifikasi"
      - **Tolak** → Status: "Ditolak" (dengan alasan)
   4. Perangkat Desa melihat status update di halaman mereka

### 5. **Publikasi Desa**
   - **Perangkat Desa**: Upload dan kelola publikasi desa (PDF)
   - **Admin BPS**: Kelola publikasi semua desa
   - Kategori: Laporan Statistik, Profil Desa, Infografis, Berita Resmi
   - Search dan filter

### 6. **Peta Tematik**
   - **Perangkat Desa**: Kelola data geospatial dan layer peta untuk desa sendiri
   - **Admin BPS**: Kelola peta tematik untuk semua desa
   - Upload GeoJSON data
   - Visualisasi dengan Leaflet.js
   - Layer management dengan warna custom

### 7. **Profil Umum Desa**
   - Edit profil desa (nama, demografi, dll)
   - Upload foto/gambar profil
   - Informasi umum desa

### 8. **Manajemen Modul**
   - Admin BPS dapat mengaktifkan/nonaktifkan modul per desa
   - Kontrol granular fitur yang bisa diakses setiap desa
   - Modul: Data Statistik, Publikasi, Peta Tematik, Profil Umum

---

## Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Node.js** >= 20.x ([Download](https://nodejs.org/))
- **npm** >= 10.x (included with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Backend API** running di `http://localhost:8000` (lihat [desa-cantik-api README](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/blob/develop/README.md))

**Cek versi:**
```bash
node --version  # v20.x atau lebih baru
npm --version   # v10.x atau lebih baru
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend.git
cd desa-cantik-frontend
```

### 2. Checkout Develop Branch

```bash
git checkout develop
git pull origin develop
```

### 3. Install Dependencies

```bash
npm install
```

**Installed packages:**
- React 19 + React DOM
- React Router v7
- Axios, Leaflet, React-Leaflet
- TailwindCSS, shadcn/ui components
- ESLint, Vite plugins

### 4. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

**Minimal configuration:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Note:** Variable name harus `VITE_API_BASE_URL` (bukan `VITE_API_URL`)

### 5. Start Development Server

```bash
npm run dev
```

**Output:**
```
  VITE v7.2.2  ready in 2246 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open browser:** `http://localhost:5173`

---

## Struktur Proyek

```
desa-cantik-frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, fonts
│   │   ├── fonts/
│   │   └── images/
│   │
│   ├── components/           # Reusable UI components
│   │   ├── shared/          # Shared components
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SidebarAdminBPS.jsx
│   │   │   ├── SidebarPerangkatDesa.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── VillageDetailNavbar.jsx
│   │   └── ui/              # shadcn/ui components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── table.jsx
│   │       └── ... (semua UI components)
│   │
│   ├── hooks/                # Custom React hooks
│   │
│   ├── layouts/              # Layout components
│   │   ├── DashboardLayout.jsx
│   │   └── MainLayout.jsx
│   │
│   ├── lib/                  # Utility functions
│   │   └── utils.js
│   │
│   ├── pages/                # Page components (routes)
│   │   ├── admin/            # Halaman Admin BPS
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── DaftarDesaAdmin.jsx
│   │   │   ├── PerangkatDesaAdmin.jsx
│   │   │   ├── ModulDesaAdmin.jsx
│   │   │   ├── DataStatistikAdmin.jsx
│   │   │   ├── PublikasiDesaAdmin.jsx
│   │   │   ├── PetaTematikAdmin.jsx
│   │   │   └── UbahPasswordAdminBPS.jsx
│   │   ├── desa/             # Halaman Perangkat Desa
│   │   │   ├── DashboardDesa.jsx
│   │   │   ├── ProfilUmumDesa.jsx
│   │   │   ├── DataStatistikDesa.jsx
│   │   │   ├── PublikasiDesa.jsx
│   │   │   ├── PetaTematikDesa.jsx
│   │   │   └── UbahPasswordPerangkatDesa.jsx
│   │   └── public/           # Halaman Publik
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── Tentang.jsx
│   │       └── VillageDetail.jsx
│   │
│   ├── routes/               # React Router configuration
│   │   ├── index.jsx         # Route definitions
│   │   └── config.js         # Menu items untuk sidebar
│   │
│   ├── services/             # API service layer
│   │   ├── apiClient.js      # HTTP client wrapper
│   │   ├── authApi.js        # Authentication API
│   │   ├── dataApi.js        # General data API (villages, stats, etc)
│   │   ├── dashboardService.js
│   │   ├── publicationService.js
│   │   ├── statisticService.js
│   │   ├── geoService.js
│   │   └── villageProfileService.js
│   │
│   ├── App.css
│   ├── App.jsx               # Root component
│   ├── index.css             # Global styles
│   └── main.jsx              # Entry point
│
├── .env.example              # Environment template
├── .gitignore
├── components.json           # shadcn/ui config
├── eslint.config.js          # ESLint rules
├── index.html                # HTML template
├── jsconfig.json             # Path aliases
├── package.json              # Dependencies
├── postcss.config.js         # PostCSS config
├── README.md
├── tailwind.config.js        # TailwindCSS config
└── vite.config.js            # Vite configuration
```

---

## Environment Variables

Create `.env` in project root (gitignored):

```env
# Backend API Base URL (dengan /v1 di akhir)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Optional: App Name
VITE_APP_NAME="Desa Cantik"
```

**Environment Files:**
- `.env` - Local development (gitignored)
- `.env.example` - Template (committed to repo)
- Production: Configure in hosting platform (Vercel/Netlify env vars)

**Accessing in code:**
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL;
// Default fallback: 'http://localhost:8000/api/v1'
```

---

## Development Workflow

### Daily Workflow (Individual Developer)

**Morning - Sync with Team:**
```bash
# 1. Switch to develop
git checkout develop

# 2. Pull latest changes
git pull origin develop

# 3. Create feature branch
git checkout -b feature/auth-ui

# 4. Start coding!
npm run dev
```

**Evening - Commit & Push:**
```bash
# 1. Check changes
git status

# 2. Add files
git add .

# 3. Commit with conventional message
git commit -m "feat(auth): add login form component with validation"

# 4. Push feature branch
git push origin feature/auth-ui
```

### Conventional Commit Messages

Format: `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(map): integrate Leaflet for desa boundaries"
git commit -m "fix(login): resolve token refresh issue"
git commit -m "docs(readme): update installation steps"
```

### Create Merge Request

1. **Push feature branch** (as shown above)

2. **Go to GitLab:**
   - Navigate to: `https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/merge_requests/new`

3. **Fill MR Form:**
   ```markdown
   Title: feat: Add authentication UI components

   ## Changes
   - Created LoginForm component with validation
   - Integrated Axios for API calls
   - Added error handling

   ## Testing
   - [x] Form validation working
   - [x] API integration tested with backend
   - [x] Responsive on mobile

   ## Screenshots
   [Attach screenshots]
   ```

4. **Set:**
   - Source: `feature/auth-ui`
   - Target: `develop`
   - Assignee: Team Lead
   - Reviewers: 2 teammates

5. **Get Approval** → Merge → Delete feature branch

---

## Available Scripts

```bash
# Start development server (HMR enabled)
npm run dev
# Server akan berjalan di http://localhost:5173

# Build for production
npm run build
# Output: /dist folder dengan optimized assets

# Preview production build
npm run preview
# Preview build production secara lokal

# Run linter
npm run lint
# Check code quality dengan ESLint
```

**Production Build Output:**
- Creates `/dist` folder
- Optimized, minified assets
- Ready for deployment ke Vercel/Netlify/static hosting

**Development Server:**
- Hot Module Replacement (HMR) enabled
- Fast refresh untuk React components
- Auto-reload saat file berubah

---

## Testing

### Manual Testing Checklist

**Before committing:**
- [ ] Component renders without errors
- [ ] Responsive on mobile (DevTools)
- [ ] API calls working (Network tab)
- [ ] No console errors
- [ ] Lint passing (`npm run lint`)

### Integration Testing

**Test with Backend API:**
```bash
# Terminal 1: Backend API
cd ../desa-cantik-api
php artisan serve  # atau docker-compose up -d

# Terminal 2: Frontend
cd desa-cantik-frontend
npm run dev

# Test endpoints:
# - Home: http://localhost:5173/
# - Login: http://localhost:5173/login
# - Admin Dashboard: http://localhost:5173/admin/dashboard
# - Desa Dashboard: http://localhost:5173/desa-dashboard/dashboard
# - Data Statistik Admin: http://localhost:5173/admin/data-statistik
# - Peta Tematik: http://localhost:5173/admin/peta-tematik
```

**Test Credentials (sesuaikan dengan backend):**
- Admin BPS: `admin@bps.go.id` / `password`
- Perangkat Desa: `perangkat@desa.go.id` / `password`

### Automated Testing (TODO)

**Future implementation:**
- Unit tests: Jest + React Testing Library
- E2E tests: Cypress or Playwright
- Target coverage: ≥ 70%

---

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or change port in vite.config.js:
export default defineConfig({
  server: { port: 3000 }
})
```

---

### Issue: API CORS errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. **Backend must allow origin** in `config/cors.php`:
   ```php
   'allowed_origins' => ['http://localhost:5173'],
   ```

2. **Or use proxy** in `vite.config.js`:
   ```javascript
   export default defineConfig({
     server: {
       proxy: {
         '/api': 'http://localhost:8000'
       }
     }
   })
   ```

---

### Issue: Environment variables not working

**Solution:**
1. **Prefix with `VITE_` dan gunakan nama yang benar:**
   ```env
   # Wrong
   API_URL=http://localhost:8000
   VITE_API_URL=http://localhost:8000/api

   # Correct
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

2. **Restart dev server** after changing `.env`

---

### Issue: Blank page in browser

**Check:**
1. **Console errors** (F12)
2. **Network tab** - API calls failing?
3. **Routing** - Is route defined in `src/routes/index.jsx`?
4. **Component export** - Default vs named export

**Debug:**
```javascript
// Add to component
console.log('Component rendering:', props);
```

---

## Contributing

### Code Style

**React:**
- Functional components + Hooks
- Named exports for components
- PropTypes for type checking (if not using TypeScript)

**CSS:**
- TailwindCSS utility classes
- Use shadcn/ui components where possible
- Avoid inline styles unless dynamic

**File Naming:**
- Components: `PascalCase.jsx` (e.g., `LoginForm.jsx`)
- Utilities: `camelCase.js` (e.g., `formatDate.js`)
- Folders: `kebab-case/` (e.g., `api-services/`)

### Pull Request Checklist

Before submitting MR:
- [ ] Code follows project style
- [ ] ESLint passing (`npm run lint`)
- [ ] No console.log statements
- [ ] Component tested manually
- [ ] Responsive design checked
- [ ] API integration tested
- [ ] README updated (if needed)
- [ ] Screenshots attached (for UI changes)

---

## Resources

**Project Documentation:**
- [Laporan Milestone 2](./docs/Laporan_Progres_Milestone_2_3SI1_Tim_4.pdf)

**Technical Docs:**
- [React 19 Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/en/main)
- [Leaflet](https://leafletjs.com/reference.html)
- [Recharts](https://recharts.org/) - Chart library
- [date-fns](https://date-fns.org/) - Date formatting

**Backend API:**
- [desa-cantik-api README](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-api/-/blob/develop/README.md)

---

## License

Proyek ini dikembangkan untuk keperluan akademik:

**Copyright © 2025 Tim 4 - Kelas 3SI1**  
**Politeknik  Statistika  STIS**

Untuk keperluan pendidikan dan penelitian. Tidak untuk penggunaan komersial tanpa izin.

---

## Contact & Support

**Team Communication:**
- Daily Standup: WhatsApp group
- Weekly Review: Tatap muka, waktu menyusul
- GitLab Issues: [Create Issue](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/issues)

---
<div align="center">

### **Dibangun dengan lancar dan nyaman oleh Tim 4 Kelas 3SI1**

**Politeknik Statistika STIS • Jakarta • 2025**

[Documentation](docs/) • [Report Bug](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/issues) • [Request Feature](https://git.stis.ac.id/rpl-lancarnyaman/desa-cantik-frontend/-/issues)

</div>
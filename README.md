# ⚡ Smart Listrik AI - Kalkulator & Hemat Energi

Aplikasi web pintar pemantau, kalkulator konsumsi listrik rumah tangga, estimasi biaya PLN harian/bulanan/tahunan, simulasi token listrik prabayar, serta konsultan energi personal **Ipal AI** berbasis Google Gemini API.

---

## 🌟 Fitur Utama

- 👤 **Welcome Screen & Personalized Onboarding**: Pengalaman awal interaktif untuk menyimpan nama dan profil listrik pengguna secara aman di Local Storage.
- 🏠 **Manajemen Profil Rumah**: Dukungan golongan daya PLN 450 VA hingga 11.000 VA, jenis meteran (Pasca & Prabayar), dan jumlah penghuni.
- ⚡ **Kalkulator Beban & Estimasi PLN**: Perhitungan presisi total beban Watt, perkiraan kWh per hari/bulan/tahun, serta estimasi tagihan sesuai tarif PLN.
- 🎟️ **Simulator Token Listrik & Peringatan Habis**: Menghitung daya kWh yang didapat dari nominal pembelian token dan memprediksi sisa hari penggunaan sebelum listrik padam.
- 🤖 **Ipal AI Advisor (Google Gemini API)**: Konsultan energi cerdas berbasis AI yang memahami seluruh data konteks rumah pengguna untuk memberikan analisis, rekomendasi penghematan, dan jawaban spesifik.
- 🔑 **Pengaturan Gemini API Key**: Kebebasan memasukkan, menyimpan, menguji, dan menghapus Google Gemini API Key secara aman di Local Storage tanpa hardcode.
- 📊 **Analisis Visual & Laporan Pintar**: Grafik perbandingan konsumsi antar-peralatan, ranking alat terboros, serta skor efisiensi energi.
- 🔊 **Sound Effects & Mode Gelap/Terang**: Efek suara interaktif dan tema visual yang nyaman di mata.
- 📱 **PWA (Progressive Web App)**: Siap diinstall di smartphone/desktop dan dapat diakses offline.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Icons & UI**: Lucide React, Motion (Framer Motion)
- **Visualisasi Chart**: Chart.js, React-ChartJS-2
- **AI Integration**: Google Gemini API (`@google/genai` & REST fallback)
- **Backend Server**: Node.js, Express (Dev & Container runtime)
- **Storage**: Local Storage (100% Client-side Data Security)

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js (versi 18+)
- npm atau yarn

### Langkah-langkah

1. **Clone Repository**:
   ```bash
   git clone https://github.com/username/smart-listrik-ai.git
   cd smart-listrik-ai
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Buka Aplikasi**:
   Buka browser dan akses `http://localhost:3000` (atau port yang ditentukan Vite/Express).

---

## ☁️ Cara Deploy ke Netlify

1. **Push proyek ke GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit for Netlify & GitHub deployment"
   git push origin main
   ```

2. **Hubungkan ke Netlify**:
   - Buka [Netlify Dashboard](https://app.netlify.com/).
   - Klik **"Add new site"** > **"Import an existing project"**.
   - Pilih **GitHub** dan masukkan repository `smart-listrik-ai`.

3. **Konfigurasi Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - (Netlify akan otomatis membaca file `netlify.toml` yang disiapkan).

4. **Deploy**:
   - Klik **Deploy Site**. Aplikasi Smart Listrik AI Anda siap diakses secara publik!

---

## 📷 Screenshot Aplikasi

```
+-------------------------------------------------------------------+
|  ⚡ Smart Listrik AI - Halo, Andi 👋                             |
|  [ Dashboard ] [ Peralatan ] [ Simulator ] [ Grafik ] [ Ipal AI ] |
|  +------------------------+  +---------------------------------+  |
|  | Skor Efisiensi: 85/100 |  |  Status Load: 45% (Aman)        |  |
|  +------------------------+  +---------------------------------+  |
|  | Ipal AI: "AC 1 PK adalah penyumbang 42% tagihan bulanan..."    |  |
|  +----------------------------------------------------------------+  |
+-------------------------------------------------------------------+
```

---

## 👨‍💻 Informasi Developer

- **Developer**: Smart Listrik AI Team / Open Source Contributor
- **Lisensi**: MIT License
- **Versi**: 1.0.0

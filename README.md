# StreamTV - Web IPTV Player (Siaran TV Langsung)

Aplikasi Web IPTV Streaming berbasis React + Vite + Tailwind CSS yang dapat dijalankan secara lokal maupun di-deploy ke Vercel/Netlify/Cloudflare Pages (100% Gratis).

---

## 🎨 Desain & Tema
- **Warna**: Putih & Biru Tua (*Deep Navy* `#0F172A` / `#1E3A8A`). Bersih, rapi, minimalis tanpa gradasi pelangi berlebih.

---

## 🔑 Akun & Hak Akses
Tersedia 2 akun bawaan (tersedia juga tombol preset cepat di halaman login):

1. **User 1 (Penonton)**
   - **Username**: `user1`
   - **Password**: `user123`
   - **Fitur**: Memilih kategori, mencari channel, menonton siaran langsung.

2. **Administrator (Admin)**
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Fitur Tambahan**:
     - Membuka **Panel Monitoring Admin**: Melihat status user (`user1` / `admin`) apakah sedang online/offline dan **sedang menonton channel apa secara real-time** (menggunakan sinkronisasi otomatis antar-tab browser).
     - **Tambah Channel Manual**: Menambahkan siaran baru dengan link `.m3u8`.
     - **Impor Playlist IPTV**: Mengambil playlist M3U dari link GitHub (misal `iptv-org`) atau paste teks M3U langsung.

---

## 📺 Channel Bawaan
Sudah dilengkapi dengan saluran siaran aktif pilihan:
- **Indonesia**: TVRI Nasional, TVRI World, BTV (BeritaSatu), Kompas TV, RRI Net, Nusantara TV, Rodja TV, Bali TV.
- **Internasional (Bahasa Inggris)**: Al Jazeera English, Sky News UK, France 24 English, DW English, NASA TV Public HD, Red Bull TV, Euronews.

---

## 🚀 Cara Menjalankan di Komputer Lokal

Buka terminal di folder `D:\code\HUB\IPTVWEB` lalu jalankan:

```bash
npm run dev
```

Buka browser Anda dan akses:
👉 **http://localhost:3000**


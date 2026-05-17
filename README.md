# SIPODES WebGIS Desa Interaktif

Dashboard WebGIS Kabupaten Nias, Provinsi Sumatera Utara, untuk menampilkan peta 2D wilayah kecamatan/desa, data statistik desa, popup detail wilayah, login admin, edit data, dan import Excel/CSV.

## Stack

- Next.js / React
- Tailwind CSS
- Leaflet.js / React Leaflet
- Supabase PostgreSQL
- Supabase Auth
- Vercel
- GeoJSON
- Excel/CSV import via `xlsx`
- Framer Motion dan GSAP untuk animasi ringan
- Dark mode via `next-themes`

## Fitur UI dan Admin

- Dark mode dengan toggle tema.
- Animasi fade in, stagger section, transisi halaman halus, dan mobile menu animasi.
- CRUD lengkap data desa: tambah, baca, edit, hapus.
- Import Excel/CSV.
- Hover card dengan border orange glow dan lift shadow effect.
- Komponen reusable pada `src/components/ui`.

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Supabase

1. Buat project Supabase.
2. Jalankan isi `supabase-schema.sql` di SQL Editor Supabase.
3. Buat user admin di Supabase Auth.
4. Salin `.env.example` menjadi `.env.local`.
5. Isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Jika env belum diisi, aplikasi otomatis berjalan dalam mode demo memakai data contoh dan `localStorage`.

### Login Admin

Jika login gagal, pastikan user sudah ada di Supabase Dashboard > Authentication > Users. Untuk development, Anda juga bisa memakai tombol **Buat Admin** pada panel admin. Jika Supabase meminta konfirmasi email, cek inbox email atau matikan email confirmation sementara di Authentication > Providers > Email.

## Referensi Data

Rujukan utama untuk statistik dan publikasi Kabupaten Nias:

- BPS Kabupaten Nias: https://niaskab.bps.go.id/id
- Menu BPS yang relevan: Berita Resmi Statistik, Tabel Statistik, Publikasi, Infografik, WebAPI BPS, dan API Geoportal.

## Format Excel/CSV

Kolom yang didukung:

- `id`
- `name` atau `nama_desa` atau `desa`
- `district` atau `kecamatan`
- `population` atau `jumlah_penduduk`
- `households` atau `jumlah_kk`
- `health_centers` atau `puskesmas`
- `schools` atau `sekolah`
- `public_facilities` atau `fasilitas_umum`
- `msmes` atau `umkm`
- `potentials` atau `potensi_desa`

Untuk kolom daftar, pisahkan nilai dengan koma.

## Data Peta

GeoJSON contoh Kabupaten Nias ada di `src/lib/sample-data.ts` dan memuat 10 kecamatan: Idanogawo, Bawolato, Ulugawo, Gido, Sogae'adu, Ma'u, Somolo-molo, Hiliduho, Hiliserangkai, dan Botomuzoi. Untuk mengganti batas wilayah resmi sampai level desa, ubah `sampleVillageGeoJson` dengan GeoJSON desa/kecamatan Anda. Pastikan `properties.villageId` sama dengan `id` pada data desa.

## Deploy Vercel

1. Push project ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan environment variables Supabase di Vercel.
4. Deploy.

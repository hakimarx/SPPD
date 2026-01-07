# Panduan Penggunaan Aplikasi SPPD (Versi Cloud)

Aplikasi telah berhasil di-deploy ke akun Google Anda.

**URL Aplikasi:**
[Klik disini untuk membuka Aplikasi](https://script.google.com/macros/s/AKfycbynqsVkIWgeLtq87olbSCUv8kVmbpO_wJ1t2D13ze1e5A1gz0glPfRLFedWTKchGTHY/exec)

**Database Spreadsheet:**
[Klik disini untuk membuka Database](https://docs.google.com/spreadsheets/d/1qXnhDKzWy4gXFIYWfemfuRv6w-AWtP9GptYSJl9bgto/edit)

---

## Langkah Selanjutnya (Wajib Dilakukan)

Agar fitur cetak dokumen berfungsi, Anda perlu membuat 3 file Google Docs sebagai template.

### 1. Buat Template di Google Drive
Buat 3 file Google Docs baru di Google Drive Anda (bisa di folder yang sama dengan database), lalu desain sesuai kebutuhan dan masukkan kode placeholder berikut:

#### A. Template SPPD
- Nomor: `{{NOMOR}}`
- Nama: `{{NAMA}}`
- NIP: `{{NIP}}`
- Pangkat: `{{PANGKAT}}`
- Jabatan: `{{JABATAN}}`
- Maksud: `{{MAKSUD}}`
- Asal: `{{ASAL}}`
- Tujuan: `{{TUJUAN}}`
- Tgl Berangkat: `{{TGL_BERANGKAT}}`
- Tgl Kembali: `{{TGL_KEMBALI}}`
- Transportasi: `{{TRANSPORTASI}}`
- Anggaran: `{{ANGGARAN}}`

#### B. Template Lumpsum
- Nomor SPPD: `{{NOMOR_SPPD}}`
- Nama: `{{NAMA}}`
- Hari: `{{HARI}}`
- Uang Harian: `{{UANG_HARIAN}}` (Total: `{{TOTAL_UANG_HARIAN}}`)
- Transport: `{{TRANSPORT}}`
- Penginapan: `{{PENGINAPAN}}` (Malam: `{{MALAM}}`, Total: `{{TOTAL_PENGINAPAN}}`)
- Representasi: `{{REPRESENTASI}}`
- Lainnya: `{{LAINNYA}}`
- Total Semua: `{{TOTAL_SEMUA}}`
- Terbilang: `{{TERBILANG}}`

#### C. Template Kuitansi
- Nomor: `{{NOMOR}}`
- Sudah Terima Dari: `{{SUDAH_TERIMA_DARI}}`
- Jumlah Uang: `{{JUMLAH_UANG}}`
- Untuk Pembayaran: `{{UNTUK_PEMBAYARAN}}`
- Terbilang: `{{TERBILANG}}`
- Tempat, Tanggal: `{{TEMPAT_TANGGAL}}`
- Penerima: `{{PENERIMA}}`

### 2. Konfigurasi ID Template
1.  Buka setiap file Template yang baru dibuat.
2.  Lihat URL-nya di browser. Contoh: `docs.google.com/document/d/12345abcde.../edit`
3.  Salin kode unik di tengah URL (`12345abcde...`).
4.  Buka **Aplikasi SPPD** (link di atas).
5.  Masuk ke menu **Pengaturan**.
6.  Paste ID tersebut ke kolom yang sesuai (ID Template SPPD, Lumpsum, Kuitansi).
7.  Klik **Simpan Pengaturan**.

### 3. Izin Akses (Penting)
Saat pertama kali membuka aplikasi atau menyimpan data, Google akan meminta izin akses ("Authorization Required").
1.  Klik **Review Permissions**.
2.  Pilih akun Google Anda.
3.  Jika muncul peringatan "Google hasn't verified this app", klik **Advanced** > **Go to ... (unsafe)**.
4.  Klik **Allow**.

Selesai! Aplikasi siap digunakan.

# Aplikasi TV Jam & Jadwal Masjid — Starter MVP

Paket awal HuiTekno. Ini **prototipe teknis**, belum versi produksi.

## Isi
- `/admin`: panel untuk mengubah nama masjid, jadwal salat manual, khatib, wirid, pengumuman, ayat/hadis, dan ringkasan keuangan.
- `/tv`: tampilan layar TV.
- Data disimpan pada `data/content.json`; tidak memakai Firebase.
- Perubahan dari panel admin muncul di tampilan TV melalui server lokal.

## Kebutuhan
- Node.js versi 18 atau lebih baru.
- Perangkat yang menjalankan server Node.js (untuk tahap awal bisa laptop Windows).
- HP dan perangkat tampilan TV harus bisa mengakses server melalui jaringan yang sama.

## Menjalankan di Windows
1. Ekstrak ZIP ke folder proyek.
2. Pasang Node.js LTS jika belum ada: https://nodejs.org/
3. Buka folder ini di File Explorer.
4. Klik address bar folder, ketik `cmd`, lalu tekan Enter.
5. Jalankan:
   ```bat
   npm install
   npm start
   ```
6. Di laptop, buka `http://localhost:3000/admin`.
7. Untuk tampilan TV, buka `http://localhost:3000/tv`.
8. Untuk mengakses dari HP/TV lain, lihat alamat IP lokal yang tercetak di terminal, lalu buka `http://ALAMAT-IP:3000/admin` atau `/tv`.

## Catatan jaringan yang penting
Router **tidak wajib** jika tersedia jaringan lokal lain, misalnya hotspot HP. Namun, server tetap harus berjalan pada suatu perangkat. Smart TV umumnya tidak menjalankan server Node.js hanya karena memiliki IP address.

Untuk uji lokal tanpa router:
- Jalankan server pada laptop.
- Aktifkan hotspot di HP pengurus.
- Sambungkan laptop dan Smart TV ke hotspot HP (jika TV mendukung).
- Buka panel admin di HP dan tampilan TV di browser TV menggunakan alamat IP laptop yang tercetak di terminal.
- HP pemilik hotspot biasanya bisa mengakses perangkat yang tersambung, tetapi perilaku isolasi klien berbeda-beda menurut perangkat. Jika komunikasi diblokir, gunakan router lokal atau konfigurasi jaringan lain.

**Penting:** kombinasi hanya HP + Smart TV, tanpa server/perangkat tambahan dan tanpa internet, tidak dijamin bisa bekerja. Itu bergantung pada kemampuan Smart TV dan sistem operasi yang digunakan.

## Batasan prototipe
- Belum ada login/admin authentication. Jangan gunakan pada jaringan publik atau jaringan yang tidak dipercaya.
- Jadwal salat diisi manual; belum ada perhitungan/API jadwal salat.
- Belum ada hitung mundur iqamah, kalender Hijriah, atau manajemen multi-masjid.
- Belum ada instalasi otomatis untuk Smart TV; kompatibilitas browser TV harus diuji.
- Jika internet tidak ada, sistem lokal tetap dapat berfungsi selama server lokal dan jaringan lokal aktif.
- Jika server/laptop mati, TV tidak menerima pembaruan. Untuk penggunaan rutin, server perlu berjalan pada perangkat yang stabil dan selalu menyala.

## Arah pengembangan
1. Uji server lokal pada laptop + HP + browser TV.
2. Pastikan metode koneksi yang kompatibel dengan perangkat sasaran.
3. Tambahkan autentikasi atau PIN admin yang aman.
4. Tambahkan pengelolaan jadwal dan konten yang lebih lengkap.
5. Uji offline dan pemulihan koneksi sebelum dipakai di masjid.

# Birthday Website
Buka `index.html` langsung di browser (internet perlu untuk Google Fonts).

## Struktur aset (timpa file dengan nama yang sama untuk mengganti)
`assets/images/`
- `hero/` — hero-photo.webp · hero-banner.webp (tulisan HAPPY BIRTHDAY, PNG transparan) · hero-bunting.webp (bendera, di-tile otomatis) · hero-cat-cake.webp
- `collage/` — collage-01..14.webp (dinding foto)
- `decor/` — sakti-cat-flower.webp · sakti-sticker.webp (PNG transparan, foto cut-out)
- `polaroid/` — polaroid-1.webp · polaroid-2.webp (juga dipakai di kartu musik)
- `memories/` — memory-1..8.webp
- `party/` — party-music-card.webp · kitten-*.webp (kucing dipecah per bagian agar bisa bergerak)
- `backgrounds/` — portrait.webp · finale.webp

`assets/audio/music.mp3` — musik latar.

## Edit teks
Semua teks ada di `index.html`, per section (ada komentar penanda). Warna & ukuran ada di `css/style.css` bagian `:root`.

## Animasi scroll
Lenis (smooth scroll) + GSAP ScrollTrigger, file lokal di `js/vendor/` (tanpa CDN). Semua logika di `js/main.js`; gaya efek di akhir `css/style.css` (`html.fx`).
- Section menumpuk: tiap section menempel, section berikutnya naik menutupinya.
- Reveal & parallax mengikuti posisi scroll (scrub).
- Aktif otomatis di desktop & mobile. Jika `prefers-reduced-motion` aktif atau library gagal dimuat, situs jatuh ke mode biasa tanpa efek.
- Ubah kecepatan smooth scroll: `duration` di `new Lenis(...)`. Kekuatan efek tumpuk: nilai `scale` dan `opacity` di bagian "Stacking sections".

## Musik
File: `assets/audio/music.mp3` (timpa dengan nama sama untuk ganti lagu). Autoplay dicoba saat halaman dibuka; browser sering memblokir suara, jadi musik mulai otomatis di sentuhan/klik pertama. Tombol bulat kanan bawah untuk jeda/putar.

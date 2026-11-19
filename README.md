# Papan Catatan

Aplikasi catatan sederhana untuk Challenge Praktikum Pemrograman Web Modul 5. Proyek ini dibuat menggunakan Vite, React, dan TypeScript.

## Fitur

- Menambahkan catatan berisi judul, isi, dan kategori.
- Menampilkan catatan dalam kartu.
- Menghapus catatan.
- Mencari catatan berdasarkan judul.
- Memuat, menambahkan, dan menghapus post melalui REST API.
- Mencari post melalui query `?search=...` pada endpoint backend.
- Menyimpan catatan terakhir di `localStorage` sebagai cache browser.
- Menampilkan status loading dan pesan error saat berkomunikasi dengan API.

## Menjalankan proyek

```bash
npm install
npm run dev
```

## Konfigurasi REST API

Salin `.env.example` menjadi `.env` lalu sesuaikan `VITE_API_URL` dengan URL endpoint koleksi post backend Express. Nilai default-nya adalah `http://localhost:3000/api/posts`. Jika memakai JSONPlaceholder, atur nilainya menjadi `https://jsonplaceholder.typicode.com/posts`.

Frontend mengharapkan endpoint berikut:

| Method | Endpoint | Perilaku |
| --- | --- | --- |
| `GET` | `/api/posts?search=...` | Mengembalikan array post, atau `{ "data": [...] }` / `{ "posts": [...] }`. Setiap item memiliki `id`, `title`, dan `content` atau `body`. |
| `POST` | `/api/posts` | Menerima `title`, `content`, `body`, `category`, dan `userId`; idealnya mengembalikan post yang dibuat. Frontend mengirim `content` dan `body` dengan isi yang sama untuk mendukung kedua format API. |
| `DELETE` | `/api/posts/:id` | Menghapus post berdasarkan ID dan mengembalikan status sukses (termasuk `204 No Content`). |

Kolom `body` dari JSONPlaceholder dipetakan menjadi isi catatan (`content`), dan kategori akan ditampilkan sebagai `Umum` jika API tidak mengirimkannya. Endpoint yang menerima pencarian sebaiknya memfilter dan mengembalikan post yang cocok; frontend juga memfilter hasil berdasarkan judul. JSONPlaceholder tidak menyediakan filter `search` standar, jadi gunakan backend Modul 4 untuk demonstrasi pencarian server-side. Jika frontend dan backend berjalan pada origin berbeda, backend Express harus mengaktifkan CORS untuk origin Vite (biasanya `http://localhost:5173`), misalnya dengan `app.use(cors({ origin: "http://localhost:5173" }))` sebelum deklarasi route. CORS perlu dikonfigurasi di backend, bukan di React. Jangan menyimpan kredensial Neon di aplikasi frontend.

Untuk membuat build produksi:

```bash
npm run build
```

## Struktur utama

```text
src/
├── components/
│   ├── NoteCard.tsx
│   └── NoteForm.tsx
├── services/
│   └── notesApi.ts
├── types/
│   └── note.ts
├── App.tsx
├── App.css
└── index.css
```

## Pembagian tugas

### Nadia — Setup & Komponen React

**File yang dibuat/diubah:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/types/note.ts`, `src/components/NoteForm.tsx`, `src/components/NoteCard.tsx`, `src/App.css`, dan `src/index.css`.

- Menyiapkan proyek menggunakan Vite dengan template React + TypeScript. Konfigurasi dan dependensi proyek tersedia pada `package.json`, `vite.config.ts`, serta berkas `tsconfig`.
- Membuat interface `Note` pada `src/types/note.ts` dengan properti `id`, `title`, `content`, dan `category`. Interface ini digunakan sebagai tipe data catatan di seluruh komponen.
- Membuat `src/components/NoteForm.tsx` sebagai form input. Form menyediakan input judul, isi, kategori, validasi agar judul/isi tidak kosong, lalu mengirim objek catatan baru ke `App.tsx` melalui props `onAddNote`.
- Membuat `src/components/NoteCard.tsx` untuk menampilkan kategori, judul, dan isi satu catatan. Komponen ini juga memiliki tombol **Hapus** yang mengirim `id` catatan melalui props `onDeleteNote`.
- Membuat styling dasar pada `src/App.css` dan `src/index.css`, mencakup layout halaman, form, kartu catatan, tombol, kolom pencarian, serta tampilan responsif untuk layar kecil.

### Dyfan — State & Fitur Catatan Lokal

**File yang diubah:** `src/App.tsx` dan `README.md`.

Seluruh pekerjaan Dyfan berada di `src/App.tsx`. Langkah pengerjaannya sebagai berikut.

#### Langkah 1 — Menghubungkan komponen di `App.tsx`

Menambahkan import di bagian atas file:

```tsx
import { useEffect, useState } from "react";
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";
import type { Note } from "./types/note";
import "./App.css";
```

- `useState` dan `useEffect` adalah hook bawaan React untuk menyimpan data dan menjalankan aksi otomatis.
- `NoteForm` dan `NoteCard` adalah komponen buatan Nadia yang diimpor agar dapat dipakai di `App`.
- `Note` adalah tipe data catatan (`id`, `title`, `content`, `category`). Kata `type` berarti hanya dipakai sebagai tipe, bukan kode yang dijalankan.

Memasang kedua komponen di dalam `return`:

```tsx
<NoteForm onAddNote={addNote} />

{filteredNotes.map((note) => (
  <NoteCard key={note.id} note={note} onDeleteNote={deleteNote} />
))}
```

- `onAddNote={addNote}` meneruskan fungsi `addNote` ke form. Analogi: `App` adalah kasir dan form adalah pelanggan. Pelanggan hanya menyerahkan pesanan, kasir yang mencatat.
- `.map(...)` menampilkan satu `NoteCard` untuk setiap catatan.
- `key={note.id}` adalah label unik agar React mengenali kartu mana yang berubah.
- `onDeleteNote={deleteNote}` membuat tombol **Hapus** pada kartu memanggil fungsi hapus milik `App`.

#### Langkah 2 — Fitur tambah dan hapus catatan dengan `useState`

Menambahkan di dalam `function App()`:

```tsx
const [notes, setNotes] = useState<Note[]>(loadNotes);

function addNote(newNote: Note) {
  setNotes((prevNotes) => [newNote, ...prevNotes]);
}

function deleteNote(id: string) {
  setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
}
```

- `notes` ibarat papan tulis berisi daftar catatan, dan `setNotes` adalah spidolnya. Isi `notes` hanya boleh diubah melalui `setNotes`.
- `useState<Note[]>(loadNotes)` mengisi papan tulis di awal dengan data dari `loadNotes` (lihat Langkah 4).
- `[newNote, ...prevNotes]` menaruh catatan baru di urutan paling atas, diikuti catatan lama.
- `prevNotes.filter((note) => note.id !== id)` menyimpan semua catatan kecuali yang `id`-nya sama dengan yang dihapus.

#### Langkah 3 — Fitur pencarian judul dengan `.filter()`

Menambahkan state pencarian dan hasil filter di bawah fungsi `deleteNote`:

```tsx
const [search, setSearch] = useState("");

const filteredNotes = notes.filter((note) =>
  note.title.toLowerCase().includes(search.toLowerCase())
);
```

Menambahkan kolom input di dalam `return`:

```tsx
<input
  type="text"
  className="search-input"
  placeholder="Cari judul catatan..."
  value={search}
  onChange={(event) => setSearch(event.target.value)}
/>
```

- `search` menyimpan kata yang sedang diketik di kolom pencarian.
- `.filter()` bekerja seperti saringan teh: hanya catatan yang judulnya cocok yang lolos.
- `.toLowerCase()` mengubah huruf menjadi huruf kecil agar "Tugas" dan "tugas" dianggap sama.
- `.includes(...)` memeriksa apakah judul mengandung kata yang dicari.
- `onChange` memperbarui `search` setiap kali pengguna mengetik.
- Hasil saringan disimpan di `filteredNotes`, yang ditampilkan melalui `.map()` pada Langkah 1.

#### Langkah 4 — Menyimpan catatan ke `localStorage`

Menambahkan di luar `function App()`, di bawah import:

```tsx
const STORAGE_KEY = "papan-catatan-notes";

function loadNotes(): Note[] {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    const parsedNotes: unknown = savedNotes ? JSON.parse(savedNotes) : [];

    return Array.isArray(parsedNotes) ? (parsedNotes as Note[]) : [];
  } catch {
    return [];
  }
}
```

Menambahkan di dalam `App`, setelah `useState`:

```tsx
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}, [notes]);
```

- `localStorage` ibarat laci kecil di browser yang isinya tidak hilang saat halaman di-refresh.
- `STORAGE_KEY` adalah nama label laci tersebut (diubah dari `"catatan-nadia"` menjadi `"papan-catatan-notes"`).
- `getItem` mengambil isi laci berupa teks, lalu `JSON.parse` mengubahnya kembali menjadi data.
- `Array.isArray(...)` memastikan isinya benar-benar berupa daftar, sedangkan `try/catch` mengembalikan daftar kosong jika data rusak sehingga aplikasi tidak error.
- `useEffect(..., [notes])` berarti setiap `notes` berubah, penyimpanan dijalankan. `JSON.stringify` mengubah data menjadi teks sebelum disimpan.

#### Cara menguji

1. Jalankan `npm run dev`.
2. Tambahkan beberapa catatan, lalu coba fitur cari dan hapus.
3. Refresh halaman. Jika catatan masih ada, fitur `localStorage` berfungsi dengan benar.

### Arul — Integrasi REST API Modul 4

**File yang dibuat/diubah:** `src/services/notesApi.ts`, `src/App.tsx`, `src/components/NoteForm.tsx`, `.env.example`, `.gitignore`, `src/App.css`, dan `README.md`.

Bagian Arul menghubungkan frontend ke REST API dengan endpoint koleksi `/api/posts`. Backend Express + Neon Modul 4 tidak berada di repository frontend ini, sehingga route, koneksi database, dan middleware CORS harus disediakan/dijalankan dari proyek backend.

#### Langkah 1 — Mengonfigurasi alamat API

`.env.example` berisi alamat default:

```dotenv
VITE_API_URL=http://localhost:3000/api/posts
```

Salin menjadi `.env` di root proyek, lalu sesuaikan URL dengan backend yang dijalankan. Untuk mencoba GET memakai API publik, URL dapat diganti menjadi `https://jsonplaceholder.typicode.com/posts`. Setelah mengubah `.env`, restart server Vite. Jangan menaruh password atau connection string Neon di frontend karena nilai `VITE_*` dapat dibaca browser.

#### Langkah 2 — Memusatkan request di `notesApi.ts`

Service menyediakan tiga fungsi agar komponen tidak perlu menulis `fetch` langsung:

```ts
getNotes(search, signal); // GET /api/posts?search=...
createNote(note);         // POST /api/posts
removeNote(id);           // DELETE /api/posts/:id
```

- `getNotes` menambahkan query `search` jika pencarian tidak kosong, lalu menormalisasi respons array menjadi daftar `Note`.
- `extractNote` menerima isi post dari field `content` atau `body`. Ini mendukung API Modul 4 maupun bentuk post JSONPlaceholder. ID dijadikan string, dan kategori yang tidak dikirim API diberi nilai `"Umum"`.
- `createNote` mengirim JSON yang berisi `title`, `content`, `body`, `category`, dan `userId`. Field `content` dan `body` memiliki isi yang sama agar cocok dengan kedua skema API.
- `removeNote` mengirim request ke URL post berdasarkan ID yang di-encode.
- `readResponse` menangani status HTTP gagal dan respons kosong seperti `204 No Content`; respons JSON dengan format salah menghasilkan error.

#### Langkah 3 — Menghubungkan API di `App.tsx`

- Effect React memanggil GET saat halaman dibuka, saat nilai `search` berubah, dan setelah operasi CRUD berhasil.
- `AbortController` membatalkan request pencarian lama agar hasil lama tidak menimpa hasil yang lebih baru.
- State `isLoading`, `pendingRequests`, dan `error` dipakai untuk menampilkan status memuat, menyimpan, dan pesan error.
- Saat POST sukses, state catatan diperbarui tanpa refresh. Saat DELETE sukses, catatan dihapus dari state. Jika request gagal, error ditampilkan dan perubahan tidak dianggap berhasil.
- Pencarian dikirim ke backend lewat `?search=...`; hasilnya juga difilter judulnya di frontend.
- `localStorage` tetap digunakan sebagai cache daftar lengkap. Hasil pencarian tidak mengganti cache tersebut.

#### Langkah 4 — Menunggu hasil POST di `NoteForm.tsx`

`onAddNote` sekarang asynchronous dan mengembalikan boolean. Form menunggu hasil request, menampilkan tombol **Menyimpan...**, lalu mengosongkan input hanya jika POST berhasil. Jika gagal, isi form dipertahankan agar pengguna dapat mencoba lagi.

#### Langkah 5 — Menyiapkan backend dan CORS

Backend harus menyediakan route GET, POST, dan DELETE sesuai kontrak API di bagian **Konfigurasi REST API** di atas. Jika frontend dan backend berjalan pada origin berbeda, tambahkan CORS di server Express sebelum route, contohnya:

```ts
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
```

Konfigurasi tersebut adalah contoh untuk backend dan bukan file yang ada di repository frontend. Backend juga perlu membaca query `search` dan memfilter post berdasarkan judul jika ingin mendemonstrasikan pencarian server-side.

#### Cara menguji integrasi

1. Jalankan backend Modul 4 dan pastikan route `/api/posts` serta CORS aktif.
2. Atur `VITE_API_URL` di file `.env` sesuai alamat backend, lalu jalankan frontend dengan `npm run dev`.
3. Buka Developer Tools browser pada tab **Network**, lalu muat ulang halaman. Pastikan GET `/api/posts` berhasil dan daftar post muncul.
4. Tambahkan post. Pastikan request POST berhasil, tombol menunjukkan status menyimpan, form direset, dan post muncul tanpa refresh.
5. Hapus post. Pastikan request DELETE berhasil dan kartu langsung hilang.
6. Ketik kata pada kolom pencarian. Pastikan request GET berikutnya mengandung `?search=...` dan daftar hasil diperbarui.
7. Untuk menguji error, hentikan backend lokal sementara dan muat ulang halaman. Pastikan pesan error tampil. Jalankan kembali backend setelah pengujian.
8. Jalankan `npm run build` dan `npm run lint` untuk memeriksa TypeScript/build dan lint.

**Catatan API publik:** JSONPlaceholder menggunakan field `body`, tetapi POST dan DELETE-nya hanya simulasi dan perubahannya tidak tersimpan permanen. API tersebut juga tidak menyediakan pencarian judul standar dengan `?search=...`. Gunakan backend Modul 4 untuk mendemonstrasikan CRUD persisten, Neon, dan pencarian server-side.
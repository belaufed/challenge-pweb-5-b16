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
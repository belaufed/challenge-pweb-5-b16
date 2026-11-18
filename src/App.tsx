
import { useEffect, useState } from "react";
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";
import type { Note } from "./types/note";
import "./App.css";

const STORAGE_KEY = "papan-catatan-notes";

// ambil catatan yang sebelumnya udah disimpan di browser
function loadNotes(): Note[] {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    const parsedNotes: unknown = savedNotes ? JSON.parse(savedNotes) : [];

    return Array.isArray(parsedNotes) ? (parsedNotes as Note[]) : [];
  } catch {
    return [];
  }
}

function App() {
  // notes buat nyimpan daftar catatan
  const [notes, setNotes] = useState<Note[]>(loadNotes);

  // search buat nyimpan kata yang diketik di kolom pencarian
  const [search, setSearch] = useState("");

  // setiap notes berubah, datanya disimpan ke localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // nambahin catatan baru ke daftar yang udah ada
  function addNote(newNote: Note) {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  }

  // hapus catatan berdasarkan ID yang dipilih
  function deleteNote(id: string) {
    setNotes((prevNotes) =>
      prevNotes.filter((note) => note.id !== id)
    );
  }

  // filter catatan berdasarkan judul yang dicari
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📝 Papan Catatan</h1>
        <p>Simpan ide, tugas, dan catatan pentingmu di sini.</p>
      </header>

      <main>
        {/* form buat menambah catatan */}
        <NoteForm onAddNote={addNote} />

        <section className="notes-section">
          <div className="notes-heading">
            <h2>Daftar Catatan ({notes.length})</h2>

            {/* input pencarian berdasarkan judul */}
            <input
              type="text"
              className="search-input"
              placeholder="Cari judul catatan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* kalau hasil pencarian kosong, tampilkan pesan */}
          {filteredNotes.length === 0 ? (
            <p className="empty-message">
              {search
                ? "Catatan yang dicari tidak ditemukan."
                : "Belum ada catatan. Yuk, buat catatan pertama!"}
            </p>
          ) : (
            <div className="notes-grid">
              {/* tampilkan setiap catatan pakai komponen NoteCard */}
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDeleteNote={deleteNote}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        Challenge Modul 5 — React + TypeScript
      </footer>
    </div>
  );
}

export default App;

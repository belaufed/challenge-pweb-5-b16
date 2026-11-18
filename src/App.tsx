
import { useEffect, useState } from "react";
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";
import type { Note } from "./types/note";
import { createNote, getNotes, removeNote } from "./services/notesApi";
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
  const [cachedNotes, setCachedNotes] = useState<Note[]>(loadNotes);
  const [notes, setNotes] = useState<Note[]>(cachedNotes);

  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // search buat nyimpan kata yang diketik di kolom pencarian
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    getNotes(search, controller.signal)
      .then((loadedNotes) => {
        setNotes(loadedNotes);
        if (!search.trim()) {
          setCachedNotes(loadedNotes);
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Gagal memuat catatan dari server.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [search, refreshVersion]);

  // Simpan daftar lengkap ke cache; hasil pencarian tidak mengganti cache.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedNotes));
  }, [cachedNotes]);

  // nambahin catatan baru ke daftar yang udah ada
  async function addNote(newNote: Note): Promise<boolean> {
    setPendingRequests((pending) => pending + 1);
    setError(null);

    try {
      const createdNote = await createNote(newNote);
      if (createdNote) {
        const prependNote = (prevNotes: Note[]) => [
          createdNote,
          ...prevNotes.filter((note) => note.id !== createdNote.id),
        ];
        setNotes(prependNote);
        setCachedNotes(prependNote);
      } else {
        const loadedNotes = await getNotes("");
        setCachedNotes(loadedNotes);
        setNotes(
          search.trim()
            ? loadedNotes.filter((note) =>
                note.title.toLowerCase().includes(search.trim().toLowerCase()),
              )
            : loadedNotes,
        );
      }
      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
      return true;
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal menambahkan catatan.",
      );
      return false;
    } finally {
      setPendingRequests((pending) => pending - 1);
    }
  }

  // hapus catatan berdasarkan ID yang dipilih
  async function deleteNote(id: string): Promise<void> {
    setPendingRequests((pending) => pending + 1);
    setError(null);

    try {
      await removeNote(id);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setCachedNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gagal menghapus catatan.",
      );
    } finally {
      setPendingRequests((pending) => pending - 1);
    }
  }

  function handleSearchChange(value: string) {
    setIsLoading(true);
    setError(null);
    setSearch(value);
  }

  // filter catatan berdasarkan judul yang dicari
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.trim().toLowerCase())
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
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          {isLoading && (
            <p className="api-status" role="status">
              Memuat catatan dari server...
            </p>
          )}
          {pendingRequests > 0 && (
            <p className="api-status" role="status">
              Menyimpan perubahan...
            </p>
          )}
          {error && (
            <p className="api-error" role="alert">
              {error}
            </p>
          )}

          {/* kalau hasil pencarian kosong, tampilkan pesan */}
          {filteredNotes.length === 0 ? (
            isLoading ? null : (
              <p className="empty-message">
                {search
                  ? "Catatan yang dicari tidak ditemukan."
                  : "Belum ada catatan. Yuk, buat catatan pertama!"}
              </p>
            )
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

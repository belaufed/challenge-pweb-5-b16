
import type { Note } from "../types/note";

// props ini buat nerima data catatan dan fungsi hapus dari App
interface NoteCardProps {
  note: Note;
  onDeleteNote: (id: string) => void;
}

export default function NoteCard({ note, onDeleteNote }: NoteCardProps) {
  return (
    <div className="note-card">
      {/* nampilin kategori catatannya */}
      <span className="note-category">{note.category}</span>

      {/* judul sama isi diambil dari data note */}
      <h3>{note.title}</h3>
      <p>{note.content}</p>

      {/* pas diklik, ID catatan dikirim ke fungsi hapus */}
      <button
        type="button"
        className="delete-button"
        onClick={() => onDeleteNote(note.id)}
      >
        Hapus
      </button>
    </div>
  );
}

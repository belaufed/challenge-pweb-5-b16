
import { useState, type FormEvent } from "react";
import type { Note } from "../types/note";

interface NoteFormProps {
  onAddNote: (note: Note) => Promise<boolean>;
}

export default function NoteForm({ onAddNote }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Umum");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Judul dan isi catatan wajib diisi!");
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      category,
    };

    setIsSubmitting(true);
    try {
      const saved = await onAddNote(newNote);
      if (saved) {
        setTitle("");
        setContent("");
        setCategory("Umum");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h2>Tambah Catatan Baru</h2>

      <label htmlFor="title">Judul Catatan</label>
      <input
        id="title"
        type="text"
        placeholder="Masukkan judul catatan..."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label htmlFor="content">Isi Catatan</label>
      <textarea
        id="content"
        placeholder="Tulis isi catatan..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
        required
      />

      <label htmlFor="category">Kategori</label>
      <select
        id="category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="Umum">Umum</option>
        <option value="Kuliah">Kuliah</option>
        <option value="Tugas">Tugas</option>
        <option value="Pribadi">Pribadi</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "+ Tambah Catatan"}
      </button>
    </form>
  );
}

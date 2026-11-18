
import { useState, type FormEvent } from "react";
import type { Note } from "../types/note";

interface NoteFormProps {
  onAddNote: (note: Note) => void;
}

export default function NoteForm({ onAddNote }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Umum");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    onAddNote(newNote);

    setTitle("");
    setContent("");
    setCategory("Umum");
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

      <button type="submit">+ Tambah Catatan</button>
    </form>
  );
}

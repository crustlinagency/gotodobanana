import NoteCard from "./NoteCard";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface NotesListProps {
  notes: any[];
  onEditNote: (note: any) => void;
  onNewNote: () => void;
}

export default function NotesList({ notes, onEditNote, onNewNote }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
        <div className="bg-banana-100 p-4 rounded-full mb-4">
          <FileText className="h-8 w-8 text-banana-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Capture your thoughts, ideas, and reminders. All your notes are kept private to your account.
        </p>
        <Button onClick={onNewNote} className="bg-banana-500 hover:bg-banana-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Create your first note
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onClick={onEditNote} />
      ))}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Tag as TagIcon, MoreVertical } from "lucide-react";

interface NoteCardProps {
  note: any;
  onClick: (note: any) => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  // Simple function to strip HTML for the preview
  const getPreviewText = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const preview = getPreviewText(note.content || "");
  const priorityClass = `priority-${(note.priority || "medium").toLowerCase()}`;

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow group relative flex flex-col h-full"
      onClick={() => onClick(note)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg line-clamp-1 flex-1">{note.title || "Untitled Note"}</h3>
        <Badge className={`ml-2 shrink-0 ${priorityClass}`}>
          {note.priority}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
        {preview || "No content"}
      </p>

      <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t">
        {note.tags && note.tags.map((tag: string) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-1">
            <TagIcon className="h-2.5 w-2.5" />
            {tag}
          </Badge>
        ))}
        {!note.tags?.length && (
          <span className="text-[10px] text-muted-foreground italic">No tags</span>
        )}
      </div>

      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(note.created_at || Date.now()), "MMM d")}
        </span>
      </div>
    </Card>
  );
}

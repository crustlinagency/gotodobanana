import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Heading2,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

export default function RichTextEditor({ content, onChange, placeholder, readOnly = false }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write your task description...',
            }),
        ],
        content: content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            if (onChange && !readOnly) {
                onChange(editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none p-4 focus:outline-none min-h-[200px] bg-background text-foreground',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!readOnly);
        }
    }, [readOnly, editor]);

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    if (readOnly) {
        return (
            <div className="border rounded-lg overflow-hidden">
                <EditorContent editor={editor} />
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                <Button
                    type="button"
                    variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="h-8 w-8 p-0"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="h-8 w-8 p-0"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('heading') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="h-8 w-8 p-0"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className="h-8 w-8 p-0"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className="h-8 w-8 p-0"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className="h-8 w-8 p-0"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={addLink}
                    className="h-8 w-8 p-0"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
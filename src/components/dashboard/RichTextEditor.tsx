import { RichTextEditorComponent, Toolbar, Inject, Image, Link, HtmlEditor, QuickToolbar, Table, FileManager, PasteCleanup, Count, FormatPainter } from "@syncfusion/ej2-react-richtexteditor";
import { registerLicense } from "@syncfusion/ej2-base";
import { useEffect, useRef } from "react";

// Register Syncfusion license - MUST be done in each file using Syncfusion components
const syncfusionKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY || "Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXZcdXRWRmVcV0J2WkY=";
registerLicense(syncfusionKey);

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const rteRef = useRef<RichTextEditorComponent>(null);

    useEffect(() => {
        if (rteRef.current && content !== rteRef.current.value) {
            rteRef.current.value = content;
        }
    }, [content]);

    const handleChange = () => {
        if (rteRef.current) {
            onChange(rteRef.current.value);
        }
    };

    const toolbarSettings = {
        items: [
            'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
            'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
            'Formats', 'Alignments', '|',
            'NumberFormatList', 'BulletFormatList', '|',
            'CreateLink', 'Image', '|',
            'Indent', 'Outdent', '|',
            'CreateTable', '|',
            'ClearFormat', 'SourceCode', '|',
            'Undo', 'Redo'
        ]
    };

    const quickToolbarSettings = {
        image: [
            'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', 'OpenImageLink', '-',
            'EditImageLink', 'RemoveImageLink', 'Display', 'AltText', 'Dimension'
        ],
        link: ['Open', 'Edit', 'UnLink']
    };

    const insertImageSettings = {
        saveFormat: "Base64",
        saveUrl: null,
        path: null
    };

    const pasteCleanupSettings = {
        prompt: false,
        plainText: false,
        keepFormat: true
    };

    return (
        <div className="syncfusion-rte-wrapper border rounded-lg overflow-hidden">
            <RichTextEditorComponent
                ref={rteRef}
                value={content}
                change={handleChange}
                placeholder={placeholder || "Write your task description..."}
                toolbarSettings={toolbarSettings}
                quickToolbarSettings={quickToolbarSettings}
                insertImageSettings={insertImageSettings}
                pasteCleanupSettings={pasteCleanupSettings}
                height={320}
                enableResize={false}
                showCharCount={true}
                maxLength={5000}
                floatingToolbarOffset={0}
            >
                <Inject services={[
                    Toolbar, 
                    Image, 
                    Link, 
                    HtmlEditor, 
                    QuickToolbar, 
                    Table, 
                    FileManager, 
                    PasteCleanup,
                    Count,
                    FormatPainter
                ]} />
            </RichTextEditorComponent>
        </div>
    );
}
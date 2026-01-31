'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND, 
  FORMAT_ELEMENT_COMMAND, 
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $getRoot,
  LexicalNode,
  $isElementNode,
  $isDecoratorNode,
  $isTextNode,
} from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $setBlocksType, $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, Heading1, Heading2, Quote, List as ListIcon, ListOrdered, Image as ImageIcon, 
  Palette, ChevronDown, Loader2 
} from 'lucide-react';
import { cn } from './ui';
import { toast } from 'sonner';
import ImagesPlugin, { ImageNode, INSERT_IMAGE_COMMAND } from './nodes/ImageNode';

// Image compression utility
function slugifyFilename(filename: string): string {
  const ext = filename.split('.').pop() || '';
  const name = filename.replace(/\.[^/.]+$/, '');
  const slugified = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  const timestamp = Date.now();
  return `${slugified}-${timestamp}.${ext}`;
}

async function compressImage(file: File, quality: number = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress image'));
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}



const theme = {
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
  },
  list: {
    ul: 'editor-list-ul',
    ol: 'editor-list-ol',
    listitem: 'editor-listitem',
  },
  quote: 'editor-quote',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
  },
};

const FONT_FAMILY_OPTIONS = [
  ['Inter', 'Inter'],
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['18px', '18px'],
  ['20px', '20px'],
  ['24px', '24px'],
  ['30px', '30px'],
];

interface ToolbarPluginProps {
  onImageUpload?: (file: File) => Promise<string | null>;
}

const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({ onImageUpload }) => {
  const [editor] = useLexicalComposerContext();
  const [isUploading, setIsUploading] = useState(false);
  const [activeState, setActiveState] = useState({
    bold: false,
    italic: false,
    underline: false,
    blockType: 'paragraph',
    align: 'left',
    fontFamily: 'Inter',
    fontSize: '15px',
    fontColor: '#000000',
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

      setActiveState({
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        underline: selection.hasFormat('underline'),
        blockType: element.getType(),
        align: String(element.getFormat()) || 'left',
        fontFamily: $getSelectionStyleValueForProperty(selection, 'font-family', 'Inter'),
        fontSize: $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
        fontColor: $getSelectionStyleValueForProperty(selection, 'color', '#000000'),
      });
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const applyStyleText = (styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyStyleText({ 'font-family': e.target.value });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyStyleText({ 'font-size': e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyStyleText({ 'color': e.target.value });
  };

  const formatBlock = (type: string) => {
    if (type === 'h1') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h1'));
      });
    } else if (type === 'h2') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createHeadingNode('h2'));
      });
    } else if (type === 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createQuoteNode());
      });
    } else if (type === 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $setBlocksType(selection, () => $createParagraphNode());
      });
    } else if (type === 'ul') {
       editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (type === 'ol') {
       editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && onImageUpload) {
        setIsUploading(true);
        try {
          const url = await onImageUpload(file);
          if (url) {
            // Use command pattern for image insertion
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: '' });
            toast.success('Đã chèn ảnh vào nội dung');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error('Không thể tải ảnh lên');
        } finally {
          setIsUploading(false);
        }
      } else if (!onImageUpload) {
        toast.error('Chức năng upload ảnh chưa được cấu hình');
      }
    };
    input.click();
  };

  const ToolbarBtn = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400 flex items-center justify-center min-w-[28px]",
        active ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-inner" : "hover:shadow-sm"
      )}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-lg sticky top-0 z-10">
      
      <div className="flex items-center gap-1 mr-1">
        <div className="relative">
          <select 
            onChange={handleFontFamilyChange} 
            value={activeState.fontFamily}
            className="h-8 w-[110px] appearance-none pl-2 pr-6 text-xs bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-slate-300 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300 truncate"
          >
            {FONT_FAMILY_OPTIONS.map(([option, text]) => (
              <option key={option} value={option}>{text}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            onChange={handleFontSizeChange} 
            value={activeState.fontSize}
            className="h-8 w-[65px] appearance-none pl-2 pr-5 text-xs bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 focus:border-slate-300 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300"
          >
            {FONT_SIZE_OPTIONS.map(([option, text]) => (
              <option key={option} value={option}>{text}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer group" title="Màu chữ">
          <Palette size={16} className="text-slate-600 dark:text-slate-400" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full border border-slate-200" style={{ backgroundColor: activeState.fontColor }}></div>
          <input 
            type="color" 
            value={activeState.fontColor} 
            onChange={handleColorChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} active={activeState.bold} title="In đậm (Ctrl+B)">
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} active={activeState.italic} title="In nghiêng (Ctrl+I)">
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} active={activeState.underline} title="Gạch chân (Ctrl+U)">
          <Underline size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} active={activeState.align === 'left'} title="Căn trái">
          <AlignLeft size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} active={activeState.align === 'center'} title="Căn giữa">
          <AlignCenter size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} active={activeState.align === 'right'} title="Căn phải">
          <AlignRight size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} active={activeState.align === 'justify'} title="Căn đều">
          <AlignJustify size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => formatBlock('paragraph')} active={activeState.blockType === 'paragraph'} title="Văn bản thường">
          <Type size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('h1')} active={activeState.blockType === 'h1'} title="Tiêu đề 1">
          <Heading1 size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('h2')} active={activeState.blockType === 'h2'} title="Tiêu đề 2">
          <Heading2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('quote')} active={activeState.blockType === 'quote'} title="Trích dẫn">
          <Quote size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => formatBlock('ul')} active={activeState.blockType === 'ul'} title="Danh sách chấm">
          <ListIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('ol')} active={activeState.blockType === 'ol'} title="Danh sách số">
          <ListOrdered size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={handleImageUpload} title="Tải ảnh lên">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        </ToolbarBtn>
      </div>
    </div>
  );
};

interface LexicalEditorProps {
  onChange?: (html: string) => void;
  initialContent?: string;
  folder?: string;
}

// Plugin to handle paste events and auto-upload base64 images
interface PasteImagePluginProps {
  onImageUpload: (file: File) => Promise<string | null>;
}

const PasteImagePlugin: React.FC<PasteImagePluginProps> = ({ onImageUpload }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            try {
              const url = await onImageUpload(file);
              if (url) {
                // Use command pattern for image insertion
                editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: '' });
                toast.success('Đã paste và upload ảnh');
              }
            } catch (error) {
              console.error('Paste image error:', error);
              toast.error('Không thể upload ảnh');
            }
          }
          break;
        }
      }
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener('paste', handlePaste as unknown as EventListener);
      return () => {
        rootElement.removeEventListener('paste', handlePaste as unknown as EventListener);
      };
    }
  }, [editor, onImageUpload]);

  return null;
};

const InitialContentPlugin: React.FC<{ initialContent?: string }> = ({ initialContent }) => {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (initialContent && !isInitializedRef.current) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialContent, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        
        // Filter: only ElementNode or DecoratorNode can be appended to root
        // TextNodes need to be wrapped in ParagraphNode
        const validNodes: LexicalNode[] = [];
        for (const node of nodes) {
          if ($isElementNode(node) || $isDecoratorNode(node)) {
            validNodes.push(node);
          } else if ($isTextNode(node)) {
            // Wrap text nodes in paragraph
            const text = node.getTextContent().trim();
            if (text) {
              const paragraph = $createParagraphNode();
              paragraph.append(node);
              validNodes.push(paragraph);
            }
          }
        }
        
        if (validNodes.length > 0) {
          root.append(...validNodes);
        }
      });
      isInitializedRef.current = true;
    }
  }, [editor, initialContent]);

  return null;
};

export const LexicalEditor: React.FC<LexicalEditorProps> = ({ onChange, initialContent, folder = 'posts-content' }) => {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveImage = useMutation(api.storage.saveImage);
  
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode, 
      QuoteNode, 
      ListNode, 
      ListItemNode, 
      AutoLinkNode, 
      LinkNode,
      ImageNode
    ],
  };

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return null;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return null;
    }
    
    try {
      // Compress image
      const compressedBlob = await compressImage(file, 0.85);
      const slugifiedName = slugifyFilename(file.name);
      const compressedFile = new File([compressedBlob], slugifiedName, { type: compressedBlob.type });
      
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload to Convex storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': compressedFile.type },
        body: compressedFile,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { storageId } = await response.json();
      
      // Save to database
      const result = await saveImage({
        storageId: storageId as Id<"_storage">,
        filename: slugifiedName,
        mimeType: compressedFile.type,
        size: compressedFile.size,
        folder,
      });
      
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }, [generateUploadUrl, saveImage, folder]);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-sm w-full editor-shell">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin onImageUpload={handleImageUpload} />
        <div className="relative min-h-[400px] editor-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input outline-none h-full min-h-[400px] p-4" />}
            placeholder={<div className="editor-placeholder absolute top-4 left-4 text-slate-400 pointer-events-none">Bắt đầu viết nội dung tuyệt vời của bạn...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <PasteImagePlugin onImageUpload={handleImageUpload} />
          <InitialContentPlugin initialContent={initialContent} />
          <OnChangePlugin onChange={(editorState, editor) => {
             editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null);
                if (onChange) onChange(html);
             });
          }}/>
        </div>
      </LexicalComposer>
      <style jsx global>{`
        .editor-paragraph { margin: 0 0 8px 0; }
        .editor-heading-h1 { font-size: 24px; font-weight: bold; margin: 0 0 12px 0; }
        .editor-heading-h2 { font-size: 18px; font-weight: bold; margin: 0 0 10px 0; }
        .editor-quote { border-left: 4px solid #cbd5e1; margin: 8px 0; padding-left: 16px; color: #64748b; font-style: italic; }
        .editor-list-ul { list-style-type: disc; padding-left: 24px; margin: 8px 0; }
        .editor-list-ol { list-style-type: decimal; padding-left: 24px; margin: 8px 0; }
        .editor-listitem { margin: 4px 0; }
        .editor-text-bold { font-weight: bold; }
        .editor-text-italic { font-style: italic; }
        .editor-text-underline { text-decoration: underline; }
        .editor-input img { max-width: 100%; height: auto; display: block; margin: 8px 0; border-radius: 4px; }
      `}</style>
    </div>
  );
};

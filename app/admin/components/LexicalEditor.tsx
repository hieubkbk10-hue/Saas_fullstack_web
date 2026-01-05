'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  COMMAND_PRIORITY_CRITICAL
} from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $setBlocksType, $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, Heading1, Heading2, Quote, List as ListIcon, ListOrdered, Image as ImageIcon, 
  Palette, ChevronDown 
} from 'lucide-react';
import { cn } from './ui';

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

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
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
  }, [editor]);

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

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
       const target = e.target as HTMLInputElement;
       const file = target.files?.[0];
       if(file) {
          const reader = new FileReader();
          reader.onload = () => {
             alert("Trong bản demo thực tế (kết nối backend), ảnh sẽ được chèn vào vị trí con trỏ.");
          }
          reader.readAsDataURL(file);
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

        <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer group" title="Mau chu">
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
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} active={activeState.bold} title="In dam (Ctrl+B)">
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} active={activeState.italic} title="In nghieng (Ctrl+I)">
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} active={activeState.underline} title="Gach chan (Ctrl+U)">
          <Underline size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} active={activeState.align === 'left'} title="Can trai">
          <AlignLeft size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} active={activeState.align === 'center'} title="Can giua">
          <AlignCenter size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} active={activeState.align === 'right'} title="Can phai">
          <AlignRight size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} active={activeState.align === 'justify'} title="Can deu">
          <AlignJustify size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => formatBlock('paragraph')} active={activeState.blockType === 'paragraph'} title="Van ban thuong">
          <Type size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('h1')} active={activeState.blockType === 'h1'} title="Tieu de 1">
          <Heading1 size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('h2')} active={activeState.blockType === 'h2'} title="Tieu de 2">
          <Heading2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('quote')} active={activeState.blockType === 'quote'} title="Trich dan">
          <Quote size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={() => formatBlock('ul')} active={activeState.blockType === 'ul'} title="Danh sach cham">
          <ListIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('ol')} active={activeState.blockType === 'ol'} title="Danh sach so">
          <ListOrdered size={16} />
        </ToolbarBtn>
      </div>

      <Divider />

      <div className="flex items-center gap-0.5">
        <ToolbarBtn onClick={handleImageUpload} title="Tai anh len">
          <ImageIcon size={16} />
        </ToolbarBtn>
      </div>
    </div>
  );
};

interface LexicalEditorProps {
  onChange?: (html: string) => void;
  initialContent?: string;
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({ onChange }) => {
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
      LinkNode
    ],
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-sm w-full editor-shell">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-[400px] editor-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input outline-none h-full min-h-[400px] p-4" />}
            placeholder={<div className="editor-placeholder absolute top-4 left-4 text-slate-400 pointer-events-none">Bat dau viet noi dung tuyet voi cua ban...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
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
      `}</style>
    </div>
  );
};

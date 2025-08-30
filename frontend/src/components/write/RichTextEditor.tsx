import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image,
  Undo,
  Redo
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function RichTextEditor({ content, onContentChange }: RichTextEditorProps) {
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (editorRef && content !== editorRef.innerHTML) {
      editorRef.innerHTML = content;
      setIsEmpty(!content || content.trim() === "");
    }
  }, [content, editorRef]);

  const handleInput = () => {
    if (editorRef) {
      const newContent = editorRef.innerHTML;
      const textContent = editorRef.textContent || "";
      setIsEmpty(textContent.trim() === "");
      onContentChange(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (!editorRef) return;
    
    editorRef.focus();
    
    // Handle specific commands that might not work with execCommand
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const listType = command === 'insertUnorderedList' ? 'ul' : 'ol';
      const listItem = document.createElement('li');
      
      // If there's selected text, wrap it in the list item
      if (!range.collapsed) {
        const contents = range.extractContents();
        listItem.appendChild(contents);
      } else {
        listItem.innerHTML = '<br>';
      }
      
      const list = document.createElement(listType);
      list.appendChild(listItem);
      
      range.insertNode(list);
      
      // Position cursor in the list item
      const newRange = document.createRange();
      newRange.setStart(listItem, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else if (command === 'formatBlock' && value === 'blockquote') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const blockquote = document.createElement('blockquote');
      blockquote.style.borderLeft = '4px solid hsl(var(--primary))';
      blockquote.style.paddingLeft = '16px';
      blockquote.style.margin = '16px 0';
      blockquote.style.fontStyle = 'italic';
      blockquote.style.color = 'hsl(var(--muted-foreground))';
      
      if (!range.collapsed) {
        const contents = range.extractContents();
        blockquote.appendChild(contents);
      } else {
        blockquote.innerHTML = 'Quote text...';
      }
      
      range.insertNode(blockquote);
      
      // Position cursor in the blockquote
      const newRange = document.createRange();
      newRange.selectNodeContents(blockquote);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Use execCommand for other formatting
      try {
        document.execCommand(command, false, value);
      } catch (error) {
        console.warn('execCommand failed:', command, error);
      }
    }
    
    handleInput();
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Show loading toast
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your image.",
        });

        try {
          const API_KEY = 'f21236a63fd3908f258ffa7bc0314eef';
          const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
          
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch(`${IMGBB_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            body: formData
          });

          const data = await response.json();
          
          if (data.success) {
            const img = `<img src="${data.data.url}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" /><p><br></p>`;
            execCommand('insertHTML', img);
            
            // Position cursor after the image
            setTimeout(() => {
              if (editorRef) {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(editorRef);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
                editorRef.focus();
              }
            }, 100);
            
            toast({
              title: "Image uploaded successfully",
              description: "Your image has been added to the article.",
            });
          } else {
            throw new Error(data.error?.message || 'Upload failed');
          }
        } catch (error) {
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setLinkText(selection.toString().trim());
      setIsLinkMode(true);
    } else {
      // If no text is selected, allow creating a new link
      setLinkText("");
      setIsLinkMode(true);
    }
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      if (!editorRef) return;
      
      editorRef.focus();
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Create the link element
        const link = document.createElement('a');
        link.href = linkUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.color = 'hsl(var(--primary))';
        link.style.textDecoration = 'underline';
        link.textContent = linkText;
        
        // If there was selected text, replace it
        if (!range.collapsed) {
          range.deleteContents();
        }
        
        range.insertNode(link);
        
        // Position cursor after the link
        const newRange = document.createRange();
        newRange.setStartAfter(link);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        handleInput();
      }
      
      setIsLinkMode(false);
      setLinkText("");
      setLinkUrl("");
    }
  };

  const formatHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Editor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Write your article using the visual editor below. No markdown knowledge required!
        </p>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="border rounded-t-lg p-2 bg-muted/50">
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('bold')}
                className="h-8 w-8 p-0"
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('italic')}
                className="h-8 w-8 p-0"
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('underline')}
                className="h-8 w-8 p-0"
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>


            {/* Alignment */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyLeft')}
                className="h-8 w-8 p-0"
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyCenter')}
                className="h-8 w-8 p-0"
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyRight')}
                className="h-8 w-8 p-0"
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Lists */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertUnorderedList')}
                className="h-8 w-8 p-0"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertOrderedList')}
                className="h-8 w-8 p-0"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'blockquote')}
                className="h-8 w-8 p-0"
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Media & Links */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLink}
                className="h-8 w-8 p-0"
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="h-8 w-8 p-0"
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('undo')}
                className="h-8 w-8 p-0"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('redo')}
                className="h-8 w-8 p-0"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Link Input Modal */}
          {isLinkMode && (
            <div className="bg-background border rounded p-3 mt-2">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Link Text:</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full p-2 border rounded text-sm mt-1"
                    placeholder="Link text"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL:</label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-2 border rounded text-sm mt-1"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={insertLink}>
                    Insert Link
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsLinkMode(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="relative">
          <div
            ref={setEditorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[400px] p-4 border border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary/20 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer"
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            suppressContentEditableWarning={true}
          />
          
          {/* Placeholder */}
          {isEmpty && (
            <div 
              className="absolute top-4 left-4 text-muted-foreground pointer-events-none"
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Start writing your article...
            </div>
          )}
        </div>

        {/* Helper Text */}
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p><strong>💡 Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Select text and use the toolbar buttons to format it</li>
            <li>Use keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)</li>
            <li>Click the image button to upload and insert images</li>
            <li>Select text first, then click the link button to create links</li>
            <li>Use quotes and lists to organize your content better</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
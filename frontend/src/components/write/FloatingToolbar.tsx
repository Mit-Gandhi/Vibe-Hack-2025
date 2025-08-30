import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Image,
  Upload,
  Type,
  List,
  Quote
} from "lucide-react";

const API_KEY = 'f21236a63fd3908f258ffa7bc0314eef';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

interface FloatingToolbarProps {
  content: string;
  onContentChange: (content: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function FloatingToolbar({ content, onContentChange, textareaRef }: FloatingToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Set initial position on mount
  useEffect(() => {
    // Set initial position based on screen size
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Mobile: position above content area
      setPosition({
        x: 20,
        y: 100
      });
    } else {
      // Desktop: center-right position
      setPosition({
        x: window.innerWidth - 400,
        y: 200
      });
    }
  }, []);

  // Touch drag functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const toolbarWidth = window.innerWidth < 768 ? 280 : 350;
    const toolbarHeight = 120;
    
    const newX = Math.max(10, Math.min(window.innerWidth - toolbarWidth - 10, touch.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - toolbarHeight - 10, touch.clientY - dragStart.y));
    
    setPosition({
      x: newX,
      y: newY
    });
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse drag functionality for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const toolbarWidth = window.innerWidth < 768 ? 280 : 350;
    const toolbarHeight = 120;
    
    const newX = Math.max(10, Math.min(window.innerWidth - toolbarWidth - 10, e.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - toolbarHeight - 10, e.clientY - dragStart.y));
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle mouse drag events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const insertFormatting = (startTag: string, endTag: string, placeholder: string = "") => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      startTag + selectedText + endTag + 
      content.substring(end);
    
    onContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + startTag.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleBold = () => insertFormatting("**", "**", "bold text");
  const handleItalic = () => insertFormatting("*", "*", "italic text");
  const handleUnderline = () => insertFormatting("<u>", "</u>", "underlined text");
  const handleHeading = () => insertFormatting("## ", "", "Heading");
  const handleQuote = () => insertFormatting("> ", "", "Quote");
  const handleList = () => insertFormatting("- ", "", "List item");

  const handleAlignment = (alignment: string) => {
    const alignmentTag = `<div style="text-align: ${alignment};">`;
    insertFormatting(alignmentTag, "</div>", "aligned text");
  };

  const handleInsertLink = () => {
    if (!linkUrl || !linkText) {
      toast({
        title: "Missing information",
        description: "Please provide both URL and link text.",
        variant: "destructive"
      });
      return;
    }
    
    const textarea = textareaRef?.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    
    const newContent = 
      content.substring(0, start) + 
      linkMarkdown + 
      content.substring(start);
    
    onContentChange(newContent);
    setShowLinkInput(false);
    setLinkUrl("");
    setLinkText("");
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + linkMarkdown.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', API_KEY);

      const response = await fetch(IMGBB_API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.data.url;
        const imageMarkdown = `\n\n![Uploaded image](${imageUrl})\n\n`;
        
        const textarea = textareaRef?.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const newContent = 
            content.substring(0, start) + 
            imageMarkdown + 
            content.substring(start);
          
          onContentChange(newContent);
          
          setTimeout(() => {
            textarea.focus();
            const newPosition = start + imageMarkdown.length;
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }

        toast({
          title: "Image uploaded successfully",
          description: "The image has been inserted into your article.",
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
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-1 sm:p-2 select-none w-[280px] sm:w-auto max-w-[350px]"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle for mobile */}
      <div className="flex items-center justify-center mb-1 sm:mb-2 lg:hidden">
        <div className="w-8 h-1 bg-muted-foreground/30 rounded-full"></div>
      </div>
      
      <div className="flex items-center gap-1 mb-1 sm:mb-2 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBold}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Bold"
        >
          <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleItalic}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Italic"
        >
          <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUnderline}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Underline"
        >
          <Underline className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <div className="w-px h-5 sm:h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleHeading}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Heading"
        >
          <Type className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleQuote}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Quote"
        >
          <Quote className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleList}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="List"
        >
          <List className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <div className="w-px h-5 sm:h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Insert Link"
        >
          <Link className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <label className="cursor-pointer flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            disabled={uploading}
            title="Upload Image"
            asChild
          >
            <div>
              {uploading ? (
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </div>
          </Button>
        </label>
      </div>
      
      <div className="flex items-center gap-1 mb-1 sm:mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('left')}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Align Left"
        >
          <AlignLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('center')}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Align Center"
        >
          <AlignCenter className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('right')}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Align Right"
        >
          <AlignRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAlignment('justify')}
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Justify"
        >
          <AlignJustify className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {showLinkInput && (
        <div className="space-y-2 p-2 border-t">
          <Input
            placeholder="Link text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="h-8 text-sm"
          />
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInsertLink} className="h-7 text-xs">
              Insert
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowLinkInput(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

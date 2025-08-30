import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Upload
} from "lucide-react";

const API_KEY = 'f21236a63fd3908f258ffa7bc0314eef';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

interface FormattingToolsProps {
  content: string;
  onContentChange: (content: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function FormattingTools({ content, onContentChange, textareaRef }: FormattingToolsProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + startTag.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleBold = () => insertFormatting("**", "**", "bold text");
  const handleItalic = () => insertFormatting("*", "*", "italic text");
  const handleUnderline = () => insertFormatting("<u>", "</u>", "underlined text");

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
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Formatting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBold}
              className="flex items-center gap-2"
            >
              <Bold className="h-4 w-4" />
              Bold
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleItalic}
              className="flex items-center gap-2"
            >
              <Italic className="h-4 w-4" />
              Italic
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnderline}
              className="flex items-center gap-2 col-span-2"
            >
              <Underline className="h-4 w-4" />
              Underline
            </Button>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLinkInput(!showLinkInput)}
              className="flex items-center gap-2 w-full"
            >
              <Link className="h-4 w-4" />
              Insert Link
            </Button>
            
            {showLinkInput && (
              <div className="space-y-2 p-3 border rounded-md">
                <Input
                  placeholder="Link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleInsertLink}>
                    Insert
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowLinkInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text Alignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlignment('left')}
              className="flex items-center gap-2"
            >
              <AlignLeft className="h-4 w-4" />
              Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlignment('center')}
              className="flex items-center gap-2"
            >
              <AlignCenter className="h-4 w-4" />
              Center
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlignment('right')}
              className="flex items-center gap-2"
            >
              <AlignRight className="h-4 w-4" />
              Right
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAlignment('justify')}
              className="flex items-center gap-2"
            >
              <AlignJustify className="h-4 w-4" />
              Justify
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insert Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full"
                disabled={uploading}
                asChild
              >
                <div>
                  {uploading ? (
                    <Upload className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </div>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
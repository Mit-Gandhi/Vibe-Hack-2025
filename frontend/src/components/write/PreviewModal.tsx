import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
}

export function PreviewModal({ isOpen, onClose, title, excerpt, content, category, tags }: PreviewModalProps) {
  const formatContent = (htmlContent: string) => {
    if (!htmlContent) return null;

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const processNode = (node: Node, key: string): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const children = Array.from(element.childNodes).map((child, index) => 
          processNode(child, `${key}-child-${index}`)
        );

        const props: any = { key };

        // Handle different HTML elements
        switch (tagName) {
          case 'img':
            return (
              <img
                key={key}
                src={element.getAttribute('src') || ''}
                alt={element.getAttribute('alt') || 'Image'}
                className="max-w-full h-auto my-4 rounded-lg shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            );
          
          case 'a':
            return (
              <a
                key={key}
                href={element.getAttribute('href') || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          
          case 'strong':
          case 'b':
            return <strong key={key}>{children}</strong>;
          
          case 'em':
          case 'i':
            return <em key={key}>{children}</em>;
          
          case 'u':
            return <u key={key}>{children}</u>;
          
          case 'p':
            return <p key={key} className="mb-2">{children}</p>;
          
          case 'br':
            return <br key={key} />;
          
          case 'div':
            const style = element.getAttribute('style');
            const alignMatch = style?.match(/text-align:\s*(\w+)/);
            const textAlign = alignMatch ? alignMatch[1] : undefined;
            
            return (
              <div 
                key={key} 
                className="my-2"
                style={textAlign ? { textAlign: textAlign as any } : undefined}
              >
                {children}
              </div>
            );
          
          case 'ul':
            return <ul key={key} className="list-disc list-inside my-2 ml-4">{children}</ul>;
          
          case 'ol':
            return <ol key={key} className="list-decimal list-inside my-2 ml-4">{children}</ol>;
          
          case 'li':
            return <li key={key} className="mb-1">{children}</li>;
          
          case 'blockquote':
            return (
              <blockquote key={key} className="border-l-4 border-muted pl-4 my-4 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          
          default:
            return <span key={key}>{children}</span>;
        }
      }

      return null;
    };

    const processedElements = Array.from(tempDiv.childNodes).map((child, index) => 
      processNode(child, `node-${index}`)
    );

    return processedElements;

  };

  const tagsList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Article Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{title || "Untitled Article"}</h1>
            <h2 className="text-xl text-muted-foreground">{excerpt || "No excerpt provided"}</h2>
            
            <div className="flex items-center gap-4">
              {category && (
                <Badge variant="secondary" className="capitalize">
                  {category}
                </Badge>
              )}
              
              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Content:</h4>
            <div className="prose prose-sm max-w-none">
              {content ? (
                <div className="space-y-2">
                  {formatContent(content)}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No content provided</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
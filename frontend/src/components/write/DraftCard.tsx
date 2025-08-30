import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";

interface Draft {
  id?: string;
  _id?: string;
  title: string;
  excerpt?: string;
  category?: string | { name?: string; slug?: string };
  savedAt?: string;
  timestamps?: { createdAt?: string; updatedAt?: string };
}

interface DraftCardProps {
  draft: Draft;
  onLoad: (draft: Draft) => void;
  onDelete: (id: string) => void;
}

export function DraftCard({ draft, onLoad, onDelete }: DraftCardProps) {
  const categoryLabel = typeof draft.category === 'string' ? draft.category : draft.category?.name;
  const dateStr = draft.savedAt || draft.timestamps?.updatedAt || draft.timestamps?.createdAt;

  return (
    <Card className="hover:shadow-card transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base line-clamp-1">
            {draft.title || "Untitled Draft"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(draft.id || draft._id || "")}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {draft.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {draft.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {categoryLabel && (
              <Badge variant="secondary" className="text-xs">
                {categoryLabel}
              </Badge>
            )}
            {dateStr && (
              <span className="text-xs text-muted-foreground">
                {new Date(dateStr).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoad(draft)}
            className="h-7 px-2 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Load
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
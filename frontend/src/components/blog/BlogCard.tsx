import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Heart, User, Bookmark } from "lucide-react";

interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  likes: number;
  featured?: boolean;
  className?: string;
}

export function BlogCard({
  title,
  excerpt,
  author,
  publishedAt,
  readTime,
  category,
  likes,
  featured = false,
  className
}: BlogCardProps) {
  return (
    <Card className={`group transition-smooth hover:shadow-card ${featured ? 'ring-2 ring-primary/20' : ''} ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant={featured ? "default" : "secondary"}
            className={featured ? "bg-primary text-primary-foreground" : ""}
          >
            {category}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-smooth line-clamp-2">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {excerpt}
        </p>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{author}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{publishedAt}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{likes}</span>
            </Button>
          </div>
          
          <Button variant="readmore" size="sm">
            Read More
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogService } from "@/lib/blog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Sample articles data with full content
const myArticles = [
  {
    id: 1,
    title: "Building Modern Web Applications with React and TypeScript",
    excerpt: "A comprehensive guide to building scalable and maintainable web applications using React and TypeScript with best practices and modern patterns.",
    content: `
      <h2>Getting Started with React and TypeScript</h2>
      <p>Modern web development has evolved significantly, and the combination of React and TypeScript has become the gold standard for building robust applications. This guide will walk you through the essential concepts and best practices.</p>
      
      <h3>Why TypeScript with React?</h3>
      <p>TypeScript brings several advantages to React development:</p>
      
      <ul>
        <li><strong>Type Safety</strong> - Catch errors at compile time rather than runtime</li>
        <li><strong>Better IDE Support</strong> - Enhanced autocomplete and refactoring capabilities</li>
        <li><strong>Improved Documentation</strong> - Types serve as living documentation</li>
        <li><strong>Enhanced Team Collaboration</strong> - Clear contracts between components</li>
      </ul>
      
      <blockquote>TypeScript is not just about types - it's about confidence in your code.</blockquote>
      
      <h3>Setting Up Your Development Environment</h3>
      <p>The modern React ecosystem provides excellent tooling for TypeScript development. Tools like Vite, Create React App, and Next.js offer first-class TypeScript support out of the box.</p>
      
      <p>By following these principles, you'll be well-equipped to build maintainable and scalable React applications.</p>
    `,
    category: "React",
    tags: "react,typescript,web-development,best-practices",
    status: "published",
    publishedAt: "2024-01-20",
    views: 4520,
    likes: 203,
    comments: 45,
    readTime: "10 min read"
  },
  {
    id: 2,
    title: "Advanced State Management Patterns in React",
    excerpt: "Explore advanced state management techniques including Context API, Zustand, and custom hooks for complex React applications.",
    content: `
      <h2>Understanding State Management</h2>
      <p>State management is one of the most critical aspects of React application architecture. As applications grow in complexity, choosing the right state management approach becomes crucial for maintainability and performance.</p>
      
      <h3>The Evolution of State Management</h3>
      <p>React's state management has evolved from simple <em>setState</em> calls to sophisticated patterns that handle complex application states effectively.</p>
      
      <ol>
        <li><strong>Local State</strong> - Perfect for component-specific data</li>
        <li><strong>Context API</strong> - Great for app-wide state without prop drilling</li>
        <li><strong>External Libraries</strong> - Zustand, Redux Toolkit for complex scenarios</li>
      </ol>
      
      <h3>When to Use Each Pattern</h3>
      <p>Choosing the right state management solution depends on your application's requirements:</p>
      
      <blockquote>The best state management solution is the simplest one that meets your needs.</blockquote>
      
      <p>Understanding these patterns will help you make informed decisions about state architecture in your React applications.</p>
    `,
    category: "React",
    tags: "react,state-management,context-api,zustand",
    status: "published",
    publishedAt: "2024-01-18",
    views: 3240,
    likes: 178,
    comments: 32,
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "CSS Grid and Flexbox: A Modern Layout Guide",
    excerpt: "Master modern CSS layout techniques with CSS Grid and Flexbox. Learn when to use each and how to combine them effectively.",
    content: `
      <h2>Modern CSS Layout Systems</h2>
      <p>CSS Grid and Flexbox have revolutionized how we approach layout in web development. Understanding when and how to use each system is essential for creating responsive and maintainable layouts.</p>
      
      <h3>CSS Grid: The Two-Dimensional Layout System</h3>
      <p>CSS Grid excels at creating complex, two-dimensional layouts where you need to control both rows and columns simultaneously.</p>
      
      <h3>Flexbox: The One-Dimensional Layout System</h3>
      <p>Flexbox is perfect for one-dimensional layouts, whether in a row or column, and provides excellent alignment and distribution capabilities.</p>
      
      <blockquote>Grid and Flexbox are complementary technologies, not competing ones.</blockquote>
      
      <p>By mastering both systems, you'll have the tools to create any layout design with clean, maintainable CSS.</p>
    `,
    category: "CSS",
    tags: "css,grid,flexbox,layout,responsive-design",
    status: "draft",
    lastEdited: "2 hours ago",
    wordCount: 1420
  },
  {
    id: 4,
    title: "Understanding Async/Await in JavaScript",
    excerpt: "Deep dive into asynchronous JavaScript programming with async/await, promises, and best practices for handling asynchronous operations.",
    content: `
      <h2>Asynchronous JavaScript Fundamentals</h2>
      <p>Asynchronous programming is at the heart of modern JavaScript development. Understanding how to work with async/await and promises effectively is crucial for building responsive applications.</p>
      
      <h3>The Promise Revolution</h3>
      <p>Promises transformed JavaScript from callback hell to elegant asynchronous code. They provide a cleaner way to handle asynchronous operations with better error handling.</p>
      
      <h3>Async/Await: Synchronous-Looking Asynchronous Code</h3>
      <p>Async/await builds on promises to provide an even more readable way to write asynchronous code that looks and feels synchronous.</p>
      
      <p>Mastering these concepts will significantly improve your ability to write clean, maintainable JavaScript code.</p>
    `,
    category: "JavaScript",
    tags: "javascript,async-await,promises,asynchronous",
    status: "pending",
    submittedAt: "1 day ago",
    wordCount: 2100
  }
];

export default function MyArticles() {
  const formatContent = (htmlContent: string) => {
    if (!htmlContent) return null;

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

        switch (tagName) {
          case 'h1':
            return <h1 key={key} className="text-3xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>;
          case 'h2':
            return <h2 key={key} className="text-2xl font-bold mb-4 mt-6">{children}</h2>;
          case 'h3':
            return <h3 key={key} className="text-xl font-semibold mb-3 mt-5">{children}</h3>;
          case 'p':
            return <p key={key} className="mb-4 leading-relaxed text-muted-foreground">{children}</p>;
          case 'strong':
          case 'b':
            return <strong key={key} className="font-semibold text-foreground">{children}</strong>;
          case 'em':
          case 'i':
            return <em key={key} className="italic">{children}</em>;
          case 'ul':
            return <ul key={key} className="list-disc list-inside mb-4 ml-4 space-y-1">{children}</ul>;
          case 'ol':
            return <ol key={key} className="list-decimal list-inside mb-4 ml-4 space-y-1">{children}</ol>;
          case 'li':
            return <li key={key} className="text-muted-foreground">{children}</li>;
          case 'blockquote':
            return (
              <blockquote key={key} className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground bg-muted/50 py-4 rounded-r-lg">
                {children}
              </blockquote>
            );
          case 'a':
            return (
              <a
                key={key}
                href={element.getAttribute('href') || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          default:
            return <span key={key}>{children}</span>;
        }
      }

      return null;
    };

    return Array.from(tempDiv.childNodes).map((child, index) => 
      processNode(child, `node-${index}`)
    );
  };

  const getStatusBadge = (status: string, visibility?: string) => {
    // Backend: status = draft|published, visibility = pending|approved|rejected|hidden
    if (status === "draft") {
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Draft</Badge>;
    }
    if (status === "published") {
      switch (visibility) {
        case "pending":
          return <Badge className="bg-yellow-500"><AlertCircle className="mr-1 h-3 w-3" />Pending Review</Badge>;
        case "rejected":
          return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
        case "hidden":
          return <Badge variant="secondary">Hidden</Badge>;
        default:
          return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Published</Badge>;
      }
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  // Fetch user's blogs from API
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-blogs"],
    queryFn: () => BlogService.getMyBlogs(),
    enabled: isAuthenticated,
  });

  // Normalize API response to frontend structure for display
  const apiBlogs = (data?.blogs || data?.data?.blogs || []) as any[];
  const normalized = apiBlogs.map((b) => ({
    id: b._id || b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt || "",
    content: b.content || "",
    category: b.category?.name || "",
    tags: Array.isArray(b.tags) ? b.tags.join(",") : "",
    status: b.status,
    visibility: b.visibility,
    publishedAt: b.timestamps?.publishedAt ? new Date(b.timestamps.publishedAt).toLocaleDateString() : undefined,
    views: b.engagement?.views || 0,
    likes: b.engagement?.likes || 0,
    comments: b.engagement?.comments || 0,
    readTime: b.metadata?.readTime ? `${b.metadata.readTime} min read` : undefined,
    lastEdited: b.timestamps?.updatedAt ? new Date(b.timestamps.updatedAt).toLocaleString() : undefined,
    submittedAt: b.timestamps?.createdAt ? new Date(b.timestamps.createdAt).toLocaleString() : undefined,
  }));

  const publishedArticles = normalized.filter(a => a.status === "published" && a.visibility === "approved");
  const pendingArticles = normalized.filter(a => a.status === "published" && a.visibility === "pending");
  const rejectedArticles = normalized.filter(a => a.status === "published" && a.visibility === "rejected");
  const draftArticles = normalized.filter(a => a.status === "draft");

  const navigate = useNavigate?.() || (() => {});
  const queryClient = useQueryClient();

  const { mutateAsync: deleteBlog, isPending: isDeleting } = useMutation({
    mutationFn: (blogId: string) => BlogService.deleteBlog(blogId),
    onSuccess: () => {
      // Refresh my-blogs and generic blogs lists
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const handleEdit = (article: any) => {
    navigate(`/write`, { state: { blogId: article.id, slug: article.slug } as any });
  };

  const handleDelete = async (article: any) => {
    try {
      await deleteBlog(String(article.id));
      toast({ title: "Deleted", description: `“${article.title}” has been deleted.` });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message || "Unable to delete the article.",
      });
    }
  };

  const renderArticle = (article: any) => {
    const tagsList = (article.tags || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
    
    return (
      <Card key={article.id} className="shadow-card">
        <CardContent className="p-8">
          {/* Article Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusBadge(article.status, article.visibility)}
                <Badge variant="secondary" className="capitalize">
                  {article.category}
                </Badge>
                {article.status === "published" && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{article.publishedAt}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{article.readTime}</span>
                  </>
                )}
                {article.status === "draft" && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">Last edited {article.lastEdited}</span>
                  </>
                )}
                {article.visibility === "pending" && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">Submitted {article.submittedAt}</span>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete “{article.title}”.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(article)}>
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-3">{article.title}</h3>
            <p className="text-lg text-muted-foreground mb-4">{article.excerpt}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {tagsList.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {formatContent(article.content)}
          </div>

          {article.status === "published" && article.visibility === "approved" && (
            <>
              <Separator className="my-6" />
              
              {/* Article Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{article.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{article.comments} comments</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => navigate(`/article/${article.slug}`)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Live
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">My Articles</h1>
            <p className="text-muted-foreground">
              Manage and view your articles in their full format
            </p>
          </div>

          {/* Article Tabs */}
          <Tabs defaultValue="published" className="space-y-8">
            <TabsList className="grid w-full lg:w-auto grid-cols-4 gap-2">
              <TabsTrigger className="text-center" value="published">
                Published ({publishedArticles.length})
              </TabsTrigger>
              <TabsTrigger className="text-center" value="drafts">
                Drafts ({draftArticles.length})
              </TabsTrigger>
              <TabsTrigger className="text-center" value="pending">
                Pending ({pendingArticles.length})
              </TabsTrigger>
              <TabsTrigger className="text-center" value="rejected">
                Rejected ({rejectedArticles.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Published Articles</h2>
                <Button variant="hero">
                  Write New Article
                </Button>
              </div>
              
              {publishedArticles.length > 0 ? (
                <div className="space-y-8">
                  {publishedArticles.map(renderArticle)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No published articles yet.</p>
                    <Button variant="hero">Write Your First Article</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Draft Articles</h2>
                <Button variant="hero">
                  New Draft
                </Button>
              </div>
              
              {draftArticles.length > 0 ? (
                <div className="space-y-8">
                  {draftArticles.map(renderArticle)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No drafts saved.</p>
                    <Button variant="hero">Start Writing</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-8">
              <h2 className="text-xl font-semibold">Pending Review</h2>
              
              {pendingArticles.length > 0 ? (
                <div className="space-y-8">
                  {pendingArticles.map(renderArticle)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No articles pending review.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-8">
              <h2 className="text-xl font-semibold">Rejected Articles</h2>
              
              {rejectedArticles.length > 0 ? (
                <div className="space-y-8">
                  {rejectedArticles.map(renderArticle)}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No rejected articles.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
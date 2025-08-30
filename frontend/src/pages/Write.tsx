import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreviewModal } from "@/components/write/PreviewModal";
import { DraftCard } from "@/components/write/DraftCard";
import { RichTextEditor } from "@/components/write/RichTextEditor";
import { TagsInput } from "@/components/write/TagsInput";
import { PenTool, Eye, Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogService } from "@/lib/blog";
import { useLocation, useNavigate } from "react-router-dom";

export default function Write() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editState = (location.state || {}) as any; // { blogId, slug }

  // Utility function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
  };

  // Utility function to calculate read time (average 200 words per minute)
  const calculateReadTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Utility function to count words
  const countWords = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  // Function to create complete article JSON structure
  const createArticleStructure = (status: "draft" | "published" = "draft") => {
    const now = new Date().toISOString();
    const slug = generateSlug(title);
    const wordCount = countWords(content);
    const readTime = calculateReadTime(content);

    return {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
      title: title.trim(),
      slug: slug,
      excerpt: excerpt.trim(),
      content: content,
      status: status, // draft, published, archived, under_review
      visibility: "public", // public, private, unlisted
      author: {
        id: null, // To be set by backend
        name: "Anonymous", // To be set by backend from authenticated user
        email: null, // To be set by backend
        avatar: null, // To be set by backend
        bio: null
      },
      category: {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        slug: category
      },
      tags: tags,
      metadata: {
        readTime: readTime,
        wordCount: wordCount,
        difficulty: wordCount > 1500 ? "advanced" : wordCount > 800 ? "intermediate" : "beginner"
      },
      seo: {
        metaTitle: title.length > 50 ? title.substring(0, 50) + "..." : title,
        metaDescription: excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt,
        keywords: tags,
        canonicalUrl: null
      },
      engagement: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0
      },
      timestamps: {
        createdAt: now,
        updatedAt: now,
        publishedAt: status === "published" ? now : null,
        lastViewedAt: null
      },
      featured: false,
      featuredImage: {
        url: null,
        alt: null,
        caption: null
      },
      version: 1,
      revisions: [],
      isDeleted: false
    };
  };

  // Handle draft saving
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title before saving the draft.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const blogData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        status: 'draft',
        category: { name: category, slug: generateSlug(category) },
        tags: tags,
        metadata: {
          readTime: calculateReadTime(content),
          wordCount: countWords(content),
          difficulty: 'beginner'
        },
        seo: {
          metaTitle: title.trim(),
          metaDescription: excerpt.trim(),
          keywords: tags
        }
      };

      const response = await BlogService.createBlog(blogData);
      if (!response.success) throw new Error(response.message || 'Failed to save draft');

      // Optionally keep a lightweight local cache card with savedAt
      const savedDraft = {
        id: response.blog?._id || Date.now().toString(),
        title: blogData.title,
        excerpt: blogData.excerpt,
        category: blogData.category,
        savedAt: new Date().toISOString(),
      };
      setDrafts([...drafts, savedDraft]);

      // Reset form fields
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategory("");
      setTags([]);

      toast({
        title: "Draft saved",
        description: "Your draft has been saved to your account.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save draft",
        description: error.message || 'Please login and try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle loading draft
  const handleLoadDraft = (draft: any) => {
    setTitle(draft.title === "Untitled" ? "" : (draft.title || ""));
    setExcerpt(draft.excerpt || "");
    setContent(draft.content || "");
    setCategory(draft.category?.slug || draft.category?.name || draft.category || "");
    
    // Handle both old format (string) and new format (array)
    if (Array.isArray(draft.tags)) {
      setTags(draft.tags);
    } else if (typeof draft.tags === 'string') {
      setTags(draft.tags.split(',').map(t => t.trim()).filter(t => t));
    } else {
      setTags([]);
    }
    
    toast({
      title: "Draft loaded",
      description: "The draft has been loaded into the editor.",
    });
  };

  // Handle deleting draft
  const handleDeleteDraft = (id: string) => {
    setDrafts(drafts.filter(draft => draft._id !== id && draft.id !== id)); // Handle both new and old ID formats
    toast({
      title: "Draft deleted",
      description: "The draft has been removed.",
    });
  };

  // Auto-load blog data when arriving from My Articles (Edit)
  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const slug = editState?.slug;
        if (!slug) return;
        const res = await BlogService.getBlogBySlug(slug);
        const b: any = (res as any).blog || (res as any).data?.blog;
        if (!res.success || !b) return;
        setTitle(b.title || "");
        setExcerpt(b.excerpt || "");
        setContent(b.content || ""); // HTML preserved
        setCategory(b.category?.slug || b.category?.name || "");
        setTags(Array.isArray(b.tags) ? b.tags : []);
      } catch (_) {
        // ignore fetch errors; user can still load manually
      }
    };
    loadFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editState?.slug]);

  // Handle submit for review (create or update)
  const handleSubmit = async () => {
    if (!title.trim() || !excerpt.trim() || !content.trim() || !category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, excerpt, content, and category before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Enforce minimum content length required by backend (>= 20 characters)
    const plainContent = content.replace(/<[^>]*>/g, '').trim();
    if (plainContent.length < 20) {
      toast({
        title: "Content too short",
        description: "Content must be at least 20 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const blogData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        status: 'published', // Backend will set visibility to 'pending' for review
        category: {
          name: category,
          slug: generateSlug(category)
        },
        tags: tags,
        metadata: {
          readTime: calculateReadTime(content),
          wordCount: countWords(content),
          difficulty: 'beginner'
        },
        seo: {
          metaTitle: title.trim(),
          metaDescription: excerpt.trim(),
          keywords: tags
        }
      } as any;

      let response;
      if (editState.blogId) {
        response = await BlogService.updateBlog(editState.blogId, blogData);
      } else {
        response = await BlogService.createBlog(blogData);
      }
      
      if (response.success) {
        toast({
          title: editState.blogId ? "Article updated" : "Article submitted for review",
          description: editState.blogId ? "Your article has been updated." : "Your article has been submitted and is now under review by our editorial team.",
        });

        // Clear form after successful operation
        setTitle("");
        setExcerpt("");
        setContent("");
        setCategory("");
        setTags([]);
        
        navigate('/my-articles');
      } else {
        throw new Error(response.message || 'Failed to submit article');
      }
    } catch (error: any) {
      toast({
        title: editState.blogId ? "Update failed" : "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding popular tag
  const handleAddPopularTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
  };

  // Suggested tags for the TagsInput component
  const suggestedTags = [
    "react", "javascript", "typescript", "nodejs", "css", "python", 
    "devops", "tutorial", "frontend", "backend", "api", "database",
    "mongodb", "sql", "docker", "kubernetes", "aws", "firebase",
    "nextjs", "vue", "angular", "express", "fastapi", "django",
    "machine-learning", "ai", "blockchain", "web3", "mobile",
    "flutter", "react-native", "ios", "android", "testing",
    "performance", "security", "accessibility", "ui-ux", "design"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-xl sm:text-3xl font-bold gradient-text">{editState.blogId ? 'Edit Article' : 'Write New Article'}</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {editState.blogId ? 'Update your article content and details' : 'Share your knowledge with the developer community'}
            </p>
            {editState.blogId && (
              <div className="text-xs text-muted-foreground">Editing: {editState.slug || editState.blogId}</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Editor - Expanded to 3 columns on desktop, full width on mobile */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      placeholder="Enter your article title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Excerpt</label>
                    <Textarea
                      placeholder="Brief description of your article..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="nodejs">Node.js</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="devops">DevOps</SelectItem>
                          <SelectItem value="backend">Backend</SelectItem>
                          <SelectItem value="frontend">Frontend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags</label>
                      <TagsInput
                        tags={tags}
                        onTagsChange={setTags}
                        suggestions={suggestedTags}
                        placeholder="Add relevant tags (e.g., react, javascript, tutorial)"
                        maxTags={8}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <RichTextEditor 
                content={content} 
                onContentChange={setContent} 
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button 
                  variant="animated-border" 
                  className="w-full sm:flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
                <Button variant="secondary" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>

              {/* Saved Drafts Section */}
              {drafts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Drafts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {drafts.map((draft) => (
                        <DraftCard
                          key={draft._id || draft.id}
                          draft={draft}
                          onLoad={handleLoadDraft}
                          onDelete={handleDeleteDraft}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publishing Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Before you submit:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Write a clear, descriptive title</li>
                      <li>• Include a compelling excerpt</li>
                      <li>• Choose the right category</li>
                      <li>• Add relevant tags</li>
                      <li>• Proofread your content</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Review Process:</h4>
                    <p className="text-sm text-muted-foreground">
                      All articles go through admin review before publication. 
                      This typically takes 24-48 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["react", "javascript", "typescript", "nodejs", "css", "python", "devops", "tutorial"].map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-smooth"
                        onClick={() => handleAddPopularTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Formatting tools moved to floating toolbar */}
            </div>
          </div>
        </div>
      </main>
      
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        excerpt={excerpt}
        content={content}
        category={category}
        tags={tags.join(', ')}
      />
      
      <Footer />
    </div>
  );
}
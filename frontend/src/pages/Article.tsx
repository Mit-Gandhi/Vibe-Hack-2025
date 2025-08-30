import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BlogService } from "@/lib/blog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => BlogService.getBlogBySlug(slug || ""),
    enabled: !!slug,
  });

  const responseAny: any = data as any;
  const blog: any = responseAny?.blog || responseAny?.data?.blog;
  const likedFromServer: boolean = !!(responseAny?.liked ?? responseAny?.data?.liked);

  // Derive blogId for like endpoint once blog is loaded
  const blogId = blog?._id;

  // Local like state: initialize from server when loaded
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    if (typeof likedFromServer === 'boolean') setLiked(likedFromServer);
  }, [likedFromServer]);
  const likesCount = useMemo(() => Number(blog?.engagement?.likes || 0), [blog?.engagement?.likes]);

  useEffect(() => {
    if (blog?.seo?.metaTitle) document.title = blog.seo.metaTitle;
  }, [blog]);

  // Toggle like mutation with optimistic UI
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!blogId) throw new Error("Missing blogId");
      return BlogService.toggleLike(blogId);
    },
    onMutate: async () => {
      setLiked((prev) => !prev);
      await qc.cancelQueries({ queryKey: ["article", slug] });
      const prevData = qc.getQueryData(["article", slug]);
      // Optimistically update likes count in cached blog response
      qc.setQueryData(["article", slug], (old: any) => {
        if (!old) return old;
        const prev = (old as any).blog || (old as any).data?.blog;
        if (!prev) return old;
        const delta = liked ? -1 : 1; // if currently liked, we are unliking
        const next = {
          ...(old as any),
          blog: {
            ...prev,
            engagement: { ...prev.engagement, likes: Math.max(0, (prev.engagement?.likes || 0) + delta) },
          },
          data: {
            ...(old as any).data,
            blog: {
              ...((old as any).data?.blog || {}),
              engagement: { ...((old as any).data?.blog?.engagement || {}), likes: Math.max(0, (((old as any).data?.blog?.engagement?.likes) || 0) + delta) },
            },
          },
        } as any;
        return next;
      });
      return { prevData };
    },
    onError: (_err, _vars, context: any) => {
      // Revert optimistic update
      if (context?.prevData) qc.setQueryData(["article", slug], context.prevData);
      setLiked((prev) => !prev);
      toast({ title: "Failed to update like", variant: "destructive" });
    },
    onSuccess: (res: any) => {
      // Sync with server authoritative counts
      qc.setQueryData(["article", slug], (old: any) => {
        const prev = (old as any)?.blog || (old as any)?.data?.blog;
        if (!prev) return old;
        const nextBlog = { ...prev, engagement: { ...prev.engagement, likes: res.likes } };
        if ((old as any).blog) return { ...(old as any), blog: nextBlog };
        return { ...(old as any), data: { ...((old as any).data || {}), blog: nextBlog } };
      });
      setLiked(!!res.liked);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="text-center text-muted-foreground">Loading article...</div>
        )}

        {isError && (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold mb-2">Article not available</h1>
              <p className="text-muted-foreground mb-4">
                {(error as any)?.message || "This article cannot be viewed."}
              </p>
              <Button asChild>
                <Link to="/">Go back home</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && blog && (
          <div className="max-w-3xl mx-auto">
            {/* Title + meta */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {blog.category?.name && (
                  <Badge variant="secondary" className="capitalize">{blog.category.name}</Badge>
                )}
                {blog.metadata?.readTime && (
                  <span className="text-sm text-muted-foreground">{blog.metadata.readTime} min read</span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
              {blog.excerpt && (
                <p className="text-muted-foreground">{blog.excerpt}</p>
              )}
            </div>

            {/* Article content */}
            <article className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content || "" }} />

            {/* Author box */}
            {blog?.author && (
              <div className="mt-10 border rounded-lg p-4 flex items-start gap-4">
                <img
                  src={blog.author.avatar || '/placeholder.svg'}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  alt={blog.author.name || 'Author'}
                  className="h-12 w-12 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-none">{blog.author.name || blog.author.email}</h3>
                      {blog.author.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{blog.author.bio}</p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={blog?.author?.id ? `/profile/${blog.author.id}` : '/profile'}>View author</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions row - like only */}
            <div className="mt-6 flex justify-end items-center">
              <button
                type="button"
                className="w-16 h-16 bg-white border border-transparent hover:border-border transition-colors flex flex-col items-center justify-center rounded-none shadow-sm disabled:opacity-60"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending || !blogId}
                title="Like this article"
              >
                <Heart className={`h-4 w-4 mb-1 ${liked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium text-foreground">{(blog.engagement?.likes ?? 0).toString()}</span>
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
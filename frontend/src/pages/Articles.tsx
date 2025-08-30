import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BlogService } from "@/lib/blog";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/BlogCard";

export default function Articles() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["articles", { sort: "newest", q }],
    queryFn: ({ pageParam = 1 }) =>
      BlogService.getBlogs({ page: pageParam as number, limit: 9, sort: "newest", search: q || undefined }),
    getNextPageParam: (lastPage) => {
      const page = (lastPage as any)?.page ?? (lastPage as any)?.data?.page;
      const totalPages = (lastPage as any)?.totalPages ?? (lastPage as any)?.data?.totalPages;
      if (!page || !totalPages) return undefined;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const blogs = (data?.pages || [])
    .flatMap((p: any) => p.blogs || p.data?.blogs || [])
    .filter((b: any) => b && b.slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-2">{q ? `Search results for "${q}"` : 'Latest Articles'}</h1>
          <p className="text-muted-foreground">{q ? 'Showing articles matching your search' : 'Discover the newest posts from our community'}</p>
        </div>

        {isLoading && (
          <div className="text-muted-foreground">Loading articles...</div>
        )}
        {isError && (
          <div className="text-destructive">Failed to load articles. Please try again.</div>
        )}

        {!isLoading && blogs.length === 0 && (
          <div className="text-muted-foreground">No articles yet.</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b: any, index: number) => (
            <Link key={b._id || index} to={`/article/${b.slug}`} className="block">
              <BlogCard
                title={b.title}
                excerpt={b.excerpt || ""}
                author={b.author?.name || b.author || "Unknown"}
                publishedAt={
                  b.timestamps?.publishedAt
                    ? new Date(b.timestamps.publishedAt).toLocaleDateString()
                    : b.publishedAt
                    ? new Date(b.publishedAt).toLocaleDateString()
                    : ""
                }
                readTime={`${b.metadata?.readTime || 1} min read`}
                category={b.category?.name || "General"}
                likes={b.engagement?.likes || 0}
              />
            </Link>
          ))}
        </div>

        {hasNextPage && (
          <div className="text-center mt-10">
            <Button
              variant="default"
              size="lg"
              className="shadow-elegant hover:shadow-glow"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
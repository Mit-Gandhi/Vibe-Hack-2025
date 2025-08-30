import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BlogService } from "@/lib/blog";
import { BlogCard } from "./BlogCard";
import { Button } from "@/components/ui/button";

export function BlogGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["latest", "articles"],
    queryFn: () => BlogService.getBlogs({ page: 1, limit: 6, sort: "newest" }),
  });

  const blogs: any[] = ((data as any)?.blogs || (data as any)?.data?.blogs || []).filter((b: any) => b && b.slug);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 gradient-text">
            Latest Articles
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Stay updated with the latest trends, tutorials, and insights from our community of developers
          </p>
        </div>

        {isLoading && (
          <div className="text-muted-foreground">Loading articles...</div>
        )}
        {isError && (
          <div className="text-destructive">Failed to load articles. Please try again.</div>
        )}

        {!isLoading && blogs.length > 0 && (
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
                  className="animate-fade-in"
                />
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="default" size="lg" className="shadow-elegant hover:shadow-glow">
            Load More Articles
          </Button>
        </div>
      </div>
    </section>
  );
}
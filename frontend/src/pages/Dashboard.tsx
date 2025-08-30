import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Users,
  FileText,
  TrendingUp
} from "lucide-react";

// Data will be fetched from API; remove hardcoded samples
const draftArticles: any[] = [];
const submittedArticles: any[] = [];

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BlogService } from "@/lib/blog";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Draft</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500"><AlertCircle className="mr-1 h-3 w-3" />Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Published</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Admin: fetch blogs for moderation (pending/rejected/hidden)
  const { data: moderationData, isLoading: loadingModeration } = useQuery({
    queryKey: ["admin-moderation-blogs"],
    queryFn: () => BlogService.getBlogsForModeration(),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const moderationBlogs = (moderationData?.blogs || moderationData?.data?.blogs || []) as any[];

  // Admin: fetch approved/published via public list (first page)
  const { data: publishedData, isLoading: loadingPublished } = useQuery({
    queryKey: ["admin-published-blogs", { page: 1 }],
    queryFn: () => BlogService.getBlogs({ page: 1, limit: 20, sort: 'newest' }),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const approvedBlogs = (publishedData?.blogs || (publishedData as any)?.data?.blogs || []) as any[];

  // Admin: approve/reject actions
  const updateVisibility = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: 'approved' | 'rejected' | 'hidden' | 'pending' }) =>
      BlogService.updateBlogVisibility(id, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-published-blogs", { page: 1 }] });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your articles and track your writing progress
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">15.2K</p>
                  </div>
                  <Eye className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                    <p className="text-2xl font-bold">1.8K</p>
                  </div>
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Followers</p>
                    <p className="text-2xl font-bold">234</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Article Management Tabs */}
          <Tabs defaultValue="published" className="space-y-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-3">
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Published Articles</h3>
                <Button variant="hero">
                  Write New Article
                </Button>
              </div>
              
              {approvedBlogs.map((b: any) => (
                <Card key={b._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge('approved')}
                          <span className="text-sm text-muted-foreground">
                            {b.timestamps?.publishedAt ? `Published ${new Date(b.timestamps.publishedAt).toLocaleString()}` : ''}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">{b.title}</h4>
                        <p className="text-muted-foreground mb-4">{b.excerpt}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{b.engagement?.views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{b.engagement?.likes || 0} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{b.engagement?.comments || 0} comments</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/article/${b.slug}`}>
                            View
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {approvedBlogs.length === 0 && (
                <div className="text-muted-foreground">No published articles yet.</div>
              )}
            </TabsContent>

            <TabsContent value="moderation" className="space-y-4">
              <h3 className="text-lg font-semibold">Moderation Queue (Pending)</h3>

              {/* Only Pending */}
              {moderationBlogs
                .filter((b: any) => b.visibility === 'pending')
                .map((b: any) => (
                <Card key={`pending-${b._id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge('pending')}
                          <span className="text-sm text-muted-foreground">
                            {`Submitted ${new Date(b.timestamps?.createdAt || Date.now()).toLocaleString()}`}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">{b.title}</h4>
                        <p className="text-muted-foreground mb-4">{b.excerpt}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="hero"
                          size="sm"
                          disabled={updateVisibility.isPending}
                          onClick={() => updateVisibility.mutate({ id: b._id, visibility: 'approved' })}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateVisibility.isPending}
                          onClick={() => updateVisibility.mutate({ id: b._id, visibility: 'rejected' })}
                        >
                          Reject
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/article/${b.slug}`}>View</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loadingModeration && moderationBlogs.filter((b: any) => b.visibility === 'pending').length === 0 && (
                <div className="text-muted-foreground">No items pending moderation.</div>
              )}

              {/* Rejected Tab Content */}
            </TabsContent>

            {/* Rejected Tab - only rejected */}
            <TabsContent value="rejected" className="space-y-4">
              <h3 className="text-lg font-semibold">Rejected Articles</h3>

              {moderationBlogs
                .filter((b: any) => b.visibility === 'rejected')
                .map((b: any) => (
                <Card key={`rejected-${b._id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge('rejected')}
                          <span className="text-sm text-muted-foreground">
                            {b.timestamps?.updatedAt ? `Rejected ${new Date(b.timestamps.updatedAt).toLocaleString()}` : ''}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">{b.title}</h4>
                        <p className="text-muted-foreground mb-4">{b.excerpt}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateVisibility.isPending}
                          onClick={() => updateVisibility.mutate({ id: b._id, visibility: 'pending' })}
                        >
                          Move to Pending
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/article/${b.slug}`}>View</a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loadingModeration && moderationBlogs.filter((b: any) => b.visibility === 'rejected').length === 0 && (
                <div className="text-muted-foreground">No rejected articles.</div>
              )}

              {(loadingModeration || loadingPublished) && (
                <div className="text-muted-foreground">Loading moderation queue...</div>
              )}

              {!loadingModeration && !loadingPublished && approvedBlogs.length === 0 && moderationBlogs.length === 0 && (
                <div className="text-muted-foreground">No items in moderation.</div>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Draft Articles</h3>
                <Button variant="hero">
                  New Draft
                </Button>
              </div>
              
              {draftArticles.map((article, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(article.status)}
                          <span className="text-sm text-muted-foreground">
                            Last edited {article.lastEdited}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">{article.title}</h4>
                        <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                        
                        <div className="text-sm text-muted-foreground">
                          {article.wordCount} words
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="hero" size="sm">Continue Writing</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <h3 className="text-lg font-semibold">Article Analytics</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">4.2K views</p>
                        <p className="text-sm text-green-500">+12% from last month</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        <p className="text-2xl font-bold">8.5%</p>
                        <p className="text-sm text-green-500">+2.1% from last month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top Performing Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">React Performance Guide</span>
                        <span className="text-sm font-medium">2.1K views</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">TypeScript Tips & Tricks</span>
                        <span className="text-sm font-medium">1.8K views</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CSS Grid Tutorial</span>
                        <span className="text-sm font-medium">1.2K views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
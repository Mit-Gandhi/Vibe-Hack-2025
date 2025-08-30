import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BlogService } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, Heart, Eye, MessageCircle, ArrowRight, Flame, Star, Zap } from "lucide-react";

export function TrendingSection() {
  // Fetch real blogs and sort by likes descending
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending", "popular"],
    queryFn: () => BlogService.getBlogs({ page: 1, limit: 10, sort: "popular" }),
  });

  const blogs: any[] = ((data as any)?.blogs || (data as any)?.data?.blogs || []).filter((b: any) => b && b.slug);
  const sorted = [...blogs].sort((a, b) => (b?.engagement?.likes || 0) - (a?.engagement?.likes || 0));

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getCardStyle = (index: number) => {
    const styles = [
      {
        bg: "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30",
        border: "border-indigo-200/50 dark:border-indigo-800/50",
        accent: "text-indigo-600 dark:text-indigo-400",
        hoverBg: "hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40"
      },
      {
        bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
        border: "border-emerald-200/50 dark:border-emerald-800/50",
        accent: "text-emerald-600 dark:text-emerald-400",
        hoverBg: "hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40"
      },
      {
        bg: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
        border: "border-rose-200/50 dark:border-rose-800/50",
        accent: "text-rose-600 dark:text-rose-400",
        hoverBg: "hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/40 dark:hover:to-pink-900/40"
      },
      {
        bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
        border: "border-amber-200/50 dark:border-amber-800/50",
        accent: "text-amber-600 dark:text-amber-400",
        hoverBg: "hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40"
      },
      {
        bg: "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30",
        border: "border-sky-200/50 dark:border-sky-800/50",
        accent: "text-sky-600 dark:text-sky-400",
        hoverBg: "hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-900/40 dark:hover:to-blue-900/40"
      }
    ];
    return styles[index % styles.length];
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-64 lg:h-80 relative overflow-hidden border-0 bg-slate-100 dark:bg-slate-800">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/60 via-slate-100/30 to-slate-200/60 dark:from-slate-700/60 dark:via-slate-800/30 dark:to-slate-700/60 animate-pulse"></div>
            <CardContent className="p-6 lg:p-8 relative">
              <div className="space-y-4">
                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded-full w-16"></div>
                <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                <div className="h-10 bg-slate-300 dark:bg-slate-600 rounded-lg w-full mt-6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-24 lg:h-32 relative overflow-hidden border-0 bg-slate-100 dark:bg-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200/60 to-slate-100/30 dark:from-slate-700/60 dark:to-slate-800/30 animate-pulse"></div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-12 lg:py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 lg:top-20 left-5 lg:left-10 w-48 lg:w-72 h-48 lg:h-72 bg-gradient-to-r from-indigo-500/8 to-purple-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 lg:bottom-20 right-5 lg:right-10 w-64 lg:w-96 h-64 lg:h-96 bg-gradient-to-r from-emerald-500/8 to-teal-500/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-gradient-to-r from-rose-500/4 to-pink-500/4 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-20">
          <div className="inline-flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 border border-orange-200 dark:border-orange-800/50 backdrop-blur-sm mb-6 lg:mb-8 shadow-lg">
            <div className="relative">
              <Flame className="h-4 lg:h-5 w-4 lg:w-5 text-orange-600 dark:text-orange-400" />
              <div className="absolute inset-0 animate-ping">
                <Flame className="h-4 lg:h-5 w-4 lg:w-5 text-orange-500/50" />
              </div>
            </div>
            <span className="text-xs lg:text-sm font-bold text-orange-700 dark:text-orange-300">
              TRENDING NOW
            </span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl xl:text-6xl font-black mb-4 lg:mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent leading-tight">
            Hot Articles
          </h2>
          
          <p className="text-base lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
            The most engaging content that's capturing developers' attention right now
          </p>
        </div>

        {isLoading && <LoadingSkeleton />}
        
        {isError && (
          <div className="text-center py-12 lg:py-16">
            <Card className="max-w-md lg:max-w-lg mx-auto border-0 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 shadow-xl mx-4">
              <CardContent className="p-8 lg:p-10 text-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Zap className="h-6 lg:h-8 w-6 lg:w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-red-700 dark:text-red-300 mb-2 lg:mb-3">Oops! Something went wrong</h3>
                <p className="text-red-600 dark:text-red-400 mb-4 lg:mb-6 text-sm lg:text-base">We couldn't load the trending articles</p>
                <Button 
                  variant="default" 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && !isError && sorted.length > 0 && (
          <>
            {/* Hero Article - Top Performer */}
            {sorted.length > 0 && (
              <div className="mb-12 lg:mb-16">
                <Link to={`/article/${sorted[0].slug}`} className="group block">
                  <Card className="relative overflow-hidden border border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.01] lg:group-hover:scale-[1.02]">
                    {/* Subtle animated border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Crown icon for #1 */}
                    <div className="absolute top-4 lg:top-6 right-4 lg:right-6 z-20">
                      <div className="w-8 lg:w-12 h-8 lg:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                        <Star className="h-4 lg:h-6 w-4 lg:w-6 text-white fill-white" />
                      </div>
                    </div>
                    
                    <CardContent className="p-6 lg:p-10 xl:p-12 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                        <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md px-3 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-bold w-fit">
                          #1 TRENDING
                        </Badge>
                        <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-xs lg:text-sm w-fit">
                          {sorted[0].category?.name || "General"}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black mb-4 lg:mb-6 text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-all duration-300 leading-tight">
                        {sorted[0].title}
                      </h3>
                      
                      {sorted[0].excerpt && (
                        <p className="text-sm lg:text-lg text-slate-600 dark:text-slate-400 mb-6 lg:mb-8 leading-relaxed line-clamp-2 lg:line-clamp-3">
                          {sorted[0].excerpt}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-0">
                        <div className="flex items-center gap-4 lg:gap-8 text-slate-500 dark:text-slate-400 flex-wrap">
                          <div className="flex items-center gap-1.5 lg:gap-2 hover:text-red-500 transition-colors group/stat">
                            <Heart className="h-4 lg:h-5 w-4 lg:w-5 group-hover/stat:scale-110 transition-transform" />
                            <span className="text-sm lg:text-lg font-bold">{formatNumber(sorted[0].engagement?.likes || 0)}</span>
                          </div>
                          
                          {sorted[0].engagement?.views && (
                            <div className="flex items-center gap-1.5 lg:gap-2 hover:text-blue-500 transition-colors group/stat">
                              <Eye className="h-4 lg:h-5 w-4 lg:w-5 group-hover/stat:scale-110 transition-transform" />
                              <span className="text-sm lg:text-base font-semibold">{formatNumber(sorted[0].engagement.views)}</span>
                            </div>
                          )}
                          
                          {sorted[0].metadata?.readTime && (
                            <div className="flex items-center gap-1.5 lg:gap-2 hover:text-emerald-500 transition-colors group/stat">
                              <Clock className="h-4 lg:h-5 w-4 lg:w-5 group-hover/stat:scale-110 transition-transform" />
                              <span className="text-sm lg:text-base font-semibold">{sorted[0].metadata.readTime} min</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          size="lg"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn w-full sm:w-auto"
                        >
                          <span className="font-semibold text-sm lg:text-base">Read Article</span>
                          <ArrowRight className="ml-2 h-4 lg:h-5 w-4 lg:w-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )}

            {/* Top 2-3 Articles */}
            {sorted.length > 1 && (
              <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 mb-12 lg:mb-16">
                {sorted.slice(1, 3).map((post: any, index: number) => {
                  const cardStyle = getCardStyle(index + 1);
                  return (
                    <Link to={`/article/${post.slug}`} key={post._id || post.slug} className="group">
                      <Card className={`h-full relative overflow-hidden border ${cardStyle.border} ${cardStyle.bg} ${cardStyle.hoverBg} shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02] lg:group-hover:scale-105`}>
                        <CardContent className="p-6 lg:p-8 relative z-10 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-4 lg:mb-6">
                            <div className="flex items-center gap-2 lg:gap-3">
                              <div className={`w-6 lg:w-8 h-6 lg:h-8 rounded-full bg-white dark:bg-slate-800 ${cardStyle.accent} backdrop-blur-sm flex items-center justify-center text-xs lg:text-sm font-black border border-slate-200 dark:border-slate-700 shadow-sm`}>
                                {index + 2}
                              </div>
                              <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-xs lg:text-sm font-medium">
                                {post.category?.name || "General"}
                              </Badge>
                            </div>
                            <TrendingUp className={`h-4 lg:h-5 w-4 lg:w-5 text-slate-400 dark:text-slate-500 ${cardStyle.accent} transition-colors`} />
                          </div>
                          
                          <h3 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-2 lg:line-clamp-3 flex-1 leading-tight">
                            {post.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3 lg:gap-6 text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5 lg:gap-2 hover:text-red-500 transition-colors group/heart">
                                <Heart className="h-3.5 lg:h-4 w-3.5 lg:w-4 group-hover/heart:scale-110 transition-transform" />
                                <span className="text-sm lg:text-base font-semibold">{formatNumber(post.engagement?.likes || 0)}</span>
                              </div>
                              
                              {post.metadata?.readTime && (
                                <div className="flex items-center gap-1.5 lg:gap-2 hover:text-emerald-500 transition-colors">
                                  <Clock className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
                                  <span className="text-sm lg:text-base font-medium">{post.metadata.readTime}m</span>
                                </div>
                              )}
                            </div>
                            
                            <div className={`w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-slate-100 group-hover:border-slate-800 dark:group-hover:border-slate-200 group-hover:text-white dark:group-hover:text-slate-900 transition-all duration-300 shadow-sm`}>
                              <ArrowRight className="h-3.5 lg:h-4 w-3.5 lg:w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Remaining Articles - Modern List */}
            {sorted.length > 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6 lg:mb-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">More Trending</h3>
                  <div className="h-px bg-gradient-to-r from-slate-300 dark:from-slate-600 to-transparent flex-1"></div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                  {sorted.slice(3, 10).map((post: any, index: number) => {
                    const cardStyle = getCardStyle(index + 3);
                    return (
                      <Link to={`/article/${post.slug}`} key={post._id || post.slug} className="group">
                        <Card className={`border ${cardStyle.border} ${cardStyle.bg} ${cardStyle.hoverBg} backdrop-blur-sm hover:shadow-xl transition-all duration-400 group-hover:scale-[1.01] lg:group-hover:scale-[1.02] relative overflow-hidden`}>
                          {/* Subtle animated background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 via-transparent to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                          
                          <CardContent className="p-4 lg:p-6 relative z-10">
                            <div className="flex items-start justify-between gap-3 lg:gap-4">
                              <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                                <div className={`text-lg lg:text-xl font-black text-slate-300 dark:text-slate-600 min-w-[1.5rem] lg:min-w-[2rem] pt-0.5 lg:pt-1 ${cardStyle.accent} group-hover:opacity-80 transition-colors`}>
                                  {String(index + 4).padStart(2, '0')}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 lg:mb-3">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 font-medium text-slate-700 dark:text-slate-300"
                                    >
                                      {post.category?.name || "General"}
                                    </Badge>
                                  </div>
                                  
                                  <h4 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300 line-clamp-2 mb-2 lg:mb-3 leading-tight">
                                    {post.title}
                                  </h4>
                                  
                                  <div className="flex items-center gap-3 lg:gap-6 text-xs lg:text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                    <div className="flex items-center gap-1 lg:gap-1.5 hover:text-red-500 transition-colors">
                                      <Heart className="h-3 lg:h-4 w-3 lg:w-4" />
                                      <span className="font-medium">{formatNumber(post.engagement?.likes || 0)}</span>
                                    </div>
                                    
                                    {post.engagement?.views && (
                                      <div className="flex items-center gap-1 lg:gap-1.5 hover:text-blue-500 transition-colors">
                                        <Eye className="h-3 lg:h-4 w-3 lg:w-4" />
                                        <span className="font-medium">{formatNumber(post.engagement.views)}</span>
                                      </div>
                                    )}
                                    
                                    {post.metadata?.readTime && (
                                      <div className="flex items-center gap-1 lg:gap-1.5 hover:text-emerald-500 transition-colors">
                                        <Clock className="h-3 lg:h-4 w-3 lg:w-4" />
                                        <span className="font-medium">{post.metadata.readTime}m</span>
                                      </div>
                                    )}
                                    
                                    {post.engagement?.comments && (
                                      <div className="flex items-center gap-1 lg:gap-1.5 hover:text-orange-500 transition-colors">
                                        <MessageCircle className="h-3 lg:h-4 w-3 lg:w-4" />
                                        <span className="font-medium">{formatNumber(post.engagement.comments)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="w-8 lg:w-12 h-8 lg:h-12 rounded-lg lg:rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-slate-100 group-hover:border-slate-800 dark:group-hover:border-slate-200 group-hover:text-white dark:group-hover:text-slate-900 transition-all duration-300 group-hover:shadow-md shrink-0">
                                <ArrowRight className="h-3.5 lg:h-5 w-3.5 lg:w-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Call to Action */}
            <div className="text-center mt-12 lg:mt-20">
              <Card className="max-w-xl lg:max-w-2xl mx-auto border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 shadow-xl backdrop-blur-sm mx-4">
                <CardContent className="p-8 lg:p-10 text-center">
                  <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-inner">
                    <TrendingUp className="h-8 lg:h-10 w-8 lg:w-10 text-slate-700 dark:text-slate-300" />
                  </div>
                  
                  <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 text-slate-900 dark:text-slate-100">
                    Discover More Amazing Content
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-6 lg:mb-8 text-sm lg:text-lg leading-relaxed">
                    Explore our complete library of articles, tutorials, and insights
                  </p>
                  
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 dark:from-slate-200 dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-slate-50 text-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-400 px-6 lg:px-8 py-2.5 lg:py-3 text-sm lg:text-base font-bold group w-full sm:w-auto"
                  >
                    <Link to="/articles" className="flex items-center gap-2 lg:gap-3">
                      <span>Explore All Articles</span>
                      <ArrowRight className="h-4 lg:h-5 w-4 lg:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <div className="text-center py-12 lg:py-20">
            <Card className="max-w-md lg:max-w-lg mx-auto border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 shadow-xl backdrop-blur-sm mx-4">
              <CardContent className="p-8 lg:p-12 text-center">
                <div className="w-16 lg:w-24 h-16 lg:h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-inner">
                  <TrendingUp className="h-8 lg:h-12 w-8 lg:w-12 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-slate-900 dark:text-slate-100">No Trending Articles</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 lg:mb-8 text-sm lg:text-lg">
                  Be the first to discover amazing content when it's published
                </p>
                <Button 
                  asChild 
                  variant="default"
                  size="lg"
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 dark:from-slate-200 dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-slate-50 text-white dark:text-slate-900 shadow-lg w-full sm:w-auto"
                >
                  <Link to="/articles">Browse All Articles</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
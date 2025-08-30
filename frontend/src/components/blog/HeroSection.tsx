import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, User, ArrowRight, Star, Sparkles, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartWriting = () => {
    if (isAuthenticated) {
      navigate('/write');
    } else {
      // Store the intended destination in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', '/write');
      navigate('/auth');
    }
  };

  return (
    <section className="relative overflow-hidden py-12 lg:py-16 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/4 rounded-full blur-2xl animate-pulse delay-1000" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg rotate-45 animate-bounce opacity-20 delay-500" />
        <div className="absolute bottom-32 left-16 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full animate-bounce opacity-30 delay-1000" />
      </div>
      
      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-blue-200/30 shadow-lg shadow-blue-500/10">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Featured Platform
                </span>
                <Sparkles className="w-3 h-3 text-blue-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-none">
                <span className="text-slate-900">Share Your</span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Developer Journey
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-medium max-w-xl">
                Join Devnovate's elite community of developers. Share insights, 
                learn from industry experts, and accelerate your career with premium content.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 px-8 py-4 text-base font-bold rounded-2xl"
                onClick={handleStartWriting}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Start Writing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 backdrop-blur-sm px-8 py-4 text-base font-semibold rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
                asChild
              >
                <Link to="/articles" className="flex items-center gap-2">
                  Explore Articles
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base sm:text-lg">10K+</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Active Writers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base sm:text-lg">24/7</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Fresh Content</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base sm:text-lg">Hot</p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Trending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Article Card */}
          <div className="animate-slide-up lg:animate-delay-300">
            <div className="relative group">
              {/* Enhanced glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              
              <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 hover:border-slate-300/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl shadow-slate-900/5 hover:shadow-3xl hover:shadow-blue-500/10">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 font-bold text-sm rounded-xl shadow-lg">
                    <Star className="w-3 h-3 mr-1.5 fill-current" />
                    Featured Article
                  </Badge>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-4 text-slate-900 leading-tight">
                  Building Scalable React Applications in 2024
                </h3>
                
                <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                  Discover cutting-edge patterns and battle-tested practices for creating 
                  maintainable React applications that scale seamlessly with your growing team.
                </p>
                
                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50 text-blue-700 text-xs font-bold shadow-sm">React 18</span>
                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200/50 text-purple-700 text-xs font-bold shadow-sm">Scalability</span>
                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200/50 text-emerald-700 text-xs font-bold shadow-sm">Performance</span>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-600" />
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-white shadow-sm animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">Sarah Johnson</p>
                      <p className="text-sm text-slate-500 font-medium">Senior React Developer</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-slate-700 mb-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-sm">5 min read</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">2 hours ago</p>
                  </div>
                </div>
                
                {/* Enhanced Read More Button */}
                <Button 
                  variant="ghost" 
                  className="w-full mt-6 group bg-slate-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 py-3 rounded-xl border border-slate-200/50 hover:border-blue-300/50 hover:shadow-lg"
                >
                  <span className="mr-2 font-semibold text-slate-700 group-hover:text-blue-700 transition-colors duration-200">Read Full Article</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
    </section>
  );
}
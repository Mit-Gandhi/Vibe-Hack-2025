import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, Bell, User, PenTool, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BlogService } from "@/lib/blog";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ title: string; slug: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<number | undefined>(undefined);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';
  const showBack = location.pathname !== "/";
  const displayName = user?.name || user?.username || (user?.email ? user.email.split('@')[0] : '');

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 lg:px-6">
        {/* Back + Logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-accent/50 transition-all duration-200 rounded-xl"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Link to="/" aria-label="Go to home" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="hero-gradient rounded-xl p-2.5 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 hero-gradient rounded-xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text group-hover:opacity-90 transition-opacity duration-200">
                Devnovate
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/articles" 
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 relative group"
          >
            Articles
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full"></span>
          </Link>
          
          {/* Add Write Article to navbar - only show if authenticated */}
          {isAuthenticated && (
            <Link 
              to="/write" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-200 relative group flex items-center gap-2"
            >
              <PenTool className="h-4 w-4" />
              Write Article
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full rounded-full"></span>
            </Link>
          )}
        </nav>

        {/* Enhanced Search Bar */}
        <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => {
                const v = e.target.value;
                setSearchTerm(v);
                setShowDropdown(!!v.trim());
                if (debounceRef.current) window.clearTimeout(debounceRef.current);
                debounceRef.current = window.setTimeout(async () => {
                  const q = v.trim();
                  if (!q) { setSuggestions([]); return; }
                  try {
                    const res = await BlogService.suggest(q);
                    const list = (res as any)?.suggestions || (res?.data as any)?.suggestions || [];
                    setSuggestions(list);
                  } catch (_) {
                    setSuggestions([]);
                  }
                }, 250);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = searchTerm.trim();
                  navigate(q ? `/articles?q=${encodeURIComponent(q)}` : '/articles');
                  setShowDropdown(false);
                }
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onFocus={() => setShowDropdown(!!searchTerm.trim())}
              className="pl-11 w-full bg-accent/30 border-border/50 rounded-xl focus:bg-background focus:border-primary/50 transition-all duration-200 hover:bg-accent/50"
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute mt-1 w-full bg-background border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.slug}
                    className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors"
                    onMouseDown={() => {
                      navigate(`/article/${s.slug}`);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="text-sm font-medium">{s.title}</span>
                  </button>
                ))}
                <div className="border-t border-border/40" />
                <button
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50"
                  onMouseDown={() => {
                    const q = searchTerm.trim();
                    navigate(q ? `/articles?q=${encodeURIComponent(q)}` : '/articles');
                    setShowDropdown(false);
                  }}
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* Enhanced Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-accent/50 transition-all duration-200 rounded-xl p-2.5"
              >
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground shadow-lg animate-pulse">
                  3
                </Badge>
              </Button>

              {/* Show user name next to avatar - only on larger screens */}
              {displayName && (
                <span className="hidden md:block text-sm text-foreground/80 select-none truncate max-w-[120px] mr-2">
                  {displayName}
                </span>
              )}

              {/* Enhanced User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative h-9 w-9 rounded-full hover:bg-accent/50 transition-all duration-200 ring-2 ring-transparent hover:ring-accent/30"
                    aria-label={displayName ? `Account menu for ${displayName}` : 'Account menu'}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 rounded-xl border-border/50 bg-background/95 backdrop-blur-xl shadow-xl" 
                  align="end"
                >
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome back, {displayName || 'there'}!
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/my-articles" className="flex items-center">
                      <PenTool className="mr-3 h-4 w-4" />
                      My Articles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {isAdmin && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className="rounded-lg cursor-pointer text-primary"
                    >
                      <div className="mr-3 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => navigate('/write')}
                    className="rounded-lg cursor-pointer"
                  >
                    <PenTool className="mr-3 h-4 w-4" />
                    Write Article
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Enhanced Auth Buttons */}
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="hidden sm:inline-flex hover:bg-accent/50 transition-all duration-200 rounded-xl"
              >
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                asChild 
                className="hidden sm:inline-flex bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}

          {/* Enhanced Mobile Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-accent/50 transition-all duration-200 rounded-xl p-2.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="container px-4 py-6 space-y-1">
            {/* Mobile Search */}
            <div className="lg:hidden mb-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchTerm(v);
                    setShowDropdown(!!v.trim());
                    if (debounceRef.current) window.clearTimeout(debounceRef.current);
                    debounceRef.current = window.setTimeout(async () => {
                      const q = v.trim();
                      if (!q) { setSuggestions([]); return; }
                      try {
                        const res = await BlogService.suggest(q);
                        const list = (res as any)?.suggestions || (res?.data as any)?.suggestions || [];
                        setSuggestions(list);
                      } catch (_) {
                        setSuggestions([]);
                      }
                    }, 250);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = searchTerm.trim();
                      navigate(q ? `/articles?q=${encodeURIComponent(q)}` : '/articles');
                      setShowDropdown(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  onFocus={() => setShowDropdown(!!searchTerm.trim())}
                  className="pl-11 w-full bg-accent/30 border-border/50 rounded-xl focus:bg-background focus:border-primary/50 transition-all duration-200"
                />
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute mt-1 w-full bg-background border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s.slug}
                        className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors"
                        onMouseDown={() => {
                          navigate(`/article/${s.slug}`);
                          setShowDropdown(false);
                        }}
                      >
                        <span className="text-sm font-medium">{s.title}</span>
                      </button>
                    ))}
                    <div className="border-t border-border/40" />
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50"
                      onMouseDown={() => {
                        const q = searchTerm.trim();
                        navigate(q ? `/articles?q=${encodeURIComponent(q)}` : '/articles');
                        setShowDropdown(false);
                      }}
                    >
                      View all results
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <Link 
              to="/articles" 
              className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Articles
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                <Link 
                  to="/my-articles" 
                  className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenTool className="mr-3 h-4 w-4" />
                  My Articles
                </Link>
                {isAdmin && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200 text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="mr-3 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    Dashboard
                  </Link>
                )}
                <Link 
                  to="/write" 
                  className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenTool className="mr-3 h-4 w-4" />
                  Write Article
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center py-3 px-3 text-sm font-medium text-left w-full rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth" 
                  className="flex items-center py-3 px-3 text-sm font-medium rounded-xl hover:bg-accent/50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
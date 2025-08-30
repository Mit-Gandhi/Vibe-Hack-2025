import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenTool, Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="hero-gradient rounded-lg p-2">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold gradient-text">Devnovate</h3>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Empowering developers to share knowledge, learn together, and build the future of technology.
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/write" className="hover:text-primary transition-smooth">Write Article</a></li>
              <li><a href="/trending" className="hover:text-primary transition-smooth">Trending</a></li>
              <li><a href="/categories" className="hover:text-primary transition-smooth">Categories</a></li>
              <li><a href="/authors" className="hover:text-primary transition-smooth">Authors</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-smooth">About</a></li>
              <li><a href="/help" className="hover:text-primary transition-smooth">Help Center</a></li>
              <li><a href="/community" className="hover:text-primary transition-smooth">Community</a></li>
              <li><a href="/guidelines" className="hover:text-primary transition-smooth">Guidelines</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest articles and updates delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                className="flex-1"
              />
              <Button variant="hero" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Devnovate. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-smooth">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-smooth">Terms of Service</a>
            <a href="/cookies" className="hover:text-primary transition-smooth">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
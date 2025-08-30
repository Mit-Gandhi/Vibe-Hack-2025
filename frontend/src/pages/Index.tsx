import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/blog/HeroSection";
import { TrendingSection } from "@/components/blog/TrendingSection";
import { BlogGrid } from "@/components/blog/BlogGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Modern home: removed API Connection Test section */}
        
        <TrendingSection />
        <BlogGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

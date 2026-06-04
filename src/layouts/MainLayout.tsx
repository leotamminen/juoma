import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout flex flex-col min-h-screen">
      <AnimatedBackground />

      <header className="bg-black/40 backdrop-blur-md text-white border-b border-white/5">
        <Navbar />
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-black/40 backdrop-blur-md text-white border-t border-white/5">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;

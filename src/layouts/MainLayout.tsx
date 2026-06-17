import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout flex flex-col h-dvh">
      <AnimatedBackground />

      <header className="shrink-0 bg-black/40 backdrop-blur-md text-white border-b border-white/5">
        <Navbar />
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>

      <footer className="shrink-0 bg-black/40 backdrop-blur-md text-white border-t border-white/5">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;

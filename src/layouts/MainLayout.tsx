import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout flex flex-col min-h-screen">
      {/* Yläpalkki */}
      <header className="bg-gray-800 text-white">
        <Navbar />
      </header>

      {/* Sivun sisältö */}
      <main className="flex-grow">{children}</main>

      {/* Alapalkki */}
      <footer className="bg-gray-900 text-white">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;

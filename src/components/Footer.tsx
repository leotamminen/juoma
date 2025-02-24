const Footer = () => {
  const currentYear = new Date().getFullYear(); // Hakee aina nykyisen vuoden

  return (
    <div className="bg-#1c1a19 text-gray-300 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center space-y-4">
        {/* Copyright */}
        <p className="text-sm text-gray-400">
          © {currentYear} Juoma :D Kaikki oikeudet pidetään.
        </p>
      </div>
    </div>
  );
};

export default Footer;

import "../app/globals.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../app/theme/ThemeContext"; // Update the path if ThemeContext is elsewhere

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Dropdown state
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref for hamburger button
  const { darkMode, toggleDarkMode } = useTheme(); // Theme context hook

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const handleToggleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <nav className="bg-#1c1a19 text-white shadow-md relative">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <button
          ref={buttonRef}
          className="md:hidden text-white focus:outline-none"
          onClick={handleToggleClick}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Center: Title and Desktop Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none text-lg font-bold md:flex md:space-x-6 md:items-center">
          {/* Title */}
          <Link href="/" className="block md:inline hover:text-gray-400">
            Juoma
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="/play" className="hover:text-gray-400">
              Pelaa
            </Link>
            <Link href="/learn" className="hover:text-gray-400">
              Opi
            </Link>
            <Link href="/support" className="hover:text-gray-400">
              Tuki
            </Link>
          </div>
        </div>

        {/* Right: Language Selector and Dark Mode */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <select className="hidden bg-gray-800 text-white p-2 rounded">
            {/* Hidden with 'hidden' class */}
            <option value="en">English</option>
            <option value="fi">Suomi</option>
            <option value="es">Español</option>
          </select>

          {/* Dark Mode Switch */}
          <div className="dark-mode-toggle">
            <input
              type="checkbox"
              id="darkModeSwitch"
              className="dark-mode-checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <label htmlFor="darkModeSwitch" className="dark-mode-label">
              <span className="dark-mode-ball"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Dropdown Menu for Small Screens */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-4/5 bg-gray-800 z-50 shadow-lg transition-transform transform duration-300 ease-in-out rounded-lg"
        >
          <Link
            href="/play"
            className="block py-2 px-4 hover:bg-gray-700 hover:text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            Pelaa
          </Link>
          <Link
            href="/learn"
            className="block py-2 px-4 hover:bg-gray-700 hover:text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            Opi
          </Link>
          <Link
            href="/support"
            className="block py-2 px-4 hover:bg-gray-700 hover:text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            Tuki
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

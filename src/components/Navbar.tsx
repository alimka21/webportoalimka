import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const Navbar = ({ showBack = false }: { showBack?: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: isHome ? "#home" : "/#home" },
    { name: "Tentang", href: isHome ? "#about" : "/#about" },
    { name: "Kualifikasi", href: isHome ? "#qualifications" : "/#qualifications" },
    { name: "Keahlian", href: isHome ? "#skillset" : "/#skillset" },
    { name: "Proyek", href: isHome ? "#projects" : "/#projects" },
    { name: "Kontak", href: isHome ? "#contact" : "/#contact" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "glass-nav shadow-sm py-4 bg-surface-container-lowest/90 backdrop-blur-md" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBack && (
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <a href={isHome ? "#" : "/"} className="text-xl font-bold tracking-tighter text-on-surface">
            Muhammad Alimka
          </a>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-on-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-surface-container-lowest shadow-lg border-t border-outline-variant/10 py-6 px-6 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="text-on-surface-variant font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

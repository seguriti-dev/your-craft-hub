import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoColor from "@/assets/logo-simplified-color.svg";
import logoWhite from "@/assets/logo-simplified-white.svg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <img 
              src={isScrolled ? logoColor : logoWhite} 
              alt="Hands-Hands" 
              className="h-12 md:h-14 w-auto transition-all duration-300"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className={`${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("servicios")}
              className={`${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection("portafolio")}
              className={`${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Portafolio
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className={`${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Contacto
            </button>
            <Button onClick={() => scrollToSection("contacto")}>
              Solicitar Cotización
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button
              onClick={() => scrollToSection("inicio")}
              className={`block w-full text-left px-4 py-2 ${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("servicios")}
              className={`block w-full text-left px-4 py-2 ${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection("portafolio")}
              className={`block w-full text-left px-4 py-2 ${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Portafolio
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className={`block w-full text-left px-4 py-2 ${isScrolled ? 'text-foreground' : 'text-white'} hover:text-primary transition-colors duration-300`}
            >
              Contacto
            </button>
            <div className="px-4">
              <Button onClick={() => scrollToSection("contacto")} className="w-full">
                Solicitar Cotización
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

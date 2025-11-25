import logoWhite from "@/assets/logo-white.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center md:text-left">
            <p className="text-white">
              Servicios profesionales de limpieza y restauración con calidad y compromiso
            </p>
          </div>
          <div className="flex justify-center">
            <img 
              src={logoWhite} 
              alt="Hands-Hands Cleaning & Restoration Services" 
              className="h-24 w-auto"
            />
          </div>
          <div className="text-center md:text-right">
            <p className="text-white">
              © {currentYear} Hands-Hands. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import logoColor from "@/assets/logo-color.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <img 
              src={logoColor} 
              alt="Hands-Hands Cleaning & Restoration Services" 
              className="h-16 w-auto mb-4 mx-auto md:mx-0"
            />
            <p className="text-muted-foreground max-w-md">
              Servicios profesionales de limpieza y restauración con calidad y compromiso
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-muted-foreground">
              © {currentYear} Hands-Hands. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

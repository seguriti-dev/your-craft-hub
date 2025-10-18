const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ProContratistas
            </span>
            <p className="text-secondary-foreground/80 mt-2">
              Construyendo tus sueños con calidad y profesionalismo
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-secondary-foreground/80">
              © {currentYear} ProContratistas. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

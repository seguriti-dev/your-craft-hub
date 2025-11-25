import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  {
    image: project1,
    title: "Restauración Residencial",
    description: "Restauración completa de daños por agua en residencia de 250m². Limpieza profunda, desinfección y reparación de superficies afectadas.",
    category: "Restauración",
  },
  {
    image: project2,
    title: "Oficinas Corporativas",
    description: "Limpieza profunda y mantenimiento de edificio comercial de 4 pisos. Desinfección total y limpieza de conductos de aire.",
    category: "Limpieza Comercial",
  },
  {
    image: project3,
    title: "Restauración Post-Incendio",
    description: "Limpieza especializada de daños por humo y hollín. Restauración completa con eliminación de olores y desinfección profunda.",
    category: "Restauración Especializada",
  },
];

const Portfolio = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + projects.length) % projects.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % projects.length);
    }
  };

  const selectedProject = selectedIndex !== null ? projects[selectedIndex] : null;

  return (
    <section id="portafolio" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Nuestro <span className="text-primary">Portafolio</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora algunos de nuestros proyectos más destacados
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {projects.map((project, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <Card className="overflow-hidden group cursor-pointer" onClick={() => setSelectedIndex(index)}>
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <span className="inline-block px-3 py-1 bg-primary rounded-full text-sm font-medium mb-2">
                            {project.category}
                          </span>
                          <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                          <p className="text-sm text-primary-foreground/90">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedIndex(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedProject?.title}</DialogTitle>
              <DialogDescription>{selectedProject?.category}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedProject?.image}
                  alt={selectedProject?.title}
                  className="w-full h-auto rounded-lg"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground">{selectedProject?.description}</p>
              <div className="text-center text-sm text-muted-foreground">
                {selectedIndex !== null && `${selectedIndex + 1} / ${projects.length}`}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Portfolio;

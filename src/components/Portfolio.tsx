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
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  {
    image: project1,
    title: "Residencia Moderna",
    description: "Construcción completa de residencia contemporánea de 350m² con acabados de lujo y diseño minimalista.",
    category: "Construcción Nueva",
  },
  {
    image: project2,
    title: "Edificio Corporativo",
    description: "Renovación integral de edificio comercial de 5 pisos con fachada moderna de vidrio y acero.",
    category: "Remodelación",
  },
  {
    image: project3,
    title: "Cocina Gourmet",
    description: "Remodelación completa de cocina con encimeras de mármol, electrodomésticos de última generación.",
    category: "Acabados Premium",
  },
];

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

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
                  <Card className="overflow-hidden group cursor-pointer" onClick={() => setSelectedProject(project)}>
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

        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedProject?.title}</DialogTitle>
              <DialogDescription>{selectedProject?.category}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedProject?.image}
                alt={selectedProject?.title}
                className="w-full h-auto rounded-lg"
              />
              <p className="text-muted-foreground">{selectedProject?.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Portfolio;

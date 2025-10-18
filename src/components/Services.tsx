import { Building2, Hammer, Home, PaintBucket, Wrench, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Building2,
    title: "Construcción Nueva",
    description: "Proyectos de construcción residencial y comercial desde cero con los más altos estándares de calidad.",
  },
  {
    icon: Home,
    title: "Remodelación",
    description: "Renovamos y modernizamos espacios existentes, adaptándolos a tus necesidades actuales.",
  },
  {
    icon: PaintBucket,
    title: "Acabados de Lujo",
    description: "Trabajos de acabado premium con atención meticulosa al detalle y materiales de primera calidad.",
  },
  {
    icon: Hammer,
    title: "Mantenimiento",
    description: "Servicios de mantenimiento preventivo y correctivo para mantener tus espacios en óptimas condiciones.",
  },
  {
    icon: Ruler,
    title: "Diseño y Planificación",
    description: "Asesoría completa en diseño arquitectónico y planificación de proyectos de construcción.",
  },
  {
    icon: Wrench,
    title: "Reparaciones",
    description: "Soluciones rápidas y efectivas para cualquier tipo de reparación en tu propiedad.",
  },
];

const Services = () => {
  return (
    <section id="servicios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Nuestros <span className="text-primary">Servicios</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios de construcción para satisfacer todas tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;

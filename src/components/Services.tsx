import { Sparkles, Home, Droplets, Wind, Shield, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Sparkles,
    title: "Limpieza Profunda",
    description: "Limpieza exhaustiva de espacios residenciales y comerciales con productos profesionales y técnicas especializadas.",
  },
  {
    icon: Home,
    title: "Limpieza Residencial",
    description: "Servicios de limpieza para hogares, adaptados a tus necesidades con atención personalizada y cuidado de cada detalle.",
  },
  {
    icon: Droplets,
    title: "Restauración de Daños por Agua",
    description: "Reparación y restauración profesional de daños causados por agua, inundaciones y filtraciones.",
  },
  {
    icon: Wind,
    title: "Limpieza de Conductos",
    description: "Servicio especializado de limpieza de sistemas de ventilación y aire acondicionado para mejor calidad del aire.",
  },
  {
    icon: Shield,
    title: "Desinfección y Sanitización",
    description: "Protocolos avanzados de desinfección para espacios seguros y saludables con productos certificados.",
  },
  {
    icon: Wrench,
    title: "Restauración Especializada",
    description: "Reparación y restauración de daños por incendio, humo y otros desastres con equipo profesional.",
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
            Ofrecemos una amplia gama de servicios de limpieza y restauración profesionales
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

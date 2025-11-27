import { Sparkles, Home, Droplets, Wind, Shield, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Sparkles,
    title: "Deep Cleaning",
    description: "Thorough cleaning of residential and commercial spaces with professional products and specialized techniques.",
  },
  {
    icon: Home,
    title: "Residential Cleaning",
    description: "Home cleaning services tailored to your needs with personalized attention and care for every detail.",
  },
  {
    icon: Droplets,
    title: "Water Damage Restoration",
    description: "Professional repair and restoration of water damage, floods, and leaks.",
  },
  {
    icon: Wind,
    title: "Duct Cleaning",
    description: "Specialized cleaning service for ventilation systems and air conditioning for better air quality.",
  },
  {
    icon: Shield,
    title: "Disinfection and Sanitization",
    description: "Advanced disinfection protocols for safe and healthy spaces with certified products.",
  },
  {
    icon: Wrench,
    title: "Specialized Restoration",
    description: "Repair and restoration of fire, smoke, and disaster damage with professional equipment.",
  },
];

const Services = () => {
  return (
    <section id="servicios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We offer a wide range of professional cleaning and restoration services
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

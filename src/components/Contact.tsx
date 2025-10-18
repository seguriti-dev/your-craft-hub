import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const contactInfo = [
  {
    icon: Phone,
    title: "Teléfono",
    details: ["+52 (555) 123-4567", "+52 (555) 987-6543"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@procontratistas.com", "contacto@procontratistas.com"],
  },
  {
    icon: MapPin,
    title: "Ubicación",
    details: ["Av. Construcción 123", "Ciudad de México, CDMX 01234"],
  },
  {
    icon: Clock,
    title: "Horario",
    details: ["Lun - Vie: 8:00 AM - 6:00 PM", "Sáb: 9:00 AM - 2:00 PM"],
  },
];

const Contact = () => {
  return (
    <section id="contacto" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-primary">Contáctanos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estamos listos para hacer realidad tu próximo proyecto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-muted-foreground text-sm mb-1">
                      {detail}
                    </p>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            ¿Listo para comenzar tu proyecto?
          </p>
          <a
            href="https://wa.me/5215551234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Solicitar Cotización Gratuita
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;

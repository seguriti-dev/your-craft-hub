import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Phone,
    title: "Teléfono",
    details: ["+52 (555) 123-4567", "+52 (555) 987-6543"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@miempresa.com", "contacto@miempresa.com"],
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

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "El número debe tener al menos 10 dígitos" })
    .max(15, { message: "El número debe tener menos de 15 dígitos" })
    .regex(/^[0-9+\s()-]+$/, { message: "Formato de teléfono inválido" }),
  message: z
    .string()
    .trim()
    .min(1, { message: "El mensaje es requerido" })
    .max(500, { message: "El mensaje debe tener menos de 500 caracteres" }),
});

const Contact = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Encode values for SMS/WhatsApp
    const encodedMessage = encodeURIComponent(
      `Nombre: ${values.name}\nTeléfono: ${values.phone}\nMensaje: ${values.message}`
    );
    
    // Open WhatsApp with the message
    window.open(`https://wa.me/5215551234567?text=${encodedMessage}`, "_blank");
    
    toast({
      title: "Mensaje enviado",
      description: "Te contactaremos pronto.",
    });
    
    form.reset();
  };
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

        <div id="contact-form" className="mt-16 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">Envíanos un Mensaje</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 555 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu proyecto..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg">
                    Enviar Mensaje
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;

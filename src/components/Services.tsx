import { Waves, Building2, PawPrint, RefreshCw, Eraser, Sofa, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import steamCarpetImg from "@/assets/service-steam-carpet.jpg";
import deepSteamImg from "@/assets/service-deep-steam.jpg";
import petTreatmentImg from "@/assets/service-pet-treatment.jpg";
import carpetRestorationImg from "@/assets/service-carpet-restoration.jpg";
import stainRemovalImg from "@/assets/service-stain-removal.jpg";
import upholsteryImg from "@/assets/service-upholstery.jpg";
import odorControlImg from "@/assets/service-odor-control.jpg";

const services = [
  {
    icon: Waves,
    title: "Steam Carpet Cleaning",
    description: "Professional hot water extraction cleaning that penetrates deep into carpet fibers, removing dirt, allergens, and bacteria for a thorough clean.",
    image: steamCarpetImg,
  },
  {
    icon: Building2,
    title: "Deep Commercial & Residential Steam Cleaning",
    description: "Comprehensive steam cleaning services for homes and businesses, using industrial-grade equipment to restore carpets to like-new condition.",
    image: deepSteamImg,
  },
  {
    icon: PawPrint,
    title: "Pet Treatment",
    description: "Specialized enzyme treatments that eliminate pet stains and odors at the source, keeping your home fresh and hygienic for your furry friends.",
    image: petTreatmentImg,
  },
  {
    icon: RefreshCw,
    title: "Carpet Restoration",
    description: "Revive worn, damaged, or heavily soiled carpets with our professional restoration services that bring back color, texture, and softness.",
    image: carpetRestorationImg,
  },
  {
    icon: Eraser,
    title: "Stain Removal",
    description: "Expert stain removal for wine, coffee, ink, grease, and other tough stains using advanced techniques and professional-grade solutions.",
    image: stainRemovalImg,
  },
  {
    icon: Sofa,
    title: "Upholstery Cleaning",
    description: "Gentle yet effective cleaning for sofas, chairs, and other upholstered furniture, removing dirt and stains while preserving fabric quality.",
    image: upholsteryImg,
  },
  {
    icon: Wind,
    title: "Odor Control",
    description: "Complete odor elimination services that neutralize unpleasant smells from pets, smoke, mold, and more, leaving your space fresh and clean.",
    image: odorControlImg,
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
            Professional carpet and upholstery cleaning services for homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden"
              >
                <div className="relative">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 p-3 rounded-lg bg-primary/90 text-primary-foreground backdrop-blur-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardContent className="p-6">
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

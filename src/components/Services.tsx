import { Waves, Building2, PawPrint, RefreshCw, Eraser, Sofa, Wind, HardHat, Droplets, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import deepSteamImg from "@/assets/service-deep-steam.jpg";
import petTreatmentImg from "@/assets/service-pet-treatment.jpg";
import stainRemovalImg from "@/assets/service-stain-removal.jpg";
import upholsteryImg from "@/assets/service-upholstery.jpg";
import odorControlImg from "@/assets/service-odor-control.jpg";
import carpetRestorationImg from "@/assets/service-carpet-restoration.jpg";
import mitigationImg from "@/assets/service-mitigation.jpg";
import waterExtractionImg from "@/assets/service-water-extraction.jpg";

type ServiceItem = {
  icon: React.ElementType;
  title: string;
  description: string;
  image: string;
};

type ServiceSubsection = {
  title: string;
  subtitle: string;
  services: ServiceItem[];
};

const subsections: ServiceSubsection[] = [
  {
    title: "Steam Carpet Cleaning",
    subtitle: "Professional hot water extraction and steam cleaning solutions",
    services: [
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
    ],
  },
  {
    title: "Restoration & Renovation",
    subtitle: "Bring your carpets and flooring back to life",
    services: [
      {
        icon: RefreshCw,
        title: "Carpet Restoration",
        description: "Revive worn, damaged, or heavily soiled carpets with our professional restoration services that bring back color, texture, and softness.",
        image: carpetRestorationImg,
      },
    ],
  },
  {
    title: "Site Management",
    subtitle: "On-site damage assessment and risk mitigation",
    services: [
      {
        icon: Shield,
        title: "Mitigation",
        description: "Rapid on-site damage assessment and containment to prevent further deterioration, with professional planning and coordination for full restoration.",
        image: mitigationImg,
      },
    ],
  },
  {
    title: "Water Extraction",
    subtitle: "Emergency water removal and drying services",
    services: [
      {
        icon: Droplets,
        title: "Water Extraction",
        description: "Fast-response water extraction using industrial-grade pumps and vacuums to remove standing water from floods, leaks, or burst pipes, minimizing damage to your property.",
        image: waterExtractionImg,
      },
    ],
  },
];

const ServiceCarousel = ({ services }: { services: ServiceItem[] }) => {
  const [plugin] = useState(() =>
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[plugin]}
      className="w-full max-w-5xl mx-auto"
    >
      <CarouselContent className="-ml-4">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <CarouselItem key={index} className="pl-4 basis-full">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden h-full">
                <div className="relative">
                  <img src={service.image} alt={service.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-4 left-4 p-3 rounded-lg bg-primary/90 text-primary-foreground backdrop-blur-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="-left-12 hidden md:flex" />
      <CarouselNext className="-right-12 hidden md:flex" />
    </Carousel>
  );
};

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

        <div className="space-y-16">
          {subsections.map((subsection, index) => (
            <div key={index}>
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {subsection.title}
                </h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  {subsection.subtitle}
                </p>
              </div>
              <ServiceCarousel services={subsection.services} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

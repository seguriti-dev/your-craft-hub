import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import review1 from "@/assets/review-1.jpg";
import review2 from "@/assets/review-2.jpg";
import review3 from "@/assets/review-3.jpg";
import review4 from "@/assets/review-4.jpg";
import review5 from "@/assets/review-5.jpg";
import review6 from "@/assets/review-6.jpg";
import review7 from "@/assets/review-7.jpg";
import review8 from "@/assets/review-8.jpg";
import review9 from "@/assets/review-9.jpg";

const reviews = [
  {
    image: review1,
    name: "Sarah",
    review: "My bedroom carpet looks brand new! Amazing results.",
  },
  {
    image: review2,
    name: "Michael",
    review: "Great job on our commercial hallway. Very professional!",
  },
  {
    image: review3,
    name: "Jennifer",
    review: "The steam cleaning left perfect lines. Love it!",
  },
  {
    image: review4,
    name: "David",
    review: "They cleaned all our rugs beautifully. Highly recommend!",
  },
  {
    image: review5,
    name: "Lisa",
    review: "Thorough work even around furniture. Excellent service!",
  },
  {
    image: review6,
    name: "Robert",
    review: "Our family room carpet hasn't looked this good in years!",
  },
  {
    image: review7,
    name: "Amanda",
    review: "Spotless results throughout the whole house. Thank you!",
  },
  {
    image: review8,
    name: "James",
    review: "They restored our couch to like-new condition. Impressed!",
  },
  {
    image: review9,
    name: "Emily",
    review: "Quick service and fantastic results. Will call again!",
  },
];

const Reviews = () => {
  const [plugin] = useState(() =>
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section id="reviews" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Customer Reviews
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our satisfied customers have to say about our cleaning services
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[plugin]}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2">
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={review.image}
                      alt={`Cleaning result by ${review.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground p-2 rounded-full backdrop-blur-sm">
                      <Quote className="h-4 w-4" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 italic">
                      "{review.review}"
                    </p>
                    <p className="font-semibold text-foreground">— {review.name}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default Reviews;

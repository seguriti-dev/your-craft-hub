import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      onClick={scrollToForm}
      className="fixed bottom-6 right-6 z-50 group"
    >
      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground group-hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
        ¡Envíanos un mensaje!
      </span>
    </button>
  );
};

export default WhatsAppButton;

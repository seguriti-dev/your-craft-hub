import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
// import Portfolio from "@/components/Portfolio";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  useEffect(() => {
    // Scroll to the section referenced by the URL hash (e.g. /#servicios).
    // Needed because React renders after load, so the browser's native hash
    // jump does not find the element. Also handles back/forward navigation.
    const scrollToHash = (hash: string) => {
      if (!hash) return;
      const id = hash.replace("#", "");
      // Delay lets React render and images/carousels reserve their space
      // before we measure the target position.
      window.setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    };

    scrollToHash(window.location.hash);

    const handleHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      {/* <Portfolio /> */}
      <Reviews />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;

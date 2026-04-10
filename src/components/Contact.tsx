import { Phone, Mail, MapPin, Clock, Toolbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { sendContactSMS } from "@/utils/api";
import { useEffect, useRef, useState } from "react";

const TURNSTILE_TEST_SITE_KEYS = {
  pass: "1x00000000000000000000AA",
  fail: "2x00000000000000000000AB",
  interactive: "3x00000000000000000000FF",
} as const;

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+1 (720) 255-7466", "+1 (720) 255-7466"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["handshands.contact@gmail.com", ""],
  },
  {
    icon: MapPin,
    title: "Location",
    details: ["", "Colorado"],
  },
  {
    icon: Clock,
    title: "Attention Hours",
    details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"],
  },
  {
    icon: Toolbox,
    title: "Working Hours",
    details: ["24 Hours", "For urgent requests"],
  },
];

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Number must have at least 10 digits" })
    .max(15, { message: "Number must be less than 15 digits" })
    .regex(/^[0-9+\s()-]+$/, { message: "Invalid phone format" }),
  zipCode: z
    .string()
    .trim()
    .min(5, { message: "Zip code must be at least 5 characters" })
    .max(10, { message: "Zip code must be less than 10 characters" })
    .regex(/^[0-9-]+$/, { message: "Invalid zip code format" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(500, { message: "Message must be less than 500 characters" }),
  urgent: z.boolean().default(false),
});

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileError, setTurnstileError] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const useTurnstileTestKeys = import.meta.env.VITE_TURNSTILE_USE_TEST_KEYS === "true";
  const turnstileTestBehavior = import.meta.env.VITE_TURNSTILE_TEST_BEHAVIOR || "pass";
  const turnstileSiteKey = useTurnstileTestKeys
    ? TURNSTILE_TEST_SITE_KEYS[
        turnstileTestBehavior as keyof typeof TURNSTILE_TEST_SITE_KEYS
      ] || TURNSTILE_TEST_SITE_KEYS.pass
    : import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      zipCode: "",
      message: "",
      urgent: false,
    },
  });

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) {
      return;
    }

    let cancelled = false;
    let scriptToClean: HTMLScriptElement | null = null;

    const renderTurnstile = () => {
      if (
        cancelled ||
        !window.turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "auto",
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileReady(true);
          setTurnstileError("");
        },
        "expired-callback": () => {
          setTurnstileToken("");
          setTurnstileReady(false);
          setTurnstileError("Captcha expired. Please verify again.");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileReady(false);
          setTurnstileError("Captcha could not be verified. Please try again.");
        },
      });
    };

    const existingScript = document.getElementById("cf-turnstile-script") as HTMLScriptElement | null;

    if (window.turnstile) {
      renderTurnstile();
    } else if (existingScript) {
      existingScript.addEventListener("load", renderTurnstile);
    } else {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderTurnstile);
      document.head.appendChild(script);
      scriptToClean = script;
    }

    return () => {
      cancelled = true;

      if (window.turnstile && turnstileWidgetIdRef.current) {
        window.turnstile.remove?.(turnstileWidgetIdRef.current);
      }

      if (existingScript) {
        existingScript.removeEventListener("load", renderTurnstile);
      }

      if (scriptToClean) {
        scriptToClean.removeEventListener("load", renderTurnstile);
      }

      turnstileWidgetIdRef.current = null;
    };
  }, [turnstileSiteKey]);

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileReady(false);

    if (window.turnstile && turnstileWidgetIdRef.current) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!turnstileSiteKey) {
      toast({
        title: "Captcha configuration missing",
        description: "Set VITE_TURNSTILE_SITE_KEY to enable the contact form.",
        variant: "destructive",
      });
      return;
    }

    if (!turnstileToken) {
      setTurnstileError("Please complete the captcha before sending your message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendContactSMS({
        ...values,
        turnstileToken,
      });

      if (result.success) {
        toast({
          title: "Message sent successfully",
          description: "We will contact you soon. Thank you!",
          variant: "default",
        });

        form.reset();
        setTurnstileError("");
        resetTurnstile();
      } else {
        let errorDescription = result.error || "Please try again later.";

        if (
          result.error?.includes("Too many requests") ||
          result.error?.includes("Demasiadas solicitudes")
        ) {
          errorDescription = "You have reached the request limit. Please try again in 24 hours.";
        } else if (
          result.error?.includes("temporarily unavailable") ||
          result.error?.includes("temporalmente no disponible")
        ) {
          errorDescription = "Service temporarily unavailable. Please try again in a few minutes.";
        } else if (
          result.error?.toLowerCase().includes("captcha") ||
          result.error?.toLowerCase().includes("turnstile")
        ) {
          errorDescription = "Captcha verification failed. Please try again.";
        }

        toast({
          title: "Error sending message",
          description: errorDescription,
          variant: "destructive",
        });

        resetTurnstile();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });

      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-primary">Contact Us</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We are ready to make your next project a reality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
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
                    <p key={idx} className="text-muted-foreground text-pretty text-sm mb-1">
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
              <h3 className="text-2xl font-bold mb-6 text-center">Send Us a Message</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 555 123 4567"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="80202"
                            {...field}
                            disabled={isSubmitting}
                          />
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
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project..."
                            className="min-h-[120px]"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">
                          Urgent Request (24h service available)
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <div ref={turnstileContainerRef} className="flex justify-center" />
                    {!turnstileSiteKey ? (
                      <p className="text-sm text-destructive text-center">
                        Captcha is not configured. Add `VITE_TURNSTILE_SITE_KEY` to enable submissions.
                      </p>
                    ) : null}
                    {turnstileError ? (
                      <p className="text-sm text-destructive text-center">{turnstileError}</p>
                    ) : null}
                    {useTurnstileTestKeys ? (
                      <p className="text-xs text-muted-foreground text-center">
                        Turnstile test mode is active.
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !turnstileSiteKey || !turnstileReady}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-pulse">Sending...</span>
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to be contacted regarding your request.
                  </p>
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

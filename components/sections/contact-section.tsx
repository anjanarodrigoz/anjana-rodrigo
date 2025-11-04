"use client";

import { motion } from "framer-motion";
import { ContactForm } from "@/components/features/contact-form";
import { WhatsAppWidget } from "@/components/features/whatsapp-widget";
import { Mail, MessageSquare, Calendar, MapPin, Phone } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "anjanarodrigoz@gmail.com",
    href: "mailto:anjanarodrigoz@gmail.com",
    color: "emerald",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+94 769 809 256",
    href: "tel:+94769809256",
    color: "amber",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    value: "Message me",
    href: "https://wa.me/94769809256?text=Hi%20Anjana,%20I%20visited%20your%20portfolio",
    color: "coral",
  },
  {
    icon: Calendar,
    title: "Schedule Meeting",
    value: "Book a call",
    href: "https://cal.com/anjanarodrigo",
    color: "emerald",
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative min-h-screen py-20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      <div className="watercolor-overlay absolute inset-0 opacity-20" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            <span className="gradient-text">Let's Connect</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? Let's discuss how we can work together to
            bring your ideas to life
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <p className="text-muted-foreground mb-8">
                I'm always open to discussing new projects, creative ideas, or
                opportunities to be part of your vision. Choose your preferred
                way to connect:
              </p>

              <div className="space-y-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <motion.a
                      key={index}
                      href={method.href}
                      target={
                        method.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        method.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="flex items-center gap-4 glass p-4 rounded-xl border border-border hover:border-emerald transition-all group"
                    >
                      <div
                        className={`p-3 rounded-lg bg-${method.color}/20 text-${method.color} group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{method.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {method.value}
                        </div>
                      </div>
                      <div className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Location & Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-6 rounded-xl border border-border"
            >
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-emerald mt-1" />
                <div>
                  <div className="font-semibold mb-1">Based in</div>
                  <div className="text-muted-foreground">
                    Colombo, Sri Lanka
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Available for remote work worldwide
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-3 h-3 bg-emerald rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Available for new projects
                </span>
              </div>
            </motion.div>

            {/* Response Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-6 rounded-xl border border-border"
            >
              <h4 className="font-semibold mb-3">Response Time</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Email inquiries:</span>
                  <span className="text-emerald font-medium">
                    Within 24 hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Urgent matters:</span>
                  <span className="text-amber font-medium">
                    WhatsApp available
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Video calls:</span>
                  <span className="text-coral font-medium">
                    Schedule anytime
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>

      {/* WhatsApp Widget */}
      <WhatsAppWidget />
    </section>
  );
}

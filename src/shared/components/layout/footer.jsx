// components/Footer.jsx
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  Heart,
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubscribed(true);
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const footerLinks = {
    quickLinks: [
      { name: "Productos", href: "/productos" },
      { name: "Categorías", href: "/categorias" },
      { name: "Ofertas", href: "/ofertas" },
      { name: "Sobre Nosotros", href: "/sobre-nosotros" },
    ],
    customerService: [
      { name: "Contacto", href: "/contacto" },
      { name: "Envíos", href: "/envios" },
      { name: "Devoluciones", href: "/devoluciones" },
      { name: "Garantía", href: "/garantia" },
    ],
    legal: [
      { name: "Términos y Condiciones", href: "/terminos" },
      { name: "Política de Privacidad", href: "/privacidad" },
      { name: "Política de Cookies", href: "/cookies" },
      { name: "FAQ", href: "/faq" },
    ],
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/killavibes",
      color: "hover:text-pink-500",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com/killavibes",
      color: "hover:text-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com/killavibes",
      color: "hover:text-blue-400",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/killavibes",
      color: "hover:text-red-600",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-muted/30 to-muted/50 border-t border-border/50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border/50">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-2 rounded-full backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Newsletter
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold">
              Únete a la{" "}
              <span className="gradient-text bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                vibra Killa
              </span>
            </h3>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Suscríbete y recibe ofertas exclusivas, lanzamientos de productos y
              tips tecnológicos directamente en tu correo
            </p>

            {/* Newsletter Form */}
            <form
              onSubmit={handleNewsletterSubmit}
              className="max-w-md mx-auto flex gap-2"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-background border-2 border-border focus:border-primary outline-none transition-all duration-300 text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading || isSubscribed}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || isSubscribed}
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>¡Listo!</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span className="hidden sm:inline">Suscribirse</span>
                  </>
                )}
              </button>
            </form>

            {isSubscribed && (
              <p className="text-green-500 text-sm font-semibold animate-fade-in">
                ✨ ¡Gracias por unirte! Revisa tu email para confirmar la
                suscripción.
              </p>
            )}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="inline-flex items-center space-x-3 group">
                <div className="relative">
                  <img
                    src="/logo-killavibes.svg"
                    alt="KillaVibes"
                    width="40"
                    height="40"
                    className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
                  />
                  <Zap className="absolute -bottom-1 -right-1 h-4 w-4 text-primary animate-pulse" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  KillaVibes
                </span>
              </Link>

              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Tu tienda de confianza en Barranquilla para tecnología de calidad.
                Productos originales, envíos rápidos y atención personalizada 24/7.
              </p>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: Zap, text: "Tecnología que vibra contigo" },
                  { icon: MapPin, text: "Barranquilla | Envíos 🇨🇴" },
                  { icon: Clock, text: "Atención 24/7 | Garantizado 🧿" },
                  { icon: Heart, text: "¡Únete a la vibra Killa! 😎" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-sm text-muted-foreground group hover:text-primary transition-colors duration-300"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3 pt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-12 w-12 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center text-muted-foreground ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                Enlaces Rápidos
                <ArrowRight className="ml-2 h-4 w-4 text-primary" />
              </h3>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center group text-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/30 mr-3 group-hover:bg-primary transition-colors duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                Atención al Cliente
                <ArrowRight className="ml-2 h-4 w-4 text-primary" />
              </h3>
              <ul className="space-y-3">
                {footerLinks.customerService.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center group text-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/30 mr-3 group-hover:bg-primary transition-colors duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                Contacto
                <ArrowRight className="ml-2 h-4 w-4 text-primary" />
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: MapPin,
                    text: "Barranquilla, Colombia",
                    href: "#",
                  },
                  {
                    icon: Phone,
                    text: "+57 300 252 1314",
                    href: "tel:+573002521314",
                  },
                  {
                    icon: Mail,
                    text: "info@killavibes.com",
                    href: "mailto:info@killavibes.com",
                  },
                  {
                    icon: Clock,
                    text: "24/7 Atención",
                    href: "#",
                  },
                ].map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-start space-x-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                      <contact.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="pt-1">{contact.text}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} KillaVibes. Todos los derechos
              reservados. Hecho con{" "}
              <Heart className="inline h-4 w-4 text-red-500 fill-current animate-pulse" />{" "}
              en Barranquilla
            </p>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative wave at top */}
      <div className="absolute top-0 left-0 right-0 h-12 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C360,40 720,40 1080,0 C1440,-40 1440,120 1440,120 L0,120 Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </footer>
  );
}
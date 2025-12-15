// components/TestimonialsSection.jsx
import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, Heart, Award } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "María González",
    location: "Barranquilla",
    rating: 5,
    comment: "Excelente servicio y productos de calidad. Los audífonos que compré suenan increíbles y llegaron súper rápido. ¡Totalmente recomendado!",
    avatar: "/diverse-woman-avatar.png",
    product: "Audífonos Bluetooth Premium",
    verified: true,
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    location: "Soledad",
    rating: 5,
    comment: "El compresor portátil me salvó en una emergencia. Funciona perfecto y la batería dura mucho tiempo. La mejor inversión que he hecho.",
    avatar: "/man-avatar.png",
    product: "Compresor Portátil",
    verified: true,
  },
  {
    id: 3,
    name: "Ana Rodríguez",
    location: "Barranquilla",
    rating: 5,
    comment: "Mi hija ama el parlante con orejitas de gato. La calidad del sonido es excelente y el diseño es hermoso. ¡Un 10/10!",
    avatar: "/woman-avatar-2.png",
    product: "Parlante Gato RGB",
    verified: true,
  },
  {
    id: 4,
    name: "Luis Martínez",
    location: "Barranquilla",
    rating: 5,
    comment: "Atención al cliente de primera. Me asesoraron perfectamente y el envío fue rapidísimo. Volveré a comprar sin duda.",
    avatar: "/man-avatar-2.png",
    product: "Smartwatch Pro",
    verified: true,
  },
  {
    id: 5,
    name: "Isabella Torres",
    location: "Soledad",
    rating: 5,
    comment: "Productos originales y a excelentes precios. La experiencia de compra fue increíble de principio a fin.",
    avatar: "/woman-avatar-3.png",
    product: "Auriculares Gaming",
    verified: true,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("testimonials-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  // Get visible testimonials for desktop (3 at a time)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push({ ...testimonials[index], position: i });
    }
    return visible;
  };

  return (
    <section
      id="testimonials-section"
      className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>

        {/* Decorative stars */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-primary/20 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 16 + 8}px`,
                height: `${Math.random() * 16 + 8}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div
          className={`text-center mb-16 space-y-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-full backdrop-blur-sm border border-primary/20 shadow-lg">
            <Heart className="h-5 w-5 text-red-500 fill-current animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Testimonios
            </span>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
            Lo que dicen{" "}
            <span className="relative inline-block">
              <span className="gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                nuestros clientes
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M0 6 Q50 0, 100 6 T200 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-primary opacity-50"
                />
              </svg>
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Miles de clientes satisfechos confían en{" "}
            <span className="text-primary font-semibold">KillaVibes</span> para sus
            necesidades tecnológicas
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Award className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold text-primary">500+</span>
              </div>
              <p className="text-sm text-muted-foreground">Clientes Felices</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
                <span className="text-3xl font-bold text-yellow-500">4.9</span>
              </div>
              <p className="text-sm text-muted-foreground">Rating Promedio</p>
            </div>
          </div>
        </div>

        {/* Testimonials Carousel - Mobile */}
        <div
          className={`lg:hidden relative transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative h-[500px] max-w-md mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentIndex
                    ? "opacity-100 scale-100 z-10"
                    : index < currentIndex
                    ? "opacity-0 -translate-x-full scale-95 z-0"
                    : "opacity-0 translate-x-full scale-95 z-0"
                }`}
              >
                <TestimonialCard testimonial={testimonial} featured />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 backdrop-blur-sm border border-primary/20 text-primary transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-border w-2 hover:w-4"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 backdrop-blur-sm border border-primary/20 text-primary transition-all duration-300 hover:scale-110 flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid - Desktop */}
        <div
          className={`hidden lg:block transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getVisibleTestimonials().map((testimonial) => (
              <div
                key={testimonial.id}
                className="animate-fade-in"
                style={{ animationDelay: `${testimonial.position * 0.15}s` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={prevTestimonial}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 backdrop-blur-sm border border-primary/30 text-primary transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center group"
            >
              <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="flex space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-gradient-to-r from-primary to-accent w-12 shadow-lg"
                      : "bg-border w-3 hover:w-6 hover:bg-primary/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 backdrop-blur-sm border border-primary/30 text-primary transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center group"
            >
              <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonial Card Component
function TestimonialCard({ testimonial, featured = false }) {
  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 ${
        featured ? "h-full" : ""
      }`}
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Floating quote icon */}
      <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <Quote className="h-32 w-32 text-primary rotate-12" />
      </div>

      <CardContent className="p-8 relative z-10">
        {/* Rating Stars */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s`, animationDuration: "2s" }}
              />
            ))}
          </div>
          
          {testimonial.verified && (
            <div className="flex items-center space-x-1 bg-green-500/10 px-3 py-1 rounded-full">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-xs font-semibold text-green-500">Verificado</span>
            </div>
          )}
        </div>

        {/* Comment */}
        <p className="text-muted-foreground mb-6 leading-relaxed text-base relative">
          <Quote className="inline h-5 w-5 text-primary/30 mr-1 -mt-1" />
          {testimonial.comment}
          <Quote className="inline h-5 w-5 text-primary/30 ml-1 -mt-1 rotate-180" />
        </p>

        {/* Product purchased */}
        {testimonial.product && (
          <div className="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-muted-foreground mb-1">Producto comprado:</p>
            <p className="text-sm font-semibold text-primary">{testimonial.product}</p>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background group-hover:ring-primary/40 transition-all duration-300">
            <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg">
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-bold text-base text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground flex items-center">
              <svg
                className="h-3 w-3 mr-1 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {testimonial.location}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Hover border effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg transition-all duration-300 pointer-events-none"></div>
    </Card>
  );
}
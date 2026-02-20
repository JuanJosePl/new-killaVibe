// page.jsx

import Layout from "./Layout"
import { HeroSection } from "../shared/components/marketing/hero-section"
import { FeaturedProducts } from "../modules/products/components/FeaturedProducts"
import { TestimonialsSection } from "../shared/components/marketing/testimonials-section"

export default function HomePage() {
  return (
<>
      <HeroSection />
       <FeaturedProducts /> 
      <TestimonialsSection />
</>
  )
}
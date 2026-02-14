// page.jsx

import Layout from "./Layout"
import { HeroSection } from "../shared/components/feedback/components/hero-section"
import { FeaturedProducts } from "../modules/products/components/FeaturedProducts"
import { TestimonialsSection } from "../shared/components/feedback/components/testimonials-section"
import CategoryCard from "../modules/categories/components/CategoryCard"

export default function HomePage() {
  return (
<>
      <HeroSection />
       <FeaturedProducts /> 
       < CategoryCard/> 
      <TestimonialsSection />
</>
  )
}
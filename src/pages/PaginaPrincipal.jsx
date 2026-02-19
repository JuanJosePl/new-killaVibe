// page.jsx

import Layout from "./Layout"
import { HeroSection } from "../shared/components/marketing/hero-section"
import { FeaturedProducts } from "../modules/products/components/FeaturedProducts"
import { TestimonialsSection } from "../shared/components/marketing/testimonials-section"
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
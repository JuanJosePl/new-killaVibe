// page.jsx

import Layout from "./Layout"
import { HeroSection } from "../shared/components/feedback/components/hero-section"
import { FeaturedProducts } from "../modules/products/components/FeaturedProducts"
import { TestimonialsSection } from "../shared/components/feedback/components/testimonials-section"
// import CategoriesPage from "./categorias/page"

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
       <FeaturedProducts /> 
      {/* < CategoriesPage/> */}
      <TestimonialsSection />
    </Layout>
  )
}
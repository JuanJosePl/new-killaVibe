// page.jsx

import { PageLayout } from "../components/page-layout"
import { HeroSection } from "../components/hero-section"
import { FeaturedProducts } from "../components/featured-products"
import { TestimonialsSection } from "../components/testimonials-section"
import CategoriesPage from "./categorias/page"

export default function HomePage() {
  return (
    <PageLayout>
      <HeroSection />
      <FeaturedProducts />
      < CategoriesPage/>
      <TestimonialsSection />
    </PageLayout>
  )
}
import { HeroSection } from "./hero-section-dark"

function HeroSectionDemo() {
  return (
    <HeroSection
      title="Welcome to CodeCafe"
      subtitle={{
        regular: "Master programming with ",
        gradient: "interactive learning",
      }}
      description="Transform your coding skills with our comprehensive platform featuring courses, coding challenges, and real-time progress tracking."
      ctaText="Start Learning"
      ctaHref="/auth"
      bottomImage={{
        light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center",
        dark: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=600&fit=crop&crop=center",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.4,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  )
}

export { HeroSectionDemo }
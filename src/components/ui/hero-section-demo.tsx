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
        light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center&auto=format&q=80",
        dark: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center&auto=format&q=80",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.3,
        cellSize: 50,
        lightLineColor: "#6366f1",
        darkLineColor: "#4338ca",
      }}
    />
  )
}

export { HeroSectionDemo }
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 to-transparent to-90% dark:from-black" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      bottomImage = {
        light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center&auto=format&q=80",
        dark: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center&auto=format&q=80",
      },
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/20 dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(147,51,234,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(147,51,234,0.4),rgba(255,255,255,0))]" />
        <section className="relative max-w-full mx-auto z-1">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
            <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
              <h1 className="text-sm text-slate-300 dark:text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-purple-300/20 via-indigo-400/20 to-transparent dark:from-purple-300/5 dark:via-indigo-400/5 border-[2px] border-purple-500/20 dark:border-white/5 rounded-3xl w-fit">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
              </h1>
              <h2 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 dark:from-purple-300 dark:to-indigo-300">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-300 dark:text-gray-300">
                {description}
              </p>
              <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#C084FC_0%,#6366F1_50%,#C084FC_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-900 dark:bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                    <a
                      href={ctaHref}
                      className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-purple-300/20 via-indigo-400/30 to-transparent dark:from-purple-300/5 dark:via-indigo-400/20 text-white dark:text-white border-input border-[1px] border-purple-500/30 hover:bg-gradient-to-tr hover:from-purple-300/30 hover:via-indigo-400/40 hover:to-transparent dark:hover:from-purple-300/10 dark:hover:via-indigo-400/30 transition-all sm:w-auto py-4 px-10"
                    >
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>
            {bottomImage && (
              <div className="mt-32 mx-10 relative z-10">
                <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-purple-500/30 shadow-2xl overflow-hidden">
                  {/* Dashboard Preview Mockup */}
                  <div className="absolute inset-0 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg"></div>
                        <h1 className="text-xl font-bold text-white">CodeCafe Dashboard</h1>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
                        <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="w-6 h-6 bg-blue-400 rounded mb-2"></div>
                        <div className="text-2xl font-bold text-white">12</div>
                        <div className="text-xs text-slate-400">Tasks</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="w-6 h-6 bg-green-400 rounded mb-2"></div>
                        <div className="text-2xl font-bold text-white">8</div>
                        <div className="text-xs text-slate-400">Completed</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="w-6 h-6 bg-purple-400 rounded mb-2"></div>
                        <div className="text-2xl font-bold text-white">5</div>
                        <div className="text-xs text-slate-400">Notes</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="w-6 h-6 bg-indigo-400 rounded mb-2"></div>
                        <div className="text-2xl font-bold text-white">85%</div>
                        <div className="text-xs text-slate-400">Success</div>
                      </div>
                    </div>
                    
                    {/* Chart Area */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm font-medium text-white mb-3">Weekly Progress</div>
                        <div className="flex items-end gap-2 h-20">
                          <div className="bg-purple-400 w-4 h-8 rounded-t"></div>
                          <div className="bg-purple-400 w-4 h-12 rounded-t"></div>
                          <div className="bg-purple-400 w-4 h-16 rounded-t"></div>
                          <div className="bg-purple-400 w-4 h-10 rounded-t"></div>
                          <div className="bg-purple-400 w-4 h-14 rounded-t"></div>
                          <div className="bg-purple-400 w-4 h-18 rounded-t"></div>
                          <div className="bg-purple-400 w-4 h-12 rounded-t"></div>
                        </div>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm font-medium text-white mb-3">Recent Activity</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div className="text-xs text-slate-300">Task completed</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="text-xs text-slate-300">Note created</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <div className="text-xs text-slate-300">Course started</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overlay gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
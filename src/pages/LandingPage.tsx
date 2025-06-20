import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TubelightNavbarDemo } from '../components/ui/tubelight-navbar-demo'
import { Code, Users, Trophy, BookOpen, Target, Star, ChevronRight } from 'lucide-react'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Courses",
      description: "Learn Java, Python, DSA and more with hands-on coding exercises"
    },
    {
      icon: Code,
      title: "Coding Challenges",
      description: "Solve real-world problems and improve your programming skills"
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description: "Compete with other learners and track your progress"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with fellow developers and share knowledge"
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "AI-powered recommendations based on your skill level"
    },
    {
      icon: Star,
      title: "Achievements",
      description: "Earn badges and rewards as you complete challenges"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Tubelight Navbar */}
      <TubelightNavbarDemo />

      {/* Hero Section */}
      <section className="relative max-w-full mx-auto">
        <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
          <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
            <h1 className="text-sm text-slate-300 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-purple-300/20 via-indigo-400/20 to-transparent border-[2px] border-purple-500/20 rounded-3xl w-fit">
              Welcome to CodeCafe
              <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
            </h1>
            <h2 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.75)_100%)]">
              Master programming with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                interactive learning
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-300">
              Transform your coding skills with our comprehensive platform featuring courses, coding challenges, and real-time progress tracking.
            </p>
            <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
              <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#C084FC_0%,#6366F1_50%,#C084FC_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-900 text-xs font-medium backdrop-blur-3xl">
                  <button
                    onClick={() => navigate('/auth')}
                    className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-purple-300/20 via-indigo-400/30 to-transparent text-white border-input border-[1px] border-purple-500/30 hover:bg-gradient-to-tr hover:from-purple-300/30 hover:via-indigo-400/40 hover:to-transparent transition-all sm:w-auto py-4 px-10"
                  >
                    Start Learning
                  </button>
                </div>
              </span>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div className="mt-32 mx-10 relative z-10">
            <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-purple-500/30 shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Dashboard Preview Mockup */}
              <div className="absolute inset-0 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg"></div>
                    <h1 className="text-xl font-bold text-white">CodeCafe Dashboard</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-600/50 rounded-full"></div>
                    <div className="w-8 h-8 bg-slate-600/50 rounded-full"></div>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                    <div className="w-6 h-6 bg-blue-400 rounded mb-2"></div>
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-xs text-slate-400">Tasks</div>
                  </div>
                  <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                    <div className="w-6 h-6 bg-green-400 rounded mb-2"></div>
                    <div className="text-2xl font-bold text-white">8</div>
                    <div className="text-xs text-slate-400">Completed</div>
                  </div>
                  <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                    <div className="w-6 h-6 bg-purple-400 rounded mb-2"></div>
                    <div className="text-2xl font-bold text-white">5</div>
                    <div className="text-xs text-slate-400">Notes</div>
                  </div>
                  <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                    <div className="w-6 h-6 bg-indigo-400 rounded mb-2"></div>
                    <div className="text-2xl font-bold text-white">85%</div>
                    <div className="text-xs text-slate-400">Success</div>
                  </div>
                </div>
                
                {/* Chart Area */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/20">
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
                  <div className="bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/20">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to master coding
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            From beginner-friendly tutorials to advanced challenges, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 hover:bg-slate-700/30 transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to start your coding journey?
            </h2>
            <p className="text-xl text-slate-200 mb-8">
              Join thousands of developers who are already learning with CodeCafe
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Learning Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-600/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              CodeCafe
            </h1>
          </div>
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} CodeCafe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
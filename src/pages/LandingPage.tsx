import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSectionDemo } from '../components/ui/hero-section-demo'
import { NavbarDemo } from '../components/ui/navbar-demo'
import { Code, Users, Trophy, BookOpen, Target, Star } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* New Navbar */}
      <NavbarDemo />

      {/* Hero Section */}
      <HeroSectionDemo />

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
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105"
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
      <footer className="py-12 px-4 border-t border-slate-600/50">
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
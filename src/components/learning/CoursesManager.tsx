import React, { useState } from 'react'
import { BookOpen, Play, Clock, Star, Users, ChevronRight, Filter, Search, CheckCircle, Award, Calendar, Book } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Course } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CoursesManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: courses, loading } = useRealTimeSubscription<Course>('courses', undefined)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📚' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'dsa', label: 'Data Structures & Algorithms', icon: '🧮' },
    { value: 'web', label: 'Web Development', icon: '🌐' },
    { value: 'mobile', label: 'Mobile Development', icon: '📱' },
    { value: 'database', label: 'Database', icon: '🗄️' }
  ]

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'advanced': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.icon || '📚'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'java': return 'from-blue-500/30 to-blue-600/30 border-blue-500/30'
      case 'python': return 'from-green-500/30 to-green-600/30 border-green-500/30'
      case 'dsa': return 'from-purple-500/30 to-purple-600/30 border-purple-500/30'
      case 'web': return 'from-orange-500/30 to-red-500/30 border-orange-500/30'
      case 'mobile': return 'from-cyan-500/30 to-blue-500/30 border-cyan-500/30'
      case 'database': return 'from-emerald-500/30 to-teal-600/30 border-emerald-500/30'
      default: return 'from-slate-500/30 to-slate-600/30 border-slate-500/30'
    }
  }

  const handleStartLearning = (course: Course) => {
    setSelectedCourse(course)
    setShowCourseModal(true)
    toast.success(`Starting ${course.title} course!`)
  }

  const closeCourseModal = () => {
    setSelectedCourse(null)
    setShowCourseModal(false)
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Learning Courses</h2>
            <p className="text-slate-400">Master programming with our comprehensive courses</p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-64"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filters:</span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No courses found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
            >
              {/* Course Thumbnail - Enhanced with NxtWave-like design */}
              <div className={`h-48 bg-gradient-to-br ${getCategoryColor(course.category)} relative overflow-hidden`}>
                {/* Course Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-slate-800/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">{getCategoryIcon(course.category)}</span>
                  </div>
                </div>
                
                {/* Course Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full border backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
                
                {course.is_premium && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 backdrop-blur-sm text-yellow-400 rounded-full border border-yellow-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Premium
                    </span>
                  </div>
                )}
                
                {/* Course Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3" />
                      <span>1.2k enrolled</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>4.8 (120)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-orange-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {course.description || 'Learn the fundamentals and advanced concepts'}
                </p>

                {/* Course Features */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Self-paced learning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Certificate on completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{course.duration_hours} hours of content</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleStartLearning(course)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Learning
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Categories Overview */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Course Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(1).map((category) => {
            const count = courses.filter(c => c.category === category.value).length
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-4 rounded-lg border transition-colors text-center ${
                  selectedCategory === category.value
                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-slate-500 mt-1">{count} courses</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Course Header */}
            <div className={`p-8 bg-gradient-to-r ${getCategoryColor(selectedCourse.category)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl">{getCategoryIcon(selectedCourse.category)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full border backdrop-blur-sm ${getDifficultyColor(selectedCourse.difficulty)}`}>
                        {selectedCourse.difficulty}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-500/20 backdrop-blur-sm text-blue-400 rounded-full border border-blue-500/30">
                        {selectedCourse.category}
                      </span>
                      {selectedCourse.is_premium && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 backdrop-blur-sm text-yellow-400 rounded-full border border-yellow-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeCourseModal}
                  className="p-2 text-white/70 hover:text-white transition-colors bg-slate-800/30 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-100">{selectedCourse.duration_hours}h</div>
                  <div className="text-xs text-slate-400">Course Duration</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Book className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-100">12</div>
                  <div className="text-xs text-slate-400">Modules</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-100">24/7</div>
                  <div className="text-xs text-slate-400">Access</div>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Course Description</h3>
                <p className="text-slate-300 mb-6">{selectedCourse.description || 'No description available for this course.'}</p>
                
                <h3 className="text-lg font-semibold text-slate-100 mb-4">What You'll Learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Fundamentals and core concepts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Practical examples and real-world applications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Advanced techniques and best practices</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-slate-300">Hands-on projects and coding exercises</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Course Curriculum</h3>
                <div className="space-y-3 mb-6">
                  <div className="bg-slate-700/30 rounded-lg overflow-hidden border border-slate-600/30">
                    <div className="bg-slate-700/50 p-4 flex items-center justify-between">
                      <h4 className="font-medium text-slate-100">Module 1: Introduction</h4>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">4 lessons</span>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between border-b border-slate-600/20 pb-2">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Getting Started</span>
                          </div>
                          <span className="text-xs text-slate-400">15 min</span>
                        </li>
                        <li className="flex items-center justify-between border-b border-slate-600/20 pb-2">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Environment Setup</span>
                          </div>
                          <span className="text-xs text-slate-400">20 min</span>
                        </li>
                        <li className="flex items-center justify-between border-b border-slate-600/20 pb-2">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Basic Concepts</span>
                          </div>
                          <span className="text-xs text-slate-400">25 min</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">First Exercise</span>
                          </div>
                          <span className="text-xs text-slate-400">30 min</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg overflow-hidden border border-slate-600/30">
                    <div className="bg-slate-700/50 p-4 flex items-center justify-between">
                      <h4 className="font-medium text-slate-100">Module 2: Core Concepts</h4>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">5 lessons</span>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between border-b border-slate-600/20 pb-2">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Fundamentals</span>
                          </div>
                          <span className="text-xs text-slate-400">45 min</span>
                        </li>
                        <li className="flex items-center justify-between border-b border-slate-600/20 pb-2">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Advanced Topics</span>
                          </div>
                          <span className="text-xs text-slate-400">60 min</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Practical Application</span>
                          </div>
                          <span className="text-xs text-slate-400">90 min</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Course Features */}
                <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/30 mb-6">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Course Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-100">Self-paced Learning</h4>
                        <p className="text-sm text-slate-400">Learn at your own pace, anytime</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-100">Certificate</h4>
                        <p className="text-sm text-slate-400">Earn a certificate upon completion</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Book className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-100">Comprehensive Content</h4>
                        <p className="text-sm text-slate-400">In-depth learning materials</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-100">Community Support</h4>
                        <p className="text-sm text-slate-400">Get help from peers and mentors</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      toast.success(`Enrolled in ${selectedCourse.title}!`)
                      closeCourseModal()
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Course Now
                  </button>
                  
                  <button
                    onClick={closeCourseModal}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesManager
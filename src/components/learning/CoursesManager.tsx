import React, { useState } from 'react'
import { BookOpen, Play, Clock, Star, Users, ChevronRight, Filter, Search } from 'lucide-react'
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
              {/* Course Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-orange-500/20 to-red-500/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl">{getCategoryIcon(course.category)}</span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
                {course.is_premium && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                      Premium
                    </span>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-orange-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {course.description || 'Learn the fundamentals and advanced concepts'}
                </p>

                {/* Course Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>1.2k students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleStartLearning(course)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors border border-orange-500/30"
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
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{getCategoryIcon(selectedCourse.category)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedCourse.title}</h2>
                </div>
                <button
                  onClick={closeCourseModal}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(selectedCourse.difficulty)}`}>
                  {selectedCourse.difficulty}
                </span>
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  {selectedCourse.category}
                </span>
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                  {selectedCourse.duration_hours} hours
                </span>
                {selectedCourse.is_premium && (
                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                    Premium
                  </span>
                )}
              </div>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Course Description</h3>
                <p className="text-slate-300 mb-6">{selectedCourse.description || 'No description available for this course.'}</p>
                
                <h3 className="text-lg font-semibold text-slate-100 mb-4">What You'll Learn</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300">Fundamentals and core concepts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300">Practical examples and real-world applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300">Advanced techniques and best practices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300">Hands-on projects and coding exercises</span>
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Course Curriculum</h3>
                <div className="space-y-3 mb-6">
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h4 className="font-medium text-slate-100 mb-2">Module 1: Introduction</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-slate-300">Getting Started</span>
                        </div>
                        <span className="text-xs text-slate-400">15 min</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-slate-300">Environment Setup</span>
                        </div>
                        <span className="text-xs text-slate-400">20 min</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h4 className="font-medium text-slate-100 mb-2">Module 2: Core Concepts</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-slate-300">Fundamentals</span>
                        </div>
                        <span className="text-xs text-slate-400">45 min</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-slate-300">Advanced Topics</span>
                        </div>
                        <span className="text-xs text-slate-400">60 min</span>
                      </li>
                    </ul>
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
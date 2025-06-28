import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  Layers,
  Play
} from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Course, Lesson, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const CourseAdminPanel: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: courses, loading, refetch } = useRealTimeSubscription<Course>('courses', undefined)
  const { data: lessons } = useRealTimeSubscription<Lesson>('lessons', undefined)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPublished, setFilterPublished] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showLessonsPanel, setShowLessonsPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'java',
    difficulty: 'beginner',
    duration_hours: 0,
    thumbnail_url: '',
    is_premium: false,
    is_published: true,
    order_index: 0
  })

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    video_url: '',
    order_index: 0,
    duration_minutes: 0,
    is_published: true
  })
  const [showAddLessonForm, setShowAddLessonForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'dsa', label: 'Data Structures & Algorithms' },
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'database', label: 'Database' }
  ]

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesPublished = filterPublished === 'all' || 
                            (filterPublished === 'published' && course.is_published) ||
                            (filterPublished === 'draft' && !course.is_published)
    return matchesSearch && matchesCategory && matchesPublished
  })

  // Get course lessons
  const getCourseLessons = (courseId: string) => {
    return lessons
      .filter(lesson => lesson.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index)
  }

  // Reset form
  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: 'java',
      difficulty: 'beginner',
      duration_hours: 0,
      thumbnail_url: '',
      is_premium: false,
      is_published: true,
      order_index: courses.length + 1
    })
    setEditingCourse(null)
  }

  // Reset lesson form
  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      content: '',
      video_url: '',
      order_index: getCourseLessons(selectedCourse?.id || '').length + 1,
      duration_minutes: 0,
      is_published: true
    })
    setEditingLesson(null)
  }

  // Load course for editing
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseForm({
      title: course.title,
      description: course.description || '',
      category: course.category,
      difficulty: course.difficulty,
      duration_hours: course.duration_hours,
      thumbnail_url: course.thumbnail_url || '',
      is_premium: course.is_premium,
      is_published: course.is_published,
      order_index: course.order_index
    })
    setShowAddForm(true)
  }

  // Load lesson for editing
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      order_index: lesson.order_index,
      duration_minutes: lesson.duration_minutes,
      is_published: lesson.is_published
    })
    setShowAddLessonForm(true)
  }

  // Submit course form
  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    
    setIsLoading(true)
    try {
      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            ...courseForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCourse.id)
        
        if (error) throw error
        
        toast.success('Course updated successfully!')
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert([{
            ...courseForm,
            created_by: currentUser.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        
        if (error) throw error
        
        toast.success('Course created successfully!')
      }
      
      // Reset form and refresh data
      resetForm()
      setShowAddForm(false)
      refetch()
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit lesson form
  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !selectedCourse) return
    
    setIsLoading(true)
    try {
      if (editingLesson) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            ...lessonForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLesson.id)
        
        if (error) throw error
        
        toast.success('Lesson updated successfully!')
      } else {
        // Create new lesson
        const { error } = await supabase
          .from('lessons')
          .insert([{
            ...lessonForm,
            course_id: selectedCourse.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        
        if (error) throw error
        
        toast.success('Lesson created successfully!')
      }
      
      // Reset form
      resetLessonForm()
      setShowAddLessonForm(false)
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all associated lessons and cannot be undone.')) {
      return
    }
    
    setIsLoading(true)
    try {
      // Delete course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
      
      if (error) throw error
      
      toast.success('Course deleted successfully!')
      refetch()
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This cannot be undone.')) {
      return
    }
    
    setIsLoading(true)
    try {
      // Delete lesson
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)
      
      if (error) throw error
      
      toast.success('Lesson deleted successfully!')
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle course published status
  const toggleCoursePublished = async (course: Course) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          is_published: !course.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', course.id)
      
      if (error) throw error
      
      toast.success(`Course ${course.is_published ? 'unpublished' : 'published'} successfully!`)
      refetch()
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle lesson published status
  const toggleLessonPublished = async (lesson: Lesson) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          is_published: !lesson.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', lesson.id)
      
      if (error) throw error
      
      toast.success(`Lesson ${lesson.is_published ? 'unpublished' : 'published'} successfully!`)
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Manage course lessons
  const handleManageLessons = (course: Course) => {
    setSelectedCourse(course)
    setShowLessonsPanel(true)
  }

  // Get category label
  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value
  }

  // Get difficulty label with color
  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${colors[difficulty as keyof typeof colors] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
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
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Course Management</h2>
            <p className="text-slate-400">Create, edit and manage your learning courses</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm()
                setShowAddForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
            
            <button
              onClick={refetch}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">
                  <div className="flex items-center gap-2">
                    Course
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  </div>
                </th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Category</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Difficulty</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Duration</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Lessons</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No courses found</h3>
                    <p className="text-slate-400">Try adjusting your filters or create a new course</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                          course.category === 'java' ? 'from-blue-500/30 to-blue-600/30' :
                          course.category === 'python' ? 'from-green-500/30 to-green-600/30' :
                          course.category === 'dsa' ? 'from-purple-500/30 to-purple-600/30' :
                          course.category === 'web' ? 'from-orange-500/30 to-red-500/30' :
                          course.category === 'mobile' ? 'from-cyan-500/30 to-blue-500/30' :
                          'from-slate-500/30 to-slate-600/30'
                        }`}>
                          <span className="text-lg">
                            {course.category === 'java' ? '☕' :
                             course.category === 'python' ? '🐍' :
                             course.category === 'dsa' ? '🧮' :
                             course.category === 'web' ? '🌐' :
                             course.category === 'mobile' ? '📱' :
                             course.category === 'database' ? '🗄️' : '📚'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-100">{course.title}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {course.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-300">
                        {getCategoryLabel(course.category)}
                      </span>
                    </td>
                    <td className="p-4">
                      {getDifficultyBadge(course.difficulty)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{course.duration_hours}h</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">
                          {getCourseLessons(course.id).length}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {course.is_published ? (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                            <AlertCircle className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                        {course.is_premium && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                            <Star className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/20"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleManageLessons(course)}
                          className="p-2 text-purple-400 hover:text-purple-300 transition-colors rounded-lg hover:bg-purple-500/20"
                          title="Manage Lessons"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleCoursePublished(course)}
                          className="p-2 text-orange-400 hover:text-orange-300 transition-colors rounded-lg hover:bg-orange-500/20"
                          title={course.is_published ? "Unpublish Course" : "Publish Course"}
                        >
                          {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/20"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Course Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={() => {
                    resetForm()
                    setShowAddForm(false)
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                  placeholder="Enter course description"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({...courseForm, category: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    required
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({...courseForm, difficulty: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    required
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    value={courseForm.duration_hours}
                    onChange={(e) => setCourseForm({...courseForm, duration_hours: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Order Index
                  </label>
                  <input
                    type="number"
                    value={courseForm.order_index}
                    onChange={(e) => setCourseForm({...courseForm, order_index: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({...courseForm, thumbnail_url: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={courseForm.is_premium}
                    onChange={(e) => setCourseForm({...courseForm, is_premium: e.target.checked})}
                    className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-300">Premium Course</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={courseForm.is_published}
                    onChange={(e) => setCourseForm({...courseForm, is_published: e.target.checked})}
                    className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-300">Published</span>
                </label>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {editingCourse ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCourse ? 'Update Course' : 'Create Course'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowAddForm(false)
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons Management Panel */}
      {showLessonsPanel && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    Manage Lessons: {selectedCourse.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {getCategoryLabel(selectedCourse.category)} • {selectedCourse.difficulty} • {selectedCourse.duration_hours}h
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLessonsPanel(false)
                    setSelectedCourse(null)
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-100">Course Lessons</h3>
                <button
                  onClick={() => {
                    resetLessonForm()
                    setShowAddLessonForm(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
              </div>
              
              {/* Lessons List */}
              <div className="space-y-4 mb-6">
                {getCourseLessons(selectedCourse.id).length === 0 ? (
                  <div className="bg-slate-700/30 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                    <h4 className="text-lg font-semibold text-slate-300 mb-2">No lessons yet</h4>
                    <p className="text-slate-400 mb-4">Add your first lesson to get started</p>
                    <button
                      onClick={() => {
                        resetLessonForm()
                        setShowAddLessonForm(true)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Lesson
                    </button>
                  </div>
                ) : (
                  getCourseLessons(selectedCourse.id).map((lesson, index) => (
                    <div key={lesson.id} className="bg-slate-700/30 rounded-lg border border-slate-600/30 overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-slate-200">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-100">{lesson.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration_minutes} min</span>
                              </div>
                              {lesson.video_url && (
                                <div className="flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  <span>Video</span>
                                </div>
                              )}
                              {lesson.is_published ? (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                                  <CheckCircle className="w-3 h-3" />
                                  Published
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                                  <AlertCircle className="w-3 h-3" />
                                  Draft
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/20"
                            title="Edit Lesson"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleLessonPublished(lesson)}
                            className="p-2 text-orange-400 hover:text-orange-300 transition-colors rounded-lg hover:bg-orange-500/20"
                            title={lesson.is_published ? "Unpublish Lesson" : "Publish Lesson"}
                          >
                            {lesson.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/20"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowLessonsPanel(false)
                    setSelectedCourse(null)
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            
            {/* Add/Edit Lesson Form */}
            {showAddLessonForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-100">
                        {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                      </h2>
                      <button
                        onClick={() => {
                          resetLessonForm()
                          setShowAddLessonForm(false)
                        }}
                        className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmitLesson} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="Enter lesson title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={lessonForm.content}
                        onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="Enter lesson content (markdown supported)"
                        rows={6}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Video URL
                      </label>
                      <input
                        type="text"
                        value={lessonForm.video_url}
                        onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Order Index
                        </label>
                        <input
                          type="number"
                          value={lessonForm.order_index}
                          onChange={(e) => setLessonForm({...lessonForm, order_index: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Duration (minutes) *
                        </label>
                        <input
                          type="number"
                          value={lessonForm.duration_minutes}
                          onChange={(e) => setLessonForm({...lessonForm, duration_minutes: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={lessonForm.is_published}
                          onChange={(e) => setLessonForm({...lessonForm, is_published: e.target.checked})}
                          className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-slate-300">Published</span>
                      </label>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {editingLesson ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          resetLessonForm()
                          setShowAddLessonForm(false)
                        }}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h4 className="font-semibold text-slate-100">Total Courses</h4>
          </div>
          <div className="text-2xl font-bold text-blue-400">{courses.length}</div>
          <div className="text-sm text-slate-400">{courses.filter(c => c.is_published).length} published</div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-6 h-6 text-purple-400" />
            <h4 className="font-semibold text-slate-100">Total Lessons</h4>
          </div>
          <div className="text-2xl font-bold text-purple-400">{lessons.length}</div>
          <div className="text-sm text-slate-400">{lessons.filter(l => l.is_published).length} published</div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-green-400" />
            <h4 className="font-semibold text-slate-100">Total Duration</h4>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {courses.reduce((total, course) => total + course.duration_hours, 0)}h
          </div>
          <div className="text-sm text-slate-400">
            {lessons.reduce((total, lesson) => total + lesson.duration_minutes, 0)} minutes
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <h4 className="font-semibold text-slate-100">Premium Courses</h4>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {courses.filter(c => c.is_premium).length}
          </div>
          <div className="text-sm text-slate-400">
            {Math.round((courses.filter(c => c.is_premium).length / Math.max(courses.length, 1)) * 100)}% of total
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseAdminPanel
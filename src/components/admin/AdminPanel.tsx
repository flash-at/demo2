import React, { useState } from 'react'
import { 
  Users, 
  BookOpen, 
  Code, 
  BarChart3, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Eye,
  UserX,
  Save,
  X,
  Gift,
  Target,
  Star,
  RefreshCw,
  UserPlus,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useRealTimeSubscription, importCurrentFirebaseUser } from '../../hooks/useSupabase'
import { Course, Problem, UserExtended, AdminUser, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import FirebaseUserImporter from './FirebaseUserImporter'
import toast from 'react-hot-toast'

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: courses, loading: coursesLoading } = useRealTimeSubscription<Course>('courses', undefined)
  const { data: problems, loading: problemsLoading } = useRealTimeSubscription<Problem>('problems', undefined)
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useRealTimeSubscription<UserExtended>('users_extended', undefined)
  const { data: admins, loading: adminsLoading } = useRealTimeSubscription<AdminUser>('admin_users', undefined)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'problems' | 'rewards' | 'admins' | 'import'>('overview')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'java',
    difficulty: 'beginner',
    duration_hours: 0,
    is_premium: false,
    is_published: true
  })

  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: 'arrays',
    points: 10,
    time_limit_ms: 1000,
    memory_limit_mb: 128,
    sample_input: '',
    sample_output: '',
    is_published: true
  })

  const [rewardForm, setRewardForm] = useState({
    user_id: '',
    type: 'points',
    title: '',
    description: '',
    value: 0
  })

  const loading = coursesLoading || problemsLoading || usersLoading || adminsLoading

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'import', label: 'Import Users', icon: Download },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'problems', label: 'Problems', icon: Code },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'admins', label: 'Admins', icon: Shield }
  ]

  // Course Management
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const courseData = {
        ...courseForm,
        created_by: currentUser?.uid,
        order_index: courses.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (editingItem) {
        const { error } = await supabase
          .from('courses')
          .update({ ...courseData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Course updated successfully!')
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([courseData])
        
        if (error) throw error
        toast.success('Course created successfully!')
      }

      setCourseForm({
        title: '',
        description: '',
        category: 'java',
        difficulty: 'beginner',
        duration_hours: 0,
        is_premium: false,
        is_published: true
      })
      setShowAddForm(false)
      setEditingItem(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Problem Management
  const handleProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const problemData = {
        ...problemForm,
        tags: [problemForm.category],
        test_cases: [],
        solution_template: {},
        hints: [],
        created_by: currentUser?.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (editingItem) {
        const { error } = await supabase
          .from('problems')
          .update({ ...problemData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id)
        
        if (error) throw error
        toast.success('Problem updated successfully!')
      } else {
        const { error } = await supabase
          .from('problems')
          .insert([problemData])
        
        if (error) throw error
        toast.success('Problem created successfully!')
      }

      setProblemForm({
        title: '',
        description: '',
        difficulty: 'easy',
        category: 'arrays',
        points: 10,
        time_limit_ms: 1000,
        memory_limit_mb: 128,
        sample_input: '',
        sample_output: '',
        is_published: true
      })
      setShowAddForm(false)
      setEditingItem(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Reward Management
  const handleRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const rewardData = {
        ...rewardForm,
        is_claimed: false,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('rewards')
        .insert([rewardData])
      
      if (error) throw error
      toast.success('Reward created successfully!')

      setRewardForm({
        user_id: '',
        type: 'points',
        title: '',
        description: '',
        value: 0
      })
      setShowAddForm(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${table.slice(0, -1)}?`)) return

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success(`${table.slice(0, -1)} deleted successfully!`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item)
    if (type === 'course') {
      setCourseForm({
        title: item.title,
        description: item.description || '',
        category: item.category,
        difficulty: item.difficulty,
        duration_hours: item.duration_hours,
        is_premium: item.is_premium,
        is_published: item.is_published
      })
    } else if (type === 'problem') {
      setProblemForm({
        title: item.title,
        description: item.description,
        difficulty: item.difficulty,
        category: item.category,
        points: item.points,
        time_limit_ms: item.time_limit_ms,
        memory_limit_mb: item.memory_limit_mb,
        sample_input: item.sample_input || '',
        sample_output: item.sample_output || '',
        is_published: item.is_published
      })
    }
    setShowAddForm(true)
  }

  const handleRefreshUsers = async () => {
    try {
      setIsImporting(true)
      await refetchUsers()
      toast.success('User list refreshed!')
    } catch (error) {
      console.error('Error refreshing users:', error)
      toast.error('Failed to refresh user list')
    } finally {
      setIsImporting(false)
    }
  }

  const handleImportCurrentUser = async () => {
    if (!currentUser) {
      toast.error('No current user to import')
      return
    }

    try {
      setIsImporting(true)
      await importCurrentFirebaseUser(currentUser)
      await refetchUsers()
      toast.success('Current user imported successfully!')
    } catch (error: any) {
      console.error('Error importing current user:', error)
      toast.error('Failed to import current user: ' + error.message)
    } finally {
      setIsImporting(false)
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-100">Total Users</h3>
        </div>
        <div className="text-3xl font-bold text-blue-400">{users.length}</div>
        <div className="text-sm text-slate-400 mt-2">Registered learners</div>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-green-400" />
          <h3 className="text-lg font-semibold text-slate-100">Courses</h3>
        </div>
        <div className="text-3xl font-bold text-green-400">{courses.length}</div>
        <div className="text-sm text-slate-400 mt-2">
          {courses.filter(c => c.is_published).length} published
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-8 h-8 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">Problems</h3>
        </div>
        <div className="text-3xl font-bold text-purple-400">{problems.length}</div>
        <div className="text-sm text-slate-400 mt-2">
          {problems.filter(p => p.is_published).length} published
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-100">Admins</h3>
        </div>
        <div className="text-3xl font-bold text-blue-400">{admins.length}</div>
        <div className="text-sm text-slate-400 mt-2">Active administrators</div>
      </div>
    </div>
  )

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Course Management</h3>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingItem(null)
            setCourseForm({
              title: '',
              description: '',
              category: 'java',
              difficulty: 'beginner',
              duration_hours: 0,
              is_premium: false,
              is_published: true
            })
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCourseSubmit} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-100">
              {editingItem ? 'Edit Course' : 'Add New Course'}
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setEditingItem(null)
              }}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Course title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
            
            <select
              value={courseForm.category}
              onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value as any })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="dsa">Data Structures & Algorithms</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="database">Database</option>
            </select>
          </div>

          <textarea
            placeholder="Course description"
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={courseForm.difficulty}
              onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value as any })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <input
              type="number"
              placeholder="Duration (hours)"
              value={courseForm.duration_hours}
              onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              min="0"
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={courseForm.is_premium}
                  onChange={(e) => setCourseForm({ ...courseForm, is_premium: e.target.checked })}
                  className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
                />
                Premium
              </label>
              
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={courseForm.is_published}
                  onChange={(e) => setCourseForm({ ...courseForm, is_published: e.target.checked })}
                  className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
                />
                Published
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingItem ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-100">{course.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                course.is_published 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{course.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>{course.category}</span>
              <span>{course.difficulty}</span>
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(course, 'course')}
                className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete('courses', course.id)}
                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProblems = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Problem Management</h3>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingItem(null)
            setProblemForm({
              title: '',
              description: '',
              difficulty: 'easy',
              category: 'arrays',
              points: 10,
              time_limit_ms: 1000,
              memory_limit_mb: 128,
              sample_input: '',
              sample_output: '',
              is_published: true
            })
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Problem
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleProblemSubmit} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-100">
              {editingItem ? 'Edit Problem' : 'Add New Problem'}
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setEditingItem(null)
              }}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Problem title"
              value={problemForm.title}
              onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
            
            <select
              value={problemForm.category}
              onChange={(e) => setProblemForm({ ...problemForm, category: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="arrays">Arrays</option>
              <option value="strings">Strings</option>
              <option value="linked-lists">Linked Lists</option>
              <option value="trees">Trees</option>
              <option value="graphs">Graphs</option>
              <option value="dynamic-programming">Dynamic Programming</option>
              <option value="sorting">Sorting</option>
              <option value="searching">Searching</option>
            </select>
          </div>

          <textarea
            placeholder="Problem description"
            value={problemForm.description}
            onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            rows={4}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <textarea
              placeholder="Sample input"
              value={problemForm.sample_input}
              onChange={(e) => setProblemForm({ ...problemForm, sample_input: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              rows={3}
            />
            
            <textarea
              placeholder="Sample output"
              value={problemForm.sample_output}
              onChange={(e) => setProblemForm({ ...problemForm, sample_output: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <select
              value={problemForm.difficulty}
              onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value as any })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <input
              type="number"
              placeholder="Points"
              value={problemForm.points}
              onChange={(e) => setProblemForm({ ...problemForm, points: parseInt(e.target.value) || 10 })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              min="1"
            />

            <input
              type="number"
              placeholder="Time limit (ms)"
              value={problemForm.time_limit_ms}
              onChange={(e) => setProblemForm({ ...problemForm, time_limit_ms: parseInt(e.target.value) || 1000 })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              min="100"
            />

            <input
              type="number"
              placeholder="Memory (MB)"
              value={problemForm.memory_limit_mb}
              onChange={(e) => setProblemForm({ ...problemForm, memory_limit_mb: parseInt(e.target.value) || 128 })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              min="64"
            />

            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={problemForm.is_published}
                onChange={(e) => setProblemForm({ ...problemForm, is_published: e.target.checked })}
                className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
              />
              Published
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingItem ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Problem</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Difficulty</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Category</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Points</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="font-medium text-slate-100">{problem.title}</div>
                    <div className="text-sm text-slate-400 line-clamp-1">{problem.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 capitalize">{problem.category.replace('-', ' ')}</td>
                  <td className="p-4 text-slate-300">{problem.points}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      problem.is_published 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {problem.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(problem, 'problem')}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('problems', problem.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderRewards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Reward Management</h3>
        <button
          onClick={() => {
            setShowAddForm(true)
            setRewardForm({
              user_id: '',
              type: 'points',
              title: '',
              description: '',
              value: 0
            })
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Reward
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleRewardSubmit} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-slate-100">Create New Reward</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={rewardForm.user_id}
              onChange={(e) => setRewardForm({ ...rewardForm, user_id: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.user_id}>
                  {user.username || `User ${user.user_id.slice(-4)}`}
                </option>
              ))}
            </select>
            
            <select
              value={rewardForm.type}
              onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value as any })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="points">Points</option>
              <option value="badge">Badge</option>
              <option value="premium_days">Premium Days</option>
              <option value="certificate">Certificate</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Reward title"
              value={rewardForm.title}
              onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
            
            <input
              type="number"
              placeholder="Value"
              value={rewardForm.value}
              onChange={(e) => setRewardForm({ ...rewardForm, value: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              min="0"
              required
            />
          </div>

          <textarea
            placeholder="Reward description"
            value={rewardForm.description}
            onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-4"
            rows={3}
          />

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
          >
            <Save className="w-4 h-4" />
            Create Reward
          </button>
        </form>
      )}

      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
        <p className="text-slate-400 text-center py-8">
          Reward management interface - Create and assign rewards to users for achievements and milestones.
        </p>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-100">User Management</h3>
          <p className="text-sm text-slate-400 mt-1">
            {usersLoading ? 'Loading users...' : `${users.length} registered users`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImportCurrentUser}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            <UserPlus className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
            Import Current User
          </button>
          <button
            onClick={handleRefreshUsers}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
            Refresh Users
          </button>
        </div>
      </div>

      {usersLoading ? (
        <div className="bg-slate-700/30 rounded-xl p-8 border border-slate-600/30">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-600 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-slate-700/30 rounded-xl p-12 border border-slate-600/30 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
          <h4 className="text-lg font-semibold text-slate-300 mb-2">No users found</h4>
          <p className="text-slate-400 mb-6">
            No users are currently registered in the system. Import users from Firebase to get started.
          </p>
          
          {/* Prominent call-to-action */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-400" />
              <h5 className="text-lg font-semibold text-blue-400">Getting Started</h5>
            </div>
            <p className="text-slate-300 mb-4">
              You're currently logged in as <strong>{currentUser?.displayName || currentUser?.email}</strong>. 
              Click the button below to import your Firebase user account into the system.
            </p>
            <button
              onClick={handleImportCurrentUser}
              disabled={isImporting}
              className="flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50 mx-auto text-lg font-semibold"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Import My Account
                </>
              )}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRefreshUsers}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">User</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Level</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Points</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(user.username || user.user_id || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-100">
                            {user.username || `User ${user.user_id?.slice(-4) || 'Unknown'}`}
                          </div>
                          <div className="text-sm text-slate-400 truncate max-w-[200px]">
                            {user.user_id || 'No ID'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-medium">{user.level || 1}</span>
                        <div className="w-8 h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${((user.experience_points || 0) % 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-300 font-medium">{user.total_score || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        user.is_premium 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {user.is_premium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-600/50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-600/50"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-600/50"
                          title="Suspend User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Statistics */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <h4 className="text-lg font-semibold text-slate-100">Total Users</h4>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{users.length}</div>
            <div className="text-sm text-slate-400">Registered learners</div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-yellow-400" />
              <h4 className="text-lg font-semibold text-slate-100">Premium Users</h4>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {users.filter(u => u.is_premium).length}
            </div>
            <div className="text-sm text-slate-400">
              {Math.round((users.filter(u => u.is_premium).length / users.length) * 100)}% of total
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-green-400" />
              <h4 className="text-lg font-semibold text-slate-100">Avg. Level</h4>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {Math.round(users.reduce((sum, u) => sum + (u.level || 1), 0) / users.length)}
            </div>
            <div className="text-sm text-slate-400">Average user level</div>
          </div>
        </div>
      )}
    </div>
  )

  const renderAdmins = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-100">Admin Management</h3>
      </div>

      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Admin</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Role</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Created</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-100">{admin.user_id}</div>
                        <div className="text-sm text-slate-400">Administrator</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      admin.role === 'super_admin' ? 'bg-red-500/20 text-red-400' :
                      admin.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'users': return renderUsers()
      case 'import': return <FirebaseUserImporter />
      case 'courses': return renderCourses()
      case 'problems': return renderProblems()
      case 'rewards': return renderRewards()
      case 'admins': return renderAdmins()
      default: return renderOverview()
    }
  }

  if (loading && activeTab === 'overview') {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
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
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Admin Panel</h2>
            <p className="text-slate-400">Manage users, content, and platform settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setShowAddForm(false)
                  setEditingItem(null)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'users' && users.length > 0 && (
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                    {users.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminPanel
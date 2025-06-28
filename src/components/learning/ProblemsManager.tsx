import React, { useState, useEffect } from 'react'
import { 
  Code, 
  Play, 
  Clock, 
  Trophy, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpDown, 
  Tag, 
  Star, 
  BookOpen, 
  FileText, 
  Terminal, 
  RefreshCw, 
  Download, 
  ChevronDown, 
  ChevronUp,
  BarChart,
  Zap,
  Plus,
  Save,
  X,
  Edit,
  Trash2
} from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Problem, Submission, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ProblemsManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: problems, loading, refetch } = useRealTimeSubscription<Problem>('problems', undefined)
  const { data: submissions } = useRealTimeSubscription<Submission>('submissions', undefined, currentUser?.uid)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [showProblemModal, setShowProblemModal] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'category' | 'points'>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [problemSubmissions, setProblemSubmissions] = useState<Submission[]>([])

  // Check if user is admin
  useEffect(() => {
    if (currentUser?.email) {
      const adminEmails = ['maheshch1094@gmail.com', 'admin@codecafe.com']
      setIsAdmin(adminEmails.includes(currentUser.email.toLowerCase()))
    }
  }, [currentUser])

  // Problem form state
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: 'arrays',
    tags: [] as string[],
    points: 10,
    time_limit_ms: 1000,
    memory_limit_mb: 128,
    sample_input: '',
    sample_output: '',
    is_published: true
  })

  const difficulties = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'arrays', label: 'Arrays' },
    { value: 'strings', label: 'Strings' },
    { value: 'linked-lists', label: 'Linked Lists' },
    { value: 'trees', label: 'Trees' },
    { value: 'graphs', label: 'Graphs' },
    { value: 'dynamic-programming', label: 'Dynamic Programming' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'searching', label: 'Searching' },
    { value: 'recursion', label: 'Recursion' },
    { value: 'greedy', label: 'Greedy Algorithms' },
    { value: 'backtracking', label: 'Backtracking' }
  ]

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ]

  // Sort and filter problems
  const sortedAndFilteredProblems = React.useMemo(() => {
    let filtered = problems.filter(problem => {
      const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty
      const matchesCategory = selectedCategory === 'all' || problem.category === selectedCategory
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      return matchesDifficulty && matchesCategory && matchesSearch
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
        return sortDirection === 'asc'
          ? difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
          : difficultyOrder[b.difficulty as keyof typeof difficultyOrder] - difficultyOrder[a.difficulty as keyof typeof difficultyOrder]
      } else if (sortBy === 'category') {
        return sortDirection === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category)
      } else if (sortBy === 'points') {
        return sortDirection === 'asc'
          ? a.points - b.points
          : b.points - a.points
      }
      return 0
    })
  }, [problems, selectedDifficulty, selectedCategory, searchTerm, sortBy, sortDirection])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
    }
  }

  const getProblemStatus = (problemId: string) => {
    const problemSubmissions = submissions.filter(s => s.problem_id === problemId)
    if (problemSubmissions.length === 0) return 'not-attempted'
    
    const hasAccepted = problemSubmissions.some(s => s.status === 'accepted')
    if (hasAccepted) return 'solved'
    
    return 'attempted'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'attempted': return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default: return <Code className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'wrong_answer': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'time_limit': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'runtime_error': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'compile_error': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const handleSort = (column: 'title' | 'difficulty' | 'category' | 'points') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const handleOpenProblem = (problem: Problem) => {
    setSelectedProblem(problem)
    setShowProblemModal(true)
    
    // Set default code template based on language
    const defaultCode = getDefaultCodeTemplate(problem, language)
    setCode(defaultCode)
    
    // Log analytics
    if (currentUser) {
      supabase.from('analytics').insert([{
        user_id: currentUser.uid,
        metric_name: 'problem_view',
        metric_value: 1,
        date: new Date().toISOString().split('T')[0]
      }]).then(({ error }) => {
        if (error) console.error('Error logging analytics:', error)
      })
    }
  }

  const getDefaultCodeTemplate = (problem: Problem, lang: string) => {
    const templates: Record<string, Record<string, string>> = {
      javascript: {
        default: `/**
 * Problem: ${problem.title}
 * 
 * @param {*} input - The input as described in the problem
 * @return {*} - The expected output
 */
function solution(input) {
  // Your code here
  
  return null;
}

// Example usage:
// const result = solution(${problem.sample_input || 'input'});
// console.log(result);
`
      },
      python: {
        default: `"""
Problem: ${problem.title}

Args:
    input: The input as described in the problem
Returns:
    The expected output
"""
def solution(input):
    # Your code here
    
    return None

# Example usage:
# result = solution(${problem.sample_input || 'input'})
# print(result)
`
      },
      java: {
        default: `/**
 * Problem: ${problem.title}
 */
public class Solution {
    /**
     * @param input The input as described in the problem
     * @return The expected output
     */
    public static Object solution(Object input) {
        // Your code here
        
        return null;
    }
    
    public static void main(String[] args) {
        // Example usage:
        // Object result = solution(${problem.sample_input || 'input'});
        // System.out.println(result);
    }
}
`
      },
      cpp: {
        default: `/**
 * Problem: ${problem.title}
 */
#include <iostream>
#include <vector>
#include <string>

// Your solution here
void solution() {
    // Your code here
}

int main() {
    // Example usage:
    solution();
    return 0;
}
`
      }
    }
    
    // Check if problem has a specific template for this language
    if (problem.solution_template && 
        problem.solution_template[lang]) {
      return problem.solution_template[lang]
    }
    
    // Otherwise use default template
    return templates[lang]?.default || templates.javascript.default
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    
    if (selectedProblem) {
      const newTemplate = getDefaultCodeTemplate(selectedProblem, newLanguage)
      
      // Only update code if it's still the default template or empty
      if (!code || code === getDefaultCodeTemplate(selectedProblem, language)) {
        setCode(newTemplate)
      } else if (confirm('Changing language will reset your code. Continue?')) {
        setCode(newTemplate)
      } else {
        e.preventDefault()
        setLanguage(language) // Revert selection
      }
    }
  }

  const handleSubmitSolution = async () => {
    if (!currentUser || !selectedProblem || !code.trim()) {
      toast.error('Please write your solution before submitting')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // In a real app, this would send the code to a backend for execution
      // For demo purposes, we'll simulate a submission
      
      // Random result (in a real app, this would be the actual result from running the code)
      const statuses = ['accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error']
      const randomStatus = Math.random() > 0.6 ? 'accepted' : statuses[Math.floor(Math.random() * statuses.length)]
      const testCasesPassed = randomStatus === 'accepted' ? 10 : Math.floor(Math.random() * 9) + 1
      
      // Create submission record
      const { error } = await supabase.from('submissions').insert([{
        user_id: currentUser.uid,
        problem_id: selectedProblem.id,
        language,
        code,
        status: randomStatus,
        execution_time_ms: Math.floor(Math.random() * 500) + 50,
        memory_used_mb: Math.floor(Math.random() * 64) + 16,
        test_cases_passed: testCasesPassed,
        total_test_cases: 10,
        points_earned: randomStatus === 'accepted' ? selectedProblem.points : 0,
        submitted_at: new Date().toISOString()
      }])
      
      if (error) throw error
      
      // Create activity record
      await supabase.from('activities').insert([{
        user_id: currentUser.uid,
        action: randomStatus === 'accepted' ? 'problem_solved' : 'problem_attempted',
        description: randomStatus === 'accepted' 
          ? `Solved problem "${selectedProblem.title}"` 
          : `Attempted problem "${selectedProblem.title}"`,
        metadata: { 
          problem_id: selectedProblem.id, 
          problem_title: selectedProblem.title,
          status: randomStatus
        }
      }])
      
      // If accepted, create achievement (first time only)
      if (randomStatus === 'accepted' && 
          !submissions.some(s => s.problem_id === selectedProblem.id && s.status === 'accepted')) {
        
        await supabase.from('achievements').insert([{
          user_id: currentUser.uid,
          type: 'problem_solved',
          title: 'Problem Solver',
          description: `Solved the "${selectedProblem.title}" problem`,
          points_awarded: selectedProblem.points,
          metadata: { problem_id: selectedProblem.id },
          earned_at: new Date().toISOString()
        }])
        
        // Create reward
        await supabase.from('rewards').insert([{
          user_id: currentUser.uid,
          type: 'points',
          title: 'Problem Solving Reward',
          description: `Earned ${selectedProblem.points} points for solving "${selectedProblem.title}"`,
          value: selectedProblem.points,
          is_claimed: true,
          created_at: new Date().toISOString(),
          claimed_at: new Date().toISOString()
        }])
      }
      
      toast.success(
        randomStatus === 'accepted' 
          ? `Solution accepted! You earned ${selectedProblem.points} points.` 
          : `Submission received. Status: ${randomStatus.replace('_', ' ')}`
      )
      
      // Close modal after submission
      setTimeout(() => {
        setShowProblemModal(false)
        setSelectedProblem(null)
        setCode('')
      }, 2000)
      
    } catch (error: any) {
      toast.error(`Error submitting solution: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddProblem = () => {
    setEditingProblem(null)
    setProblemForm({
      title: '',
      description: '',
      difficulty: 'easy',
      category: 'arrays',
      tags: [],
      points: 10,
      time_limit_ms: 1000,
      memory_limit_mb: 128,
      sample_input: '',
      sample_output: '',
      is_published: true
    })
    setShowAddForm(true)
  }

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem)
    setProblemForm({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      category: problem.category,
      tags: problem.tags || [],
      points: problem.points,
      time_limit_ms: problem.time_limit_ms,
      memory_limit_mb: problem.memory_limit_mb,
      sample_input: problem.sample_input || '',
      sample_output: problem.sample_output || '',
      is_published: problem.is_published
    })
    setShowAddForm(true)
  }

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Problem deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(`Error deleting problem: ${error.message}`)
    }
  }

  const handleSubmitProblemForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('You must be logged in to create or edit problems')
      return
    }
    
    try {
      const formattedTags = typeof problemForm.tags === 'string' 
        ? (problemForm.tags as string).split(',').map(tag => tag.trim()) 
        : problemForm.tags
      
      const problemData = {
        ...problemForm,
        tags: formattedTags,
        test_cases: [],
        solution_template: {},
        hints: []
      }
      
      if (editingProblem) {
        // Update existing problem
        const { error } = await supabase
          .from('problems')
          .update({
            ...problemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProblem.id)
        
        if (error) throw error
        
        toast.success('Problem updated successfully')
      } else {
        // Create new problem
        const { error } = await supabase
          .from('problems')
          .insert([{
            ...problemData,
            created_by: currentUser.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        
        if (error) throw error
        
        toast.success('Problem created successfully')
      }
      
      setShowAddForm(false)
      setEditingProblem(null)
      refetch()
    } catch (error: any) {
      toast.error(`Error saving problem: ${error.message}`)
    }
  }

  const handleViewSubmissions = async (problemId: string) => {
    try {
      // In a real app, you would fetch submissions for this problem from the backend
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('problem_id', problemId)
        .order('submitted_at', { ascending: false })
      
      if (error) throw error
      
      setProblemSubmissions(data || [])
      setShowSubmissions(true)
    } catch (error: any) {
      toast.error(`Error fetching submissions: ${error.message}`)
    }
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
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Coding Problems</h2>
            <p className="text-slate-400">Solve DSA problems and improve your programming skills</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            
            {/* Admin: Add Problem Button */}
            {isAdmin && (
              <button
                onClick={handleAddProblem}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Problem
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filters:</span>
          </div>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {submissions.filter(s => s.status === 'accepted').length}
            </div>
            <div className="text-sm text-slate-400">Solved</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {new Set(submissions.map(s => s.problem_id)).size}
            </div>
            <div className="text-sm text-slate-400">Attempted</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {submissions.reduce((sum, s) => sum + s.points_earned, 0)}
            </div>
            <div className="text-sm text-slate-400">Points</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((submissions.filter(s => s.status === 'accepted').length / Math.max(new Set(submissions.map(s => s.problem_id)).size, 1)) * 100)}%
            </div>
            <div className="text-sm text-slate-400">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">
                  <button 
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    Problem
                    {sortBy === 'title' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">
                  <button 
                    onClick={() => handleSort('difficulty')}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    Difficulty
                    {sortBy === 'difficulty' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">
                  <button 
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    Category
                    {sortBy === 'category' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">
                  <button 
                    onClick={() => handleSort('points')}
                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                  >
                    Points
                    {sortBy === 'points' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Code className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No problems found</h3>
                    <p className="text-slate-400">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredProblems.map((problem) => {
                  const status = getProblemStatus(problem.id)
                  return (
                    <tr
                      key={problem.id}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="p-4">
                        {getStatusIcon(status)}
                      </td>
                      <td className="p-4">
                        <div>
                          <h3 className="font-medium text-slate-100 hover:text-blue-400 cursor-pointer transition-colors" onClick={() => handleOpenProblem(problem)}>
                            {problem.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {problem.tags && problem.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-1.5 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded">
                                {tag}
                              </span>
                            ))}
                            {problem.tags && problem.tags.length > 3 && (
                              <span className="px-1.5 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded">
                                +{problem.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300 capitalize">
                          {problem.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-slate-300">{problem.points}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenProblem(problem)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm border border-blue-500/30"
                          >
                            <Play className="w-4 h-4" />
                            Solve
                          </button>
                          
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditProblem(problem)}
                                className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                                title="Edit Problem"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProblem(problem.id)}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                                title="Delete Problem"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Categories */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Problem Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(1).map((category) => {
            const count = problems.filter(p => p.category === category.value).length
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-4 rounded-lg border transition-colors text-center ${
                  selectedCategory === category.value
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="text-2xl mb-2">
                  {category.value === 'arrays' ? '📊' :
                   category.value === 'strings' ? '📝' :
                   category.value === 'linked-lists' ? '🔗' :
                   category.value === 'trees' ? '🌳' :
                   category.value === 'graphs' ? '🕸️' :
                   category.value === 'dynamic-programming' ? '🧩' :
                   category.value === 'sorting' ? '📋' :
                   category.value === 'searching' ? '🔍' :
                   category.value === 'recursion' ? '🔄' :
                   category.value === 'greedy' ? '🤑' :
                   category.value === 'backtracking' ? '↩️' : '⚙️'}
                </div>
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-slate-500 mt-1">{count} problems</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Problem Detail Modal */}
      {showProblemModal && selectedProblem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Problem Header */}
            <div className="p-6 border-b border-slate-700 bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedProblem.difficulty === 'easy' ? 'bg-green-500/20' :
                      selectedProblem.difficulty === 'medium' ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                    }`}>
                      {selectedProblem.difficulty === 'easy' ? 
                        <span className="text-green-400">E</span> :
                        selectedProblem.difficulty === 'medium' ?
                        <span className="text-yellow-400">M</span> :
                        <span className="text-red-400">H</span>
                      }
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{selectedProblem.title}</h2>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(selectedProblem.difficulty)}`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-sm text-slate-400 capitalize">{selectedProblem.category.replace('-', ' ')}</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">{selectedProblem.points} points</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProblemModal(false)
                    setSelectedProblem(null)
                    setCode('')
                  }}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Problem Description */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-700">
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Problem Description</h3>
                  <div className="text-slate-300 mb-6 whitespace-pre-line">{selectedProblem.description}</div>
                  
                  {selectedProblem.sample_input && (
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-slate-100 mb-2">Sample Input</h4>
                      <pre className="bg-slate-700/50 p-3 rounded-lg text-sm text-slate-300 overflow-x-auto">
                        {selectedProblem.sample_input}
                      </pre>
                    </div>
                  )}
                  
                  {selectedProblem.sample_output && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-slate-100 mb-2">Sample Output</h4>
                      <pre className="bg-slate-700/50 p-3 rounded-lg text-sm text-slate-300 overflow-x-auto">
                        {selectedProblem.sample_output}
                      </pre>
                    </div>
                  )}
                  
                  {/* Constraints */}
                  {selectedProblem.constraints && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-slate-100 mb-2">Constraints</h4>
                      <div className="bg-slate-700/50 p-3 rounded-lg text-sm text-slate-300">
                        <div dangerouslySetInnerHTML={{ __html: selectedProblem.constraints.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                  )}
                  
                  {/* Hints */}
                  {selectedProblem.hints && selectedProblem.hints.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-slate-100 mb-2">Hints</h4>
                      <div className="space-y-2">
                        {selectedProblem.hints.map((hint: string, index: number) => (
                          <div key={index} className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-sm text-slate-300">
                            <strong>Hint {index + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-slate-100 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProblem.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-full border border-slate-600/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Problem Stats */}
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 mb-6">
                    <h4 className="text-md font-semibold text-slate-100 mb-3">Problem Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-slate-400">Success Rate</div>
                        <div className="text-lg font-bold text-green-400">68%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Submissions</div>
                        <div className="text-lg font-bold text-blue-400">1,245</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Difficulty</div>
                        <div className={`text-lg font-bold ${
                          selectedProblem.difficulty === 'easy' ? 'text-green-400' :
                          selectedProblem.difficulty === 'medium' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {selectedProblem.difficulty.charAt(0).toUpperCase() + selectedProblem.difficulty.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* View Submissions Button */}
                  <button
                    onClick={() => handleViewSubmissions(selectedProblem.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg transition-colors border border-slate-600/50 mb-4"
                  >
                    <BarChart className="w-4 h-4" />
                    View Submissions
                  </button>
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-slate-300" />
                      <h3 className="font-medium text-slate-100">Solution</h3>
                    </div>
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-slate-900 overflow-y-auto">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-transparent text-slate-200 font-mono text-sm focus:outline-none resize-none"
                    placeholder="Write your solution here..."
                    spellCheck="false"
                  />
                </div>
                
                <div className="p-4 border-t border-slate-700 bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Time Limit: {selectedProblem.time_limit_ms}ms</span>
                      <span className="mx-2">|</span>
                      <span>Memory Limit: {selectedProblem.memory_limit_mb}MB</span>
                    </div>
                    <button
                      onClick={handleSubmitSolution}
                      disabled={isSubmitting || !code.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Submit Solution
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Problem Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">
                  {editingProblem ? 'Edit Problem' : 'Add New Problem'}
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitProblemForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({...problemForm, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="Enter problem title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({...problemForm, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="Enter problem description"
                  rows={6}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={problemForm.difficulty}
                    onChange={(e) => setProblemForm({...problemForm, difficulty: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  >
                    {difficulties.slice(1).map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={problemForm.category}
                    onChange={(e) => setProblemForm({...problemForm, category: e.target.value as any})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={typeof problemForm.tags === 'string' ? problemForm.tags : problemForm.tags.join(', ')}
                  onChange={(e) => setProblemForm({...problemForm, tags: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="arrays, sorting, two-pointer"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    value={problemForm.points}
                    onChange={(e) => setProblemForm({...problemForm, points: parseInt(e.target.value) || 10})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time Limit (ms)
                  </label>
                  <input
                    type="number"
                    value={problemForm.time_limit_ms}
                    onChange={(e) => setProblemForm({...problemForm, time_limit_ms: parseInt(e.target.value) || 1000})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    min="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Memory Limit (MB)
                  </label>
                  <input
                    type="number"
                    value={problemForm.memory_limit_mb}
                    onChange={(e) => setProblemForm({...problemForm, memory_limit_mb: parseInt(e.target.value) || 128})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    min="16"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sample Input
                  </label>
                  <textarea
                    value={problemForm.sample_input}
                    onChange={(e) => setProblemForm({...problemForm, sample_input: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="Example input"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sample Output
                  </label>
                  <textarea
                    value={problemForm.sample_output}
                    onChange={(e) => setProblemForm({...problemForm, sample_output: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="Example output"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={problemForm.is_published}
                    onChange={(e) => setProblemForm({...problemForm, is_published: e.target.checked})}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-300">Published</span>
                </label>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingProblem ? 'Update Problem' : 'Create Problem'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">Submissions</h2>
                <button
                  onClick={() => setShowSubmissions(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {problemSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">No submissions yet</h3>
                  <p className="text-slate-400">Be the first to submit a solution!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {problemSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-slate-700/30 rounded-lg border border-slate-600/30 overflow-hidden">
                      <div className="p-4 border-b border-slate-600/30 bg-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(submission.status)}`}>
                              {submission.status === 'accepted' ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Accepted</span>
                                </div>
                              ) : submission.status === 'wrong_answer' ? (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Wrong Answer</span>
                                </div>
                              ) : (
                                submission.status.replace('_', ' ')
                              )}
                            </div>
                            <span className="text-sm text-slate-300">
                              {new Date(submission.submitted_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>{submission.execution_time_ms}ms</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-400">
                              <BarChart className="w-4 h-4" />
                              <span>{submission.memory_used_mb}MB</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-400">
                              <Tag className="w-4 h-4" />
                              <span>{submission.language}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-300">
                              {submission.test_cases_passed}/{submission.total_test_cases} test cases passed
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-slate-300">
                              {submission.points_earned} points earned
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg">
                          <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                            {submission.code}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSubmissions(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Problem Difficulty Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Difficulty Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Easy</span>
                </div>
                <span className="text-sm text-slate-400">
                  {problems.filter(p => p.difficulty === 'easy').length} problems
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full"
                  style={{ width: `${(problems.filter(p => p.difficulty === 'easy').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Medium</span>
                </div>
                <span className="text-sm text-slate-400">
                  {problems.filter(p => p.difficulty === 'medium').length} problems
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${(problems.filter(p => p.difficulty === 'medium').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Hard</span>
                </div>
                <span className="text-sm text-slate-400">
                  {problems.filter(p => p.difficulty === 'hard').length} problems
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full"
                  style={{ width: `${(problems.filter(p => p.difficulty === 'hard').length / problems.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Your Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">
                  {Math.round((submissions.filter(s => s.status === 'accepted').length / problems.length) * 100)}%
                </span>
              </div>
              <div>
                <div className="text-sm text-slate-400">Completion Rate</div>
                <div className="text-lg font-semibold text-slate-100">
                  {submissions.filter(s => s.status === 'accepted').length} / {problems.length} problems
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                style={{ width: `${(submissions.filter(s => s.status === 'accepted').length / problems.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-sm text-slate-400">Easy</div>
                <div className="text-lg font-semibold text-green-400">
                  {submissions.filter(s => 
                    s.status === 'accepted' && 
                    problems.find(p => p.id === s.problem_id)?.difficulty === 'easy'
                  ).length} / {problems.filter(p => p.difficulty === 'easy').length}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-sm text-slate-400">Medium</div>
                <div className="text-lg font-semibold text-yellow-400">
                  {submissions.filter(s => 
                    s.status === 'accepted' && 
                    problems.find(p => p.id === s.problem_id)?.difficulty === 'medium'
                  ).length} / {problems.filter(p => p.difficulty === 'medium').length}
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <div className="text-sm text-slate-400">Hard</div>
                <div className="text-lg font-semibold text-red-400">
                  {submissions.filter(s => 
                    s.status === 'accepted' && 
                    problems.find(p => p.id === s.problem_id)?.difficulty === 'hard'
                  ).length} / {problems.filter(p => p.difficulty === 'hard').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Recommended Next</h3>
          {problems.length > 0 ? (
            <div className="space-y-3">
              {problems
                .filter(p => getProblemStatus(p.id) === 'not-attempted')
                .slice(0, 3)
                .map(problem => (
                  <div 
                    key={problem.id}
                    className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenProblem(problem)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-100">{problem.title}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 capitalize">{problem.category.replace('-', ' ')}</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-slate-300">{problem.points} points</span>
                      </div>
                    </div>
                  </div>
                ))}
              
              <button
                onClick={() => {
                  // Find a random unsolved problem
                  const unsolvedProblems = problems.filter(p => getProblemStatus(p.id) === 'not-attempted')
                  if (unsolvedProblems.length > 0) {
                    const randomProblem = unsolvedProblems[Math.floor(Math.random() * unsolvedProblems.length)]
                    handleOpenProblem(randomProblem)
                  } else {
                    toast.success('Congratulations! You\'ve attempted all problems.')
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors mt-4"
              >
                <Zap className="w-4 h-4" />
                Random Problem
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <p className="text-slate-400">No problems available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProblemsManager
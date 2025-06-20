import React, { useState } from 'react'
import { Code, Play, Clock, Trophy, Filter, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Problem, Submission } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const ProblemsManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: problems, loading } = useRealTimeSubscription<Problem>('problems', undefined)
  const { data: submissions } = useRealTimeSubscription<Submission>('submissions', undefined, currentUser?.uid)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)

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
    { value: 'searching', label: 'Searching' }
  ]

  const filteredProblems = problems.filter(problem => {
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || problem.category === selectedCategory
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDifficulty && matchesCategory && matchesSearch
  })

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
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search problems..."
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
                <th className="text-left p-4 text-sm font-medium text-slate-300">Problem</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Difficulty</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Category</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Points</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Code className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No problems found</h3>
                    <p className="text-slate-400">Try adjusting your filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => {
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
                          <h3 className="font-medium text-slate-100 hover:text-orange-400 cursor-pointer transition-colors">
                            {problem.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                            {problem.description}
                          </p>
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
                        <button
                          onClick={() => setSelectedProblem(problem)}
                          className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors text-sm border border-orange-500/30"
                        >
                          <Play className="w-4 h-4" />
                          Solve
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedProblem.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(selectedProblem.difficulty)}`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="text-sm text-slate-400">{selectedProblem.category}</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">{selectedProblem.points} points</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Problem Description</h3>
                <p className="text-slate-300 mb-6">{selectedProblem.description}</p>
                
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
                
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors border border-green-500/30">
                    <Code className="w-4 h-4" />
                    Start Coding
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg transition-colors border border-slate-600/50">
                    <Clock className="w-4 h-4" />
                    View Submissions
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

export default ProblemsManager
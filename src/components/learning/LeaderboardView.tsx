import React, { useState } from 'react'
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Target, Award } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { LeaderboardEntry, UserExtended } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const LeaderboardView: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: leaderboard, loading } = useRealTimeSubscription<LeaderboardEntry>('leaderboard', undefined)
  const { data: users } = useRealTimeSubscription<UserExtended>('users_extended', undefined)
  const [selectedCategory, setSelectedCategory] = useState<string>('overall')

  const categories = [
    { value: 'overall', label: 'Overall', icon: Trophy },
    { value: 'weekly', label: 'This Week', icon: TrendingUp },
    { value: 'monthly', label: 'This Month', icon: Star },
    { value: 'dsa', label: 'DSA Problems', icon: Target },
    { value: 'java', label: 'Java', icon: Award },
    { value: 'python', label: 'Python', icon: Medal }
  ]

  const filteredLeaderboard = leaderboard
    .filter(entry => entry.category === selectedCategory)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  const getUserData = (userId: string) => {
    return users.find(user => user.user_id === userId)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Award className="w-6 h-6 text-amber-600" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30'
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30'
      default: return 'bg-slate-700/30 border-slate-600/30'
    }
  }

  const currentUserRank = filteredLeaderboard.findIndex(entry => entry.user_id === currentUser?.uid) + 1

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
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
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Leaderboard</h2>
            <p className="text-slate-400">See how you rank against other learners</p>
          </div>
          
          {currentUserRank > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">#{currentUserRank}</div>
                <div className="text-sm text-slate-400">Your Rank</div>
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Top 3 Podium */}
      {filteredLeaderboard.length >= 3 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-6 text-center">Top Performers</h3>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🥈</span>
              </div>
              <div className="bg-gray-400/20 border border-gray-400/30 rounded-lg p-4 min-w-[120px]">
                <div className="font-semibold text-slate-100">
                  {getUserData(filteredLeaderboard[1]?.user_id)?.username || 'User'}
                </div>
                <div className="text-sm text-slate-400">{filteredLeaderboard[1]?.score} pts</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-3xl">👑</span>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 min-w-[120px]">
                <div className="font-semibold text-slate-100">
                  {getUserData(filteredLeaderboard[0]?.user_id)?.username || 'User'}
                </div>
                <div className="text-sm text-slate-400">{filteredLeaderboard[0]?.score} pts</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🥉</span>
              </div>
              <div className="bg-amber-600/20 border border-amber-600/30 rounded-lg p-4 min-w-[120px]">
                <div className="font-semibold text-slate-100">
                  {getUserData(filteredLeaderboard[2]?.user_id)?.username || 'User'}
                </div>
                <div className="text-sm text-slate-400">{filteredLeaderboard[2]?.score} pts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100">Full Rankings</h3>
        </div>
        
        <div className="divide-y divide-slate-700/30">
          {filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No rankings yet</h3>
              <p className="text-slate-400">Start solving problems to appear on the leaderboard!</p>
            </div>
          ) : (
            filteredLeaderboard.map((entry, index) => {
              const rank = index + 1
              const userData = getUserData(entry.user_id)
              const isCurrentUser = entry.user_id === currentUser?.uid
              
              return (
                <div
                  key={entry.id}
                  className={`p-4 hover:bg-slate-700/20 transition-colors ${
                    isCurrentUser ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {(userData?.username || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-100">
                            {userData?.username || `User ${entry.user_id.slice(-4)}`}
                            {isCurrentUser && (
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400">
                            Level {userData?.level || 1} • {entry.problems_solved} problems solved
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-100">{entry.score}</div>
                      <div className="text-sm text-slate-400">points</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <div className="text-2xl font-bold text-slate-100 mb-2">
            {filteredLeaderboard.length}
          </div>
          <div className="text-slate-400">Total Participants</div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <div className="text-2xl font-bold text-slate-100 mb-2">
            {filteredLeaderboard.reduce((sum, entry) => sum + entry.problems_solved, 0)}
          </div>
          <div className="text-slate-400">Problems Solved</div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <div className="text-2xl font-bold text-slate-100 mb-2">
            {Math.round(filteredLeaderboard.reduce((sum, entry) => sum + entry.score, 0) / Math.max(filteredLeaderboard.length, 1))}
          </div>
          <div className="text-slate-400">Average Score</div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardView
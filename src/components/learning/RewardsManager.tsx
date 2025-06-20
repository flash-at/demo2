import React, { useState } from 'react'
import { Gift, Star, Trophy, Award, Crown, Target, Zap, Calendar } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Reward, Achievement } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const RewardsManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: rewards, loading: rewardsLoading } = useRealTimeSubscription<Reward>('rewards', undefined, currentUser?.uid)
  const { data: achievements, loading: achievementsLoading } = useRealTimeSubscription<Achievement>('achievements', undefined, currentUser?.uid)
  const [activeTab, setActiveTab] = useState<'rewards' | 'achievements'>('rewards')

  const loading = rewardsLoading || achievementsLoading

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points': return <Star className="w-6 h-6 text-yellow-400" />
      case 'badge': return <Award className="w-6 h-6 text-purple-400" />
      case 'premium_days': return <Crown className="w-6 h-6 text-orange-400" />
      case 'certificate': return <Trophy className="w-6 h-6 text-green-400" />
      default: return <Gift className="w-6 h-6 text-blue-400" />
    }
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'problem_solved': return <Target className="w-6 h-6 text-green-400" />
      case 'streak': return <Zap className="w-6 h-6 text-yellow-400" />
      case 'course_completed': return <Trophy className="w-6 h-6 text-blue-400" />
      case 'level_up': return <Crown className="w-6 h-6 text-purple-400" />
      case 'first_submission': return <Star className="w-6 h-6 text-orange-400" />
      case 'perfect_score': return <Award className="w-6 h-6 text-red-400" />
      default: return <Gift className="w-6 h-6 text-slate-400" />
    }
  }

  const totalPoints = rewards
    .filter(r => r.type === 'points' && r.is_claimed)
    .reduce((sum, r) => sum + r.value, 0)

  const unclaimedRewards = rewards.filter(r => !r.is_claimed)

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Rewards & Achievements</h2>
            <p className="text-slate-400">Track your progress and claim your rewards</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-sm text-slate-400">Total Points</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{achievements.length}</div>
              <div className="text-sm text-slate-400">Achievements</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'rewards'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
            }`}
          >
            <Gift className="w-4 h-4" />
            Rewards ({unclaimedRewards.length} unclaimed)
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'achievements'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Achievements ({achievements.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'rewards' ? (
        <div className="space-y-6">
          {/* Unclaimed Rewards */}
          {unclaimedRewards.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Unclaimed Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unclaimedRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 hover:scale-105 transition-transform"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {getRewardIcon(reward.type)}
                      <div>
                        <h4 className="font-semibold text-slate-100">{reward.title}</h4>
                        <p className="text-sm text-slate-400">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-400">
                        {reward.type === 'points' ? `+${reward.value}` : reward.value}
                        {reward.type === 'points' && ' pts'}
                        {reward.type === 'premium_days' && ' days'}
                      </span>
                      <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30 hover:bg-green-500/30 transition-colors">
                        Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Rewards */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">All Rewards</h3>
            {rewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                <h4 className="text-lg font-semibold text-slate-300 mb-2">No rewards yet</h4>
                <p className="text-slate-400">Complete tasks and solve problems to earn rewards!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`rounded-lg p-4 border transition-all ${
                      reward.is_claimed
                        ? 'bg-slate-700/30 border-slate-600/30 opacity-75'
                        : 'bg-slate-700/50 border-slate-600/50 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {getRewardIcon(reward.type)}
                      <div>
                        <h4 className="font-semibold text-slate-100">{reward.title}</h4>
                        <p className="text-sm text-slate-400">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-300">
                        {reward.type === 'points' ? `+${reward.value}` : reward.value}
                        {reward.type === 'points' && ' pts'}
                        {reward.type === 'premium_days' && ' days'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        reward.is_claimed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {reward.is_claimed ? 'Claimed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Your Achievements</h3>
          {achievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
              <h4 className="text-lg font-semibold text-slate-300 mb-2">No achievements yet</h4>
              <p className="text-slate-400">Start learning and solving problems to unlock achievements!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {getAchievementIcon(achievement.type)}
                    <div>
                      <h4 className="font-semibold text-slate-100">{achievement.title}</h4>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-400">
                      +{achievement.points_awarded} pts
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RewardsManager
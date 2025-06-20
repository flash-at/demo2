import React, { useState } from 'react'
import { Gift, Star, Trophy, Award, Crown, Target, Zap, Calendar, DollarSign, CreditCard, Banknote, Wallet } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { Reward, Achievement, RedemptionRequest, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const RewardsManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: rewards, loading: rewardsLoading } = useRealTimeSubscription<Reward>('rewards', undefined, currentUser?.uid)
  const { data: achievements, loading: achievementsLoading } = useRealTimeSubscription<Achievement>('achievements', undefined, currentUser?.uid)
  const { data: redemptions, loading: redemptionsLoading } = useRealTimeSubscription<RedemptionRequest>('redemption_requests', undefined, currentUser?.uid)
  const [activeTab, setActiveTab] = useState<'rewards' | 'achievements' | 'redeem'>('rewards')
  const [showRedeemForm, setShowRedeemForm] = useState(false)
  const [redemptionForm, setRedemptionForm] = useState({
    type: 'cash' as 'cash' | 'gift_voucher' | 'paypal' | 'bank_transfer',
    points: 100,
    paymentDetails: {
      paypalEmail: '',
      bankAccount: '',
      accountHolder: '',
      routingNumber: '',
      voucherType: 'amazon'
    }
  })

  const loading = rewardsLoading || achievementsLoading || redemptionsLoading

  // Calculate total points from rewards
  const totalPoints = rewards
    .filter(r => r.type === 'points' && r.is_claimed)
    .reduce((sum, r) => sum + r.value, 0)

  const unclaimedRewards = rewards.filter(r => !r.is_claimed)

  // Redemption rates (points to cash)
  const redemptionRates = {
    cash: 0.01, // 100 points = $1
    gift_voucher: 0.012, // 100 points = $1.20 in gift vouchers
    paypal: 0.01,
    bank_transfer: 0.009 // 100 points = $0.90 (lower due to fees)
  }

  const handleRedemption = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('Please log in to redeem points')
      return
    }

    if (redemptionForm.points < 100) {
      toast.error('Minimum redemption is 100 points')
      return
    }

    if (redemptionForm.points > totalPoints) {
      toast.error('Insufficient points for redemption')
      return
    }

    try {
      const cashValue = redemptionForm.points * redemptionRates[redemptionForm.type]
      
      const redemptionData = {
        user_id: currentUser.uid,
        redemption_type: redemptionForm.type,
        points_used: redemptionForm.points,
        cash_value: cashValue,
        payment_details: {
          ...redemptionForm.paymentDetails,
          userEmail: currentUser.email,
          userName: currentUser.displayName
        },
        status: 'pending',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('redemption_requests')
        .insert([redemptionData])

      if (error) throw error

      toast.success('Redemption request submitted successfully! We will process it within 3-5 business days.')
      setShowRedeemForm(false)
      setRedemptionForm({
        type: 'cash',
        points: 100,
        paymentDetails: {
          paypalEmail: '',
          bankAccount: '',
          accountHolder: '',
          routingNumber: '',
          voucherType: 'amazon'
        }
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

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

  const getRedemptionIcon = (type: string) => {
    switch (type) {
      case 'cash': return <DollarSign className="w-5 h-5 text-green-400" />
      case 'gift_voucher': return <Gift className="w-5 h-5 text-purple-400" />
      case 'paypal': return <Wallet className="w-5 h-5 text-blue-400" />
      case 'bank_transfer': return <CreditCard className="w-5 h-5 text-orange-400" />
      default: return <Banknote className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'approved': return 'bg-blue-500/20 text-blue-400'
      case 'processing': return 'bg-purple-500/20 text-purple-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

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
            <p className="text-slate-400">Track your progress and redeem points for real cash</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-sm text-slate-400">Total Points</div>
              <div className="text-xs text-green-400 mt-1">≈ ${(totalPoints * 0.01).toFixed(2)}</div>
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
          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'redeem'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Redeem Points
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
      ) : activeTab === 'achievements' ? (
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
      ) : (
        <div className="space-y-6">
          {/* Redemption Options */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Redeem Points for Real Cash</h3>
                <p className="text-slate-400">Convert your points to cash, gift vouchers, or PayPal payments</p>
              </div>
              <button
                onClick={() => setShowRedeemForm(true)}
                disabled={totalPoints < 100}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-4 h-4" />
                Redeem Now
              </button>
            </div>

            {/* Redemption Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(redemptionRates).map(([type, rate]) => (
                <div key={type} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center gap-3 mb-2">
                    {getRedemptionIcon(type)}
                    <h4 className="font-semibold text-slate-100 capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                  </div>
                  <div className="text-sm text-slate-400">
                    100 points = ${rate.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Your {totalPoints} pts = ${(totalPoints * rate).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {totalPoints < 100 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  You need at least 100 points to redeem. You currently have {totalPoints} points.
                  Complete more tasks and solve problems to earn points!
                </p>
              </div>
            )}
          </div>

          {/* Redemption Form */}
          {showRedeemForm && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Redeem Points</h3>
              
              <form onSubmit={handleRedemption} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Redemption Type</label>
                    <select
                      value={redemptionForm.type}
                      onChange={(e) => setRedemptionForm({ ...redemptionForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    >
                      <option value="cash">Cash (Bank Transfer)</option>
                      <option value="paypal">PayPal</option>
                      <option value="gift_voucher">Gift Voucher</option>
                      <option value="bank_transfer">Direct Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Points to Redeem</label>
                    <input
                      type="number"
                      min="100"
                      max={totalPoints}
                      step="10"
                      value={redemptionForm.points}
                      onChange={(e) => setRedemptionForm({ ...redemptionForm, points: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Cash value: ${(redemptionForm.points * redemptionRates[redemptionForm.type]).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                {redemptionForm.type === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">PayPal Email</label>
                    <input
                      type="email"
                      value={redemptionForm.paymentDetails.paypalEmail}
                      onChange={(e) => setRedemptionForm({
                        ...redemptionForm,
                        paymentDetails: { ...redemptionForm.paymentDetails, paypalEmail: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                )}

                {redemptionForm.type === 'bank_transfer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        value={redemptionForm.paymentDetails.accountHolder}
                        onChange={(e) => setRedemptionForm({
                          ...redemptionForm,
                          paymentDetails: { ...redemptionForm.paymentDetails, accountHolder: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Bank Account Number</label>
                      <input
                        type="text"
                        value={redemptionForm.paymentDetails.bankAccount}
                        onChange={(e) => setRedemptionForm({
                          ...redemptionForm,
                          paymentDetails: { ...redemptionForm.paymentDetails, bankAccount: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {redemptionForm.type === 'gift_voucher' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Voucher Type</label>
                    <select
                      value={redemptionForm.paymentDetails.voucherType}
                      onChange={(e) => setRedemptionForm({
                        ...redemptionForm,
                        paymentDetails: { ...redemptionForm.paymentDetails, voucherType: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500"
                    >
                      <option value="amazon">Amazon Gift Card</option>
                      <option value="google_play">Google Play Gift Card</option>
                      <option value="apple">Apple Gift Card</option>
                      <option value="steam">Steam Gift Card</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    Submit Redemption Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRedeemForm(false)}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600/50 hover:bg-slate-700/70 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Redemption History */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Redemption History</h3>
            {redemptions.length === 0 ? (
              <div className="text-center py-8">
                <Banknote className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="text-slate-400">No redemption requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map((redemption) => (
                  <div key={redemption.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      {getRedemptionIcon(redemption.redemption_type)}
                      <div>
                        <p className="font-medium text-slate-100">
                          {redemption.points_used} points → ${redemption.cash_value.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-400 capitalize">
                          {redemption.redemption_type.replace('_', ' ')} • {new Date(redemption.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(redemption.status)}`}>
                      {redemption.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RewardsManager
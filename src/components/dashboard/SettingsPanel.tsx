import React, { useState } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save, 
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface UserSettings {
  profile: {
    displayName: string
    email: string
    bio: string
    location: string
    website: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    taskReminders: boolean
    achievementAlerts: boolean
    weeklyDigest: boolean
    soundEnabled: boolean
  }
  appearance: {
    theme: 'dark' | 'light' | 'auto'
    language: string
    timezone: string
    compactMode: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showActivity: boolean
    showAchievements: boolean
    allowMessages: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    loginAlerts: boolean
  }
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'privacy' | 'security'>('profile')
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      bio: '',
      location: '',
      website: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      achievementAlerts: true,
      weeklyDigest: false,
      soundEnabled: true
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      compactMode: false
    },
    privacy: {
      profileVisibility: 'public',
      showActivity: true,
      showAchievements: true,
      allowMessages: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleSave = () => {
    // Here you would typically save to your backend/database
    toast.success('Settings saved successfully!')
    onClose()
  }

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Profile Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
            <input
              type="text"
              value={settings.profile.displayName}
              onChange={(e) => updateSettings('profile', 'displayName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={settings.profile.email}
              disabled
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed from settings</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea
              value={settings.profile.bio}
              onChange={(e) => updateSettings('profile', 'bio', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={settings.profile.location}
                onChange={(e) => updateSettings('profile', 'location', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
              <input
                type="url"
                value={settings.profile.website}
                onChange={(e) => updateSettings('profile', 'website', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-slate-100 font-medium">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => updateSettings('notifications', 'emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-slate-100 font-medium">Push Notifications</p>
                <p className="text-sm text-slate-400">Receive push notifications in browser</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => updateSettings('notifications', 'pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-slate-100 font-medium">Task Reminders</p>
                <p className="text-sm text-slate-400">Get reminded about due tasks</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.taskReminders}
                onChange={(e) => updateSettings('notifications', 'taskReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center gap-3">
              {settings.notifications.soundEnabled ? 
                <Volume2 className="w-5 h-5 text-purple-400" /> : 
                <VolumeX className="w-5 h-5 text-slate-400" />
              }
              <div>
                <p className="text-slate-100 font-medium">Sound Effects</p>
                <p className="text-sm text-slate-400">Play sounds for notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.soundEnabled}
                onChange={(e) => updateSettings('notifications', 'soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Appearance Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'auto', label: 'Auto', icon: Globe }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSettings('appearance', 'theme', value)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    settings.appearance.theme === value
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/20'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select
              value={settings.appearance.language}
              onChange={(e) => updateSettings('appearance', 'language', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={settings.appearance.timezone}
              onChange={(e) => updateSettings('appearance', 'timezone', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Kolkata">India Standard Time</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <p className="text-slate-100 font-medium">Compact Mode</p>
              <p className="text-sm text-slate-400">Use smaller spacing and elements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appearance.compactMode}
                onChange={(e) => updateSettings('appearance', 'compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Privacy Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Profile Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'public', label: 'Public', icon: Globe },
                { value: 'private', label: 'Private', icon: Lock }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSettings('privacy', 'profileVisibility', value)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    settings.privacy.profileVisibility === value
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/20'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <div>
                <p className="text-slate-100 font-medium">Show Activity</p>
                <p className="text-sm text-slate-400">Let others see your recent activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.showActivity}
                  onChange={(e) => updateSettings('privacy', 'showActivity', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <div>
                <p className="text-slate-100 font-medium">Show Achievements</p>
                <p className="text-sm text-slate-400">Display your achievements publicly</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.showAchievements}
                  onChange={(e) => updateSettings('privacy', 'showAchievements', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <p className="text-slate-100 font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-slate-400">Add an extra layer of security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => updateSettings('security', 'twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout (minutes)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={0}>Never</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div>
              <p className="text-slate-100 font-medium">Login Alerts</p>
              <p className="text-sm text-slate-400">Get notified of new login attempts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.loginAlerts}
                onChange={(e) => updateSettings('security', 'loginAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfile()
      case 'notifications': return renderNotifications()
      case 'appearance': return renderAppearance()
      case 'privacy': return renderPrivacy()
      case 'security': return renderSecurity()
      default: return renderProfile()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-700/50 p-4 bg-slate-800/30">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                      activeTab === tab.id
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-800/50">
          <p className="text-sm text-slate-400">
            Changes are saved automatically
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-300 hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-700/50 border border-slate-600/30"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-all duration-200 hover:scale-105 shadow-lg shadow-orange-500/10"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
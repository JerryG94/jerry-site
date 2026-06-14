import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Edit2, Save, X, Globe, Calendar } from 'lucide-react'
import { getUserProfile, updateProfile } from '../api/user'

export default function UserProfile({ user, onClose }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    avatar: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await getUserProfile(user.id)
      setProfile(data.user)
      setFormData({
        bio: data.user.bio || '',
        avatar: data.user.avatar || ''
      })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setProfile(prev => ({ ...prev, ...formData }))
      setEditing(false)
    } catch (err) {
      alert('更新失败')
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">请先登录</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 
                        flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <User size={24} className="text-blue-500" />
          </motion.div>
        </div>
        <p className="text-sm text-slate-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          个人中心
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-3xl p-8">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                        flex items-center justify-center shadow-lg shadow-blue-500/25">
          <User size={48} className="text-white" />
        </div>

        {/* Username */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {profile?.username}
        </h2>

        {/* Bio */}
        <div className="text-center mb-6">
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="写一段个人简介..."
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl 
                         border border-slate-200/50 dark:border-slate-700/50
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                         transition-all text-sm resize-none"
              rows={3}
            />
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              {profile?.bio || '暂无个人简介'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {profile?.website_count || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">收录网站</div>
          </div>
          <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              0
            </div>
            <div className="text-xs text-slate-500 mt-1">收藏</div>
          </div>
          <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {profile?.created_at ? new Date(profile.created_at).getFullYear() : '-'}
            </div>
            <div className="text-xs text-slate-500 mt-1">加入年份</div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-center gap-3">
          {editing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white 
                           rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors"
              >
                <Save size={16} />
                保存
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 dark:bg-slate-700 
                           rounded-xl font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 
                           transition-colors"
              >
                <X size={16} />
                取消
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 dark:bg-slate-700 
                         rounded-xl font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 
                         transition-colors"
            >
              <Edit2 size={16} />
              编辑资料
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

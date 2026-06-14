import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { register, login } from '../api/auth'

export default function LoginModal({ onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = '请输入邮箱'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位'
    }

    if (!isLogin && !formData.username) {
      newErrors.username = '请输入用户名'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setApiError('')
    
    try {
      let response
      if (isLogin) {
        response = await login(formData.email, formData.password)
      } else {
        response = await register(formData.username, formData.email, formData.password)
      }
      
      // Save token and user data
      localStorage.setItem('glj_token', response.token)
      localStorage.setItem('glj_user', JSON.stringify(response.user))
      
      // Call onLogin callback
      onLogin(response.user)
    } catch (error) {
      setApiError(error.response?.data?.error || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 
                   bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-3xl p-8 
                     shadow-2xl shadow-blue-500/10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl 
                       hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                       transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl 
                            bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center
                            shadow-lg shadow-blue-500/25">
              <User size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isLogin ? '登录以保存您的收藏' : '注册以加入资源社区'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium mb-1.5">用户名</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="请输入用户名"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 
                                 rounded-xl border border-slate-200/50 dark:border-slate-700/50
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                                 transition-all text-sm"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5">邮箱</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 
                             rounded-xl border border-slate-200/50 dark:border-slate-700/50
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                             transition-all text-sm"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 
                             rounded-xl border border-slate-200/50 dark:border-slate-700/50
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                             transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                         text-white rounded-xl font-medium text-sm
                         hover:shadow-lg hover:shadow-blue-500/25 
                         transition-all duration-300 mt-6
                         ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </motion.button>

            {/* API Error */}
            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 text-center mt-3"
              >
                {apiError}
              </motion.p>
            )}
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors({})
                  setFormData({ username: '', email: '', password: '' })
                }}
                className="ml-1 text-blue-600 dark:text-blue-400 
                           hover:underline font-medium"
              >
                {isLogin ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">或通过以下方式</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Social Login (Mock) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 
                         bg-slate-100 dark:bg-slate-800 
                         rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 
                         transition-colors text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.2 1.52-1.21 2.82-2.96 3.55v2.75h4.5c1.47-1.35 2.48-3.43 2.48-5.54z"/>
                <path fill="#34A853" d="M12.255 24c2.91 0 5.34-.95 7.12-2.56l-3.5-2.75c-.95.65-2.17 1.03-3.62 1.03-2.75 0-5.09-1.83-5.92-4.29h-3.69v2.84C4.03 21.71 7.91 24 12.26 24z"/>
                <path fill="#FBBC05" d="M6.335 14.43c-.2-.65-.31-1.35-.31-2.07s.11-1.42.31-2.07v-2.84h-3.69a11.96 11.96 0 000 9.82l3.69-2.84z"/>
                <path fill="#EA4335" d="M12.255 6.54c1.56 0 2.91.54 3.99 1.58l2.82-2.82C17.58 3.65 15.15 2.43 12.26 2.43c-4.35 0-8.23 2.29-10.39 5.71l3.69 2.84c.83-2.46 3.17-4.54 5.92-4.54z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 
                         bg-slate-100 dark:bg-slate-800 
                         rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 
                         transition-colors text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

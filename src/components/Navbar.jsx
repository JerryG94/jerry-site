import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User, 
  LogOut,
  ChevronDown,
  Bookmark,
  Settings,
  Eye
} from 'lucide-react'

export default function Navbar({ 
  isDark, 
  setIsDark, 
  user, 
  onLoginClick, 
  onLogout,
  sidebarOpen,
  setSidebarOpen 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const [searchParams, setSearchParams] = useSearchParams()
  const debounceRef = useRef(null)

  // Sync local input with URL search param on mount/route change
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    // Debounce URL update
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (val.trim()) {
        params.set('search', val.trim())
      } else {
        params.delete('search')
      }
      setSearchParams(params, { replace: true })
    }, 300)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Submit immediately
      clearTimeout(debounceRef.current)
      const val = searchQuery
      const params = new URLSearchParams(searchParams)
      if (val.trim()) {
        params.set('search', val.trim())
      } else {
        params.delete('search')
      }
      setSearchParams(params, { replace: true })
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b"
    >
      <div className="h-14 flex items-center">
        {/* Left: Logo - aligned with sidebar content */}
        <div className="w-64 flex-shrink-0 flex items-center gap-2 pl-3 md:pl-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/" className="flex items-center gap-1.5">
          <motion.div
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <img src={`${import.meta.env.BASE_URL}assets/jerry-logo.png`} alt="Jerry" className="w-8 h-8 object-contain" />
            <span className="hidden sm:block font-semibold text-base tracking-tight">
              Jerry小站
            </span>
          </motion.div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg mx-auto px-2">
          <div className="relative group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400
                         group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="搜索网站、标签、分类..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800
                         rounded-lg border border-slate-200/50 dark:border-slate-700/50
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50
                         focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Right: Actions - at the far right */}
        <div className="flex items-center gap-1 flex-shrink-0 pr-4">
          {/* Back to frontend (admin only) */}
          {isAdmin && (
            <Link
              to="/"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                         bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                         transition-colors shadow-sm"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">查看前台</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                       transition-colors"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <Sun size={17} className="text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Moon size={17} className="text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Menu */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-200/50 
                           dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-blue-500 
                                rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-2"
                  >
                    <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      to="/favorites"
                      className="w-full px-3 py-2 text-left text-sm rounded-lg 
                                 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                                 transition-colors flex items-center gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Bookmark size={16} />
                      我的收藏
                    </Link>
                    <Link
                      to="/profile"
                      className="w-full px-3 py-2 text-left text-sm rounded-lg 
                                 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                                 transition-colors flex items-center gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} />
                      个人资料
                    </Link>
                    <Link
                      to="/admin"
                      className="w-full px-3 py-2 text-left text-sm rounded-lg 
                                 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                                 transition-colors flex items-center gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} />
                      管理后台
                    </Link>
                    <button
                      onClick={onLogout}
                      className="w-full mt-1 px-3 py-2 text-left text-sm rounded-lg 
                                 hover:bg-red-50 dark:hover:bg-red-900/20 
                                 text-red-600 dark:text-red-400 transition-colors
                                 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 
                         text-white rounded-lg text-sm font-medium transition-colors"
            >
              <User size={15} />
              <span className="hidden sm:inline">登录</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

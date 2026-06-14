import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ResourceGrid from './components/ResourceGrid'
import DiscussionBoard from './components/DiscussionBoard'
import FavoritesPage from './components/FavoritesPage'
import UserProfile from './components/UserProfile'
import LoginModal from './components/LoginModal'
import BackToTop from './components/BackToTop'
import Footer from './components/Footer'
import Admin from './pages/Admin'
import { AnimatePresence } from 'framer-motion'

function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('glj_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('glj_user', JSON.stringify(userData))
    setIsLoginOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('glj_user')
  }

  return (
    <Router>
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar 
          isDark={isDark}
          setIsDark={setIsDark}
          user={user}
          onLoginClick={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div className="flex pt-14 h-[calc(100dvh-3.5rem)] overflow-hidden">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={user}
          />

          {/* Spacer for fixed sidebar on desktop */}
          <div className="hidden md:block w-64 flex-shrink-0" />

          {/* Main content - scrollable area */}
          <div className="flex-1 overflow-y-auto">
            <Routes>
            <Route path="/" element={
              <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <ResourceGrid user={user} />
              </main>
            } />
            <Route path="/discussion" element={
              <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <DiscussionBoard user={user} />
              </main>
            } />
            <Route path="/favorites" element={
              <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <FavoritesPage user={user} />
              </main>
            } />
            <Route path="/profile" element={
              <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <UserProfile user={user} />
              </main>
            } />
            <Route path="/admin" element={
              <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <Admin />
              </main>
            } />
            </Routes>
          </div>
        </div>

        <Footer />
      </div>

      <BackToTop />

      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal 
            onClose={() => setIsLoginOpen(false)}
            onLogin={handleLogin}
          />
        )}
      </AnimatePresence>
    </Router>
  )
}

export default App

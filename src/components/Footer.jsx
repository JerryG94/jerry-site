import { memo } from 'react'
import { Heart } from 'lucide-react'

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30
                        bg-white/80 dark:bg-slate-900/80
                        backdrop-blur-md
                        border-t border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-[1600px] mx-auto md:pl-64 px-4 md:px-6 h-10 flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {currentYear} GLJ 资源导航 · All rights reserved.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          Made with <Heart size={11} className="text-red-400" /> by Senior Developer
        </p>
      </div>
    </footer>
  )
})

export default Footer

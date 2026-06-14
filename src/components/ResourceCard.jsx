import { memo } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Bookmark, Share2 } from 'lucide-react'

const ResourceCard = memo(function ResourceCard({ resource, index, onSelect, onBookmark }) {
  const { name, url, description, tags, category1, category2 } = resource

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect && onSelect()}
      className="group relative glass-card rounded-2xl p-5 
                 hover:shadow-xl hover:shadow-blue-500/10 
                 dark:hover:shadow-blue-500/20
                 transition-all duration-300 magnetic-element
                 cursor-pointer"
    >
      {/* Card Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Favicon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 
                        dark:from-slate-800 dark:to-slate-700 
                        flex items-center justify-center flex-shrink-0
                        group-hover:scale-110 transition-transform duration-300">
          <img 
            src={getFavicon(url)} 
            alt={name}
            className="w-6 h-6 rounded"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div className="hidden w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 
                           items-center justify-center text-white text-xs font-bold">
            {name.charAt(0)}
          </div>
        </div>

        {/* Title & URL */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight mb-1 
                         group-hover:text-blue-600 dark:group-hover:text-blue-400 
                         transition-colors">
            {name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {getDomain(url)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBookmark && onBookmark(resource)}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                       transition-colors"
          >
            <Bookmark size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 
                       transition-colors"
          >
            <Share2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + i * 0.03 }}
            className="px-2.5 py-1 text-xs rounded-lg 
                       bg-slate-100 dark:bg-slate-800 
                       text-slate-600 dark:text-slate-400
                       hover:bg-blue-100 dark:hover:bg-blue-900/30
                       hover:text-blue-600 dark:hover:text-blue-400
                       cursor-pointer transition-colors"
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 
                      border-t border-slate-200/50 dark:border-slate-700/50">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {category2}
        </span>
        <motion.a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 text-xs font-medium 
                     text-blue-600 dark:text-blue-400 
                     hover:text-blue-700 dark:hover:text-blue-300 
                     transition-colors"
        >
          访问网站
          <ExternalLink size={12} />
        </motion.a>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 pointer-events-none
                      bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
    </motion.div>
  )
})

export default ResourceCard

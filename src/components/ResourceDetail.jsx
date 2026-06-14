import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Globe,
  Tag,
  Star,
  Send
} from 'lucide-react'
import { getResource } from '../api/resources'
import { rateResource } from '../api/ratings'
import { getComments, addComment } from '../api/comments'
import { addFavorite, removeFavorite } from '../api/favorites'

export default function ResourceDetail({ resource: initialResource, onClose, user }) {
  const [resource, setResource] = useState(initialResource)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch full resource details and comments
  useEffect(() => {
    if (initialResource?.id) {
      fetchResourceDetails()
      fetchComments()
    }
  }, [initialResource?.id])

  const fetchResourceDetails = async () => {
    try {
      const data = await getResource(initialResource.id)
      setResource(data.resource)
    } catch (err) {
      console.error('Failed to fetch resource details:', err)
    }
  }

  const fetchComments = async () => {
    try {
      const data = await getComments(initialResource.id)
      setComments(data.comments || [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  const handleRate = async (score) => {
    if (!user) {
      alert('请先登录')
      return
    }

    try {
      await rateResource(resource.id, score)
      setUserRating(score)
      fetchResourceDetails() // Refresh to get updated rating
    } catch (err) {
      alert('评分失败')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('请先登录')
      return
    }

    if (!newComment.trim()) return

    try {
      setLoading(true)
      await addComment(resource.id, newComment)
      setNewComment('')
      fetchComments() // Refresh comments
    } catch (err) {
      alert('评论失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      alert('请先登录')
      return
    }

    try {
      if (isFavorite) {
        await removeFavorite(resource.id)
        setIsFavorite(false)
      } else {
        await addFavorite(resource.id)
        setIsFavorite(true)
      }
    } catch (err) {
      alert('操作失败')
    }
  }

  if (!resource) return null

  const { name, url, description, tags, category1, category2, avg_rating, rating_count, views } = resource

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
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    } catch {
      return null
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description,
          url: url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(url)
      alert('链接已复制到剪贴板')
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
          className="w-full max-w-2xl glass-card rounded-3xl overflow-hidden 
                     shadow-2xl shadow-blue-500/10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header with gradient */}
          <div className="relative pt-10 pb-6 px-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 
                      flex flex-col items-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl z-10
                         bg-white/20 backdrop-blur-sm hover:bg-white/30 
                         transition-colors text-white"
            >
              <X size={20} />
            </button>

            {/* Icon - floats above the gradient boundary */}
            <div className="w-20 h-20 -mt-2 rounded-2xl 
                            bg-white shadow-lg border-4 border-white
                            flex items-center justify-center
                            shrink-0">
              <img 
                src={getFavicon(url)} 
                alt={name}
                className="w-12 h-12 rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 
                              items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0)}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mt-3 mb-1">{name}</h2>
            <p className="text-white/80 text-sm">{getDomain(url)}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Rating and Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= (userRating || Math.round(avg_rating || 0))
                          ? 'text-yellow-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      <Star 
                        size={20} 
                        fill={star <= (userRating || Math.round(avg_rating || 0)) ? 'currentColor' : 'none'} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    {avg_rating?.toFixed(1) || '0.0'} ({rating_count || 0} 评价)
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                浏览 {views || 0} 次
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                网站介绍
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Tag size={16} className="text-purple-500" />
                标签分类
              </h3>
              <div className="flex flex-wrap gap-2">
                {(tags || []).map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-sm rounded-xl 
                               bg-slate-100 dark:bg-slate-800 
                               text-slate-700 dark:text-slate-300
                               hover:bg-blue-100 dark:hover:bg-blue-900/30
                               transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="font-semibold text-sm mb-3">
                评论 ({comments.length})
              </h3>

              {/* Add Comment */}
              {user && (
                <form onSubmit={handleComment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="写下你的评论..."
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 
                                 rounded-xl border border-slate-200/50 dark:border-slate-700/50
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                                 transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="p-2 bg-blue-500 text-white rounded-xl 
                                 hover:bg-blue-600 transition-colors 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{comment.username}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    暂无评论，来发表第一条评论吧！
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 
                            border-t border-slate-200/50 dark:border-slate-700/50">
              <motion.a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 
                           bg-gradient-to-r from-blue-500 to-purple-600 
                           text-white rounded-xl font-medium text-sm
                           hover:shadow-lg hover:shadow-blue-500/25 
                           transition-all duration-300"
              >
                <ExternalLink size={18} />
                访问网站
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-3 rounded-xl hover:bg-slate-200/50 
                           dark:hover:bg-slate-800/50 transition-colors"
              >
                <Share2 size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                className={`p-3 rounded-xl transition-colors ${
                  isFavorite 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Bookmark size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

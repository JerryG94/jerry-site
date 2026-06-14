import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFavorites } from '../api/favorites'
import ResourceCard from './ResourceCard'

export default function FavoritesPage({ user }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await getFavorites()
      setFavorites(data.resources || [])
    } catch (err) {
      console.error('Failed to fetch favorites:', err)
      setError('获取收藏失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full 
                        bg-slate-100 dark:bg-slate-800 
                        flex items-center justify-center">
          <Bookmark size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">请先登录</h3>
        <p className="text-sm text-slate-500 mb-4">
          登录后即可查看您的收藏
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-xl text-sm 
                     hover:bg-blue-600 transition-colors"
        >
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            我的收藏
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            共 {favorites.length} 个收藏资源
          </p>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 
                     hover:bg-slate-200/50 dark:hover:bg-slate-800/50 
                     rounded-xl transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          返回
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full 
                          bg-slate-100 dark:bg-slate-800 
                          flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Bookmark size={24} className="text-blue-500" />
            </motion.div>
          </div>
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-20">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchFavorites}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm 
                       hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      )}

      {/* Favorites Grid */}
      {!loading && !error && (
        <>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map((resource, index) => (
                <ResourceCard
                  key={resource.id || resource.url}
                  resource={resource}
                  index={index}
                  onSelect={() => {
                    // Open resource detail
                    console.log('Open resource:', resource)
                  }}
                  onBookmark={async (res) => {
                    try {
                      // Remove from favorites
                      const { removeFavorite } = require('../api/favorites')
                      await removeFavorite(res.id)
                      fetchFavorites() // Refresh
                    } catch (err) {
                      alert('取消收藏失败')
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full 
                              bg-slate-100 dark:bg-slate-800 
                              flex items-center justify-center">
                <Bookmark size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无收藏</h3>
              <p className="text-sm text-slate-500 mb-4">
                浏览资源并点击收藏按钮添加
              </p>
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-xl text-sm 
                           hover:bg-blue-600 transition-colors"
              >
                浏览资源
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

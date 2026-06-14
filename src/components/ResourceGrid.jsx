import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Grid, List, BookmarkCheck } from 'lucide-react'
import ResourceCard from './ResourceCard'
import ResourceDetail from './ResourceDetail'
import { getResources } from '../api/resources'
import { addFavorite } from '../api/favorites'

// Import bookmarks data as fallback
import bookmarksData from '../data/bookmarks_data.json'

export default function ResourceGrid({ user }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory1 = searchParams.get('category1')
  const selectedCategory2 = searchParams.get('category2')
  
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [selectedTags, setSelectedTags] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [usingLocalData, setUsingLocalData] = useState(true)
  
  // Sync local search from URL params (e.g. when Navbar search updates)
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  // Initialize with local data immediately
  useEffect(() => {
    console.log('ResourceGrid: 初始化本地数据...')
    // Load local data first for immediate display
    setResources(bookmarksData || [])
    setLoading(false)
    setUsingLocalData(true)
    console.log(`ResourceGrid: 已加载 ${bookmarksData?.length || 0} 个本地书签`)
  }, [])

  // Then try to fetch from API in background (optional)
  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        console.log('ResourceGrid: 尝试从 API 获取数据...')
        const params = {}
        
        if (selectedCategory1) {
          params.category1 = selectedCategory1
        }
        
        if (selectedCategory2) {
          params.category2 = selectedCategory2
        }
        
        if (searchQuery) {
          params.search = searchQuery
        }
        
        const response = await getResources(params)
        
        if (response.resources && response.resources.length > 0) {
          console.log(`ResourceGrid: API 返回 ${response.resources.length} 个资源，更新数据`)
          setResources(response.resources)
          setUsingLocalData(false)
        }
      } catch (err) {
        console.log('ResourceGrid: API 不可用，继续使用本地数据')
        // Keep using local data, no need to update state
      }
    }

    // Delay API call to not block initial render
    const timer = setTimeout(() => {
      fetchFromAPI()
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedCategory1, selectedCategory2, searchQuery])

  // Extract all unique tags from resources
  const allTags = useMemo(() => {
    const tagSet = new Set()
    resources.forEach(item => {
      (item.tags || []).forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [resources])

  // Filter resources based on category and tags (client-side)
  const filteredResources = useMemo(() => {
    let filtered = resources

    // Category1 filter
    if (selectedCategory1) {
      filtered = filtered.filter(item => item.category1 === selectedCategory1)
    }

    // Category2 filter
    if (selectedCategory2) {
      filtered = filtered.filter(item => item.category2 === selectedCategory2)
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        (item.tags || []).some(tag => selectedTags.includes(tag))
      )
    }

    // Search filter (client-side)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.url || '').toLowerCase().includes(q) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(q))
      )
    }

    return filtered
  }, [resources, selectedCategory1, selectedCategory2, selectedTags, searchQuery])

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setSearchParams({})
  }

  // Get current category display name
  const currentCategoryName = selectedCategory2 || selectedCategory1 || null

  // Load more resources (pagination)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    try {
      const params = { page: page + 1 }
      
      if (selectedCategory1) {
        params.category1 = selectedCategory1
      }
      
      if (selectedCategory2) {
        params.category2 = selectedCategory2
      }
      
      const response = await getResources(params)
      
      if (response.resources && response.resources.length > 0) {
        setResources(prev => [...prev, ...response.resources])
        setPage(prev => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to load more:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {currentCategoryName ? (
                <span className="flex items-center gap-2">
                  <span>分类:</span>
                  <span className="text-blue-600 dark:text-blue-400">{currentCategoryName}</span>
                </span>
              ) : (
                'Jerry小站'
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              共 {filteredResources.length} 个优质网站资源
              {usingLocalData && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                  本地数据
                </span>
              )}
              {!usingLocalData && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                  API 同步
                </span>
              )}
              {selectedCategory1 && (
                <button
                  onClick={() => setSearchParams({})}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  (清除分类)
                </button>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${
                showFilters || selectedTags.length > 0
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal size={18} />
            </motion.button>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="md:hidden">
          <div className="relative">
            <BookmarkCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                // Also sync to URL for consistency
                const params = new URLSearchParams(searchParams)
                if (e.target.value.trim()) {
                  params.set('search', e.target.value.trim())
                } else {
                  params.delete('search')
                }
                setSearchParams(params, { replace: true })
              }}
              placeholder="搜索资源..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 
                         rounded-xl border border-slate-200/50 dark:border-slate-700/50
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                         transition-all text-sm"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {(showFilters || selectedTags.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">标签筛选</h3>
                  {(searchQuery || selectedTags.length > 0 || selectedCategory1) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      清除全部
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>

                {/* Active Filters */}
                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-xs text-slate-500">已选标签:</span>
                    {selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 
                                   bg-blue-100 dark:bg-blue-900/30 
                                   text-blue-700 dark:text-blue-300 
                                   rounded-md text-xs"
                      >
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resources Grid - 始终显示，因为本地数据已立即加载 */}
      <AnimatePresence mode="wait">
          {filteredResources.length > 0 ? (
            <motion.div
              key={viewMode + '-' + (selectedCategory1 || 'all') + '-' + (selectedCategory2 || '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'
              }
            >
              {filteredResources.map((resource, index) => (
                <ResourceCard
                  key={resource.id || resource.url}
                  resource={resource}
                  index={index}
                  onSelect={() => setSelectedResource(resource)}
                  onBookmark={async (res) => {
                    if (!user) {
                      alert('请先登录')
                      return
                    }
                    try {
                      await addFavorite(res.id)
                      alert('收藏成功')
                    } catch (err) {
                      alert('收藏失败')
                    }
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full 
                              bg-slate-100 dark:bg-slate-800 
                              flex items-center justify-center">
                <Grid size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">未找到匹配资源</h3>
              <p className="text-sm text-slate-500 mb-4">
                尝试调整搜索关键词或清除筛选条件
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm 
                           hover:bg-blue-600 transition-colors"
              >
                清除筛选
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Resource Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

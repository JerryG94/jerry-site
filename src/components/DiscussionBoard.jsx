import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Plus,
  ArrowLeft,
  User
} from 'lucide-react'

// Mock discussion data
const mockPosts = [
  {
    id: 1,
    title: '推荐一个超好用的在线工具集合网站',
    author: '用户A',
    avatar: null,
    content: '最近发现了一个非常实用的在线工具集合网站，包含了各种开发、设计、办公工具，界面也很清爽，推荐给大家！',
    tags: ['工具推荐', '资源分享'],
    likes: 24,
    replies: 8,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: '你们都在用什么影视资源网站？',
    author: '用户B',
    avatar: null,
    content: '想问问大家平时都在哪里看电影电视剧？有没有比较稳定的在线影视网站推荐？免费的最好。',
    tags: ['求助', '影视资源'],
    likes: 15,
    replies: 12,
    createdAt: '2024-01-14T08:20:00Z'
  },
  {
    id: 3,
    title: '分享一个自学编程的好网站',
    author: '用户C',
    avatar: null,
    content: '这个网站从零基础到进阶都有，课程质量很高，而且完全免费。适合想学编程的朋友。',
    tags: ['教育资源', '编程学习'],
    likes: 42,
    replies: 5,
    createdAt: '2024-01-13T15:45:00Z'
  }
]

export default function DiscussionBoard({ user }) {
  const [posts, setPosts] = useState(mockPosts)
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  const handleCreatePost = (e) => {
    e.preventDefault()
    
    if (!newPost.title || !newPost.content) return

    const post = {
      id: posts.length + 1,
      title: newPost.title,
      author: user?.username || '匿名用户',
      avatar: null,
      content: newPost.content,
      tags: newPost.tags,
      likes: 0,
      replies: 0,
      createdAt: new Date().toISOString()
    }

    setPosts([post, ...posts])
    setNewPost({ title: '', content: '', tags: [] })
    setShowNewPost(false)
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
  }

  const addTag = () => {
    if (newTag && !newPost.tags.includes(newTag)) {
      setNewPost(prev => ({ ...prev, tags: [...prev.tags, newTag] }))
      setNewTag('')
    }
  }

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-sm text-slate-600 
                     dark:text-slate-400 hover:text-blue-600 
                     dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={16} />
          返回列表
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold mb-4">{selectedPost.title}</h2>
          
          <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center text-white text-xs font-bold">
              {selectedPost.author.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">{selectedPost.author}</span>
            <span>•</span>
            <span>{new Date(selectedPost.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {selectedPost.content}
          </p>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50">
            <button
              onClick={() => handleLike(selectedPost.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl 
                         hover:bg-blue-100 dark:hover:bg-blue-900/30 
                         transition-colors text-sm"
            >
              <ThumbsUp size={16} />
              {selectedPost.likes}
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MessageSquare size={16} />
              {selectedPost.replies} 回复
            </div>
          </div>
        </motion.div>

        {/* Replies Section (Mock) */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">回复</h3>
          <p className="text-sm text-slate-500 text-center py-8">
            暂无回复，快来发表你的看法吧！
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            交流讨论
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            与社区成员分享资源、交流心得
          </p>
        </div>

        {user && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 px-4 py-2.5 
                       bg-blue-500 hover:bg-blue-600 
                       text-white rounded-xl text-sm font-medium 
                       transition-colors shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} />
            发布新帖
          </motion.button>
        )}
      </div>

      {/* New Post Form */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreatePost} className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-lg">发布新帖</h3>

              <div>
                <label className="block text-sm font-medium mb-1.5">标题</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入帖子标题"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 
                             rounded-xl border border-slate-200/50 dark:border-slate-700/50
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                             transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">内容</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="分享你的想法..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 
                             rounded-xl border border-slate-200/50 dark:border-slate-700/50
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                             transition-all text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">标签</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="添加标签"
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 
                               rounded-lg border border-slate-200/50 dark:border-slate-700/50
                               focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                               transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 
                               rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 
                               transition-colors text-sm"
                  >
                    添加
                  </button>
                </div>
                {newPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPost.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs rounded-lg 
                                   bg-blue-100 dark:bg-blue-900/30 
                                   text-blue-700 dark:text-blue-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setNewPost(prev => ({ 
                            ...prev, 
                            tags: prev.tags.filter(t => t !== tag) 
                          }))}
                          className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-xl 
                             hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  发布
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 
                             rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 
                             transition-colors text-sm"
                >
                  取消
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedPost(post)}
            className="glass-card rounded-2xl p-6 cursor-pointer
                       hover:shadow-xl hover:shadow-blue-500/10 
                       dark:hover:shadow-blue-500/20
                       transition-all duration-300 magnetic-element"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg hover:text-blue-600 
                             dark:hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
              {post.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                  flex items-center justify-center text-white text-xs">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <span>{post.author}</span>
                </div>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike(post.id)
                  }}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp size={14} />
                  {post.likes}
                </button>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  {post.replies}
                </div>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 
                              border-t border-slate-200/50 dark:border-slate-700/50">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-lg 
                               bg-slate-100 dark:bg-slate-800 
                               text-slate-600 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

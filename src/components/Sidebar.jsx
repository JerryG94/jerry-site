import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronDown,
  ChevronRight,
  Layout,
  Film,
  BookOpen,
  Palette,
  Code,
  Globe,
  GripVertical,
  Edit2
} from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import bookmarksData from '../data/bookmarks_data.json'
import categoryConfigData from '../data/category_config.json'

const categoryIcons = {
  '软件下载网站': Layout,
  '影视音乐游戏': Film,
  '教育资源汇总': BookOpen,
  '设计素材模板': Palette,
  '开源项目展示': Code,
  '其他网站收藏': Globe,
  '网盘资源收藏': ({ size, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
      <path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <circle cx="12" cy="10" r="2" />
      <path d="m8 16 1.5-1.5" />
      <path d="M14.5 14.5 16 16" />
    </svg>
  )
}

const categoryColors = {
  '软件下载网站': 'from-blue-500 to-cyan-500',
  '影视音乐游戏': 'from-purple-500 to-pink-500',
  '教育资源汇总': 'from-green-500 to-emerald-500',
  '设计素材模板': 'from-orange-500 to-red-500',
  '开源项目展示': 'from-slate-500 to-slate-700',
  '其他网站收藏': 'from-teal-500 to-cyan-500',
  '网盘资源收藏': 'from-indigo-500 to-violet-600'
}

// Read sort order from config file
const getConfigOrder = () => {
  try {
    return categoryConfigData
  } catch {
    return { category1Order: [], category2Order: {} }
  }
}

const configOrder = getConfigOrder()

const API_BASE = '/api/admin'

export default function Sidebar({ isOpen, onClose, user }) {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Drag only enabled on admin page
  const isAdmin = location.pathname === '/admin'

  // Drag state
  const [dragCat1, setDragCat1] = useState(null)        // cat1 being dragged
  const [dragOverCat1, setDragOverCat1] = useState(null)  // cat1 target
  const [dragCat2, setDragCat2] = useState(null)         // { cat1, cat2 }
  const [dragOverCat2, setDragOverCat2] = useState(null)  // { cat1, cat2 }

  // Live ordering state (starts from static config, updates after drag-save)
  const [liveCat1Order, setLiveCat1Order] = useState(() => configOrder.category1Order || [])
  const [liveCat2Order, setLiveCat2Order] = useState(() => ({ ...(configOrder.category2Order || {}) }))

  // Context menu + inline rename
  const [ctxMenu, setCtxMenu] = useState(null) // { x, y, type, oldName, cat1 }
  const [renaming, setRenaming] = useState(false)
  const renameInputRef = useRef(null)

  const dragCounterRef = useRef(0)

  // Close context menu on any click outside
  useEffect(() => {
    const handler = () => setCtxMenu(null)
    if (ctxMenu) {
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }
  }, [ctxMenu])

  // Focus rename input when it appears
  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renaming])

  // Build categories using live ordering
  const categories = useMemo(() => {
    const catMap = {}
    for (const item of bookmarksData) {
      const c1 = item.category1
      const c2 = item.category2
      if (c1 && c2) {
        if (!catMap[c1]) catMap[c1] = []
        if (!catMap[c1].includes(c2)) catMap[c1].push(c2)
      }
    }

    const ordered = {}
    for (const c1 of liveCat1Order) {
      if (catMap[c1]) {
        const subOrder = liveCat2Order[c1] || []
        ordered[c1] = [...catMap[c1]].sort((a, b) => {
          const ia = subOrder.indexOf(a)
          const ib = subOrder.indexOf(b)
          if (ia !== -1 && ib !== -1) return ia - ib
          if (ia !== -1) return -1
          if (ib !== -1) return 1
          return a.localeCompare(b)
        })
      }
    }
    for (const c1 of Object.keys(catMap).sort()) {
      if (!ordered[c1]) ordered[c1] = catMap[c1].sort()
    }
    return ordered
  }, [liveCat1Order, liveCat2Order])

  const categoryCounts = useMemo(() => {
    const counts = {}
    for (const item of bookmarksData) {
      counts[item.category1] = (counts[item.category1] || 0) + 1
    }
    return counts
  }, [])

  const subcategoryCounts = useMemo(() => {
    const counts = {}
    for (const item of bookmarksData) {
      const key = `${item.category1}::${item.category2}`
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [])

  // --- Save order to API ---
  const saveOrder = async () => {
    try {
      await fetch(`${API_BASE}/category-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category1Order: liveCat1Order,
          category2Order: liveCat2Order
        })
      })
    } catch (e) { /* silent */ }
  }

  // --- Context Menu & Rename ---

  const handleContextMenu = (e, type, oldName, cat1 = null) => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({ x: e.clientX, y: e.clientY, type, oldName, cat1 })
  }

  const handleRename = async (newName) => {
    if (!ctxMenu) return
    const { type, oldName } = ctxMenu
    if (!newName.trim() || newName.trim() === oldName) {
      setRenaming(false)
      setCtxMenu(null)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/rename-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, oldName, newName: newName.trim() })
      })
      const json = await res.json()
      if (json.success) {
        // Update local order state immediately
        if (type === 'category1') {
          setLiveCat1Order(prev => prev.map(c => c === oldName ? newName.trim() : c))
        } else if (type === 'category2' && ctxMenu.cat1) {
          setLiveCat2Order(prev => {
            const updated = { ...prev }
            if (updated[ctxMenu.cat1]) {
              updated[ctxMenu.cat1] = updated[ctxMenu.cat1].map(c => c === oldName ? newName.trim() : c)
            }
            return updated
          })
        }
      }
    } catch (e) { /* silent */ }
    setRenaming(false)
    setCtxMenu(null)
  }

  // --- Cat1 drag handlers ---
  const handleDragStartCat1 = (e, cat1) => {
    e.dataTransfer.setData('text/plain', cat1)
    e.dataTransfer.effectAllowed = 'move'
    setDragCat1(cat1)
    // Delay opacity change slightly so user sees what they grabbed
    setTimeout(() => setDragCat1(cat1), 10)
  }

  const handleDragOverCat1 = (e, cat1) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragCat1 && dragCat1 !== cat1) setDragOverCat1(cat1)
  }

  const handleDragEnterCat1 = (cat1) => {
    dragCounterRef.current++
    if (dragCat1 && dragCat1 !== cat1) setDragOverCat1(cat1)
  }

  const handleDragLeaveCat1 = () => {
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setDragOverCat1(null)
  }

  const handleDropCat1 = (e, targetCat1) => {
    e.preventDefault()
    setDragOverCat1(null)
    if (!dragCat1 || dragCat1 === targetCat1) return

    const newOrder = [...liveCat1Order]
    let fromIdx = newOrder.indexOf(dragCat1)
    let toIdx = newOrder.indexOf(targetCat1)

    // Ensure items are in the order list (guard against missing entries)
    if (fromIdx === -1) {
      newOrder.push(dragCat1)
      fromIdx = newOrder.length - 1
    }
    if (toIdx === -1) {
      newOrder.push(targetCat1)
      toIdx = newOrder.length - 1
    }

    if (fromIdx === toIdx) return

    const [moved] = newOrder.splice(fromIdx, 1)
    const adjustedIdx = fromIdx < toIdx ? toIdx - 1 : toIdx
    newOrder.splice(adjustedIdx, 0, moved)
    setLiveCat1Order(newOrder)
    setDragCat1(null)
    saveOrder()
  }

  const handleDragEndCat1 = () => {
    setDragCat1(null)
    setDragOverCat1(null)
    dragCounterRef.current = 0
  }

  // --- Cat2 drag handlers ---
  const handleDragStartCat2 = (e, cat1, cat2) => {
    e.dataTransfer.setData('text/plain', `${cat1}::${cat2}`)
    e.dataTransfer.effectAllowed = 'move'
    setDragCat2({ cat1, cat2 })
    e.stopPropagation() // prevent triggering cat1 drag
  }

  const handleDragOverCat2 = (e, cat1, cat2) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragCat2?.cat1 === cat1 && dragCat2.cat2 !== cat2) {
      setDragOverCat2({ cat1, cat2 })
    }
  }

  const handleDropCat2 = (e, targetCat1, targetCat2) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCat2(null)
    if (!dragCat2 || dragCat2.cat1 !== targetCat1 || dragCat2.cat2 === targetCat2) return

    const currentOrder = [...(liveCat2Order[targetCat1] || [])]
    let fromIdx = currentOrder.indexOf(dragCat2.cat2)
    let toIdx = currentOrder.indexOf(targetCat2)

    // Ensure dragged item is in the order list
    if (fromIdx === -1) {
      currentOrder.push(dragCat2.cat2)
      fromIdx = currentOrder.length - 1
    }
    // Ensure target item is in the order list (it should be, but guard)
    if (toIdx === -1) {
      currentOrder.push(targetCat2)
      toIdx = currentOrder.length - 1
    }

    if (fromIdx === toIdx) return

    // Move: remove from old position, insert at new position
    const [moved] = currentOrder.splice(fromIdx, 1)
    // Adjust toIdx if we removed an item before it
    const adjustedIdx = fromIdx < toIdx ? toIdx - 1 : toIdx
    currentOrder.splice(adjustedIdx, 0, moved)

    setLiveCat2Order(prev => ({ ...prev, [targetCat1]: currentOrder }))
    setDragCat2(null)
    saveOrder()
  }

  const handleDragEndCat2 = () => {
    setDragCat2(null)
    setDragOverCat2(null)
  }

  const handleCategoryClick = (category1, category2 = null) => {
    // On admin page: just update search params (Admin reads filterCat1/filterCat2 from URL)
    if (location.pathname === '/admin') {
      if (category2) {
        setSearchParams({ category1, category2 })
      } else {
        setExpandedCategory(expandedCategory === category1 ? null : category1)
        setSearchParams({ category1: category1 })
      }
    }
    // On other non-home pages (discussion etc): navigate back to home
    else if (location.pathname !== '/') {
      const params = category2 ? { category1, category2 } : { category1 }
      navigate({ pathname: '/', search: `?${new URLSearchParams(params).toString()}` })
    }
    // Already on home page
    else {
      if (category2) {
        setSearchParams({ category1, category2 })
      } else {
        setExpandedCategory(expandedCategory === category1 ? null : category1)
        setSearchParams({ category1: category1 })
      }
    }
    onClose()
  }

  const handleShowAll = () => {
    setSearchParams({})
    setExpandedCategory(null)
    // Stay on current page, just reset filters
    if (location.pathname !== '/admin') {
      navigate('/')
    }
    onClose()
  }

  const handleDiscussion = () => {
    navigate('/discussion')
    onClose()
  }

  const isCategoryActive = (cat1, cat2 = null) => {
    const currentCat1 = searchParams.get('category1')
    const currentCat2 = searchParams.get('category2')
    if (cat2) return currentCat1 === cat1 && currentCat2 === cat2
    return currentCat1 === cat1 && !currentCat2
  }

  const isAllActive = !searchParams.get('category1')

  useEffect(() => {
    const activeCat = searchParams.get('category1')
    if (activeCat && expandedCategory !== activeCat) {
      setExpandedCategory(activeCat)
    } else if (!activeCat && expandedCategory) {
      setExpandedCategory(null)
    }
  }, [searchParams])

  const orderedCat1Keys = Object.keys(categories)

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`
          fixed top-14 left-0 z-40 w-64
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          overflow-y-auto flex-shrink-0
          flex flex-col
          transition-transform duration-300 ease-in-out
          h-[calc(100dvh-3.5rem)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-4 flex-1">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="font-semibold text-lg">分类导航</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {/* All Resources */}
            <button
              onClick={handleShowAll}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                         text-left transition-all duration-200 ${
                           isAllActive
                             ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                             : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                         }`}
            >
              <Globe size={18} />
              <span className="flex-1 font-medium text-sm">全部资源</span>
              <span className={`text-xs ${isAllActive ? 'text-white/70' : 'text-slate-400'}`}>
                {bookmarksData.length}
              </span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

            {/* Categories */}
            {orderedCat1Keys.map((category1) => {
              const Icon = categoryIcons[category1] || Globe
              const isExpanded = expandedCategory === category1
              const isActive = isCategoryActive(category1)
              const count = categoryCounts[category1] || 0
              const subcats = categories[category1]
              const isDraggingThis = dragCat1 === category1
              const isOverThis = dragOverCat1 === category1

              return (
                <div key={category1}>
                  <div
                    draggable={isAdmin}
                    onDragStart={isAdmin ? (e) => handleDragStartCat1(e, category1) : undefined}
                    onDragOver={isAdmin ? (e) => handleDragOverCat1(e, category1) : undefined}
                    onDragEnter={isAdmin ? () => handleDragEnterCat1(category1) : undefined}
                    onDragLeave={isAdmin ? () => handleDragLeaveCat1() : undefined}
                    onDrop={isAdmin ? (e) => handleDropCat1(e, category1) : undefined}
                    onDragEnd={isAdmin ? handleDragEndCat1 : undefined}
                    className={`relative rounded-xl transition-all duration-150 ${
                      isDraggingThis ? 'opacity-40 scale-[0.98]' : ''
                    } ${
                      isOverThis && !isDraggingThis
                        ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => handleCategoryClick(category1)}
                      onContextMenu={(e) => isAdmin && handleContextMenu(e, 'category1', category1)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                 text-left transition-all duration-200 group
                                 ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}
                                 select-none ${
                                   isActive && !isDraggingThis
                                     ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                     : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                 }`}
                    >
                      {/* Grip handle - only on admin page */}
                      {isAdmin && (
                        <GripVertical
                          size={12}
                          className={`text-slate-300 group-hover:text-slate-400 dark:text-slate-600 
                                   dark:group-hover:text-slate-400 transition-colors flex-shrink-0`}
                        />
                      )}

                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${categoryColors[category1] || 'from-gray-500 to-gray-700'}
                                      text-white shadow-lg flex-shrink-0`}>
                        <Icon size={14} />
                      </div>
                      <span className="flex-1 font-medium text-sm truncate">{category1}</span>
                      <span className={`text-xs flex-shrink-0 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                        {count}
                      </span>
                      <div
                        className={`transition-transform duration-200 flex-shrink-0 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      >
                        <ChevronRight size={16} className={isActive ? 'text-white/70' : 'text-slate-400'} />
                      </div>
                    </button>
                  </div>

                  {/* Subcategories */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700
                                    space-y-1 py-1">
                      {subcats.map((subcat) => {
                        const isSubActive = isCategoryActive(category1, subcat)
                        const subCount = subcategoryCounts[`${category1}::${subcat}`] || 0
                        const isDraggingCat2 = dragCat2?.cat2 === subcat
                        const isOverCat2 = dragOverCat2?.cat2 === subcat

                        return (
                          <div
                            key={subcat}
                            draggable={isAdmin}
                            onDragStart={isAdmin ? (e) => handleDragStartCat2(e, category1, subcat) : undefined}
                            onDragOver={isAdmin ? (e) => handleDragOverCat2(e, category1, subcat) : undefined}
                            onDrop={isAdmin ? (e) => handleDropCat2(e, category1, subcat) : undefined}
                            onDragEnd={isAdmin ? handleDragEndCat2 : undefined}
                            className={`rounded-lg transition-all duration-150 ${
                              isDraggingCat2 ? 'opacity-30 scale-95' : ''
                            } ${
                              isOverCat2 && !isDraggingCat2
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-300'
                                : ''
                            }`}
                          >
                            <button
                              onClick={() => handleCategoryClick(category1, subcat)}
                              onContextMenu={(e) => isAdmin && handleContextMenu(e, 'category2', subcat, category1)}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg
                                         text-left text-sm transition-all duration-200
                                         ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}
                                         select-none
                                         ${
                                           isSubActive && !isDraggingCat2
                                             ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                             : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                         }`}
                            >
                              {isAdmin && <GripVertical size={9} className="flex-shrink-0 text-slate-300" />}
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isSubActive ? 'bg-blue-500' : 'bg-slate-400'
                              }`} />
                              <span className="flex-1 truncate">{subcat}</span>
                              <span className={`text-xs flex-shrink-0 ${
                                isSubActive ? 'text-blue-500/70' : 'text-slate-400'
                              }`}>
                                {subCount}
                              </span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Bottom: Discussion Link */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleDiscussion}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-left transition-all duration-200 ${
                         location.pathname === '/discussion'
                           ? 'bg-purple-500 text-white'
                           : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                       }`}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="font-medium text-sm">交流讨论</span>
          </button>
        </div>
      </div>

      {/* Context Menu (admin only) */}
      {ctxMenu && !renaming && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 
                     dark:border-slate-700 py-1 min-w-[120px] text-sm"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setRenaming(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300
                       hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={13} />
            <span>重命名</span>
          </button>
        </div>
      )}

      {/* Inline Rename Input */}
      {renaming && ctxMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-blue-400 
                     dark:border-blue-600 p-2"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={renameInputRef}
            defaultValue={ctxMenu.oldName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(e.target.value)
              if (e.key === 'Escape') { setRenaming(false); setCtxMenu(null) }
            }}
            onBlur={(e) => {
              // Small delay so click outside can trigger
              setTimeout(() => {
                if (renaming) {
                  handleRename(e.target.value)
                }
              }, 150)
            }}
            className="px-2 py-1 text-sm rounded-md border border-blue-300 dark:border-blue-600
                       bg-blue-50 dark:bg-blue-900/30 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[150px]"
            placeholder="新分类名称"
          />
        </div>
      )}
    </>
  )
}

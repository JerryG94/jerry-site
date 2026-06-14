import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Edit2, Trash2, Download, Upload, X,
  Save, ArrowLeft, ExternalLink, RefreshCw,
  ChevronDown, ChevronUp, AlertTriangle, Check, CheckSquare, Square, XCircle,
  GripVertical
} from 'lucide-react'

const API_BASE = '/api/admin'

// Helper: editable select with "add new" option
function CategorySelect({ value, options, onChange, onBlur, className, placeholder, allowAdd = true }) {
  const [inputMode, setInputMode] = useState(false)
  const [inputVal, setInputVal] = useState('')

  if (inputMode) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputVal.trim()) {
              onChange(inputVal.trim())
              setInputMode(false); setInputVal('')
            }
            if (e.key === 'Escape') {
              setInputMode(false); setInputVal('')
              if (onBlur) onBlur()
            }
          }}
          onBlur={() => { if (!inputVal.trim()) { setInputMode(false); setInputVal('') } }}
          className={className}
          placeholder="输入新分类..."
        />
        <button
          onClick={() => { if (inputVal.trim()) { onChange(inputVal.trim()); setInputMode(false); setInputVal('') } else { setInputMode(false) } }}
          className="p-0.5 text-green-600 hover:text-green-700 shrink-0"
          title="确认添加"
        >
          <Check size={12} />
        </button>
        <button
          onClick={() => { setInputMode(false); setInputVal('') }}
          className="p-0.5 text-slate-400 hover:text-slate-600 shrink-0"
        >
          <XCircle size={12} />
        </button>
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={e => {
        if (e.target.value === '__new__') {
          setInputMode(true)
        } else {
          onChange(e.target.value)
        }
      }}
      onBlur={onBlur}
      className={className}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      {allowAdd && <option value="__new__">+ 添加新分类...</option>}
    </select>
  )
}

const EMPTY_BOOKMARK = {
  name: '',
  url: '',
  description: '',
  tags: [],
  category1: '',
  category2: ''
}

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef(null)

  // Data state
  const [bookmarks, setBookmarks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filter from URL (controlled by Sidebar)
  const searchQuery = searchParams.get('search') || ''
  const filterCat1 = searchParams.get('category1') || ''
  const filterCat2 = searchParams.get('category2') || ''

  // Sort
  const [sortField, setSortField] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  // Form modal
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ ...EMPTY_BOOKMARK })
  const [formTags, setFormTags] = useState('')

  // Selection & batch
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [batchCat1, setBatchCat1] = useState('')
  const [batchCat2, setBatchCat2] = useState('')
  const [showBatchBar, setShowBatchBar] = useState(false)

  // UI state
  const [notification, setNotification] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Bookmark drag-to-reorder state
  const [dragBmId, setDragBmId] = useState(null)
  const [dragOverBmId, setDragOverBmId] = useState(null)

  // Inline editing state: { itemId: { field: newValue } }
  const [inlineEdit, setInlineEdit] = useState({})
  const [savingId, setSavingId] = useState(null)

  // --- Derived data ---

  // Dynamic Category1 list from stats (alphabetical, sidebar handles ordering)
  const cat1List = useMemo(() => {
    if (!stats?.category1) return []
    return Object.keys(stats.category1).sort()
  }, [stats])

  // Get unique category2 values (flat list, for batch bar)
  const cat2List = useMemo(() => {
    if (!stats?.category2) return []
    return Object.keys(stats.category2).sort()
  }, [stats])

  // Get category2 values for a specific category1 (for cascading dropdowns)
  const getCat2ForCat1 = useCallback((cat1) => {
    if (!stats?.cat2ByCat1 || !cat1) return []
    return (stats.cat2ByCat1[cat1] || []).sort()
  }, [stats])

  // --- Fetch ---

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterCat1) params.set('category1', filterCat1)
      if (searchQuery) params.set('search', searchQuery)
      
      const res = await fetch(`${API_BASE}/bookmarks?${params}`)
      const json = await res.json()
      if (json.success) {
        let data = json.data || []

        // Client-side cat2 filter (API doesn't support cat2 filter)
        if (filterCat2) {
          data = data.filter(item => item.category2 === filterCat2)
        }

        // Sort (natural order when sortField is null)
        if (sortField) {
          data.sort((a, b) => {
            let va = a[sortField] || ''
            let vb = b[sortField] || ''
            if (typeof va === 'string') va = va.toLowerCase()
            if (typeof vb === 'string') vb = vb.toLowerCase()
            return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
          })
        }

        setBookmarks(data)
      }
    } catch (err) {
      notify('Failed to fetch data', 'error')
    }
  }, [filterCat1, filterCat2, searchQuery, sortField, sortDir])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      const json = await res.json()
      if (json.success) setStats(json)
    } catch (err) { /* ignore */ }
  }, [])

  useEffect(() => {
    const init = async () => {
      await fetchStats()
      await fetchData()
      setLoading(false)
    }
    init()
  }, [fetchData, fetchStats])

  // --- Helpers ---

  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch { return null }
  }

  // --- Selection ---

  const toggleSelectAll = () => {
    if (selectedIds.size === bookmarks.length && bookmarks.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(bookmarks.map(b => b.id)))
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    setShowBatchBar(selectedIds.size > 0)
  }, [selectedIds])

  // --- Inline edit ---

  const handleInlineChange = async (itemId, field, value) => {
    setSavingId(itemId)

    try {
      const res = await fetch(`${API_BASE}/bookmarks/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      const json = await res.json()
      if (json.success) {
        setBookmarks(prev => prev.map(b =>
          b.id === itemId ? { ...b, [field]: value } : b
        ))
        fetchStats()
        notify(`Updated ${field}`)
      } else {
        notify('Update failed', 'error')
      }
    } catch (err) {
      notify('Network error', 'error')
    }

    setSavingId(null)
    setInlineEdit(prev => {
      const copy = { ...prev }
      delete copy[itemId]
      return copy
    })
  }

  const startInlineEdit = (itemId, field, currentValue) => {
    setInlineEdit(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [field]: currentValue } }))
  }

  // --- Batch update ---

  const handleBatchUpdate = async (field, value) => {
    if (!value) return
    let successCount = 0
    let failCount = 0

    for (const id of selectedIds) {
      try {
        const res = await fetch(`${API_BASE}/bookmarks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        })
        const json = await res.json()
        if (json.success) successCount++
        else failCount++
      } catch { failCount++ }
    }

    notify(`Batch ${field}: ${successCount} updated, ${failCount} failed`)
    setBatchCat1('')
    setBatchCat2('')
    setSelectedIds(new Set())
    fetchData()
    fetchStats()
  }

  const handleBatchDelete = async () => {
    let count = 0
    for (const id of selectedIds) {
      try {
        await fetch(`${API_BASE}/bookmarks/${id}`, { method: 'DELETE' })
        count++
      } catch { /* skip */ }
    }
    notify(`Deleted ${count} items`)
    setDeleteConfirm(null)
    setSelectedIds(new Set())
    fetchData()
    fetchStats()
  }

  // --- CRUD forms ---

  const openAddForm = () => {
    setEditingItem(null)
    setFormData({ ...EMPTY_BOOKMARK })
    setFormTags('')
    setShowForm(true)
  }

  const openEditForm = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '', url: item.url || '',
      description: item.description || '',
      tags: item.tags || [],
      category1: item.category1 || '', category2: item.category2 || ''
    })
    setFormTags((item.tags || []).join(', '))
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      notify('Name and URL are required', 'error')
      return
    }
    const payload = { ...formData, tags: formTags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      const url = editingItem ? `${API_BASE}/bookmarks/${editingItem.id}` : `${API_BASE}/bookmarks`
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (json.success) {
        notify(editingItem ? 'Updated' : 'Added')
        setShowForm(false)
        fetchData()
        fetchStats()
      } else {
        notify((editingItem ? 'Update' : 'Add') + ' failed: ' + (json.error || ''), 'error')
      }
    } catch (err) { notify('Network error', 'error') }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bookmarks/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        notify('Deleted')
        setDeleteConfirm(null)
        fetchData()
        fetchStats()
      } else { notify('Delete failed', 'error') }
    } catch (err) { notify('Network error', 'error') }
  }

  // --- Import/Export ---

  const handleExport = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `glj-bookmarks-${new Date().toISOString().slice(0,10)}.json`; a.click()
    URL.revokeObjectURL(url)
    notify('Exported ' + bookmarks.length + ' bookmarks')
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) { notify('Invalid format', 'error'); return }
        const res = await fetch(`${API_BASE}/import`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        const json = await res.json()
        if (json.success) {
          notify(`Imported: ${json.added} added, ${json.updated} updated`)
          fetchData(); fetchStats()
        } else { notify('Import failed', 'error') }
      } catch { notify('Invalid JSON file', 'error') }
    }
    reader.readAsText(file); e.target.value = ''
  }

  // Sort toggle
  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }
  const SortIcon = ({ field }) => sortField !== field
    ? <ChevronDown size={12} className="text-slate-300" />
    : sortDir === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />

  // Bookmark drag handlers
  const handleBmDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDragBmId(id)
    // Reset sort so drag reorder is visible immediately
    if (sortField) {
      setSortField(null)
      setSortDir('asc')
    }
  }

  const handleBmDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragBmId && dragBmId !== id) setDragOverBmId(id)
  }

  const handleBmDrop = async (e, targetId) => {
    e.preventDefault()
    setDragOverBmId(null)
    if (!dragBmId || dragBmId === targetId) return

    const fromIdx = bookmarks.findIndex(b => b.id === dragBmId)
    const toIdx = bookmarks.findIndex(b => b.id === targetId)
    if (fromIdx === -1 || toIdx === -1) return

    const newOrder = [...bookmarks]
    const [moved] = newOrder.splice(fromIdx, 1)
    newOrder.splice(toIdx, 0, moved)
    setBookmarks(newOrder)
    setDragBmId(null)

    // Persist
    try {
      await fetch(`${API_BASE}/reorder-bookmarks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newOrder.map(b => b.id) })
      })
      notify('书签顺序已保存')
    } catch (err) {
      notify('保存书签顺序失败', 'error')
    }
  }

  const handleBmDragEnd = () => {
    setDragBmId(null)
    setDragOverBmId(null)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh]">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-16 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm animate-in slide-in-from-right
          ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {notification.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
          {notification.message}
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">管理后台</h1>
          <span className="text-xs text-slate-400">{bookmarks.length} 条数据</span>
          {filterCat1 && (
            <span className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
              {filterCat1}{filterCat2 ? ' > ' + filterCat2 : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Download size={13} /> 导出
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Upload size={13} /> 导入
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={openAddForm}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5">
            <Plus size={13} /> 新增
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery}
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams(searchParams)
              if (val) params.set('search', val)
              else params.delete('search')
              setSearchParams(params, { replace: true })
            }}
            placeholder="搜索名称、URL、描述..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder:text-slate-400" />
        </div>
        <button onClick={() => { fetchData(); fetchStats() }}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={15} className="text-slate-500" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="w-6 px-1 py-3" />
                <th className="w-8 px-3 py-3">
                  <button onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-blue-500 transition-colors">
                    {selectedIds.size === bookmarks.length && bookmarks.length > 0
                      ? <CheckSquare size={15} className="text-blue-500" />
                      : <Square size={15} />}
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700"
                    onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">名称 <SortIcon field="name" /></span>
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 w-36">分类一</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 w-36">分类二</th>
                <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">标签</th>
                <th className="text-right px-3 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {bookmarks.map(item => {
                const isSelected = selectedIds.has(item.id)
                const isEditingThisRow = savingId === item.id

                return (
                  <tr key={item.id}
                    draggable
                    onDragStart={(e) => handleBmDragStart(e, item.id)}
                    onDragOver={(e) => handleBmDragOver(e, item.id)}
                    onDrop={(e) => handleBmDrop(e, item.id)}
                    onDragEnd={handleBmDragEnd}
                    className={`border-b border-slate-50 dark:border-slate-800/50 transition-all duration-150
                      ${dragBmId === item.id ? 'opacity-40 scale-[0.98]' : ''}
                      ${dragOverBmId === item.id && dragBmId !== item.id ? 'ring-2 ring-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : ''}
                      ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                    {/* Drag handle */}
                    <td className="px-1 py-2">
                      <GripVertical size={14}
                        className="text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing
                                   hover:text-slate-500 dark:hover:text-slate-400 transition-colors" />
                    </td>
                    {/* Checkbox */}
                    <td className="px-3 py-2">
                      <button onClick={() => toggleSelectOne(item.id)}
                        className={`${isSelected ? 'text-blue-500' : 'text-slate-300 hover:text-slate-500'} transition-colors`}>
                        {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>
                    </td>

                    {/* Site name + URL */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={getFavicon(item.url)} alt="" className="w-5 h-5 rounded shrink-0" onError={e => e.target.style.display='none'} />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate text-[13px]" title={item.name}>{item.name}</div>
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-blue-500 hover:underline truncate block" title={item.url}>{item.url}</a>
                        </div>
                      </div>
                    </td>

                    {/* Category1 - inline select */}
                    <td className="px-3 py-2">
                      {inlineEdit[item.id]?.category1 !== undefined ? (
                        <CategorySelect
                          value={inlineEdit[item.id].category1}
                          options={cat1List}
                          onChange={(val) => handleInlineChange(item.id, 'category1', val)}
                          onBlur={() => setInlineEdit(prev => { const c = {...prev}; delete c[item.id]; return c })}
                          className="w-full px-1.5 py-1 text-xs rounded-md border border-blue-400 dark:border-blue-600 
                                     bg-blue-50 dark:bg-blue-900/30 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="未分类"
                        />
                      ) : (
                        <button
                          onClick={() => startInlineEdit(item.id, 'category1', item.category1 || '')}
                          className="group inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                                     bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400
                                     hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="点击修改分类一"
                        >
                          {isEditingThisRow ? (
                            <span className="flex items-center gap-1"><span className="animate-spin">&#9693;</span> 保存中</span>
                          ) : (
                            <>
                              <span>{item.category1 || '-'}</span>
                              <Edit2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Category2 - inline select (cascaded by current cat1) */}
                    <td className="px-3 py-2">
                      {inlineEdit[item.id]?.category2 !== undefined ? (
                        <CategorySelect
                          value={inlineEdit[item.id].category2}
                          options={getCat2ForCat1(item.category1)}
                          onChange={(val) => handleInlineChange(item.id, 'category2', val)}
                          onBlur={() => setInlineEdit(prev => { const c = {...prev}; delete c[item.id]; return c })}
                          className="w-full px-1.5 py-1 text-xs rounded-md border border-purple-400 dark:border-purple-600 
                                     bg-purple-50 dark:bg-purple-900/30 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                          placeholder="未分类"
                        />
                      ) : (
                        <button
                          onClick={() => startInlineEdit(item.id, 'category2', item.category2 || '')}
                          className="group inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md
                                     bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400
                                     hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          title="点击修改分类二"
                        >
                          {isEditingThisRow ? (
                            <span className="flex items-center gap-1"><span className="animate-spin">&#9693;</span> 保存中</span>
                          ) : (
                            <>
                              <span className="truncate max-w-[110px]">{item.category2 || '-'}</span>
                              <Edit2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(item.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{tag}</span>
                        ))}
                        {(item.tags || []).length > 3 &&
                          <span className="text-[11px] text-slate-400">+{item.tags.length - 3}</span>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors">
                          <ExternalLink size={14} />
                        </a>
                        <button onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
              )})}
              {bookmarks.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <div className="text-4xl mb-2">📂</div>
                    <div>暂无数据</div>
                    <div className="text-xs mt-1">尝试切换左侧分类或修改搜索关键词</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch action bar */}
      {showBatchBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom fade-in duration-300">
          <div className="flex items-center gap-2 text-sm">
            <CheckSquare size={16} className="text-blue-500" />
            <span className="font-medium text-slate-900 dark:text-white">{selectedIds.size}</span>
            <span className="text-slate-500">已选</span>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Batch Cat1 */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 whitespace-nowrap">改分类1:</label>
            <CategorySelect
              value={batchCat1}
              options={cat1List}
              onChange={val => setBatchCat1(val)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="选择..."
              allowAdd={true}
            />
            {batchCat1 && (
              <button onClick={() => handleBatchUpdate('category1', batchCat1)}
                className="px-2 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                应用
              </button>
            )}
          </div>

          {/* Batch Cat2 (cascaded by batchCat1) */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 whitespace-nowrap">改分类2:</label>
            <CategorySelect
              value={batchCat2}
              options={batchCat1 ? getCat2ForCat1(batchCat1) : cat2List}
              onChange={val => setBatchCat2(val)}
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
              placeholder="选择..."
              allowAdd={true}
            />
            {batchCat2 && (
              <button onClick={() => handleBatchUpdate('category2', batchCat2)}
                className="px-2 py-1 text-xs rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-colors">
                应用
              </button>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          <button onClick={() => setDeleteConfirm({ id: '__batch__', name: `${selectedIds.size} 个项目` })}
            className="px-2 py-1 text-xs rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
            <Trash2 size={12} /> 批量删除
          </button>

          <button onClick={() => { setSelectedIds(new Set()); setBatchCat1(''); setBatchCat2('') }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingItem ? '编辑书签' : '新增书签'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">名称 *</label>
                <input type="text" value={formData.name} onChange={e => setFormData(d => ({...d, name: e.target.value}))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder="如：Google" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL *</label>
                <input type="text" value={formData.url} onChange={e => setFormData(d => ({...d, url: e.target.value}))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">描述</label>
                <textarea value={formData.description} onChange={e => setFormData(d => ({...d, description: e.target.value}))} rows="3"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                  placeholder="网站简要描述..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">分类一 *</label>
                  <CategorySelect
                    value={formData.category1}
                    options={cat1List}
                    onChange={val => setFormData(d => ({...d, category1: val, category2: ''}))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder="选择分类..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">分类二</label>
                  <CategorySelect
                    value={formData.category2}
                    options={getCat2ForCat1(formData.category1)}
                    onChange={val => setFormData(d => ({...d, category2: val}))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder="选择子分类..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">标签</label>
                <input type="text" value={formTags} onChange={e => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder="标签1, 标签2, 标签3（逗号分隔）" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                取消
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5">
                <Save size={14} /> {editingItem ? '更新' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {deleteConfirm.id === '__batch__' ? '批量删除' : '删除书签'}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              确定要删除 <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong> 吗？此操作无法撤销。
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                取消
              </button>
              <button
                onClick={() => deleteConfirm.id === '__batch__' ? handleBatchDelete() : handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

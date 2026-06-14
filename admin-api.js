import fs from 'fs'
import path from 'path'

const DATA_FILE = path.resolve(__dirname, 'src/data/bookmarks_data.json')
const CONFIG_FILE = path.resolve(__dirname, 'src/data/category_config.json')

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw)
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { category1Order: [], category2Order: {} }
  }
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

// Helper: safely read request body with proper UTF-8 encoding
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolve(Buffer.concat(chunks).toString('utf-8'))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

export default function adminApiPlugin() {
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only handle /api/admin/ requests
        if (!req.url?.startsWith('/api/admin')) {
          return next()
        }

        // CORS headers
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        // Handle preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        try {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const pathname = url.pathname

          // GET /api/admin/bookmarks - List all
          if (pathname === '/api/admin/bookmarks' && req.method === 'GET') {
            const data = readData()
            const search = url.searchParams.get('search')
            const cat1 = url.searchParams.get('category1')

            let filtered = data
            if (search) {
              const q = search.toLowerCase()
              filtered = filtered.filter(item =>
                (item.name || '').toLowerCase().includes(q) ||
                (item.url || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q)
              )
            }
            if (cat1) {
              filtered = filtered.filter(item => item.category1 === cat1)
            }

            res.end(JSON.stringify({ success: true, count: filtered.length, data: filtered }))
            return
          }

          // POST /api/admin/bookmarks - Create
          if (pathname === '/api/admin/bookmarks' && req.method === 'POST') {
            readBody(req).then(body => {
              const data = readData()
              const newItem = JSON.parse(body)

              // Validate required fields
              if (!newItem.name || !newItem.url) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'name and url are required' }))
                return
              }

              // Ensure url has protocol
              if (!newItem.url.startsWith('http://') && !newItem.url.startsWith('https://')) {
                newItem.url = 'https://' + newItem.url
              }

              newItem.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
              data.push(newItem)
              writeData(data)
              res.end(JSON.stringify({ success: true, data: newItem }))
            })
            return
          }

          // PUT /api/admin/bookmarks/:id - Update
          const updateMatch = pathname.match(/^\/api\/admin\/bookmarks\/(.+)$/)
          if (updateMatch && req.method === 'PUT') {
            readBody(req).then(body => {
              const data = readData()
              const index = data.findIndex(item => item.id === updateMatch[1])
              if (index === -1) {
                res.statusCode = 404
                res.end(JSON.stringify({ success: false, error: 'Bookmark not found' }))
                return
              }

              const updates = JSON.parse(body)
              data[index] = { ...data[index], ...updates }
              // Preserve the id
              data[index].id = updateMatch[1]

              // Ensure url has protocol
              if (data[index].url && !data[index].url.startsWith('http')) {
                data[index].url = 'https://' + data[index].url
              }

              writeData(data)
              res.end(JSON.stringify({ success: true, data: data[index] }))
            })
            return
          }

          // DELETE /api/admin/bookmarks/:id
          if (updateMatch && req.method === 'DELETE') {
            const data = readData()
            const index = data.findIndex(item => item.id === updateMatch[1])
            if (index === -1) {
              res.statusCode = 404
              res.end(JSON.stringify({ success: false, error: 'Bookmark not found' }))
              return
            }
            const deleted = data.splice(index, 1)[0]
            writeData(data)
            res.end(JSON.stringify({ success: true, data: deleted }))
            return
          }

          // GET /api/admin/stats - Statistics
          if (pathname === '/api/admin/stats' && req.method === 'GET') {
            const data = readData()
            const cat1Stats = {}
            const cat2Stats = {}
            // cat2ByCat1: { category1: [category2, ...] } for cascading dropdowns
            const cat2ByCat1 = {}
            data.forEach(item => {
              const c1 = item.category1 || '未分类'
              const c2 = item.category2 || '未分类'
              cat1Stats[c1] = (cat1Stats[c1] || 0) + 1
              cat2Stats[c2] = (cat2Stats[c2] || 0) + 1
              // Build cat2 grouping
              if (!cat2ByCat1[c1]) cat2ByCat1[c1] = new Set()
              cat2ByCat1[c1].add(c2)
            })
            // Convert Sets to sorted arrays
            const cat2ByCat1Sorted = {}
            for (const [k, v] of Object.entries(cat2ByCat1)) {
              cat2ByCat1Sorted[k] = [...v].sort()
            }
            res.end(JSON.stringify({
              success: true,
              total: data.length,
              category1: cat1Stats,
              category2: cat2Stats,
              cat2ByCat1: cat2ByCat1Sorted
            }))
            return
          }

          // POST /api/admin/rename-category - Rename a category (bulk update all bookmarks)
          if (pathname === '/api/admin/rename-category' && req.method === 'POST') {
            readBody(req).then(body => {
              try {
                const { type, oldName, newName } = JSON.parse(body)
                if (!type || !oldName || !newName) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ success: false, error: 'type, oldName, newName are required' }))
                  return
                }
                if (!['category1', 'category2'].includes(type)) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ success: false, error: 'type must be category1 or category2' }))
                  return
                }
                if (oldName === newName) {
                  res.end(JSON.stringify({ success: true, updated: 0, message: 'Same name, no changes' }))
                  return
                }

                const data = readData()
                let updated = 0
                data.forEach(item => {
                  if (item[type] === oldName) {
                    item[type] = newName
                    updated++
                  }
                })
                writeData(data)
                res.end(JSON.stringify({ success: true, updated, type, oldName, newName }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON: ' + e.message }))
              }
            })
            return
          }

          // POST /api/admin/import - Bulk import
          if (pathname === '/api/admin/import' && req.method === 'POST') {
            readBody(req).then(body => {
              try {
                const importData = JSON.parse(body)
                const data = readData()

                if (!Array.isArray(importData)) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ success: false, error: 'Import data must be an array' }))
                  return
                }

                let added = 0
                let updated = 0
                importData.forEach(item => {
                  if (!item.name || !item.url) return

                  // Ensure url has protocol
                  if (!item.url.startsWith('http')) {
                    item.url = 'https://' + item.url
                  }

                  // Check if URL already exists
                  const existing = data.findIndex(d => d.url === item.url)
                  if (existing >= 0) {
                    data[existing] = { ...data[existing], ...item }
                    data[existing].id = data[existing].id // preserve id
                    updated++
                  } else {
                    item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
                    data.push(item)
                    added++
                  }
                })

                writeData(data)
                res.end(JSON.stringify({ success: true, added, updated, total: data.length }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON: ' + e.message }))
              }
            })
            return
          }

          // GET /api/admin/category-config - Get category sort order
          if (pathname === '/api/admin/category-config' && req.method === 'GET') {
            const config = readConfig()
            res.end(JSON.stringify({ success: true, config }))
            return
          }

          // PUT /api/admin/category-config - Update category sort order
          if (pathname === '/api/admin/category-config' && req.method === 'PUT') {
            readBody(req).then(body => {
              try {
                const { category1Order, category2Order } = JSON.parse(body)
                const config = readConfig()
                if (Array.isArray(category1Order)) config.category1Order = category1Order
                if (category2Order && typeof category2Order === 'object') {
                  config.category2Order = { ...config.category2Order, ...category2Order }
                }
                writeConfig(config)
                res.end(JSON.stringify({ success: true, config }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON: ' + e.message }))
              }
            })
            return
          }

          // PUT /api/admin/reorder-bookmarks - Reorder all bookmarks by ID array
          if (pathname === '/api/admin/reorder-bookmarks' && req.method === 'PUT') {
            readBody(req).then(body => {
              try {
                const { ids } = JSON.parse(body)
                if (!Array.isArray(ids)) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ success: false, error: 'ids must be an array' }))
                  return
                }
                const data = readData()
                // Build a map for O(1) lookup
                const map = {}
                data.forEach(item => { map[item.id] = item })

                // Reorder: create new array in the given order
                const reordered = []
                const seen = new Set()
                for (const id of ids) {
                  if (map[id] && !seen.has(id)) {
                    reordered.push(map[id])
                    seen.add(id)
                  }
                }
                // Append any items not in the order list
                for (const item of data) {
                  if (!seen.has(item.id)) {
                    reordered.push(item)
                  }
                }
                writeData(reordered)
                res.end(JSON.stringify({ success: true, count: reordered.length }))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON: ' + e.message }))
              }
            })
            return
          }

          // No matching route
          res.statusCode = 404
          res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }))
        } catch (err) {
          console.error('Admin API error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ success: false, error: err.message }))
        }
      })
    }
  }
}

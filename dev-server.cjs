require('dotenv').config()
const http = require('http')
const handler = require('./api/index.js')

const PORT = process.env.API_PORT || 3001

const server = http.createServer(async (req, res) => {
  try {
    const body = req.method !== 'GET' && req.method !== 'DELETE'
      ? await new Promise((resolve) => {
          let data = ''
          req.on('data', chunk => data += chunk)
          req.on('end', () => resolve(data || null))
        })
      : null

    const url = `http://localhost:${PORT}${req.url}`
    const request = new Request(url, {
      method: req.method,
      headers: Object.entries(req.headers).reduce((acc, [k, v]) => {
        acc[k] = Array.isArray(v) ? v.join(', ') : v
        return acc
      }, {}),
      body,
    })

    const response = await handler(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(await response.text())
  } catch (err) {
    console.error('Dev server error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, error: 'Internal server error' }))
  }
})

server.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`)
})

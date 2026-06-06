const http = require('http')
const fs = require('fs')
const path = require('path')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

/**
 * Start a tiny static file server.
 * @param {string} rootDir - Directory to serve
 * @param {number} port - Port (0 = random available port)
 * @returns {Promise<{server: http.Server, url: string}>}
 */
function startStaticServer(rootDir, port = 0) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Security: prevent directory traversal
      let reqPath = decodeURIComponent(req.url)
      reqPath = reqPath.split('?')[0] // strip query string
      reqPath = path.normalize(reqPath).replace(/^(\.\.(\/|\$))+/g, '')

      let filePath = path.join(rootDir, reqPath)
      if (filePath.endsWith(path.sep)) {
        filePath += 'index.html'
      }

      // Strategy: 0=exact, 1=.html, 2=index.html fallback, 3=404
      function tryRead(tryPath, strategy = 0) {
        fs.readFile(tryPath, (err, data) => {
          if (!err) {
            res.writeHead(200, {
              'Content-Type': getMimeType(tryPath),
              'Cache-Control': 'public, max-age=0',
            })
            res.end(data)
            return
          }
          if (err.code !== 'ENOENT') {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('Server error')
            return
          }
          // File not found - try next strategy
          if (strategy === 0 && !path.extname(reqPath)) {
            // Try adding .html (e.g. /dashboard → /dashboard.html)
            tryRead(tryPath + '.html', 1)
          } else if (strategy === 1) {
            // .html also missing - fall back to index.html for SPA routes
            tryRead(path.join(rootDir, 'index.html'), 2)
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('Not found')
          }
        })
      }

      tryRead(filePath, 0)
    })

    server.listen(port, '127.0.0.1', () => {
      const actualPort = server.address().port
      const url = `http://127.0.0.1:${actualPort}`
      console.log(`[StaticServer] Serving ${rootDir} at ${url}`)
      resolve({ server, url })
    })

    server.on('error', reject)
  })
}

module.exports = { startStaticServer }

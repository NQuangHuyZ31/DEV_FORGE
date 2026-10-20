/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import axios from 'axios'

function devCorsProxyPlugin(): Plugin {
  return {
    name: 'devforge-cors-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', '*')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })

        req.on('end', async () => {
          try {
            const { url, method, headers, data, timeoutMs } = JSON.parse(body || '{}')

            if (!url) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'URL is required for proxy' }))
              return
            }

            const sanitizedHeaders = { ...headers }
            delete sanitizedHeaders['host']
            delete sanitizedHeaders['origin']
            delete sanitizedHeaders['referer']

            const startTime = performance.now()
            const targetRes = await axios.request({
              url,
              method: method || 'GET',
              headers: sanitizedHeaders,
              data: data || undefined,
              timeout: timeoutMs || 30000,
              validateStatus: () => true,
              responseType: 'text',
              transformResponse: [(d) => d],
            })
            const durationMs = Math.round(performance.now() - startTime)

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.statusCode = 200
            res.end(
              JSON.stringify({
                status: targetRes.status,
                statusText: targetRes.statusText,
                headers: targetRes.headers,
                data: targetRes.data,
                durationMs,
              })
            )
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.statusCode = 200
            res.end(
              JSON.stringify({
                proxyError: true,
                message: err.message || 'Remote request failed',
                code: err.code || 'PROXY_ERROR',
              })
            )
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devCorsProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['axios'],
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/test/setup.ts',
    fileParallelism: false,
  },
})

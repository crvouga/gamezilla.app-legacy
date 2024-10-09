import http from 'http'
import { spawn } from 'child_process'
import { SERVER_PORT_LOCAL } from './config-public'

const REPLICA_COUNT = 3
const START_COMMAND = 'bun server'

type Target = {
  host: string
  port: number
}

const targets: Target[] = []
for (let i = 1; i <= REPLICA_COUNT; i++) {
  targets.push({
    host: '127.0.0.1',
    port: SERVER_PORT_LOCAL + i
  })
}

for (const target of targets) {
  spawn(START_COMMAND, {
    env: {
      ...process.env,
      PORT: String(target.port)
    }
  })
}

let currentTargetIndex = 0

const server = http.createServer((req, res) => {
  const target = targets[currentTargetIndex]

  if (!target) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('No available targets')
    return
  }

  currentTargetIndex = (currentTargetIndex + 1) % targets.length

  const options = {
    hostname: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  }

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)

    proxyRes.pipe(res, { end: true })
  })

  req.pipe(proxyReq, { end: true })

  proxyReq.on('error', (err) => {
    console.error('Error forwarding request:', err)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Error occurred while forwarding request.')
  })
})

server.listen(SERVER_PORT_LOCAL, () => {
  console.log('Round-robin load balancer running on port 8080')
})

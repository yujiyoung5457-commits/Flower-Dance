import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

const guidePath = resolve('docs/SHOPPINGMALL_GUIDE.html')
const pdfPath = resolve('SHOPPINGMALL_GUIDE.pdf')

createServer((request, response) => {
  if (request.url === '/guide') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    createReadStream(guidePath).pipe(response)
    return
  }

  if (request.url === '/pdf') {
    response.writeHead(200, { 'Content-Type': 'application/pdf' })
    createReadStream(pdfPath).pipe(response)
    return
  }

  {
    response.writeHead(404)
    response.end('Not found')
    return
  }
}).listen(8765, '127.0.0.1')

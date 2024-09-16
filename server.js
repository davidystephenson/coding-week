const http = require('http')
const url = require('url')

let count = 0

function handleRequest(request, response) {
  const path = url.parse(request.url).pathname
  if (path === '/input') {
    count += 1
    response.end()
    return
  }
  response.setHeader('Access-Control-Allow-Origin', '*') /* @dev First, read about security */
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  response.setHeader('Access-Control-Max-Age', 2592000) // 30 days
  response.setHeader('Access-Control-Allow-Headers', 'content-type')
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  response.write(`data:${Math.floor(Math.random() * 1000) + 1}\n\n`);
  function handleOutput() {
    console.log('count:', count)
    response.write('event: message\n');
    response.write('data:' + count + "\n\n");
  }
  setInterval(handleOutput, 1000);
}
const port = 8000;
function handleListen() {
  console.log('Server is listening on port', port);
}
const server = http.createServer(handleRequest)
server.listen(port, handleListen);
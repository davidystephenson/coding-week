const http = require('http')
const url = require('url')

const game = {
  bet: 'red',
  color: 'red',
  count: 0,
  money: 0
}

function handleSpin() {
  console.log('spin')
  const red = game.color === 'red'
  const newColor = red ? 'black' : 'red'
  game.color = newColor

  const random = Math.random()
  if (random < 0.95) {
    setTimeout(handleSpin, 200)
  } else {
    if (game.bet === game.color) {
      game.money += 1
    } else {
      game.money -= 1
    }
    setTimeout(handleSpin, 10000)
  }
}
handleSpin()

function handleRequest(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*') /* @dev First, read about security */
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  response.setHeader('Access-Control-Max-Age', 2592000) // 30 days
  response.setHeader('Access-Control-Allow-Headers', 'content-type')
  const path = url.parse(request.url).pathname
  if (path === '/source') {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });
    response.write(`data:${Math.floor(Math.random() * 1000) + 1}\n\n`);
    function handleOutput() {
      console.log('game', game)
      const json = JSON.stringify(game)
      response.write('event: message\n');
      response.write(`data:${json}\n\n`);
    }
    const interval = setInterval(handleOutput, 1000);
    request.on('close', () => {
      console.log('close')
      clearInterval(interval)
      response.end()
    })
    return
  }
  if (path === '/input') {
    game.count += 1
  }
  if (path === '/red') {
    game.bet = 'red'
  }
  if (path === '/black') {
    game.bet = 'black'
  }
  response.end()
}
const port = 10000;
function handleListen() {
  console.log('Server is listening on port', port);
}
const server = http.createServer(handleRequest)
server.listen(port, handleListen);
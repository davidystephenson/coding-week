const http = require('http')
const url = require('url')

const game = {
  bet: 'red',
  color: 'red',
  money: 0,
  time: 10
}

function spin() {
  if (game.time > 0) {
    game.time -= 1
    setTimeout(spin, 1000)
    return
  }
  const red = game.color === 'red'
  const newColor = red ? 'black' : 'red'
  game.color = newColor

  const random = Math.random()
  if (random < 0.97) {
    setTimeout(spin, 200)
  } else {
    if (game.bet === game.color) {
      game.money += 1
    } else {
      game.money -= 1
    }
    game.time = 10
    spin()
  }
}
spin()

function respond(request, response) {
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
    const interval = setInterval(handleOutput, 100);
    request.on('close', () => {
      console.log('close')
      clearInterval(interval)
      response.end()
    })
    return
  }
  if (path === '/red') {
    game.bet = 'red'
  }
  if (path === '/black') {
    game.bet = 'black'
  }
  response.end()
}
const server = http.createServer(respond)
function ready() {
  console.log('Listening on port 10000')
}
server.listen(10000, ready)
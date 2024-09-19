const http = require('http')
const url = require('url')

const game = {
  color: 'red',
  time: 10,
  player: {},
  players: {},
  spins: 0
}

function spin() {
  if (game.time > 0) {
    game.time -= 1
    setTimeout(spin, 1000)
    return
  }
  game.spins = game.spins + 1

  const red = game.color === 'red'
  const newColor = red ? 'black' : 'red'
  game.color = newColor

  const random = Math.random()
  if (game.spins < 36 || random < 0.5) {
    setTimeout(spin, 200)
  } else {
    for (const id in game.players) {
      const player = game.players[id]
      if (player.bet === game.color) {
        player.money += 1
      } else {
        player.money -= 1
      }
    }
    game.time = 10
    game.spins = 0
    spin()
  }
}
spin()

function respond(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  response.setHeader('Access-Control-Max-Age', 2592000)
  response.setHeader('Access-Control-Allow-Headers', 'content-type')
  const path = url.parse(request.url).pathname
  if (path === '/connect') {
    const id = crypto.randomUUID().slice(0, 6)
    game.players[id] = {
      bet: 'red',
      id,
      money: 0
    }
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    })
    function handleOutput() {
      const clone = structuredClone(game)
      clone.player = game.players[id]
      const json = JSON.stringify(clone)
      response.write('event: message\n');
      response.write(`data:${json}\n\n`);
    }
    const interval = setInterval(handleOutput, 100);
    request.on('close', () => {
      clearInterval(interval)
      delete game.players[id]
      response.end()
    })
    return
  }
  const parts = path.split('/')
  const bet = parts[1]
  const id = parts[2]
  const player = game.players[id]
  if (player) {
    game.players[id].bet = bet
  }
  response.end()
}
const server = http.createServer(respond)
function ready() {
  console.log('Listening on port 10000')
}
server.listen(10000, ready)
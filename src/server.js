const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { Game } = require('./Game.js')

const GAMEOPS = {
  MAX_PLAYERS: 4,
  timeInterval: 1000
}

const game = new Game(GAMEOPS)
setInterval(game.tick.bind(game), GAMEOPS.timeInterval)

app.use(express.static('dist'))
app.get('/', function (req, res) {
  res.sendfile('../dist/index.html')
})

io.on('connection', function (socket) {
  console.log(`${socket.id} connected`)
  game.onPlayerJoin(socket)

  socket.on('input', function (input) {
    game.onInput(socket, input)
  })

  socket.on('disconnect', function () {
    console.log(`${socket.id} disconnected`)
    game.onPlayerLeave(socket)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`)
})

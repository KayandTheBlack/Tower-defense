'use strict'
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { Game } = require('./Game.js')
var bodyParser = require('body-parser')

app.use(bodyParser.json())

/*
const GAMEOPS = {
  MAX_PLAYERS: 4,
  timeInterval: 700,
  gold: 200,
  lifes: 5,
  map: 'DOUBLE'
} */
const games = {}
// const game = new Game(GAMEOPS)
// setInterval(game.tick.bind(game), GAMEOPS.timeInterval)

app.use(express.static('dist'))
app.get('/', function (req, res) {
  res.sendfile('../dist/index.html')
})
app.post('/createGame', function (req, res) {
  console.log(req.body.ops)
  games[req.body.name] = new Game(req.body.ops)
  setInterval(games[req.body.name].tick.bind(games[req.body.name]), games[req.body.name].ops.timeInterval)
  res.status(200).send(req.body.name)
})

io.on('connection', function (socket) {
  console.log(`${socket.id} connected`)
  socket.on('joinGame', (id = 0) => {
    socket.gameId = id
    if(games[id] === undefined) return
    games[id].onPlayerJoin(socket)
  })

  socket.on('input', function (input) {
    if(games[socket.gameId] === undefined) return
    games[socket.gameId].onInput(socket, input)
  })

  socket.on('disconnect', function () {
    if(games[socket.gameId] === undefined) return
    console.log(`${socket.id} disconnected`)
    const game = games[socket.gameId]
    game.onPlayerLeave(socket)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`)
})

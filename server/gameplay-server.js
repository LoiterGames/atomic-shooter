const GAME = require('./game').default

const geckos = require('@geckos.io/server').default
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const io = geckos()

GAME.start()

io.addServer(server)
io.onConnection( channel => {
    const {id, maxMessageSize} = channel

    console.log(`received connection ${id}`)

    GAME.addPlayer(id)

    channel.onDrop(drop => {
        console.error(`dropped message: ${drop}`)
    })

    channel.join('bomb')

    channel.on('input', data => {
        console.log(`channel ${id} got input: ${JSON.stringify(data)}`)
        GAME.addInput(id, data)
    })

    channel.onDisconnect(reason => {
        console.log(`channel ${id} disconnected for reason: ${reason}`)
        GAME.removePlayer(id)
    })
})


// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default
server.listen(3000)

setInterval(() => {
    const snapshot = GAME.update(1/30)
    if (snapshot === null) return

    io.room('bomb').emit('snapshot', JSON.stringify(snapshot))
}, 33.3)
import http from 'http'
import https from 'https'
import fs from 'fs'
import express from 'express'
import geckos, {iceServers} from "@geckos.io/server";
import {SnapshotInterpolation} from "@geckos.io/snapshot-interpolation";

import {addLatencyAndPackagesLoss, handlePlayer} from './Utils.js'
import {GP} from '@bomb/shared/GP.js'
import {SharedConfig} from "@bomb/shared/SharedConfig.js";
import {MessageType, ActorType, Actor} from "@bomb/shared/PROTOC.js";
import {SharedHelper} from "@bomb/shared/SharedHelper.js";

SharedConfig.init('DEBUG_REMOTE')

console.log(JSON.stringify(SharedConfig, null, 2))


const app = express()

let server
let ice = []
if (SharedConfig.ENV === 'DEBUG_LOCAL') {
    server = http.createServer(app)
} else if (SharedConfig.ENV === 'DEBUG_REMOTE') {
    ice = iceServers
    server = https.createServer({
        key : fs.readFileSync(SharedConfig.SSL_KEY, 'utf-8'),
        cert : fs.readFileSync(SharedConfig.SSL_CERT, 'utf-8'),
        ca : fs.readFileSync(SharedConfig.SSL_CA, 'utf-8'),
    }, app)
}

// console.log('ice servers: ', ice)
const G = geckos()
const SI = new SnapshotInterpolation()

/** @type {Map<Types.ChannelId, Actor>} */
const players = new Map()
/** @type {Map<string, Actor>} */
const bombs = new Map()
/** @type {Map<string, Actor>} */
const pickups = new Map()


let tick = 0

let rotateTimer = 0
let rotateWarning = 0
let rotating = false
let rotateNextRow = -1
let rotateNextCol = -1
let rotateRow = []
let rotateCol = []


G.addServer(server)
// G.listen(ServerConfig.PORT)

G.onConnection(channel => {
    console.log(`now connected : ${channel.id}`)

    players.set(channel.id, Actor.createPlayer(Math.random() * 5 - 2.5, 0, Math.random() * 5 - 2.5))

    G.emit(MessageType.PLAYER_ADD, {id : channel.id, actor : players.get(channel.id)}, {reliable : true})

    channel.onDisconnect(() => {
        G.emit(MessageType.PLAYER_REMOVE, channel.id, {reliable : true})
        if (players.has(channel.id)) {
            players.delete(channel.id)
        }
    })

    channel.on(MessageType.MOVE, async data => {
        const loose = await addLatencyAndPackagesLoss(); if (loose) return;

        const player = handlePlayer(players, channel.id, MessageType.MOVE)
        if (!player) return;

        // if (player.incapacitated) {
        //     console.warn(`MOVE: player ${player} attempted to move (${data[0]}:${data[1]}) in incapacitated state`)
        //     return;
        // }

        // console.log(`velocity: ${channel.id}: ${data[0]}:${data[1]}`)
        player.vx = data[0]
        player.vz = data[1]
    })

    channel.on(MessageType.THROW, async data => {
        await addLatencyAndPackagesLoss() // will not discard guaranteed message

        const player = handlePlayer(players, channel.id, MessageType.MOVE)
        if (!player) return;

        console.log(`player ${channel.id} has signaled a throw`)
    })

    // channel.on('shoot', data => {
    //     addLatencyAndPackagesLoss(() => {
    //         const { x, y, time } = data
    //
    //         // get the two closest snapshot to the date
    //         const shots = SI.vault.get(time)
    //         if (!shots) return
    //
    //         // interpolate between both snapshots
    //         const shot = SI.interpolate(shots.older, shots.newer, time, 'x y')
    //         if (!shot) return
    //
    //         // check for a collision
    //         shot.state.forEach(entity => {
    //             if (
    //                 collisionDetection(
    //                     { x: entity.x, y: entity.y, width: 40, height: 60 },
    //                     // make the pointer 10px by 10px
    //                     { x: x - 5, y: y - 5, width: 10, height: 10 }
    //                 )
    //             ) {
    //                 channel.emit('hit', entity, { reliable: true })
    //             }
    //         })
    //     }, false)
    // })
})

let time = Date.now()

const loop = () => {
    const now = Date.now()
    const dt = (now - time)/1000
    time = now
    tick++

    // update world (physics etc.)
    players.forEach(player => {
        player.x += player.vx * GP.player.speed * dt
        player.z += player.vz * GP.player.speed * dt

        // player.vx = player.vy = 0
    })

    // send state on every N-th frame
    if (tick % SharedConfig.FRAME_SKIP === 0) {
        const worldState = []
        players.forEach((player, key) => {
            worldState.push({
                id: key,
                x: Math.floor(player.x*1000)/1000,//player.x.toFixed(2),
                z: Math.floor(player.z*1000)/1000
            })

        })

        const snapshot = SI.snapshot.create(worldState)
        SI.vault.add(snapshot)
        G.emit(MessageType.SNAPSHOT, snapshot)
    }

    if (players.size < 1) {
        rotateTimer = 0
        return;
    }

    if (rotateTimer === 0 && !rotating) {
        rotateNextCol = -1
        rotateNextRow = -1

        if (rotateCol.length === 0) {
            rotateCol = SharedHelper.fill(0, GP.environment.size-1)
        }
        if (rotateRow.length === 0) {
            rotateRow = SharedHelper.fill(0, GP.environment.size-1)
        }

        if (Math.random() > 0.5) {
            rotateNextCol = rotateCol.splice(Math.floor(Math.random() * rotateCol.length), 1)[0]
        } else {
            rotateNextRow = rotateRow.splice(Math.floor(Math.random() * rotateRow.length), 1)[0]
        }
    }

    rotateTimer += dt
    if (rotating) {
        if (rotateTimer > GP.environment.rotateTime) {
            rotateTimer = 0
            G.emit(MessageType.ROTATE_END, {}, {reliable : true})
            rotating = false
            rotateNextCol = -1
            rotateNextRow = -1
        }
    } else {
        const nextRotateWarning = GP.environment.rotateFrequency - GP.environment.rotateWarnings*GP.environment.rotateWarningTime + rotateWarning

        if (rotateTimer > GP.environment.rotateFrequency) {
            rotateTimer = 0
            rotateWarning = 0
            G.emit(MessageType.ROTATE_START, {
                col : rotateNextCol,
                row : rotateNextRow
            }, {reliable : true})
            rotating = true
        } else if (rotateTimer > nextRotateWarning) {
            rotateWarning++
            G.emit(MessageType.ROTATE_WARNING, {
                col : rotateNextCol,
                row : rotateNextRow
            }, {reliable : true})
        }
    }
    // G.emit(MessageType.PLAYER_REMOVE, channel.id, {reliable : true})
}

server.listen(SharedConfig.PORT, () => {
    console.log(`server launch success on port ${SharedConfig.PORT}`)
})

// server calculates position at 60 fps
// but sends a snapshot at 15 fps (to save bandwidth)
setInterval(loop, SharedConfig.FRAME_LENGTH)

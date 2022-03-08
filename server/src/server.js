import {addLatencyAndPackagesLoss, handlePlayer} from './Utils.js'

import GP from '@bomb/shared/GP.js'
import SharedConfig from "@bomb/shared/SharedConfig.js";
import {MessageType, ActorType, Actor} from "@bomb/shared/PROTOC.js";

import {SnapshotInterpolation} from "@geckos.io/snapshot-interpolation";
import geckos from "@geckos.io/server";

import http from 'http'
import express from 'express'
const app = express()
const server = http.createServer(app)

const G = geckos()
const SI = new SnapshotInterpolation()

/** @type {Map<Types.ChannelId, Actor>} */
const players = new Map()
/** @type {Map<string, Actor>} */
const bombs = new Map()
/** @type {Map<string, Actor>} */
const pickups = new Map()

let tick = 0

G.addServer(server)
// G.listen(ServerConfig.PORT)

G.onConnection(channel => {
    console.log(`connected : ${channel.id}`)

    players.set(channel.id, Actor.createPlayer(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5))

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
        player.vy = data[1]
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
        player.y += player.vy * GP.player.speed * dt

        // player.vx = player.vy = 0
    })

    // send state on every N-th frame
    if (tick % SharedConfig.FRAME_SKIP === 0) {
        const worldState = []
        players.forEach((player, key) => {
            worldState.push({
                id: key,
                x: Math.floor(player.x*1000)/1000,//player.x.toFixed(2),
                y: Math.floor(player.y*1000)/1000
            })

        })

        const snapshot = SI.snapshot.create(worldState)
        SI.vault.add(snapshot)
        G.emit(MessageType.SNAPSHOT, snapshot)
    }
}

server.listen(SharedConfig.PORT)

// server calculates position at 60 fps
// but sends a snapshot at 15 fps (to save bandwidth)
setInterval(loop, SharedConfig.FRAME_LENGTH)

import {SnapshotInterpolation, Vault} from "@geckos.io/snapshot-interpolation";
import {SharedConfig} from "@bomb/shared/SharedConfig";
import geckosClient from "@geckos.io/client";
import {Actor, MessageType} from "@bomb/shared/PROTOC";
import {Emitter} from "./util/Emitter";

export default class Link {

    SI = new SnapshotInterpolation(SharedConfig.TARGET_FPS/SharedConfig.FRAME_SKIP)
    players = new Map()

    connected = false

    get id() {
        return this._channel?.id || undefined
    }

    /** @return {Actor} */
    get self() {
        return this.players.get(this._channel?.id)
    }

    constructor() {

        Object.assign(this, Emitter())

        // console.log(SharedConfig)
        this._channel = geckosClient({
            url : SharedConfig.URL,
            port : SharedConfig.PORT
        })

        this._channel.onConnect(() => {})
            .then(err => {
                if (err) return console.error(err.message)
                this.connected = true
            })
            .catch(e => {
                console.error(e)
                console.error('Could not connect')
            })

        this._channel.on(MessageType.PLAYER_ADD, value => {
            console.log(value)

            this.players.set(value.id, Actor.createFromSnapshot(value.actor))
        })

        this._channel.on(MessageType.SNAPSHOT, value => {
            // console.log(value)
            this.SI.snapshot.add(value)
        })

        this._channel.on(MessageType.PLAYER_REMOVE, value => {
            this.players.delete(value)
        })
    }


}
const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation')
const SI = new SnapshotInterpolation(30)

class _Player {
    id = null
    x = 0
    y = 0
    z = 0
    inputs = []

    constructor(id) {
        this.id = id
    }
}

class _Game {

    players = []

    start() {

    }

    addInput(id, i) {
        const player = this.players.find(p => p.id === id)
        player.inputs.push(i)
    }

    addPlayer(id) {
        this.players.push(new _Player(id))
    }

    removePlayer(id) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                this.players.splice(i, 1)
                return;
            }
        }
    }

    update(dt) {
        if (this.players.length === 0) {
            // console.log('skipping beat')
            return null
        }

        for (let i = 0; i < this.players.length; i++) {
            const p = this.players[i]
            while (p.inputs.length) {
                const frameInput = p.inputs.shift()
                p.x += frameInput.x * dt
                p.z += frameInput.y * dt
            }
        }

        const snapshot = this.players.map(p => {
            return {id : p.id, x : p.x, y : p.y}
        })

        return SI.snapshot.create(snapshot)
    }
}

exports.default = new _Game()
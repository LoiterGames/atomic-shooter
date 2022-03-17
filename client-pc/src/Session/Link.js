//assetId=72642411
//# sourceURL=Link.js
const Link = pc.createScript('link');

Link.prototype.start = function() {

    this.SI = new Snap.SnapshotInterpolation(SharedConfig.TARGET_FPS/SharedConfig.FRAME_SKIP)

    /**
     * @type {Map<string, Actor>}
     */
    this.players = new Map()
    this.connected = false

    // const SI = new SnapshotInterpolation(15)
    this.channel = geckos({
        url : SharedConfig.URL,
        port : SharedConfig.PORT
    })

    this.channel.onConnect(() => {
        // dont know what to really do here
    }).then(err => {
        // console.log('on connect promise')
        if (err) return console.error(err)

        this.connected = true
    }).catch(e => {
        console.error(e)
        console.error('could not connect')
    })

    this.channel.on(MessageType.PLAYER_ADD, value => {
        // console.log(`adding player ${value.id}, is self: ${value.id === this.channel.id}`)
        this.players.set(value.id, Actor.createFromSnapshot(value.actor))
        this.entity.fire(MessageType.PLAYER_ADD, value)
    })

    this.channel.on(MessageType.SNAPSHOT, value => {
        this.SI.snapshot.add(value)
    })

    this.channel.on(MessageType.PLAYER_REMOVE, value => {
        this.entity.fire(MessageType.PLAYER_REMOVE, value)
    })

    this.channel.on(MessageType.ROTATE_WARNING, value => {
        Singleton.session.environment.onWarning(value.col, value.row)
    })

    this.channel.on(MessageType.ROTATE_START, value => {
        // console.error('start rotation', value)
        if (value.col > -1) {
            Singleton.session.environment.rotateCol(value.col)
        }
        if (value.row > -1) {
            Singleton.session.environment.rotateRow(value.row)
        }
    })

    this.channel.on(MessageType.ROTATE_END, value => {
        // console.error('end rotation')

    })
};

// update code called every frame
Link.prototype.update = function(dt) {

};
//assetId=72336059
//jshint asi: true
//# sourceURL=EntrySession.js
const EntrySession = pc.createScript('entrySession');

EntrySession.attributes.add('playerPrefab', {type : 'asset', assetType:'template'})

// initialize code called once per entity
EntrySession.prototype.postInitialize = function() {

    /**
     * @type {Map<string, VisualPlayer>}
     */
    this.visualPlayers = new Map()

    this.link = Singleton.link

    console.log('will start to do stuff')
    SharedConfig.init('DEBUG_REMOTE')
    this.link.start()

    Singleton.link.on(MessageType.PLAYER_REMOVE, playerId => {
        console.log(this, playerId)

    })
};

// update code called every frame
EntrySession.prototype.update = function(dt) {

    if (!this.link.connected) return

    Singleton.input.manualUpdate(dt)

    this.link.channel.emit(MessageType.MOVE, [Singleton.input.x, Singleton.input.y])

    // const snapshot = link.SI.calcInterpolation('x z')
    const snapshot = this.link.SI.vault.get()

    if (!snapshot) return;

    for (let i = 0; i < snapshot.state.length; i++) {
        const id = snapshot.state[i].id
        const x = snapshot.state[i].x
        const z = snapshot.state[i].z

        let isSelf = false
        if (id === this.link.channel.id) {
            isSelf = true
            // get from local vault
        }

        if (!this.visualPlayers.has(id)) {
            console.log('will add missing player with id', id)
            const playerE = this.playerPrefab.resource.instantiate()
            this.app.root.addChild(playerE)

            this.visualPlayers.set(id, playerE.script.visualPlayer)
            playerE.script.visualPlayer.start(x, z, isSelf)
        }

        this.visualPlayers.get(id).manualUpdate(x, z)
    }
};
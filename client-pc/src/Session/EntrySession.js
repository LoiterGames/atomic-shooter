//assetId=72336059
//jshint asi: true
//# sourceURL=EntrySession.js
const EntrySession = pc.createScript('entrySession');

EntrySession.attributes.add('playerPrefab', {type : 'asset', assetType:'template'})

// initialize code called once per entity
EntrySession.prototype.postInitialize = function() {

    Singleton.session.environment.start()

    /**
     * @type {Map<string, VisualPlayer>}
     */
    this.visualPlayers = new Map()

    this.link = Singleton.session.link
    this.input = Singleton.session.input

    this.localVault = new Snap.Vault()

    console.log('will start to do stuff')
    SharedConfig.init('DEBUG_REMOTE')
    this.link.start()

    Singleton.session.link.on(MessageType.PLAYER_REMOVE, playerId => {
        console.log(this, playerId)
    })
};

EntrySession.prototype._prediction = function(dt) {
    const player = this.link.players.get(this.link.channel.id)

    if (!player) return;

    player.x = player.x + this.input.velocity.x * this.input.power * GP.player.speed * dt
    player.z = player.z + this.input.velocity.y * this.input.power * GP.player.speed * dt

    this.localVault.add(this.link.SI.snapshot.create([{
        id : this.link.channel.id,
        x : player.x,
        z : player.z
    }]))
}

EntrySession.prototype._reconsiliation = function(dt) {

    // for now, don't reconsile on stop to avoid rubber banding
    const isMoving = input.x !== 0 || input.y !== 0
    if (!isMoving) return;

    const player = this.link.players.get(this.link.channel.id)

    if (!player) return;

    const serverSnapshot = this.link.SI.vault.get()
    if (!serverSnapshot) return;

    const localSnapshot = this.localVault.get(serverSnapshot.time, true)
    if (!localSnapshot) return;

    const serverPos = serverSnapshot.state.filter(s => s.id === this.link.id)[0]

    const offsetX = localSnapshot.state[0].x - serverPos.x
    const offsetZ = localSnapshot.state[0].z - serverPos.z

    // apply a step by step correction of the player's position
    player.x -= offsetX / SharedConfig.RECONSILE_DELTA
    player.z -= offsetZ / SharedConfig.RECONSILE_DELTA
}

// update code called every frame
EntrySession.prototype.update = function(dt) {

    if (!this.link.connected) return

    Singleton.session.input.manualUpdate(dt)

    this.link.channel.emit(MessageType.MOVE, [this.input.velocity.x * this.input.power, this.input.velocity.y * this.input.power])

    this._prediction(dt)

    const snapshot = this.link.SI.calcInterpolation('x z')
    // const snapshot = this.link.SI.vault.get()

    if (!snapshot) return;

    for (let i = 0; i < snapshot.state.length; i++) {
        const id = snapshot.state[i].id
        let x = snapshot.state[i].x
        let z = snapshot.state[i].z

        let isSelf = false
        if (id === this.link.channel.id) {
            isSelf = true
            x = this.localVault.get().state[0].x
            z = this.localVault.get().state[0].z
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
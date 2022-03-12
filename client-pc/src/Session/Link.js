//assetId=72642411
//# sourceURL=Link.js
const Link = pc.createScript('link');

// initialize code called once per entity
Link.prototype.initialize = function() {

    this.players = new Map()
    this.connected = false

    // const SI = new SnapshotInterpolation(15)
    this.channel = geckos({
        url : 'https://nikitka.live',
        port : 9208
    })

    this.channel.onConnect().then(err => {
        if (err) return console.error(err)

        this.connected = true
    })

    this.channel.on('PLAYER_ADD', value => {
        console.log(value)

        // this.players.set(value.id, )
    })
};

// update code called every frame
Link.prototype.update = function(dt) {

};
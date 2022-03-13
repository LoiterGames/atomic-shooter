//assetId=72334827
//jshint asi: true
//# sourceURL=UIFullscreenButton.js
var UifullscreenButton = pc.createScript('uifullscreenButton');

// initialize code called once per entity
UifullscreenButton.prototype.initialize = function() {
    if (!this.entity.element) {
        throw `Fullscreen button script should have an element attached!`
    }

    this.entity.element.on('click', function(e) {
        this.app.enableFullscreen(null,
            function() {
                console.log('going to fullscreen')
            }.bind(this),
            function(e) {
                this.element.useInput = false;
                this.tween.to(this.opacity, 0.3, pc.Linear).start()
            }.bind(this))
    }, this)

    this.opacity = {opacity : 1};
    this.tween = this.entity.tween(this.element)
}
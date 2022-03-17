//assetId=73367100
//jshint asi: true
//# sourceURL=Chunk.js
const Chunk = pc.createScript('chunk');

Chunk.attributes.add('material', {type : 'entity'})
Chunk.attributes.add('defaultColor', {type : 'rgb'})
Chunk.attributes.add('warningColor', {type : 'rgb'})
Chunk.attributes.add('warningTime', {type : 'number'})
Chunk.attributes.add('warningCurve', {type : 'string'})

Chunk.prototype.start = function() {
    this.time = 0
    this.isWarning = false

    /**
     * @type {pc.StandardMaterial}
     */
    this.matInstance = this.material.render.material.clone()
    this.material.render.material = this.matInstance

    this.currentColor = new pc.Color()
}

Chunk.prototype.startWarning = function() {
    this.time = 0
    this.isWarning = true
    this.direction = 1

    console.log('warning stated')
}

Chunk.prototype.highlight = function() {
    this.matInstance.diffuse = this.warningColor
    this.matInstance.update()
}

Chunk.prototype.highlightReset = function() {
    this.matInstance.diffuse = this.defaultColor
    this.matInstance.update()
}

Chunk.prototype.update = function (dt) {
    if (this.isWarning) {
        this.time = pc.math.clamp(this.time + dt*this.direction, 0, this.warningTime)

        if (this.time === this.warningTime && this.direction > 0) {
            this.direction = -1
        }

        if (this.time === 0 && this.direction < 0) {
            this.time = 0
            this.isWarning = false
            this.direction = 0

        }

        this.matInstance.diffuse = this.currentColor.lerp(this.defaultColor, this.warningColor, pc[this.warningCurve](this.time))
        this.matInstance.update()
    }
}


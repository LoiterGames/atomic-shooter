//assetId=72334833
//jshint asi: true
//# sourceURL=UIComposerButton.js
var UicomposerButton = pc.createScript('uicomposerButton');

UicomposerButton.attributes.add('animatedElement', {type : 'entity'})

// initialize code called once per entity
UicomposerButton.prototype.initialize = function() {
    if (!this.entity.element) {
        throw `entity ${this.entity.name} does not have element - trying to button up`
    }

    /** @type {pc.Entity} */
    this.scaleTarget = this.animatedElement || this.entity

    const scale = this.scaleTarget.getLocalScale()
    this.originalScale = new pc.Vec3(scale.x, scale.y, scale.z)
    this.tween = this.scaleTarget.tween(scale)

    if (this.app.touch === null) {
        this.scaleTarget.element.on(pc.EVENT_MOUSEDOWN, this.onClick, this)
    } else {
        this.scaleTarget.element.on(pc.EVENT_TOUCHSTART, this.onClick, this)
    }
    // this.scaleTarget.element.on('click', this.onClick, this)

    this.composer = Singleton.composer
};

UicomposerButton.prototype.onClick = function() {
    this.tween.stop()

    const scaleT = this.composer.buttonScaleT
    const duration = this.composer.buttonDuration
    const ease = this.composer.buttonEase

    this.scaleTarget.setLocalScale(this.originalScale.x * scaleT, this.originalScale.y * scaleT, this.originalScale.z * scaleT)
    this.tween.to(this.originalScale, duration, pc[ease]).start()
}

UicomposerButton.prototype.setEnabled = function(value) {
    this.entity.element.useInput = value

    if (value) {
        this.entity.element.color = pc.Color.WHITE
        this.entity.element.opacity = 1
    } else {
        this.entity.element.color = this.composer.buttonDisableColor
        this.entity.element.opacity = this.composer.buttonDisableColor.a
    }
}
//assetId=72327001
//jshint asi: true
//# sourceURL=TouchInput.js
const TouchInput = pc.createScript('touchInput')

TouchInput.attributes.add('controlsRoot', {type: 'entity'})
TouchInput.attributes.add('overlay', {type: 'entity'})
TouchInput.attributes.add('pointerAnchor', {type: 'entity'})
TouchInput.attributes.add('vPointer', {type: 'entity'})

TouchInput.attributes.add('maxDrag', {type: 'number'})
TouchInput.attributes.add('deadZone', {type : 'number'})
TouchInput.attributes.add('controlsEnabled', {type : 'boolean'})

TouchInput.prototype.initialize = function() {
    this.velocity = new pc.Vec2(0, 0)
    this.power = 0

    this._device = this.app.graphicsDevice

    this.dragging = false
    this.pointer = new pc.Vec2()
    this.center = new pc.Vec2()
    this.anchorTouch = null
    
    this.showStick = false;
    
    if (this.app.touch === null) {
        if (Helper.params.debug === 'true') {
            console.log('this device does not support touch. will debug touch control')
            this.showStick = true
            this.app.mouse.on(pc.EVENT_MOUSEMOVE, function(event) {
                if (!this.controlsEnabled) return;
                if (this.dragging) {
                    event.event.stopImmediatePropagation();
                    this.pointer.set(event.x, event.y)
                }
            }, this)

            this.app.mouse.on(pc.EVENT_MOUSEUP, function(event) {
                if (!this.controlsEnabled) return;
                if (!this.dragging) return
                event.event.stopImmediatePropagation();
                this.dragging = false
                this.vPointer.setLocalPosition(this.pointerAnchor.getLocalPosition())
                this.power = 0

            }, this)

            this.overlay.element.on('mousedown', function (event) {
                if (!this.controlsEnabled) return;
                event.event.stopImmediatePropagation();

                this.pointer.set(event.x, event.y)
                this.dragging = true
            }, this);
            
        } else {
            console.log('this device does not support touch')
            this.showStick = false
            this.controlsRoot.enabled = false
        }
    } else {
        console.log('this device does support touch')
        this.showStick = true
        
        this.overlay.element.on(pc.EVENT_TOUCHSTART, this._startDrag, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this._moveDrag, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this._endDrag, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this._endDrag, this);
    }
};

TouchInput.prototype.disableControls = function() {
    this.controlsEnabled = false
}

TouchInput.prototype.enableControls = function() {
    this.controlsEnabled = true
}

TouchInput.prototype.showControls = function() {
    if (this.showStick) {
        // for (var i = 0; i < this.controlsRoot.children.length; i++) {
        //     if (this.controlsRoot.children[i].script) {
        //         this.controlsRoot.children[i].script.tween.play()
        //     }
        // }
    }
}

TouchInput.prototype.hideControls = function() {
    // for (var i = 0; i < this.controlsRoot.children.length; i++) {
    //     this.controlsRoot.children[i].element.opacity = 0
    // }
}

TouchInput.prototype._startDrag = function(e) {
    if (!this.controlsEnabled) return;
    if (this.dragging) return

    console.log(e)
    this.anchorTouch = e.touches[0]
    // e.event.preventDefault()

    this.dragging = true
    
    var touch = e.touches[0]
    this.pointer.set(touch.clientX, touch.clientY)
    if (typeof(this.pointer.x) === 'undefined') {
        console.error('what')
    }
}

TouchInput.prototype._moveDrag = function(e) {
    if (!this.controlsEnabled) return;
    if (!this.dragging) return;

    // e.event.preventDefault()
    
    var touch = e.touches[0]
    this.pointer.set(touch.x, touch.y)
    if (typeof(this.pointer.x) === 'undefined') {
        console.error('what')
    }
}

TouchInput.prototype._endDrag = function(e) {
    if (!this.controlsEnabled) return;
    if (!this.dragging) return;
    
    if (e.touches.length > 0) {
        var touches = e.changedTouches
        var endedAnchorTouch = false
        for (var i = 0; i < touches.length; i++) {
            if (touches[i].identifier !== this.anchorTouch.identifier) continue;
            endedAnchorTouch = true
        }

        if (!endedAnchorTouch) return
    }
    
    // e.event.preventDefault()
    this.dragging = false
    this.vPointer.setLocalPosition(this.pointerAnchor.getLocalPosition())
    this.power = 0
}


// update code called every frame
TouchInput.prototype.manualUpdate = function(dt) {
    if (!this.controlsEnabled) return;
    if (!this.dragging) return;
    
    const d = this.app.graphicsDevice

    const screen = this.vPointer.element.screen.screen
    const scale = screen.scale;

    const clientSizeX = d.clientRect.width;
    const clientSizeY = d.clientRect.height;

    const scaleBlendX = screen.referenceResolution.x / screen.resolution.x

    const pointerX = this.pointer.x / clientSizeX
    const pointerY = this.pointer.y / clientSizeY

    const screenSizeX = screen.referenceResolution.x
    const screenSizeY = screen.referenceResolution.y

    const ar = screenSizeX/screenSizeY
    const realAR = clientSizeX/clientSizeY
    const arScale = ar/realAR

    const anchorPos = this.pointerAnchor.getLocalPosition()
    const anchorX = this.pointerAnchor.element.anchor.x
    const anchorY = (screenSizeY - this.pointerAnchor.getLocalPosition().y) / screenSizeY

    const xOffset = (pointerX - anchorX) * screenSizeX
    const yOffset = (pointerY - anchorY) * screenSizeY

    const offset = new pc.Vec3(xOffset * 1/arScale, -yOffset, 0)
    const len = offset.length()
    if (len > this.maxDrag) {
        offset.normalize().scale(this.maxDrag)
        this.vPointer.setLocalPosition(anchorPos.x + offset.x, anchorPos.y + offset.y, 0)
        this.velocity.set(-offset.x, offset.y).normalize()
        this.power = 1
    } else if (len < this.deadZone) {
        this.vPointer.setLocalPosition(this.pointerAnchor.getLocalPosition())
        this.power = 0
    } else {
        this.vPointer.setLocalPosition(anchorPos.x + offset.x, anchorPos.y + offset.y, 0)
        this.velocity.set(-offset.x, offset.y).normalize()
        this.power = 1
    }
    
    if (Number.isNaN(this.velocity.x) || Number.isNaN(this.velocity.y)) {
        console.error('what')
    }
}
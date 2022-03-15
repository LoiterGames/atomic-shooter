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
    this.input = new pc.Vec2(0, 0)
    
    this._device = this.app.graphicsDevice
    var d = this.app.graphicsDevice


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
                this.input.set(0, 0)
                
            }, this)

            this.overlay.element.on('mousedown', function (event) {
                if (!this.controlsEnabled) return;
                event.event.stopImmediatePropagation();

                this.pointer.set(event.x, event.y)
                this.dragging = true
            }, this);
            
        } else {
            console.log('this device does not support touch. will do mouse control')
            this.showStick = false
            this.controlsRoot.enabled = false
            
            this.app.mouse.on(pc.EVENT_MOUSEMOVE, function(event) {
                if (!this.controlsEnabled) return;
                event.event.stopImmediatePropagation();
                
                this.center.set(event.element.clientWidth/2, event.element.clientHeight/2)
                
                this.pointer.set(event.x, event.y)
                
                this.input = this.input.sub2(this.pointer, this.center).normalize()
                this.input.set(-this.input.y, this.input.x)
                // var w =
                // if (this.dragging) {
                //     event.event.stopImmediatePropagation();
                //     this.pointer.set(event.x, event.y)
                // }
            }, this)
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
        for (var i = 0; i < this.controlsRoot.children.length; i++) {
            if (this.controlsRoot.children[i].script) {
                this.controlsRoot.children[i].script.tween.play()
            }
        }
    }
}

TouchInput.prototype.hideControls = function() {
    for (var i = 0; i < this.controlsRoot.children.length; i++) {
        this.controlsRoot.children[i].element.opacity = 0
    }
}

TouchInput.prototype._startDrag = function(e) {
    if (!this.controlsEnabled) return;
    if (this.dragging) return

    // console.log(e)
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
    this.input.set(0, 0)
}


// update code called every frame
TouchInput.prototype.manualUpdate = function(dt) {
    if (!this.controlsEnabled) return;
    if (!this.dragging) return;
    
    var d = this.app.graphicsDevice
    
    var screen = this.vPointer.element.screen.screen
    var scale = screen.scale;
    
    var clientSizeX = d.clientRect.width;
    var clientSizeY = d.clientRect.height;
    
    var scaleBlendX = screen.referenceResolution.x / screen.resolution.x
    
    var pointerX = this.pointer.x / clientSizeX
    var pointerY = this.pointer.y / clientSizeY
    
    var screenSizeX = screen.referenceResolution.x
    var screenSizeY = screen.referenceResolution.y
    
    var ar = screenSizeX/screenSizeY
    var realAR = clientSizeX/clientSizeY
    var arScale = ar/realAR

    var anchorPos = this.pointerAnchor.getLocalPosition()
    var anchorX = this.pointerAnchor.element.anchor.x
    var anchorY = (screenSizeY - this.pointerAnchor.getLocalPosition().y) / screenSizeY

    var xOffset = (pointerX - anchorX) * screenSizeX
    var yOffset = (pointerY - anchorY) * screenSizeY
    
    var offset = new pc.Vec3(xOffset * 1/arScale, -yOffset, 0)
    var len = offset.length()
    if (len > this.maxDrag) {
        offset.normalize().scale(this.maxDrag)
        this.vPointer.setLocalPosition(anchorPos.x + offset.x, anchorPos.y + offset.y, 0)
        this.input.set(-offset.x, offset.y).normalize()
    } else if (len < this.deadZone) {
        this.vPointer.setLocalPosition(this.pointerAnchor.getLocalPosition())
        // this.input.set(0, 0)
    } else {
        this.vPointer.setLocalPosition(anchorPos.x + offset.x, anchorPos.y + offset.y, 0)
        this.input.set(-offset.x, offset.y).normalize()
    }
    
    if (Number.isNaN(this.input.x) || Number.isNaN(this.input.y)) {
        console.error('what')
    }
}
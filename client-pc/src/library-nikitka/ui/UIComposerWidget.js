//assetId=68146909
const UIComposerBehaviour = {
    SIMPLE : 'SIMPLE',
    FADE : 'FADE',
    SCALE : 'SCALE',
    HIDE_UP : 'HIDE_UP',
}

//jshint asi: true
//# sourceURL=UIComposerWidget.js

const UicomposerWidget = pc.createScript('uicomposerWidget');

UicomposerWidget.attributes.add('behaviour', {
    type : 'string',
    enum : [
        {[UIComposerBehaviour.SIMPLE] : UIComposerBehaviour.SIMPLE},
        {[UIComposerBehaviour.FADE] : UIComposerBehaviour.FADE},
        {[UIComposerBehaviour.SCALE] : UIComposerBehaviour.SCALE},
        {[UIComposerBehaviour.HIDE_UP] : UIComposerBehaviour.HIDE_UP},
    ]
})

// initialize code called once per entity
UicomposerWidget.prototype.initialize = function() {
    /** @type {pc.ElementComponent} */
    this.element = this.entity.element

    this.originalPosition = null
    this.hideToPosition = null;

    this.originalScale = null;
    this.hideToScale = null;

    this.customHidden = false

    if (this.element) this.needInput = this.element.useInput

    if (this.behaviour === UIComposerBehaviour.FADE) {
        this.tween = this.entity.tween(this.element)
    } else if (this.behaviour === UIComposerBehaviour.HIDE_UP) {
        const pos = this.entity.getLocalPosition()
        this.tween = this.entity.tween(pos)
        this.originalPosition = new pc.Vec3(pos.x, pos.y, pos.z)
        this.hideToPosition = new pc.Vec3(pos.x, -pos.y, pos.z)
    } else if (this.behaviour === UIComposerBehaviour.SCALE) {
        const scale = this.entity.getLocalScale()
        this.tween = this.entity.tween(scale)
        this.originalScale = new pc.Vec3(scale.x, scale.y, scale.z)
        this.hideToScale = new pc.Vec3(0, 0, 0)
    }
};

UicomposerWidget.prototype.setExternalHide = function(value) {
    this.customHidden = value
}

UicomposerWidget.prototype.hide = function(duration, ease) {
    if (this.element) {
        this.element.useInput = false
    }

    this.interruptTweens()

    if (this.behaviour === UIComposerBehaviour.FADE) {
        this.tween.to({opacity : 0}, duration, pc[ease]).start()
    } else if (this.behaviour === UIComposerBehaviour.SIMPLE) {
        this.entity.enabled = false
    } else if (this.behaviour === UIComposerBehaviour.HIDE_UP) {
        this.tween.to(this.hideToPosition, duration, pc[ease]).start()
    } else if (this.behaviour === UIComposerBehaviour.SCALE) {
        this.tween.to(this.hideToScale, duration, pc[ease]).start()
    }
}

UicomposerWidget.prototype.show = function(duration, delay, ease) {
    if (this.customHidden) return

    if (this.element) {
        this.element.useInput = this.needInput
    }

    this.interruptTweens()

    if (this.behaviour === UIComposerBehaviour.FADE) {
        this.tween.to({opacity : 1}, duration, pc[ease], delay).start()
    } else if (this.behaviour === UIComposerBehaviour.SIMPLE) {
        this.entity.enabled = true
    } else if (this.behaviour === UIComposerBehaviour.HIDE_UP) {
        this.tween.to(this.originalPosition, duration, pc[ease]).start()
    } else if (this.behaviour === UIComposerBehaviour.SCALE) {
        this.tween.to(this.originalScale, duration, pc[ease]).start()
    }
}

UicomposerWidget.prototype.showInstant = function() {
    if (this.customHidden) return

    if (this.element) {
        this.element.useInput = this.needInput
    }

    this.interruptTweens()

    if (this.behaviour === UIComposerBehaviour.FADE) {
        this.element.opacity = 1
    } else if (this.behaviour === UIComposerBehaviour.SIMPLE) {
        this.entity.enabled = true
    } else if (this.behaviour === UIComposerBehaviour.HIDE_UP) {
        this.entity.setLocalPosition(this.originalPosition)
    } else if (this.behaviour === UIComposerBehaviour.SCALE) {
        this.entity.setLocalScale(this.originalScale)
    }
}

UicomposerWidget.prototype.hideInstant = function() {
    if (this.element) {
        this.element.useInput = false
    }

    this.interruptTweens()

    if (this.behaviour === UIComposerBehaviour.FADE) {
        this.element.opacity = 0
    } else if (this.behaviour === UIComposerBehaviour.SIMPLE) {
        this.entity.enabled = false
    } else if (this.behaviour === UIComposerBehaviour.HIDE_UP) {
        this.entity.setLocalPosition(this.hideToPosition)
    } else if (this.behaviour === UIComposerBehaviour.SCALE) {
        this.entity.setLocalScale(this.hideToScale)
    }
}

UicomposerWidget.prototype.interruptTweens = function() {
    for (let key in this.entity.script) {
        const script = this.entity.script[key]
        if (script['interruptAll']) {
            script.interruptAll()
        }
    }
}
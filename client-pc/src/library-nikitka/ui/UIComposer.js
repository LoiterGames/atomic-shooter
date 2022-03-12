//assetId=68146907
var UIComposition = {
    MENU_MAIN : 'MENU_MAIN',
    MENU_SELECT : 'MENU_SELECT'
}

//jshint asi: true
//# sourceURL=UIComposer.js
var Uicomposer = pc.createScript('uicomposer');

Uicomposer.attributes.add('showDuration', {type : 'number'})
Uicomposer.attributes.add('showDelay', {type : 'number'})
Uicomposer.attributes.add('showEase', {type : 'string'})

Uicomposer.attributes.add('hideDuration', {type : 'number'})
Uicomposer.attributes.add('hideEase', {type : 'string'})

Uicomposer.attributes.add('startComposition', {type : 'string', default : UIComposition.MENU_MAIN})
Uicomposer.attributes.add('MENU_MAIN', {type : 'entity', array : true})
Uicomposer.attributes.add('MENU_SELECT', {type : 'entity', array : true})

Uicomposer.attributes.add('buttonDuration', {type : 'number'})
Uicomposer.attributes.add('buttonScaleT', {type : 'number'})
Uicomposer.attributes.add('buttonEase', {type : 'string'})
Uicomposer.attributes.add('buttonDisableColor', {type : 'rgba'})

// initialize code called once per entity
Uicomposer.prototype.postInitialize = function() {
    this.current = null

    this.allElements = []
    for (let key in UIComposition) {
        this.allElements.push(...this[key])
    }

    this.lockedState = {}

    this.goTo(this.startComposition)
};

// update code called every frame
Uicomposer.prototype.update = function(dt) {

};

/**
 * @param locked {Boolean}
 * @param e {pc.Entity}
 * @private
 */
Uicomposer.prototype._setLock = function(locked, e) {
    /** @type {UicomposerButton} */
    const button = e.script.uicomposerButton
    if (button) {
        console.log('locking button', e.name)
        if (locked) {
            button.setEnabled(false)
        } else {
            button.setEnabled(true)
        }
    } else {
        for (let i = 0; i < e.children.length; i++) {
            if (!e.children[i].entity) continue; // might be a self GraphNode
            if (!e.children[i].element) continue; // might be an empty entity without element
            this._setLock(locked, e.children[i].element)
        }

        if (e.element) { // might be screen or empty entity
            console.log('locking element', e.path)
            if (locked) {
                this.lockedState[e._guid] = e.element.useInput
                e.element.useInput = false
            } else {
                e.element.useInput = this.lockedState[e._guid]
            }
        }
    }

    if (locked === false) {
        this.lockedState = {}
    }
}

Uicomposer.prototype.setLock = function(value) {
    const elementsToLock = this[this.current]
    for (let i = 0; i < elementsToLock.length; i++) {
        this._setLock(value, elementsToLock[i])
    }

    console.log(this.lockedState)
}

Uicomposer.prototype.goTo = function(composition) {
    if (this.current) {

        console.log(`will switch ${this.current}->${composition}`)

        const elementsToHide = this[this.current]
        const elementsToShow = this[composition]
        for (let i = 0; i < elementsToHide.length; i++) {
            /** @type {UicomposerWidget} */
            const el = elementsToHide[i].script.uicomposerWidget
            el.hide(this.hideDuration, this.hideEase)
        }

        for (let i = 0; i < elementsToShow.length; i++) {
            /** @type {UicomposerWidget} */
            const el = elementsToShow[i].script.uicomposerWidget
            el.show(this.showDuration, this.showDelay, this.showEase)
        }

        this.current = composition
    } else {
        for (let i = 0; i < this.allElements.length; i++) {
            /** @type {UicomposerWidget} */
            const el = this.allElements[i].script.uicomposerWidget
            el.hideInstant()
        }

        this.current = composition

        const elementsToShow = this[this.current]
        for (let i = 0; i < elementsToShow.length; i++) {
            /** @type {UicomposerWidget} */
            const el = elementsToShow[i].script.uicomposerWidget
            el.showInstant()
        }
    }
}
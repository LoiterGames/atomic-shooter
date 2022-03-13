//assetId=72334828
//jshint asi: true
//# sourceURL=Inventory.js
const SAVE_KEY = "harvest-game-rnd"

const Inventory = {

    level_opened : 0,
    level_selected : 0,
    level_best : [0],
    tractors_opened : [0],
    tractor_selected : 0,   // selection to enter gameplay
    tractor_selected_in_menu : 0, // temp selection

    grass_in_pocket : [0],
    grass_after_game : [],

    settings_quality : 1, // 0-1-2 for low-med-high
    settings_sound : 1, // 0-1 for off-on

    user_name : 'Player#322',

    //
    // concrete helper functions

    getBestAtSelected() {
        const value = this.level_best[this.level_selected]
        if (typeof (value) === "undefined") {
            this.level_best[this.level_selected] = 0
            this.save()
            return 0
        }
        return value
    },

    debugAddGrass(grassType, amount) {
        this.grass_after_game[grassType] = amount
        this.save()
        window.location.reload()
    },

    //
    // generic routines
    //

    load : function() {
        const value = localStorage.getItem(SAVE_KEY)
        if (value && value.length > 0) {
            const loaded = JSON.parse(value)
            console.warn('loading save: ', loaded)
            Object.assign(this, loaded)
        } else {
            console.warn('no save, starting new game')
        }
    },

    save : function() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this))
    },

    clear : function() {
        localStorage.setItem(SAVE_KEY, '')
        window.location.reload()
    }
}
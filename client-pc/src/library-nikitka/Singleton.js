//assetId=72334831
//jshint asi: true
//# sourceURL=Singleton.js
const Singleton = {
    _instance : null,
    _cache : null,
    _checkCache() {
        if (!this._instance) {
            this._cache = {}
            const entity = new pc.Entity('SINGLETON')
            this._instance = entity
            pc.app.root.addChild(entity)
        }
    },

    _get: function(what) {
        if (typeof(this._cache['_cached_' + what]) === 'undefined') {
            this._cache['_cached_' + what] = pc.app.root.find(
                /**
                 * @param node {GraphNode}
                 * @returns {boolean}
                 */
                function(node) {
                    if (!node.script) return false;
                    return typeof(node.script._scriptsData[what]) !== 'undefined';
            })[0].script[what];
        }
        return this._cache['_cached_' + what];
    },

//
// CONCRETE TYPES BELOW
//

    /**
     * @return {Link}
     */
    get link() {
        this._checkCache()
        return this._get('link')
    },

    /**
     * @return {TouchInput}
     */
    get input() {
        this._checkCache()
        return this._get('touchInput')
    },

    /**
     * @return {EntrySession}
     */
    get session() {
        this._checkCache()
        return this._get('entrySession')
    },
}
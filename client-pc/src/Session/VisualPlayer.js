//assetId=72731159
//# sourceUrl=VisualPlayer.js
const VisualPlayer = pc.createScript('visualPlayer');

VisualPlayer.attributes.add('selfMaterial', {type : 'asset', assetType : 'material', array : true})
VisualPlayer.attributes.add('enemyMaterial', {type : 'asset', assetType : 'material', array : true})
VisualPlayer.attributes.add('materialRoots', {type : 'entity', array : true})

VisualPlayer.prototype.start = function(startX, startZ, isSelf) {
    /**
     * @type {AnimComponent | AnimComponentSystem}
     */
    this.animator = this.entity.anim

    for (let i = 0; i < this.materialRoots.length; i++) {
        if (isSelf) {
            this.materialRoots[i].render.materialAssets = [this.selfMaterial[i]]
        } else {
            this.materialRoots[i].render.materialAssets = [this.enemyMaterial[i]]
        }
    }

    this.lastX = startX
    this.lastZ = startZ
    this.entity.setPosition(startX, 0, startZ)
}

VisualPlayer.prototype.manualUpdate = function(nextX, nextZ) {

}
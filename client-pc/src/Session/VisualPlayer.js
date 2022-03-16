//assetId=72731159
//# sourceUrl=VisualPlayer.js
const VisualPlayer = pc.createScript('visualPlayer');

VisualPlayer.attributes.add('selfMaterial', {type : 'asset', assetType : 'material', array : true})
VisualPlayer.attributes.add('enemyMaterial', {type : 'asset', assetType : 'material', array : true})
VisualPlayer.attributes.add('materialRoots', {type : 'entity', array : true})

VisualPlayer.prototype.start = function(startX, startZ, isSelf) {
    console.log(this)
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

    this.lastPos = new pc.Vec3(startX, 0, startZ)
    this.entity.setPosition(startX, 0, startZ)
}

VisualPlayer.prototype.manualUpdate = function(nextX, nextZ) {
    const currentPos = new pc.Vec3(nextX, 0, nextZ)
    const dir = new pc.Vec3().sub2(currentPos, this.lastPos).normalize()

    // console.log(this.lastPos.distance(currentPos))
    if (this.lastPos.distance(currentPos) > 0.005) {
        this.animator.setBoolean('walk', true)
        this.entity.lookAt(new pc.Vec3().add2(currentPos, dir.mulScalar(-1)))
        Gizmo.line(currentPos, new pc.Vec3().add2(currentPos, dir.mulScalar(-1)), Gizmo.BLUE_GIZMO)
    } else {
        this.animator.setBoolean('walk', false)
    }

    this.entity.setPosition(currentPos)
    this.lastPos.set(nextX, 0, nextZ)


}
//assetId=72325429
//jshint asi: true
//# sourceURL=CamLook.js
const CamLook = pc.createScript('camLook');

CamLook.attributes.add('default', {type : 'number'})
CamLook.attributes.add('setup', {
    type : 'json', array : true,
    schema : [
        {name : 'target', type : 'entity'},
        {name : 'fov', type : 'number'},
        {name : 'normalizedOffset', type : 'vec3'},
        {name : 'boom', type : 'number'},
        {name : 'maxDistance', type : 'vec3'},
        {name : 'speedCurve', type : 'curve'},
        {name : 'speed', type : 'vec2'},
    ]
})

/**
 * @param value {Entity}
 */
CamLook.prototype.assignTarget = function(value) {
    this.target = value
    this.selected = this.default

    // this.entity.lookAt(this.target.getPosition())
    this.resetCameraView()
}

CamLook.prototype.postInitialize = function() {
    this.on('attr:setup', function(value) {
        this.resetCameraView()
    })
}

CamLook.prototype.resetCameraView = function() {
    var tp = this.target.getPosition()
    var self = this.entity.getPosition()
    
    var toGo = new pc.Vec3().add2(tp, this.setup[this.selected].normalizedOffset.clone().normalize().mulScalar(this.setup[this.selected].boom))
    this.entity.setPosition(toGo.x, toGo.y, toGo.z)

    this.entity.camera.fov = this.setup[this.selected].fov

    this.entity.lookAt(this.target.getPosition())
}

// CamLook.prototype.switchToGameCamera = function() {
//     var cam = this.gameCamera.camera
//     var look = this.gameCamera.script.camLook
//
//     this.assignCameraParams(cam, look)
// }
//
// CamLook.prototype.switchToDebugCamera = function() {
//     var cam = this.debugCamera.camera
//     var look = this.debugCamera.script.camLook

//
//     this.assignCameraParams(cam, look)
// }

// CamLook.prototype.assignCameraParams = function(fromCam, fromLook) {
//     this.entity.camera.projection = fromCam.projection
//     this.entity.camera.frustumCulling = fromCam.frustumCulling
//     this.entity.camera.fov = fromCam.fov
//     this.entity.camera.orthoHeight = fromCam.orthoHeight
//
//     this.boom = new pc.Vec3(fromLook.boom.x, fromLook.boom.y, fromLook.boom.z)
//
//     this.resetCameraView()
// }

// update code called every frame
CamLook.prototype.manualUpdate = function(dt) {
    
    if (!this.target) return;

    // {name : 'boom', type : 'vec3'},
    // {name : 'maxDistance', type : 'vec3'},
    // {name : 'speedCurve', type : 'curve'},
    // {name : 'speed', type : 'vec2'},

    /**
     * @type {pc.Vec3}
     */
    const normalizedOffset = this.setup[this.selected].normalizedOffset.clone().normalize()
    const boom = this.setup[this.selected].boom
    const maxDistance = this.setup[this.selected].maxDistance
    const speedCurve = this.setup[this.selected].speedCurve
    const speed = this.setup[this.selected].speed
    
    // dt *= Helper.main.timeScale
    
    // this.entity.lookAt(this.lookAt.getPosition());
    // this.entity.lookAt(this.lookAt.getPosition());
    // 
    var targetPos = this.target.getPosition()
    var selfPos = this.entity.getPosition()
    
    // var targetPos2 = new pc.Vec3(targetPos.x, 0, targetPos.z)
    // var selfPos2 = new pc.Vec3(selfPos.x, 0, selfPos.z)
    
    var distance = new pc.Vec3().sub2(targetPos, selfPos)
    // console.log(new pc.Vec3().sub2(targetPos, selfPos))
    distance = distance.add(normalizedOffset.mulScalar(boom))

    var distanceScalar = distance.length();
    
    var distanceTX = Math.min(1, Math.abs(distance.x) / maxDistance.x)
    var distanceTY = Math.min(1, Math.abs(distance.y) / maxDistance.y)
    var distanceTZ = Math.min(1, Math.abs(distance.z) / maxDistance.z)
    
    var distanceTXCurve = speedCurve.value(distanceTX)
    var distanceTYCurve = speedCurve.value(distanceTY)
    var distanceTZCurve = speedCurve.value(distanceTZ)
    
    var speedX = pc.math.lerp(speed.x, speed.y, distanceTXCurve)
    var speedY = pc.math.lerp(speed.x, speed.y, distanceTYCurve)
    var speedZ = pc.math.lerp(speed.x, speed.y, distanceTZCurve)
    // var nextMove = distance.normalize().scale(speed * dt)
    
    this.entity.setPosition(selfPos.x + speedX * dt * Helper.math.sign(distance.x), 
                            selfPos.y + speedY * dt * Helper.math.sign(distance.y), 
                            selfPos.z + speedZ * dt * Helper.math.sign(distance.z));

    // this.entity.lookAt(this.target.getPosition())
};
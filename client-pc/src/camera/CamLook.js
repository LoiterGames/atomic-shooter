//assetId=72325429
//jshint asi: true
//# sourceURL=CamLook.js
var CamLook = pc.createScript('camLook');

CamLook.attributes.add('autoStart', {type : 'boolean'})
CamLook.attributes.add('target', {type : 'entity'})
CamLook.attributes.add('boom', {type : 'vec3'});

CamLook.attributes.add('maxDistanceX', {type : 'number'});
CamLook.attributes.add('maxDistanceY', {type : 'number'});
CamLook.attributes.add('maxDistanceZ', {type : 'number'});
CamLook.attributes.add('fromToSpeedCurve', {type : 'curve'});
CamLook.attributes.add('fromToSpeed', {type : 'vec2'});

CamLook.attributes.add('debugCamera', {type : 'entity'})
CamLook.attributes.add('gameCamera', {type : 'entity'})

CamLook.prototype.start = function() {
    this.switchToGameCamera()
}

CamLook.prototype.postInitialize = function() {
    if (this.autoStart) {
        this.switchToGameCamera()
    }

    // Singleton.composer
}

CamLook.prototype.resetCameraView = function() {
    var tp = this.target.getPosition()
    var self = this.entity.getPosition()
    
    var toGo = new pc.Vec3().add2(tp, this.boom)
    this.entity.setPosition(toGo.x, toGo.y, toGo.z)
    this.entity.lookAt(this.target.getPosition())
    
    this.started = true
}

CamLook.prototype.switchToGameCamera = function() {
    var cam = this.gameCamera.camera
    var look = this.gameCamera.script.camLook

    this.assignCameraParams(cam, look)
}

CamLook.prototype.switchToDebugCamera = function() {
    var cam = this.debugCamera.camera
    var look = this.debugCamera.script.camLook

    this.assignCameraParams(cam, look)
}

CamLook.prototype.assignCameraParams = function(fromCam, fromLook) {
    this.entity.camera.projection = fromCam.projection
    this.entity.camera.frustumCulling = fromCam.frustumCulling
    this.entity.camera.fov = fromCam.fov
    this.entity.camera.orthoHeight = fromCam.orthoHeight

    this.boom = new pc.Vec3(fromLook.boom.x, fromLook.boom.y, fromLook.boom.z)

    this.resetCameraView()
}

// update code called every frame
CamLook.prototype.manualUpdate = function(dt) {
    
    if (!this.started) return;
    
    dt *= Helper.main.timeScale
    
    // this.entity.lookAt(this.lookAt.getPosition());
    // this.entity.lookAt(this.lookAt.getPosition());
    // 
    var targetPos = this.target.getPosition()
    var selfPos = this.entity.getPosition()
    
    // var targetPos2 = new pc.Vec3(targetPos.x, 0, targetPos.z)
    // var selfPos2 = new pc.Vec3(selfPos.x, 0, selfPos.z)
    
    var distance = new pc.Vec3().sub2(targetPos, selfPos)
    // console.log(new pc.Vec3().sub2(targetPos, selfPos))
    distance = distance.add(this.boom)
    
    
    var distanceScalar = distance.length();
    
    var distanceTX = Math.min(1, Math.abs(distance.x) / this.maxDistanceX)
    var distanceTY = Math.min(1, Math.abs(distance.y) / this.maxDistanceY)
    var distanceTZ = Math.min(1, Math.abs(distance.z) / this.maxDistanceZ)
    
    var distanceTXCurve = this.fromToSpeedCurve.value(distanceTX)
    var distanceTYCurve = this.fromToSpeedCurve.value(distanceTY)
    var distanceTZCurve = this.fromToSpeedCurve.value(distanceTZ)
    
    var speedX = pc.math.lerp(this.fromToSpeed.x, this.fromToSpeed.y, distanceTXCurve)
    var speedY = pc.math.lerp(this.fromToSpeed.x, this.fromToSpeed.y, distanceTYCurve)
    var speedZ = pc.math.lerp(this.fromToSpeed.x, this.fromToSpeed.y, distanceTZCurve)
    // var nextMove = distance.normalize().scale(speed * dt)
    
    this.entity.setPosition(selfPos.x + speedX * dt * Helper.math.sign(distance.x), 
                            selfPos.y + speedY * dt * Helper.math.sign(distance.y), 
                            selfPos.z + speedZ * dt * Helper.math.sign(distance.z));

    // this.entity.lookAt(this.target.getPosition())
};

// swap method called for script hot-reloading
// inherit your script state here
// CamLook.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/
import * as THREE from 'three';

class _Render {

    position1 = new THREE.Vector3(0, 8, 0)
    lookAt1 = new THREE.Vector3(0, 0, 0)

    start() {

        this.cameraAnchorX = 0
        this.lookPoint = new THREE.Vector3(0, 0, 0)

        this.frustumSize = 3
        this.camera = new THREE.OrthographicCamera( 1, 1, 1, 1, 1, 100 );
        this.camera.position.x = this.position1.x;
        this.camera.position.y = this.position1.y;
        // this.camera.position.z = this.position1.y;
        this.camera.lookAt(this.lookPoint.x, this.lookPoint.y, this.lookPoint.z)

        this.scene = new THREE.Scene()

        this.light = new THREE.DirectionalLight(0xEEEEEE, 1)
        this.scene.add(this.light)

        this.renderer = new THREE.WebGLRenderer({antialias: true})
        // this.renderer.setPixelRatio(window.devicePixelRatio)
        // this.renderer.gammaFactor = 2.2;
        // this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.onWindowResize()

        document.body.appendChild(this.renderer.domElement)

        window.addEventListener( 'resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        this.screen_width = window.innerWidth
        this.screen_height = window.innerHeight
        this.aspect = window.innerWidth/window.innerHeight

        // console.log(this.aspect)
        this.frustumSize = 3//THREE.MathUtils.lerp(2.25, 3, (Math.min(this.aspect, 1)-0.5)*2)

        this.renderer.setSize( this.screen_width, this.screen_height );

        this.camera.left = - this.frustumSize * Math.max(this.aspect, 1);
        this.camera.right = this.frustumSize * Math.max(this.aspect, 1);
        this.camera.top = this.frustumSize / Math.min(this.aspect, 1);
        this.camera.bottom = - this.frustumSize / Math.min(this.aspect, 1);
        this.camera.updateProjectionMatrix();

        // const diff = this.camera.top - this.frustumSize

        // this.camera.position.z = diff*0.5 + 0.2
        // this.lookPoint.z = this.camera.position.z
        //
        // this.camera.lookAt(this.lookPoint.x, this.lookPoint.y, this.lookPoint.z)
    }

    // busy = false
    // currentView = 1
    // switchView() {
    //     if (this.busy) return
    //     this.busy = true
    //
    //     if (this.currentView === 1) {
    //         this.currentView = 2
    //         gsap.to(this.lookPoint,
    //             {x : this.lookAt2.x, y : this.lookAt2.y, z : this.lookAt2.z, duration : 2})
    //         gsap.to(this.camera.position, {
    //             x : this.position2.x, y : this.position2.y, z : this.position2.z, duration : 2, ease : 'power2.out',
    //             onUpdate : function() {
    //                 this.camera.lookAt(this.lookPoint.x, this.lookPoint.y, this.lookPoint.z)
    //             }.bind(this),
    //             onComplete : function() {
    //                 this.busy = false
    //                 Game.busy = false
    //             }.bind(this)
    //         })
    //     } else if (this.currentView === 2) {
    //         this.currentView = 1
    //         gsap.to(this.lookPoint,
    //             {x : this.lookAt1.x, y : this.lookAt1.y, z : this.lookAt1.z, duration : 2})
    //         gsap.to(this.camera.position, {
    //             x : this.position1.x, y : this.position1.y, z : this.position1.z, duration : 2, ease : 'power2.out',
    //             onUpdate : function() {
    //                 this.camera.lookAt(this.lookPoint.x, this.lookPoint.y, this.lookPoint.z)
    //             }.bind(this),
    //             onComplete : function() {
    //                 this.busy = false
    //                 Game.busy = false
    //             }.bind(this)
    //         })
    //     }
    // }

    /**
     * @param actor {Actor}
     */
    add(actor) {
        this.scene.add(actor.view.mesh)
    }

    update(dt) {
        this.renderer.render(this.scene, this.camera)
    }
}

const Render = new _Render()
export default Render

import * as THREE from 'three';

let camera, scene, renderer;
let geometry, material, mesh;

export default class ThreeTest {
    constructor() {

        // THREE.PerspectiveCamera()

        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.position.z = 1;

        scene = new THREE.Scene();

        geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        material = new THREE.MeshNormalMaterial();

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setAnimationLoop( this.animation );
        document.body.appendChild( renderer.domElement );
    }

    animation(time) {
        mesh.rotation.x = time / 2000;
        mesh.rotation.y = time / 1000;

        renderer.render( scene, camera );
    }
}
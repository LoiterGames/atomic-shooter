import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Assets from './Assets'

export default class ComponentView {

    /**
     * @type {BoxGeometry}
     */
    geometry = null
    /**
     * @type {Material}
     */
    material = null
    /**
     * @type {THREE.Mesh}
     */
    mesh = null

    static geometryCache = {

    }

    /**
     * @param material {Material}
     * @return {ComponentView}
     * @constructor
     */
    static MakeCube(material = undefined) {
        const c = new ComponentView()
        c.geometry = Assets.geometries.box
        c.material = material || Assets.materials.normal
        c.mesh = new THREE.Mesh(c.geometry, c.material)
        return c
    }

    /**
     * @param material {Material}
     * @return {ComponentView}
     * @constructor
     */
    static MakeSphere(material = undefined) {
        const c = new ComponentView()
        c.geometry = Assets.geometries.box
        c.material = material || Assets.materials.normal
        c.mesh = new THREE.Mesh(c.geometry, c.material)
        return c
    }

    static gltf(path, material) {
        const dummy = ComponentView.MakeCube(material)
        Assets.getGLTF(path, geometry => {
            dummy.geometry = geometry
            dummy.material = material
            dummy.mesh.geometry = geometry
            dummy.mesh.material = material
        })
        return dummy
    }
}
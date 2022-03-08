import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

class CacheEntry {
    state = null
    geometry = null
    listeners = []
    loader = null
}

class _Assets {

    geometries = {
        box : new THREE.BoxGeometry(1, 1, 1),
        sphere : new THREE.SphereGeometry(1)
    }

    materials = {
        normal : new THREE.MeshNormalMaterial(),
        vcolor : new THREE.MeshPhongMaterial({color : 0xFF0000}),
        ball : {
            stage1 : new THREE.MeshLambertMaterial({color : 0xEEEEEE}),
            stage2 : new THREE.MeshLambertMaterial({color : 0xCC2222}),
            stage4 : new THREE.MeshLambertMaterial({color : 0x22CC22}),
            stage8 : new THREE.MeshLambertMaterial({color : 0x2222CC}),
            stage16 : new THREE.MeshLambertMaterial({color : 0xCCCC22}),
            stage32 : new THREE.MeshToonMaterial({color : 0x22CCCC}),
            stage64 : new THREE.MeshPhongMaterial({color : 0xCC22CC}),
            stage128 : new THREE.MeshPhongMaterial({color : 0x8bd4f2}),
            stage256 : new THREE.MeshPhongMaterial({color : 0xD17A22}),
            stage512 : new THREE.MeshPhongMaterial({color : 0x4C061D}),
            stage1024 : new THREE.MeshPhongMaterial({color : 0x3B3923}),
            stage2048 : new THREE.MeshPhongMaterial({color : 0xE3B23C}),
            stage4096 : new THREE.MeshPhongMaterial({color : 0x392061}),
            stage8192 : new THREE.MeshPhongMaterial({color : 0xAA6373}),
            tage16384 : new THREE.MeshPhongMaterial({color : 0x3772FF}),
        }
    }

    textures = {

    }

    getGLTF(path, meshInjector) {
        if (typeof(this.geometries[path]) === 'undefined') {
            console.log(`started loading ${path}`)
            const entry = new CacheEntry()
            entry.loader = new GLTFLoader()
            entry.loader.load(path, gltf => {
                // console.log(gltf)
                entry.state = 'loaded'
                entry.geometry = gltf.scene.children[0].geometry
                console.log(`finished loading ${path}, will resolve ${entry.listeners.length} listeners`)
                for (let i = 0; i < entry.listeners.length; i++) {
                    entry.listeners[i](entry.geometry)
                }
            }, undefined, error => {
                entry.state = 'failed'
                console.error(error)
            })
            entry.state = 'loading'
            entry.listeners.push(meshInjector)
            this.geometries[path] = entry
        } else {
            const entry = this.geometries[path]
            if (entry.state === 'loaded') {
                console.log(`getting ${path} from cache`)
                meshInjector(entry.geometry)
            }
            if (entry.state === 'loading') {
                console.log(`awaiting ${path} to load`)
                entry.listeners.push(meshInjector)
            }
            if (entry.state === 'failed') {
                console.error(`could not load ${path}, not retrying`)
            }
        }
    }
}

const Assets = new _Assets()
export default Assets;
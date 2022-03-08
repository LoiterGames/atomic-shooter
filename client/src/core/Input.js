import {Emitter} from "../util/Emitter";
import {Events} from "./Events";

class _Input {

    /**
     * @return {Emitter}
     */
    get e() {return this;}

    constructor() {
        Object.assign(this, Emitter({}))
    }

    start() {

        document.addEventListener('keydown', e => {
            if (e.code === 'ArrowUp') {
                this.e.emit(Events.INPUT, {x : 0, y : 1})
            }
            if (e.code === 'ArrowDown') {
                this.e.emit(Events.INPUT, {x : 0, y : -1})
            }
            if (e.code === 'ArrowLeft') {
                this.e.emit(Events.INPUT, {x : -1, y : 0})
            }
            if (e.code === 'ArrowRight') {
                this.e.emit(Events.INPUT, {x : 1, y : 0})
            }
        })

    //     let xDown = null
    //     let yDown = null
    //
    //     // document.addEventListener('')
    //     document.addEventListener('mousedown', function(e) {
    //         // const first = e.touches[0]
    //         xDown = e.clientX
    //         yDown = e.clientY
    //     }.bind(this), false);
    //
    //     document.addEventListener('mouseup', function(e) {
    //         // const first = e.touches[0]
    //         xDown = null
    //         yDown = null
    //     }.bind(this), false);
    //
    //     document.addEventListener('mousemove', function(e) {
    //         if ( ! xDown || ! yDown ) {
    //             return;
    //         }
    //
    //         const xUp = e.clientX;
    //         const yUp = e.clientY;
    //
    //         const xDiff = xDown - xUp;
    //         const yDiff = yDown - yUp;
    //
    //         if (!Game.swipeBall) {
    //             xDown = null
    //             yDown = null
    //             return;
    //         }
    //         if (Game.busy){
    //             xDown = null
    //             yDown = null
    //             return;
    //         }
    //
    //         if (Math.abs(xDiff) < 5 && Math.abs(yDiff) < 5) return;
    //
    //         console.log(xDiff, yDiff)
    //
    //         const aspect = Math.abs( xDiff ) / Math.abs( yDiff )
    //
    //         if (aspect < 0.5 || aspect > 2.0) {
    //             console.log('vertical or horizontal swipe')
    //
    //             if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
    //                 if ( xDiff > 0 ) {
    //                     console.log('swipe left')
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(-2, 0, 0)), Game.zone5, 1)
    //                 } else {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(2, 0, 0)), Game.zone5, 1)
    //                     console.log('swipe right')
    //                 }
    //             } else {
    //                 if ( yDiff > 0 ) {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(-2, 0, 0)), Game.zone5, 1)
    //                     /* down swipe */
    //                 } else {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(-2, 0, 0)), Game.zone5, 1)
    //                     /* up swipe */
    //                 }
    //             }
    //         } else {
    //             console.log('diagonal swipe', xDiff, yDiff)
    //             if (xDiff < 0 && yDiff > 0) {
    //                 Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone1.mesh.position, new THREE.Vector3(2, 2, 0)), Game.zone1, 3)
    //             }
    //
    //             if (xDiff > 0 && yDiff > 0) {
    //                 Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone2.mesh.position, new THREE.Vector3(-2, 2, 0)), Game.zone2, 3)
    //             }
    //
    //             if (xDiff < 0 && yDiff < 0) {
    //                 Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone3.mesh.position, new THREE.Vector3(2, 1, 0)), Game.zone3, 2)
    //             }
    //
    //             if (xDiff > 0 && yDiff < 0) {
    //                 Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone4.mesh.position, new THREE.Vector3(-2, 1, 0)), Game.zone4, 2)
    //
    //             }
    //         }
    //
    //
    //         xDown = null;
    //         yDown = null;
    //
    //         return
    //
    //
    //     }.bind(this), false);
    //
    //     // document.addEventListener('')
    //     document.addEventListener('touchstart', function(e) {
    //         const first = e.touches[0]
    //         xDown = first.clientX
    //         yDown = first.clientY
    //     }.bind(this), false);
    //     document.addEventListener('touchmove', function(evt) {
    //         if ( ! xDown || ! yDown ) {
    //             return;
    //         }
    //
    //         const xUp = evt.touches[0].clientX;
    //         const yUp = evt.touches[0].clientY;
    //
    //         const xDiff = xDown - xUp;
    //         const yDiff = yDown - yUp;
    //
    //         if (!Game.swipeBall) {
    //             if (Math.abs(xDiff) < 30 && Math.abs(yDiff) < 30) return;
    //         } else {
    //             console.log(xDiff, yDiff)
    //
    //             const aspect = Math.abs( xDiff ) / Math.abs( yDiff )
    //
    //             if (aspect < 0.5 || aspect > 2.0) {
    //                 console.log('vertical or horizontal swipe')
    //
    //                 if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
    //                     if ( xDiff > 0 ) {
    //                         console.log('swipe left')
    //                         Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(-2, 0, 0)), Game.zone5, 1)
    //                     } else {
    //                         Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(2, 0, 0)), Game.zone5, 1)
    //                         console.log('swipe right')
    //                     }
    //                 } else {
    //                     if ( yDiff > 0 ) {
    //                         Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(-2, 0, 0)), Game.zone5, 1)
    //                         /* down swipe */
    //                     } else {
    //                         Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone5.mesh.position, new THREE.Vector3(-2, 0, 0)), Game.zone5, 1)
    //                         /* up swipe */
    //                     }
    //                 }
    //             } else {
    //                 console.log('diagonal swipe', xDiff, yDiff)
    //                 if (xDiff < 0 && yDiff > 0) {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone1.mesh.position, new THREE.Vector3(2, 2, 0)), Game.zone1, 3)
    //                 }
    //
    //                 if (xDiff > 0 && yDiff > 0) {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone2.mesh.position, new THREE.Vector3(-2, 2, 0)), Game.zone2, 3)
    //                 }
    //
    //                 if (xDiff < 0 && yDiff < 0) {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone3.mesh.position, new THREE.Vector3(2, 1, 0)), Game.zone3, 2)
    //                 }
    //
    //                 if (xDiff > 0 && yDiff < 0) {
    //                     Game.flyThroughZone(this.getMidPoint(Game.theBall.mesh.position, Game.zone4.mesh.position, new THREE.Vector3(-2, 1, 0)), Game.zone4, 2)
    //
    //                 }
    //             }
    //
    //
    //             xDown = null;
    //             yDown = null;
    //
    //             return
    //         }
    //
    //         console.log(xDiff, yDiff)
    //
    //         if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
    //             if ( xDiff > 0 ) {
    //                 console.log('swipe left')
    //                 /* right swipe */
    //                 if (!Game.swipeBall) Game.swipeLeft()
    //             } else {
    //                 console.log('swipe right')
    //                 /* left swipe */
    //                 if (!Game.swipeBall) Game.swipeRight()
    //             }
    //         } else {
    //             if ( yDiff > 0 ) {
    //                 /* down swipe */
    //                 if (!Game.swipeBall) Game.swipeUp()
    //             } else {
    //                 /* up swipe */
    //                 if (!Game.swipeBall) Game.swipeDown()
    //             }
    //         }
    //         /* reset values */
    //         xDown = null;
    //         yDown = null;
    //     }.bind(this), false);
    }
}

const Input = new _Input()
export default Input
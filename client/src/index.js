// const theResolve = () => {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve('resolved')
//         }, 2000)
//     })
// }
//
// const resolveAsync = async() => {
//     const result = await theResolve()
// }
//
// resolveAsync()
import geckos from '@geckos.io/client'
import {SnapshotInterpolation} from "@geckos.io/snapshot-interpolation";
import Render from "./core/Render";
import Actor from "./core/Actor";
import ComponentView from "./core/ComponentView";
import Input from "./core/Input";
import {Events} from "./core/Events";
const SI = new SnapshotInterpolation(30)

window.onload = async () => {

    const channel = geckos({
        url : 'http://localhost',
        port : 3000
    })

    const {id, maxMessageSize} = channel

    await channel.onConnect(error => {
        if (error) return console.error(error.message)
        console.log('connection successfull!')
    })

    channel.onDisconnect(() => {
        console.log('disconnected')
    })

    channel.on('snapshot', data => {
        // console.log('SNAPSHOT: ', JSON.parse(data))
        SI.snapshot.add(data)
    })

    Render.start()

    // UIStart.show()
    // Game.start()
    Input.start()

    Input.e.on(Events.INPUT, stick => {

        channel.emit('input', stick)
    })

    let time = Date.now()

    /**
     * @type {Map<string, Actor>}
     */
    const players = new Map()

    const loop = () => {

        const now = Date.now()
        const dt = (now - time)/1000

        const kek = SI.calcInterpolation('x y z')
        if (kek) {
            const state = kek.state
            if (state) {
                state.forEach(splayer => {
                    if (players.has(splayer.id)) {
                        const a = new Actor().addView(ComponentView.MakeSphere())
                        a.view.mesh.position.x = splayer.x
                        a.view.mesh.position.y = splayer.y
                        a.view.mesh.position.z = splayer.z
                        players.set(splayer.id, a)

                        Render.add(a)
                    } else {
                        const a = players.get(splayer.id)
                        a.view.mesh.position.x = splayer.x
                        a.view.mesh.position.y = splayer.y
                        a.view.mesh.position.z = splayer.z
                    }
                })
            }
        }

        Render.update(dt)
        // UICountdown.update(dt)

        time = now
        requestAnimationFrame(loop)
    }

    loop()
}

import {Application, Entity, Color} from "playcanvas";
import Link from "./Link";
import {MessageType} from "@bomb/shared/PROTOC";
import {Vault} from "@geckos.io/snapshot-interpolation";
import GP from "@bomb/shared/GP";
import {SharedConfig} from "@bomb/shared/SharedConfig";

SharedConfig.init('DEBUG_REMOTE')

// let localSelf = null
const localVault = new Vault()
const input = {x:0, y:0}

/**
 * @type {Map<string, Entity>}
 */
const visualPlayers = new Map()

window.onload = async () => {

    const link = new Link()
    window.link = link

    const prediction = dt => {
        const player = link.self

        if (!player) return;

        player.x = player.x + input.x * GP.player.speed * dt
        player.y = player.y + input.y * GP.player.speed * dt

        localVault.add(link.SI.snapshot.create([{
            id : link.id,
            x : player.x,
            y : player.y
        }]))
    }

    const reconsiliation = () => {
        const player = link.self

        if (!player) return;

        const serverSnapshot = link.SI.vault.get()
        if (!serverSnapshot) return;

        const localSnapshot = localVault.get(serverSnapshot.time, true)
        if (!localSnapshot) return;

        const serverPos = serverSnapshot.state.filter(s => s.id === link.id)[0]

        const offsetX = localSnapshot.state[0].x - serverPos.x
        const offsetY = localSnapshot.state[0].y - serverPos.y

        const isMoving = input.x !== 0 || input.y !== 0

        // we correct the position faster if the player moves
        const correction = isMoving ? 30 : 180

        if (!isMoving) {
            if (Math.abs(offsetX) < SharedConfig.RECONSILE_EPSILON && Math.abs(offsetY) < SharedConfig.RECONSILE_EPSILON) return;
        }

        // apply a step by step correction of the player's position
        player.x -= offsetX / correction
        player.y -= offsetY / correction
    }

    const canvas = window.document.createElement('canvas')
    canvas.style.width = '100% !important'
    canvas.style.height = '100% !important'

    document.body.appendChild(canvas)

    const app = new Application(canvas, {});

    // create camera entity
    const camera = new Entity("camera");
    camera.addComponent("camera", {
        clearColor: new Color(0.5, 0.6, 0.9),
    });

    app.root.addChild(camera);
    camera.setPosition(10, 10, 10);
    camera.lookAt(0, 0, 0)

    // create directional light entity
    const light = new Entity("light");
    light.addComponent("light");
    app.root.addChild(light);
    light.setEulerAngles(45, 0, 0);

    // rotate the box according to the delta time since the last frame
    // app.on("update", (dt) => box.rotate(10 * dt, 20 * dt, 30 * dt));

    app.on('update', dt => {
        // puk
        if (!link.connected) return

        link._channel.emit(MessageType.MOVE, [input.x, input.y])

        prediction(dt)
        reconsiliation()

        const snapshot = link.SI.calcInterpolation('x y')
        // const snapshot = link.SI.vault.get()

        if (!snapshot) return

        const {state} = snapshot

        state.forEach(s => {
            let {id, x, y} = s

            if (id === link.id) {
                x = localVault.get().state[0].x
                y = localVault.get().state[0].y
            }

            if (!visualPlayers.has(id)) {
                const box = new Entity(id);
                box.addComponent("render", {
                    type: "box",
                });

                app.root.addChild(box);
                visualPlayers.set(id, box)
            }

            const visual = visualPlayers.get(id)


            visual.setPosition(x, 0, y)

            // console.log(`${id}: ${x},${y}`)
        })
    })

    app.start();

    window.addEventListener( 'resize', () => {
        app.graphicsDevice.resizeCanvas(window.innerWidth, window.innerHeight)
    });
    app.graphicsDevice.resizeCanvas(window.innerWidth, window.innerHeight)

    document.addEventListener('keydown', e => {
        const { keyCode } = e
        switch (keyCode) {
            case 37:
                input.x = -1
                break
            case 38:
                input.y = 1
                break
            case 39:
                input.x = 1
                break
            case 40:
                input.y = -1
                break
        }
    })

    document.addEventListener('keyup', e => {
        const { keyCode } = e
        switch (keyCode) {
            case 37:
                input.x = 0
                break
            case 38:
                input.y = 0
                break
            case 39:
                input.x = 0
                break
            case 40:
                input.y = 0
                break
        }
    })
}
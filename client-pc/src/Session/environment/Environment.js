//assetId=73337850
//jshint asi: true
//# sourceURL=Environment.js
const Environment = pc.createScript('environment');

Environment.attributes.add('chunkPrefab', {type : 'asset', assetType:'template'})
// Environment.attributes.add('marker', {type : 'entity'})

Environment.prototype.start = function() {
    this.rotator = new pc.Entity('rotatorRoot')
    this.app.root.addChild(this.rotator)

    /**
     * @type {Entity[]}
     */
    this.chunks = []

    this.size = GP.environment.size
    const scale = GP.environment.chunkScale
    const sizeScale = 0.95

    this.offsetXZ = (GP.environment.size * GP.environment.chunkScale)/-2 + scale/2
    this.offsetY = -1 * (GP.environment.size * GP.environment.chunkScale) + scale/2

    console.log(this.offsetXZ, this.offsetY)

    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            for (let k = 0; k < this.size; k++) {
                let bound = false
                bound = bound || i === 0; bound = bound || i === GP.environment.size-1
                bound = bound || j === 0; bound = bound || j === GP.environment.size-1
                bound = bound || k === 0; bound = bound || k === GP.environment.size-1

                if (!bound) continue;

                // console.log(`creating ${i}:${j}:${k}`)


                /**
                 * @type {Entity}
                 */
                const chunk = this.chunkPrefab.resource.instantiate()
                this.app.root.addChild(chunk)

                chunk.setLocalScale(scale * sizeScale, scale * sizeScale, scale * sizeScale)
                chunk.setPosition(this.offsetXZ + i * scale, this.offsetY + j * scale, this.offsetXZ + k * scale)

                // console.log(chunk.getPosition(), chunk.getLocalScale())

                this.chunks[i + j * this.size + k * this.size*this.size] = chunk

                chunk.script.chunk.start()
            }
        }
    }
}

Environment.prototype.onWarning = function(col, row) {
    console.log('will warn', col, row)
    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            for (let k = 0; k < this.size; k++) {
                if (i === col || k === row) {
                    const child = this.chunks[i + j * this.size + k * this.size*this.size]

                    if (!child) continue

                    /**
                     * @type Chunk
                     */
                    const chunkScript = child.script.chunk

                    chunkScript.startWarning()
                }
            }
        }
    }
}

Environment.prototype.theReparent = function(child, parent2) {
    const mat = child.getWorldTransform().clone();
    const parentMat = parent2.getWorldTransform().clone().invert();
    mat.mul2(parentMat, mat);
    const pos = mat.getTranslation();
    const rot = new pc.Quat().setFromMat4(mat);
    const scale = mat.getScale();

    child.reparent(parent2);

    pos.x = Number.parseFloat(pos.x.toFixed(2))
    pos.y = Number.parseFloat(pos.y.toFixed(2))
    pos.z = Number.parseFloat(pos.z.toFixed(2))

    child.setLocalPosition(pos);
    child.setLocalRotation(rot);
    child.setLocalScale(scale);
}

Environment.prototype.clearRotator = function() {
    while (this.rotator.children.length > 0) {
        // console.log('will reparent ', this.rotator.children[0], this.rotator.children)
        this.theReparent(this.rotator.children[0], this.app.root)
    }
    this.rotator.setLocalEulerAngles(0, 0, 0)
}

Environment.prototype.rotateRow = function(target) {
    if (this.tween) return;

    this.clearRotator()

    // find row center first
    const x = 0
    const y = -GP.environment.size/2 * GP.environment.chunkScale
    const z = this.offsetXZ + target * GP.environment.chunkScale

    // this.marker.setPosition(x, y, z)
    this.rotator.setPosition(x, y, z)

    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            for (let k = 0; k < this.size; k++) {
                if (k !== target) continue

                let bound = false
                bound = bound || i === 0; bound = bound || i === GP.environment.size-1
                bound = bound || j === 0; bound = bound || j === GP.environment.size-1
                bound = bound || k === 0; bound = bound || k === GP.environment.size-1

                if (!bound) continue;

                const child = this.chunks[i + j * this.size + k * this.size*this.size]
                this.theReparent(child, this.rotator)
            }
        }
    }

    const euler = this.rotator.getLocalEulerAngles()
    this.tween = this.rotator.tween(euler)
    this.tween.rotate(new pc.Vec3(euler.x, euler.y, euler.z + 90), 1, pc['BackOut'])
        .on('complete', this._finishTween, this).start()
}

Environment.prototype._finishTween = function() {
    this.tween = null

    this.clearRotator()

    const newChunks = []

    const scale = GP.environment.chunkScale

    for (let i = 0; i < this.chunks.length; i++) {
        const chunk = this.chunks[i]
        if (!chunk) continue

        const pos = chunk.getPosition()
        const x = Math.floor((pos.x - scale/2 + (this.size*scale)/2) / scale)
        const y = Math.floor((pos.y - scale/2 + (this.size*scale)) / scale)
        const z = Math.floor((pos.z - scale/2 + (this.size*scale)/2) / scale)
        // console.log(pos, '->', x, y, z)

        newChunks[x + y * this.size + z * this.size*this.size] = chunk
        // chunk.script.chunk.highlight()
    }


    this.chunks = newChunks
}

Environment.prototype.rotateCol = function(target) {
    if (this.tween) return;

    this.clearRotator()

    // find row center first
    const x = this.offsetXZ + target * GP.environment.chunkScale
    const y = -GP.environment.size/2 * GP.environment.chunkScale
    const z = 0

    // this.marker.setPosition(x, y, z)
    this.rotator.setPosition(x, y, z)

    for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
            for (let k = 0; k < this.size; k++) {
                if (i !== target) continue

                let bound = false
                bound = bound || i === 0; bound = bound || i === GP.environment.size-1
                bound = bound || j === 0; bound = bound || j === GP.environment.size-1
                bound = bound || k === 0; bound = bound || k === GP.environment.size-1

                if (!bound) continue;

                const child = this.chunks[i + j * this.size + k * this.size*this.size]
                this.theReparent(child, this.rotator)
            }
        }
    }

    const euler = this.rotator.getLocalEulerAngles()
    this.tween = this.rotator.tween(euler)
    this.tween.rotate(new pc.Vec3(euler.x + 90, euler.y, euler.z), 1, pc['BackOut'])
        .on('complete', this._finishTween, this).start()
}
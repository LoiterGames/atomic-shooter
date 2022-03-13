//assetId=72334829
//jshint asi: true
//# sourceURL=Helper.js
const Helper = {

    numberTo0X : function(value) {
        return value < 10 ? '0'+value : value
    },

    rak : function(x, y, x1, y1, x2, y2) {
        return Math.abs(((x * (y2 - y1)) - (y * (x2 - x1)) + (x2 * y1) - (y2 * x1))) / Math.sqrt(((y2 - y1) ^ 2) + ((x2 - x1) ^ 2))
    },

    distance : {
        sqr : function (x) {
            return x * x;
        },
        dist2: function (v, w) {
            return Helper.distance.sqr(v.x - w.x) + Helper.distance.sqr(v.z - w.z);
        },
        distToSegmentSquared (p, v, w) {
            var l2 = Helper.distance.dist2(v, w);
            if (l2 === 0) return Helper.distance.dist2(p, v);
            var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            return Helper.distance.dist2(p, new pc.Vec3(v.x + t * (w.x - v.x), 0, v.y + t * (w.y - v.y)));
        },


        distanceSquaredToLineSegment2 : function(lx1, ly1, ldx, ldy, lineLengthSquared, px, py) {
            var t; // t===0 at line pt 1 and t ===1 at line pt 2
            if (!lineLengthSquared) {
                // 0-length line segment. Any t will return same result
                t = 0;
            }
            else {
                t = ((px - lx1) * ldx + (py - ly1) * ldy) / lineLengthSquared;

                if (t < 0)
                    t = 0;
                else if (t > 1)
                    t = 1;
            }

            var lx = lx1 + t * ldx,
                ly = ly1 + t * ldy,
                dx = px - lx,
                dy = py - ly;
            return dx*dx + dy*dy;
        },

        distanceSquaredToLineSegment : function(lx1, ly1, lx2, ly2, px, py) {
            var ldx = lx2 - lx1,
                ldy = ly2 - ly1,
                lineLengthSquared = ldx*ldx + ldy*ldy;
            return Helper.distance.distanceSquaredToLineSegment2(lx1, ly1, ldx, ldy, lineLengthSquared, px, py);
        },

        distanceToLineSegment : function(lx1, ly1, lx2, ly2, px, py) {
            return Math.sqrt(Helper.distance.distanceSquaredToLineSegment(lx1, ly1, lx2, ly2, px, py));
        }
    },

    ease : {
        out3 : function(t) {return (--t)*t*t+1},
        in3 : function(t) {return t*t*t},
        in2 : function(t) {return t*t},
        linear : function(t) {return t},
        bounce : function(x) { return -((x*2.0-1.0)*(x*2.0-1.0))+1.0 }
    },

    vec3 : {
        dir : function(from, to, cachedV3) {
            cachedV3 = cachedV3 ? cachedV3 : new pc.Vec3()
            cachedV3.set(
                to.x - from.x,
                to.y - from.y,
                to.z - from.z
            )
            return cachedV3
        }
    },

    reflect : function(what, normal) {
        var dot = what.dot(normal)
        var reflection = normal.clone().scale(2 * dot)
        return what.clone().sub(reflection)
    },

    shuffle : function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    },

    math: {
        qdot : function(q1, q2) { return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w },
        approximately: function(a, b) { return Math.abs(a - b) < 0.001 },
        _m1 : new pc.Vec3(),
        _m2 : new pc.Vec3(),
        clamp: function(v, min, max) {
            return Math.min(Math.max(v, min), max);
        },
        sign: function(v) {
            if (this.approximately(v, 0)) {
                return 1
            } else {
                return v / Math.abs(v)
            }
        },
        bezier: function(from, control, to, t, result) {
            this._m1.lerp(from, control, t)
            this._m2.lerp(control, to, t)

            if (typeof(result) === 'undefined') {
                result = new pc.Vec3()
            }
            return result.lerp(this._m1, this._m2, t)
        },
        loopAround: function(v, max) {
            if (v >= max) {
                return v-max
            }
            return v
        },
        repeat : function(v, max) {
            v++
            if (v === max) v = 0
            return v
        },
        randomInCircle : function(radius, cachedV2) {
            cachedV2 = cachedV2 ? cachedV2 : new pc.Vec2()
            var a = Math.random() * Math.PI*2
            var r = radius * Math.sqrt(Math.random())
            cachedV2.set(Math.cos(a)*r, Math.sin(a) * r)
            return cachedV2
        },
        mod : function(a, n) { return a - Math.floor(a/n)*n },
        angleDiff : function(alpha, beta) {
            var phi = Math.abs(beta - alpha) % 360;       // This is either the distance or 360 - distance
            var distance = phi > 180 ? 360 - phi : phi;
            // distance = phi < 180 ? 360 + phi : phi;
            return distance;
        },
        angleDiffSigned : function(a, b) {
            var d = Math.abs(a - b) % 360;
            var r = d > 180 ? 360 - d : d;

            //calculate sign
            var sign = (a - b >= 0 && a - b <= 180) || (a - b <=-180 && a- b>= -360) ? 1 : -1;
            r *= sign;
            return r
        },
        LookRotation: function(forward, up)
        {
            forward = forward.normalize();

            //var vector = forward.normalize();
            //var vector2 = up.CrossProduct(vector).Normalize();
            //var vector3 = vector.CrossProduct(vector2);
            var vector = forward.normalize();
            var vector2 = (new pc.Vec3()).cross(up, vector).normalize();
            var vector3 = (new pc.Vec3()).cross(vector, vector2);
            var m00 = vector2.x;
            var m01 = vector2.y;
            var m02 = vector2.z;
            var m10 = vector3.x;
            var m11 = vector3.y;
            var m12 = vector3.z;
            var m20 = vector.x;
            var m21 = vector.y;
            var m22 = vector.z;

            var num8 = (m00 + m11) + m22;
            var quaternion = new pc.Quat();
            if (num8 > 0.0)
            {
                var num = Math.sqrt(num8 + 1.0);
                quaternion.w = num * 0.5;
                num = 0.5 / num;
                quaternion.x = (m12 - m21) * num;
                quaternion.y = (m20 - m02) * num;
                quaternion.z = (m01 - m10) * num;
                return quaternion;
            }
            if ((m00 >= m11) && (m00 >= m22))
            {
                var num7 = Math.sqrt(((1.0 + m00) - m11) - m22);
                var num4 = 0.5 / num7;
                quaternion.x = 0.5 * num7;
                quaternion.y = (m01 + m10) * num4;
                quaternion.z = (m02 + m20) * num4;
                quaternion.w = (m12 - m21) * num4;
                return quaternion;
            }
            if (m11 > m22)
            {
                var num6 = Math.sqrt(((1.0 + m11) - m00) - m22);
                var num3 = 0.5 / num6;
                quaternion.x = (m10 + m01) * num3;
                quaternion.y = 0.5 * num6;
                quaternion.z = (m21 + m12) * num3;
                quaternion.w = (m20 - m02) * num3;
                return quaternion;
            }
            var num5 = Math.sqrt(((1.0 + m22) - m00) - m11);
            var num2 = 0.5 / num5;
            quaternion.x = (m20 + m02) * num2;
            quaternion.y = (m21 + m12) * num2;
            quaternion.z = 0.5 * num5;
            quaternion.w = (m01 - m10) * num2;
            return quaternion;
        }
    },

    _dat : undefined,
    get dat() {
        if (typeof(this._dat) === 'undefined') {
            this._dat = new dat.GUI({width : 400})
            this._dat.close()
        }
        return this._dat
    },

    _get: function(what) {
        if (typeof(this['_cached_' + what]) === 'undefined') {
            this['_cached_' + what] = pc.app.root.find(function(node) {
                if (!node.script) return false;
                return typeof(node.script._scriptsData[what]) !== 'undefined';
            })[0].script[what];
        }
        return this['_cached_' + what];
    },
    clearCache : function() {
        var deleteKeys = []
        for (var key in this) {
            if (key.indexOf('_cached_') > -1) {
                deleteKeys.push(key)
            }
        }

        for (var i = 0; i < deleteKeys.length; i++) {
            delete this[deleteKeys[i]]
        }

        this.dat.destroy()
        this._dat = undefined
    },
    findAll : function(nameContains, tag) {
        const result = []
        pc.app.root.find(function(node) {
            if (!node.name.includes(nameContains)) return;
            result.push(node)
        })
        return result
    },
    // findAllWithTag : function(tag) {
    //     const result = []
    //     pc.app.root.find(function(node) {
    //         if (!node.name.includes(nameContains)) return;
    //         result.push(node)
    //     })
    //     return result
    // },
    get input() { return this._get('touchInput') },
    get grid() { return this._get('grid') },
    get camera() { return this._get('camLook') },
    get main() { return this._get('main') },
    get grass() { return this._get('grass') },
    get player() { return this._get('ControlsHeavy') },
    get gameParams() { return this._get('gameParams') },
    get ai() { return this._get('aidirector') },
//     get game() { return this._get('game') },
//     get hitting() { return this._get('hitting') },
//     get playerE() { return this._get('touchInput').entity },
//     get ai() { return this._get('directorAi') },
//     get pickups() { return this._get('directorPickup') },
//     get level() { return this._get('level') },
//     get pool() { return this._get('pool') },

//     get ftue0() { return this._get('ftue0') },
//     get ftue1() { return this._get('ftue1') },
//     get ftue2() { return this._get('ftue2') },

//     get fonts() { return this._get('fonts') },

//     get compositions() { return this._get('compositions') },

//     get screenResult() {return this._get('screenResult')},
//     get screenProfileMoney() {return this._get('screenProfileMoney')},
//     get screenLevelIndicator() {return this._get('screenLevelIndicator')},
//     get popupUnlock() {return this._get('popupUnlock')},
//     get popupLastChance() {return this._get('popupLastChance')},
//     get popupPause() {return this._get('popupIngamePause')},

//     get tableUnlocking() {return this._get('tableUnlocking')},
//     get shaderFloor() {return this._get('shaderFloor')},

    // getShader : function(shader) { return Helper._get(shader); },

    objectHasAnyKey: function(v) {
        for (var k in v) {
            return true
        }
        return false
    },

    _params: undefined,
    get params() {
        if (typeof(this._params) === 'undefined') {
            var p = {}
            var url = window.location.href;
            var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m,key,value) {
                    p[key] = value;
                });
            this._params = p;
        }
        return this._params;
    },

    createMaterial : function(vs, fs, shaderName) {
        var gd = pc.app.graphicsDevice;

        var vertexShader = vs.resource;
        var fragmentShader = "precision " + gd.precision + " float;\n";
        fragmentShader = fragmentShader + fs.resource;

        // A shader definition used to create a new shader.
        var shaderDefinition = {
            attributes: {
                vVertex: pc.SEMANTIC_POSITION,
                vColor: pc.SEMANTIC_COLOR,
                vNormal: pc.SEMANTIC_NORMAL,
                vTexCoord: pc.SEMANTIC_TEXCOORD0
            },
            vshader: vertexShader,
            fshader: fragmentShader
        };

        var shader = new pc.Shader(gd, shaderDefinition);

        var material = new pc.Material();
        material.name = shaderName;
        material.shader = shader;
        // material.blendType = pc.BLEND_NORMAL

        return material;
    }
}
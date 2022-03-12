//assetId=68146898
// jshint asi: true
//
// http://www.jeffreythompson.org/ collision detection

var JCollision = {
    aabbToaabb : function(a, b) {
        return a.left < b.right &&
            a.right > b.left &&
            a.top > b.bottom &&
            a.bottom < b.top
    },
    pointToaabb : function(p, aabb) {
        return p.x > aabb.left && p.x < aabb.right && p.y > aabb.bottom && p.y < aabb.top
    },
    polyToPoly : function(p1, p2) {
        var next = 0
        for (var current = 0; current < p1.length; current++) {
            next = current+1
            if (next === p1.length) next = 0

            var vc = p1[current]
            var vn = p1[next]

            var hit = this.polyToLine(p2, vc.x, vc.y, vn.x, vn.y)

            if (hit) return true;

            hit = this.polyToPoint(p1, p2[0].x, p2[0].y)
            if (hit) return true;
        }
        return false
    },

    polyToCircle : function(points, xc, yc, rc)
    {
        if (this.polyToPoint(points, xc, yc))
        {
            return true
        }
        var count = points.length
        for (var i = 0; i < count - 1; i++)
        {
            if (this.lineToCircle(points[i].x, points[i].y, points[i+1].x, points[i+1].y, xc, yc, rc))
            {
                return true
            }
        }
        return this.lineToCircle(points[0].x, points[0].y, points[count-1].x, points[count-1].y, xc, yc, rc)
    },

    polyToLine : function(poly, x1, y1, x2, y2) {
        var next = 0
        for (var current = 0; current < poly.length; current++) {
            next = current+1
            if (next === poly.length) next = 0

            var x3 = poly[current].x, y3 = poly[current].y
            var x4 = poly[next].x, y4 = poly[next].y

            var hit = this.lineToLine(x1, y1, x2, y2, x3, y3, x4, y4)
            if (hit) return true;
        }

        return false
    },

    polyToPoint : function(poly, px, pz) {
        var collision = false;

        var next = 0;
        for (var current=0; current<poly.length; current++) {
            next = current+1;
            if (next == poly.length) next = 0;

            // get the PVectors at our current position
            // this makes our if statement a little cleaner
            var vc = poly[current];    // c for "current"
            var vn = poly[next];       // n for "next"

            // compare position, flip 'collision' variable
            // back and forth
            if (((vc.z > pz && vn.z < pz) || (vc.z < pz && vn.z > pz)) &&
                (px < (vn.x-vc.x)*(pz-vc.z) / (vn.z-vc.z)+vc.x)) {
                collision = !collision;
            }
        }
        return collision;
    },

    lineToLine : function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        // if uA and uB are between 0-1, lines are colliding
        return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1
    },

    dot : function(v1, v2) { return (v1[0] * v2[0]) + (v1[1] * v2[1]) },

    lineToCircle : function(x1, y1, x2, y2, xc, yc, rc)
    {
        var ac = [xc - x1, yc - y1]
        var ab = [x2 - x1, y2 - y1]
        var ab2 = this.dot(ab, ab)
        var acab = this.dot(ac, ab)
        var t = acab / ab2
        t = (t < 0) ? 0 : t
        t = (t > 1) ? 1 : t
        var h = [(ab[0] * t + x1) - xc, (ab[1] * t + y1) - yc]
        var h2 = this.dot(h, h)
        return h2 <= (rc * rc)
    },

    circleToAABB(cx, cy, radius, rx, ry, rw, rh) {

        // temporary variables to set edges for testing
        let testX = cx;
        let testY = cy;

        // which edge is closest?
        if (cx < rx)         testX = rx;      // test left edge
        else if (cx > rx+rw) testX = rx+rw;   // right edge
        if (cy < ry)         testY = ry;      // top edge
        else if (cy > ry+rh) testY = ry+rh;   // bottom edge

        // get distance from closest edges
        const distX = cx-testX;
        const distY = cy-testY;
        const distance = Math.sqrt( (distX*distX) + (distY*distY) );

        // if the distance is less than the radius, collision!
        if (distance <= radius) {
            return true;
        }
        return false;
    }
}
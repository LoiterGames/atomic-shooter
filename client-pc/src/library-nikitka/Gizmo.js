//assetId=68146890
//jshint asi: true
//# sourceURL=Gizmo.js
var Gizmo = {
    layerObj : {layer : pc.app.scene.layers.getLayerById(pc.LAYERID_IMMEDIATE)},
    RED_GIZMO : new pc.Color(0.8, 0.1, 0.1),
    GREEN_GIZMO : new pc.Color(0.1, 0.8, 0.1),
    BLUE_GIZMO : new pc.Color(0.1, 0.1, 0.8),
    MAGENTA_GIZMO : new pc.Color(0.8, 0.1, 0.8),
    CYAN_GIZMO : new pc.Color(0.1, 0.8, 0.8),
    YELLOW_GIZMO : new pc.Color(0.8, 0.8, 0.1),
    _points : [new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3()],

    circle : function(center, radius, res, color) {

        if (Helper.reloading) return;
        if (!Helper.main.gizmos) return;

        var step = (Math.PI*2) / res
        var layer = this.layerObj
        var points = []
        var colors = []
        for (var i = 0; i < res; i++) {
            var to0 = new pc.Vec3().add2(
                center,
                new pc.Vec3(radius * Math.sin(step * i), 0,
                    radius * Math.cos(step * i)))
            var to1
            if (i < (res-1)) {
                to1 = new pc.Vec3().add2(
                    center,
                    new pc.Vec3(radius * Math.sin(step * (i+1)), 0,
                        radius * Math.cos(step * (i+1))))
            } else {
                to1 = new pc.Vec3().add2(
                    center,
                    new pc.Vec3(radius * Math.sin(0), 0, radius * Math.cos(0)))
            }

            points.push(to0); points.push(to1);
        }
        pc.app.renderLines(points, points.map(function() {return color}), this.layerObj)
    },

    line : function(from, to, color) {

        if (Helper.reloading) return;
        if (!Helper.main.gizmos) return;

        pc.app.renderLine(from, to, color, this.layerObj)
    },

    polygon : function(points, color) {

        if (Helper.reloading) return;
        if (!Helper.main.gizmos) return;

        for (var i = 0; i < points.length-1; i++) {
            this.line(points[i], points[i+1], color)
        }
        this.line(points[0], points[points.length-1], color)
    },

    polygon2 : function(pointsV2, color) {

        if (Helper.reloading) return;
        if (!Helper.main.gizmos) return;

        var i = 0;

        for (i = 0; i < pointsV2.length; i++) {
            this._points[i].set(pointsV2[i].x, 0, pointsV2[i].y)
        }
        for (i = 0; i < this._points.length-1; i++) {
            this.line(this._points[i], this._points[i+1], color)
        }
        this.line(this._points[0], this._points[this._points.length-1], color)
    }
}
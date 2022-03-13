//assetId=72334822
var RenderCameraTotexture = pc.createScript('renderCameraTotexture');
RenderCameraTotexture.attributes.add('scale', {type: 'number', default: 1.0});
RenderCameraTotexture.attributes.add('elementEntity', {type: 'entity', description: 'The element image that will display the render target'});

RenderCameraTotexture.prototype.initialize = function () {
    this.createNewRenderTexture();

    var onResizeCanvas = function() {
        this.secsSinceSameSize = 0;
    };

    this.app.graphicsDevice.on('resizecanvas', onResizeCanvas, this);

    var device = this.app.graphicsDevice;
    this.lastWidth = device.width;
    this.lastHeight = device.height;

    this.secsSinceSameSize = 0;

    var onRenderScaleChange = function (scale) {
        this.scale = scale;
        this.createNewRenderTexture();
        this.secsSinceSameSize = 0;
    };

    this.app.on('renderscale:change', onRenderScaleChange, this);

    this.on('destroy', function() {
        this.app.graphicsDevice.off('resizecanvas', onResizeCanvas, this);
        this.app.off('renderscale:change', onRenderScaleChange, this);

        this.elementEntity.element.texture = null;
        this.renderTarget.destroy();
        this.texture.destroy();
    }, this);
};


// update code called every frame
RenderCameraTotexture.prototype.update = function(dt) {
    // We don't want to be constantly creating an new texture if the window is constantly
    // changing size (e.g a user that is dragging the corner of the browser over a period)
    // of time.

    // We wait for the the canvas width and height to stay the same for short period of time
    // before creating a new texture to render against.

    var device = this.app.graphicsDevice;

    if (device.width == this.lastWidth && device.height == this.lastHeight) {
        this.secsSinceSameSize += dt;
    }

    if (this.secsSinceSameSize > 0.25) {
        if (this.unScaledTextureWidth != device.width || this.unScaledTextureHeight != device.height) {
            this.createNewRenderTexture();
        }
    }

    this.lastWidth = device.width;
    this.lastHeight = device.height;
};


RenderCameraTotexture.prototype.createNewRenderTexture = function() {
    var device = this.app.graphicsDevice;

    // Make sure we clean up the old textures first and remove
    // any references
    if (this.texture && this.renderTarget) {
        var oldRenderTarget = this.renderTarget;
        var oldTexture = this.texture;

        this.renderTarget = null;
        this.texture = null;

        oldRenderTarget.destroy();
        oldTexture.destroy();
    }

    // Create a new texture based on the current width and height of
    // the screen reduced by the scale
    var colorBuffer = new pc.Texture(device, {
        width: device.width * this.scale,
        height: device.height * this.scale,
        format: pc.PIXELFORMAT_R8_G8_B8,
        autoMipmap: true
    });

    colorBuffer.minFilter = pc.FILTER_LINEAR;
    colorBuffer.magFilter = pc.FILTER_LINEAR;
    var renderTarget = new pc.RenderTarget(device, colorBuffer, {
        depth: true,
        flipY: true,
        samples: 4
    });

    this.entity.camera.renderTarget = renderTarget;

    this.elementEntity.element.texture = colorBuffer;

    this.unScaledTextureWidth = device.width;
    this.unScaledTextureHeight = device.height;

    this.texture = colorBuffer;
    this.renderTarget = renderTarget;
};

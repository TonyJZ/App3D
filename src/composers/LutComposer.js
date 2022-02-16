import * as THREE from "../../thirdParty/build/three.module.js";
import * as EXTRA from "../../thirdParty/build/extra.module.js";

function LutComposer(parameters) {
    const rtParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
    };
    this.size = parameters.renderer.getSize();
    this.renderTarget = new THREE.WebGLRenderTarget(this.size.x, this.size.y, rtParameters);
    EXTRA.EffectComposer.call(this, parameters.renderer, this.renderTarget);

    this.type = "LutComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);

    const makeIdentityLutTexture = function() {
        const identityLUT = new Uint8Array([
            0, 0, 0, 255,  // black
            255, 0, 0, 255,  // red
            0, 0, 255, 255,  // blue
            255, 0, 255, 255,  // magenta
            0, 255, 0, 255,  // green
            255, 255, 0, 255,  // yellow
            0, 255, 255, 255,  // cyan
            255, 255, 255, 255,  // white
        ]);
        return function(filter) {
            const texture = new THREE.DataTexture(identityLUT, 4, 2, THREE.RGBAFormat);
            texture.minFilter = filter;
            texture.magFilter = filter;
            texture.needsUpdate = true;
            texture.flipY = false;
            return texture;
        };
    }();

    this.makeLUTTexture = function() {
        const imgLoader = new THREE.ImageLoader();
        const ctx = document.createElement("canvas").getContext("2d");

        return function(info) {
            const texture = makeIdentityLutTexture(
                info.filter ? THREE.LinearFilter : THREE.NearestFilter);

            if (info.url) {
                const lutSize = info.size;
                info.size = 2;

                imgLoader.load(info.url, function(image) {
                    const width = lutSize * lutSize;
                    const height = lutSize;
                    info.size = lutSize;
                    ctx.canvas.width = width;
                    ctx.canvas.height = height;
                    ctx.drawImage(image, 0, 0);
                    const imageData = ctx.getImageData(0, 0, width, height);

                    texture.image.data = new Uint8Array(imageData.data.buffer);
                    texture.image.width = width;
                    texture.image.height = height;
                    texture.needsUpdate = true;
                });
            }

            return texture;
        };
    }();


    // lutShader
    const lutShader = {
        uniforms: {
            tDiffuse: { value: null },
            lutMap: { value: null },
            lutMapSize: { value: 1, },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            #include <common>
        
            #define FILTER_LUT true
        
            uniform sampler2D tDiffuse;
            uniform sampler2D lutMap;
            uniform float lutMapSize;
        
            varying vec2 vUv;
        
            vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
            float sliceSize = 1.0 / size;                  // space of 1 slice
            float slicePixelSize = sliceSize / size;       // space of 1 pixel
            float width = size - 1.0;
            float sliceInnerSize = slicePixelSize * width; // space of size pixels
            float zSlice0 = floor( texCoord.z * width);
            float zSlice1 = min( zSlice0 + 1.0, width);
            float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
            float yRange = (texCoord.y * width + 0.5) / size;
            float s0 = xOffset + (zSlice0 * sliceSize);
        
            #ifdef FILTER_LUT
        
                float s1 = xOffset + (zSlice1 * sliceSize);
                vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
                vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
                float zOffset = mod(texCoord.z * width, 1.0);
                return mix(slice0Color, slice1Color, zOffset);
        
            #else
        
                return texture2D(tex, vec2( s0, yRange));
        
            #endif
            }
        
            void main() {
            vec4 originalColor = texture2D(tDiffuse, vUv);
            gl_FragColor = sampleAs3DTexture(lutMap, originalColor.xyz, lutMapSize);
            }
        `,
    };
    const lutNearestShader = {
        uniforms: Object.assign({}, lutShader.uniforms),
        vertexShader: lutShader.vertexShader,
        fragmentShader: lutShader.fragmentShader.replace("#define FILTER_LUT", "//"),
    };
    // ShaderPass
    this.effectLUT = new EXTRA.ShaderPass(lutShader);
    this.effectLUT.renderToScreen = true;
    this.effectLUTNearest = new EXTRA.ShaderPass(lutNearestShader);
    this.effectLUTNearest.renderToScreen = true;

    // let tonePass = new EXTRA.ShaderPass(toneShader);
    // tonePass.renderToScreen = true;
    this.addPass(renderPass);
    this.addPass(this.effectLUT);
    this.addPass(this.effectLUTNearest);
    // return LutComposer;

    this.lutInfo = parameters.lutInfo;
    this.applyParameters();
}

LutComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: LutComposer,
    isLutComposer: true,
    updateParameters: function(parameters) {
        this.lutInfo = parameters.lutInfo;
        this.applyParameters();
    },
    applyParameters: function() {
        this.lutInfo.texture = this.makeLUTTexture(this.lutInfo);

        const effect = this.lutInfo.filter ? this.effectLUT : this.effectLUTNearest;
        this.effectLUT.enabled = this.lutInfo.filter;
        this.effectLUTNearest.enabled = !this.lutInfo.filter;

        const lutTexture = this.lutInfo.texture;
        effect.uniforms.lutMap.value = lutTexture;
        effect.uniforms.lutMapSize.value = this.lutInfo.size;
    },

});

export { LutComposer };
import * as THREE from "../../thirdParty/build/three.module.js";
import * as EXTRA from "../../thirdParty/build/extra.module.js";

function LensDistortionComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);
    this.type = "LensDistortionComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;

    this.horizontalFOV = parameters.horizontalFOV === undefined ? 45 : parameters.horizontalFOV;
    this.strength = parameters.strength === undefined ? 0.5 : parameters.strength;
    this.cylindricalRatio = parameters.cylindricalRatio === undefined ? 2.0 : parameters.cylindricalRatio;

    this.height = Math.tan(THREE.Math.degToRad(this.horizontalFOV) / 2) / this.camera.aspect;
    this.camera.fov = Math.atan(this.height) * 2 * 180 / 3.1415926535;
    this.camera.updateProjectionMatrix();
    this.aspectRatio = this.camera.aspect;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);

    // Shader
    const lensDistortionShader = {
        uniforms: {
            "tDiffuse": { type: "t", value: null },
            "strength": { type: "f", value: this.strength },
            "height": { type: "f", value: this.height },
            "aspectRatio": { type: "f", value: this.aspectRatio },
            "cylindricalRatio": { type: "f", value: this.cylindricalRatio }
        },
        vertexShader: [
            "uniform float strength;",          // s: 0 = perspective, 1 = stereographic
            "uniform float height;",            // h: tan(verticalFOVInRadians / 2)
            "uniform float aspectRatio;",       // a: screenWidth / screenHeight
            "uniform float cylindricalRatio;",  // c: cylindrical distortion ratio. 1 = spherical
            "varying vec3 vUV;",                // output to interpolate over screen
            "varying vec2 vUVDot;",             // output to interpolate over screen
            "void main() {",
            "gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));",

            "float scaledHeight = strength * height;",
            "float cylAspectRatio = aspectRatio * cylindricalRatio;",
            "float aspectDiagSq = aspectRatio * aspectRatio + 1.0;",
            "float diagSq = scaledHeight * scaledHeight * aspectDiagSq;",
            "vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));",

            "float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;",
            "float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);",

            "vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;",
            "vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);",
            "vUV.xy += uv;",
            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform sampler2D tDiffuse;",      // sampler of rendered scene�s render target
            "varying vec3 vUV;",                // interpolated vertex output data
            "varying vec2 vUVDot;",             // interpolated vertex output data
            "void main() {",
            "vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;",
            "gl_FragColor = texture2DProj(tDiffuse, uv);",
            "}"
        ].join("\n")
    };

    // ShaderPass
    this.effect = new EXTRA.ShaderPass(lensDistortionShader);
    this.effect.renderToScreen = true;

    this.addPass(renderPass);
    this.addPass(this.effect);
    // return LensDistortionComposer;
}

LensDistortionComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: LensDistortionComposer,
    isLensDistortionComposer: true,
    updateParameters: function(parameters) {
        this.effect.uniforms.strength.value = parameters.strength;
        this.effect.uniforms.height.value = Math.tan(THREE.Math.degToRad(parameters.horizontalFOV) / 2) / this.camera.aspect;
        this.camera.fov = Math.atan(this.effect.uniforms.height.value) * 2 * 180 / 3.1415926535;
        this.camera.updateProjectionMatrix();
        this.effect.uniforms.aspectRatio.value = this.camera.aspect;
        this.effect.uniforms.cylindricalRatio.value = parameters.cylindricalRatio;
    },
});

export { LensDistortionComposer };
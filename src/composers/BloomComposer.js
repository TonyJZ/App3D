import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";

function BloomComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000, 0);

    this.type = "BloomComposer";

    let winSize = new THREE.Vector2(0, 0);
    winSize = this.renderer.getSize(winSize);
    let innerWidth = Math.floor(winSize.x);
    let innerHeight = Math.floor(winSize.y);

    let renderScene = new EXTRA.RenderPass(parameters.scene, parameters.camera);

    let effectFXAA = new EXTRA.ShaderPass(EXTRA.FXAAShader);
    effectFXAA.uniforms.resolution.value.set(1 / innerWidth, 1 / innerHeight);

    let bloomPass = new EXTRA.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = (parameters.threshold !== undefined) ? parameters.threshold : 0.0;
    bloomPass.strength = (parameters.strength !== undefined) ? parameters.strength : 3.0;
    bloomPass.radius = (parameters.radius !== undefined) ? parameters.radius : 0.45;
    this.renderer.toneMappingExposure = (parameters.exposure !== undefined) ? parameters.exposure : Math.pow(0.9, 4.0);
    bloomPass.renderToScreen = true;

    this.setSize(innerWidth, innerHeight);
    this.addPass(renderScene);
    this.addPass(bloomPass);
}

BloomComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: BloomComposer,
    isBloomComposer: true,

});

export { BloomComposer };
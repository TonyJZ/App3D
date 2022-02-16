import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";

function BlankComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);
    this.renderer.autoClear = false;
    this.type = "BlankComposer";

    let renderScene = new EXTRA.RenderPass(parameters.scene, parameters.camera);

    this.setSize(innerWidth, innerHeight);
    this.addPass(renderScene);
}

BlankComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: BlankComposer,
    isBlankComposer: true,

});

export { BlankComposer };
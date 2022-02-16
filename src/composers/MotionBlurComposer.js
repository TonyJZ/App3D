import * as EXTRA from "../../thirdParty/build/extra.module.js";

function MotionBlurComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);

    this.type = "MotionBlurComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);
    this.addPass(renderPass);
    let afterimagePass = new EXTRA.AfterimagePass();
    this.addPass(afterimagePass);
}

MotionBlurComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: MotionBlurComposer,
    isMotionBlurComposer: true,

});

export { MotionBlurComposer };
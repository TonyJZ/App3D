import * as EXTRA from "../../thirdParty/build/extra.module.js";

function ToneComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);

    this.type = "ToneComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.color = parameters.color;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);
    const toneShader = {
        uniforms: {
            tDiffuse: { value: null },
            color: { value: this.color },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform sampler2D tDiffuse;
            varying vec2 vUv;

            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                gl_FragColor = vec4(previousPassColor.rgb * color, previousPassColor.a);
            }
        `,
    };
    let tonePass = new EXTRA.ShaderPass(toneShader);
    tonePass.renderToScreen = true;
    this.addPass(renderPass);
    this.addPass(tonePass);
    // return toneComposer;
}

ToneComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: ToneComposer,
    isToneComposer: true,

});

export { ToneComposer };
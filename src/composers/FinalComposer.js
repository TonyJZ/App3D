import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";

function FinalComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);

    this.type = "FinalComposer";

    let finalPass = new EXTRA.ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: parameters.renderTargetTexture }
            },
            vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
          `,
            fragmentShader: `
            uniform sampler2D baseTexture;
            uniform sampler2D bloomTexture;
            varying vec2 vUv;
            vec4 getTexture( sampler2D texture ) {
              return texture2D( texture , vUv );
            }
            void main() {
              gl_FragColor = getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture );
            }
          `,
            defines: {}
        }), "baseTexture"
    );
    finalPass.needsSwap = true;

    let renderScene = new EXTRA.RenderPass(parameters.scene, parameters.camera);
    this.addPass(renderScene);
    this.addPass(finalPass);
}

FinalComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: FinalComposer,
    isFinalComposer: true,

});

export { FinalComposer };
import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";

function MuxComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);

    this.type = "MuxComposer";

    let muxPass = new EXTRA.ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                texture1: { value: parameters.renderTargetTexture1 },
                texture2: { value: parameters.renderTargetTexture2 },
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
            uniform sampler2D texture1;
            uniform sampler2D texture2;
            varying vec2 vUv;
            vec4 getTexture( sampler2D texture ) {
              return texture2D( texture , vUv );
            }
            void main() {
              gl_FragColor = getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( texture1 ) + vec4( 1.0 ) * getTexture( texture2 );
            }
          `,
            defines: {}
        }), "baseTexture"
    );
    muxPass.needsSwap = true;

    let renderScene = new EXTRA.RenderPass(parameters.scene, parameters.camera);
    this.addPass(renderScene);
    this.addPass(muxPass);
}

MuxComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: MuxComposer,
    isMuxComposer: true,

});

export { MuxComposer };
import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";

function GrainComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);
    this.type = "GrainComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.angle = parameters.angle || 1.57;
    this.size = parameters.size || 0.75;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);
    const dotScreenShader = {
        uniforms: {
            tDiffuse: { value: null },
            resolution: { value: this.resolution },
            angle: { value: this.angle },
            size: { value: this.size },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform vec2 resolution;
            uniform float angle;
            uniform float size;
            varying vec2 vUv;

            float pattern() {
                float s = sin( angle ), c = cos( angle );
                vec2 tex = vUv * vec2(resolution.x, resolution.y);
                vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * size;
                return ( sin( point.x ) * sin( point.y ) );
		    }

            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                gl_FragColor = vec4(previousPassColor.rgb * 2.0 - 1.0 + pattern(), previousPassColor.a);

            }
        `,
    };

    let dotScreenPass = new EXTRA.ShaderPass(dotScreenShader);
    dotScreenPass.renderToScreen = true;

    let shaderVignette = EXTRA.VignetteShader;
    let vignettePass = new EXTRA.ShaderPass(shaderVignette);
    shaderVignette.uniforms[ "offset" ].value = 0.95;
    shaderVignette.uniforms[ "darkness" ].value = 1.6;

    this.addPass(renderPass);
    this.addPass(dotScreenPass);
    this.addPass(vignettePass);
}

GrainComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: GrainComposer,
    isGrainComposer: true,
});

export { GrainComposer };
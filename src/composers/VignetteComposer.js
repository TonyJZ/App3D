import * as EXTRA from "../../thirdParty/build/extra.module.js";


function VignetteComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);
    this.type = "VignetteComposer";

    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.color = parameters.color;
    this.range = parameters.clearRange;
    this.level = parameters.level;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);
    const toneShader = {
        uniforms: {
            tDiffuse: { value: null },
            color: { value: this.color },
            range: { value: this.range },
            level: { value: this.level },
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
            uniform float range;
            uniform float level;
            varying vec2 vUv;
            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                float distance = sqrt((vUv.x - 0.5) * (vUv.x - 0.5) + (vUv.y - 0.5) * (vUv.y - 0.5));
                float d = max(0.0, distance - range);
                float v = level * d * d;
                float h = level * d * d;

                vec4 sum = vec4(0.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * (0.051/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * (0.1633/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * (0.051/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * (0.051/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * (0.1633/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * (0.051/2.0);
                // if(distance > 0.5) {
                //     gl_FragColor = vec4(sum.rgb * vec3(0.1,0.1,0.1)/(1.0 + distance), sum.a);
                // } else {
                    gl_FragColor = sum;
                // }
            }
        `,
    };
    let tonePass = new EXTRA.ShaderPass(toneShader);
    tonePass.renderToScreen = true;
    this.addPass(renderPass);
    this.addPass(tonePass);



}

VignetteComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: VignetteComposer,
    isVignetteComposer: true,
});

export { VignetteComposer };
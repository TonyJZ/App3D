import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";

function RainyComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);
    this.renderer.autoClear = false;
    this.type = "RainyComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.percent = parameters.percent || { x: 0.5, y: 0.5 };
    this.hwRatio = parameters.hwRatio || 3.0;
    this.size = parameters.size || 1.0;
    this.level = parameters.level || 3.0;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);
    let lightningShader = {
        uniforms: {
            tDiffuse: { value: null },
            time: { value: 0.0 },
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
            uniform float time;
            varying vec2 vUv;
            
            float S(float x, float y, float z) {
                return smoothstep(x, y, z);
            } 

            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);

                float T = mod(time, 503.);
                float story = S(0., 70., T);
                float fade = S(0., 10., T);
                float lightning = sin(time*sin(time*10.0));				// lighting flicker
                lightning *= pow(max(0., sin(time+sin(time))), 10.);		// lightning flash
                previousPassColor *= 1.+lightning*fade*mix(1., .1, story*story);	// composite lightning

                gl_FragColor = previousPassColor;
            }
        `,
    };
    let lightningPass = new EXTRA.ShaderPass(lightningShader);
    lightningPass.renderToScreen = true;

    let shaderVignette = EXTRA.VignetteShader;
    let vignettePass = new EXTRA.ShaderPass(shaderVignette);
    shaderVignette.uniforms[ "offset" ].value = 2.85;
    shaderVignette.uniforms[ "darkness" ].value = 5.6;

    let rainyShader = {
        uniforms: {
            tDiffuse: { value: null },
            time: { value: 0.0 },
            percent: { value: { x: this.percent.x, y: this.percent.y} },
            hwRatio: { value: this.hwRatio },
            size: { value: this.size },
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
            uniform float time;
            uniform vec2 percent;
            uniform float hwRatio;
            uniform float size;
            uniform float level;
            varying vec2 vUv;

            float S(float x, float y, float z) {
                return smoothstep(x, y, z);
            } 

            vec2 rain(vec2 uv, float t, float inSize, vec2 inPercent, float dropSpeed) {

                vec2 a = vec2(hwRatio, 1.0);
                vec2 st = uv * a;

                vec2 id = floor(st);
                st.y += t * 0.25 * dropSpeed;

                float n = fract(sin(id.x * 2563.56)*1573.48);
                st.y += n;
                uv.y += n;

                id = floor(st);
                float m = fract(sin(id.y * 23568.56)*5723.48);

                id = floor(st);
                st = fract(st) - 0.5;
                float mask1 = 0.0;
                float mask2 = 0.0;
                vec2 o1 = vec2(0.0);
                vec2 o2 = vec2(0.0);

                if((m < inPercent.y) && (n < inPercent.x)) {
                    t += fract(sin(id.x * 2584.56 + id.y * 9853.58) * 273.48) * 6.28;
                    float y = -sin(t + sin(t + sin(t) * 0.5)) * (0.38);
                    
                    vec2 p1 = vec2(0.0, y);

                    o1 = (st-p1);
                    float d = length(o1);
                    mask1 = S(0.06 * inSize, 0.0, d);

                    o2 = (fract(uv * a.x * vec2(1.0, 2.0)) - 0.5)/vec2(1.0, 2.0);
                    d = length(o2);
                    mask2 = S(0.1 * inSize * (0.5-st.y), 0.0, d) * S(-0.1, 0.1, st.y-p1.y);
                }
                return vec2(mask1*o1*30.0 + mask2*o2*10.0);
            }

            void main() {
                vec2 uvDis = vec2(0.0);
                uvDis += rain(vUv * level, time, size, percent, 2.0) * 0.5;
                uvDis += rain((vUv + vec2(0.338, 0.762)) * level * 1.2, time, size, vec2(percent.x + 0.2, percent.y + 0.2), 1.5) * 0.5;
                uvDis += rain((vUv + vec2(0.183, 0.556)) * level * 2.2, time, size, vec2(percent.x + 0.2, percent.y + 0.2), 1.0) * 0.5;
                uvDis += rain((vUv + vec2(-0.17, 0.223)) * level * 4.2, time, size, vec2(percent.x, percent.y ), 0.8) * 0.5;\
                uvDis += rain((vUv + vec2(+0.243, -0.223)) * level * 4.2, time, size, vec2(percent.x , percent.y ), 0.8) * 0.5;
                vec4 previousPassColor = texture2D(tDiffuse, vUv - uvDis);
                
                gl_FragColor = previousPassColor;
            }
        `,
    };
    let rainyPass = new EXTRA.ShaderPass(rainyShader);
    rainyPass.renderToScreen = true;

    this.addPass(renderPass);
    this.addPass(lightningPass);
    /// this.addPass(vignettePass);
    this.addPass(rainyPass);

    let animation = new Animation("rainy", update, []);
    this.scene.animations.addWithReplace(animation);

    function update(delta){
        lightningPass.uniforms.time.value += delta;
        rainyPass.uniforms.time.value += delta;
    }
}

RainyComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: RainyComposer,
    isRainyComposer: true,

});

export { RainyComposer };
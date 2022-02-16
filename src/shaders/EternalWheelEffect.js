import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { eternalWheelEffect_uniforms } from "./eternalWheelEffect_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    color: "#ffffff",   //color of ripple
    duration: 1.0,      //number of second(s) to run 1 loop of animation
}
*/

function EternalWheelEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "EternalWheelEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in eternalWheelEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, eternalWheelEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        if (key === "color" && parameters.color != undefined) {
            uniforms.color.value = new THREE.Color(parameters.color);
        } else {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        }
    }
    if (parameters.restore === undefined) {
        parameters.restore = false;
    }
    addEternalWheelEffect(parameters.object, parameters.meshName);

    function addEternalWheelEffect(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.color = uniforms.color;
                    shader.uniforms.duration = uniforms.duration;
                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float time;
                        uniform vec3 color;
                        uniform float duration;
                        ${shader.fragmentShader}
                    `;
                    // Replace vertex shader
                    shader.vertexShader = shader.vertexShader.replace(
                        "#include <uv_pars_vertex>", `
                        varying vec2 vUv;
                        uniform mat3 uvTransform;
                    `);
                    shader.vertexShader = shader.vertexShader.replace(
                        "#include <uv_vertex>", `
                        vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
                    `);
                    // add the rest of the shader codes at the bottom of the code
                    shader.fragmentShader = shader.fragmentShader.replace(
                        "#include <uv_pars_fragment>", `
                        varying vec2 vUv;
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        "void main() {", `
                        #define PI 3.14159265359
                        #define PI_2 (PI * 2.0)
                        float atan2(in float y, in float x)
                        {
                            return mod(atan(y, x) + PI_2, PI_2);
                        }
                        float smoothStep2(in float edge, in float x)
                        {
                            const float fadeWidth = 0.004;
                            return smoothstep(edge - fadeWidth, edge + fadeWidth, x);
                        }
                        float arc(in vec2 uv, in float rMin, in float rMax, in float aMin, in float aMax)
                        {
                            float r = length(uv);
                            float a = atan2(uv.y, uv.x);
                            aMin = mod(aMin, PI_2);
                            aMax = mod(aMax, PI_2);
                            float minGtMax = step(aMax, aMin);
                            a += step(a, aMax) * minGtMax * PI_2;
                            aMax += minGtMax * PI_2;
                            return smoothStep2(rMin, r) * smoothStep2(r, rMax) * step(aMin, a) * step(a, aMax);
                        }

                        const float rBegin = 0.05;
                        const float ringWidth = 0.04;
                        const float gapWidth = 0.01;
                        const int ringCount = 18;

                        float gapFunc(in float i)
                        {
                            float mul = 1.0;
                            return gapWidth * mul;
                        }
                        float aBeginFunc(in float i, float time)
                        {
                            return 0.0 + i * time * 0.16 + time + 0.2 * sin(time);
                        }
                        float aEndFunc(in float i, float time)
                        {
                            return PI + i * time * 0.16 + time + 0.21 * sin(time * 1.1);
                        }

                        void main() {
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}(?=[^}]*$)/, `
                        float c = 0.0;
                        float rMin = rBegin;
                        for (int i = 0; i < ringCount; ++i)
                        {
                            float gap = gapFunc(float(i));
                            rMin += ringWidth + gap;
                            float t = time/duration;
                            c += arc(vUv, rMin, rMin + ringWidth, aBeginFunc(float(i), t), aEndFunc(float(i), t));
                        }
                        
                        vec3 finalColor = vec3(c) * color;
                        float alpha = max(max(finalColor.r, finalColor.g), finalColor.b);
                        gl_FragColor = vec4( finalColor, alpha );
                    }`);
                };
                child.material.side = 2;
                child.material.needsUpdate = true;
                EternalWheelEffect.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

EternalWheelEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: EternalWheelEffect,
    isEternalWheelEffect: true,
    updateParameters: function(parameters) {
        for (let key in this.uniforms) {
            if (key === "color" && parameters.color != undefined) {
                this.uniforms.color.value = new THREE.Color(parameters.color);
            } else {
                this.uniforms[key].value = parameters[key] === undefined ? this.uniforms[key].value : parameters[key];
            }
        }
        if (parameters.restore === true) {
            this.uniforms.object.value.traverse((child) => {
                if (child.isMesh && child.name === this.uniforms.meshName.value) {
                    child.material.onBeforeCompile = () => {};
                    child.material.needsUpdate = true;
                }
            });
        }
    }
});

export { EternalWheelEffect };
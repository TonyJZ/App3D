import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { rippleEffect_uniforms } from "./rippleEffect_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    color: "#ff0000",   //color of ripple
    duration: 1.0,      //number of second(s) to run 1 loop of animation
}
*/

function RippleEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "RippleEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in rippleEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, rippleEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        if (key === "rippleColor" && parameters.color != undefined) {
            uniforms.rippleColor.value = new THREE.Color(parameters.color);
        } else {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        }
    }
    if (parameters.restore === undefined) {
        parameters.restore = false;
    }
    addRippleEffect(parameters.object, parameters.meshName);

    function addRippleEffect(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.rippleColor = uniforms.rippleColor;
                    shader.uniforms.duration = uniforms.duration;
                    shader.uniforms.rippleCenter = uniforms.rippleCenter;

                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float time;
                        uniform vec3 rippleColor;
                        uniform float duration;
                        uniform vec2 rippleCenter;
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
                        /}$/gm, `
                        float radius = length(vUv + rippleCenter);
                        float t = fract(time/duration);
                        
                        float y = 0.0;
                        float w = 1.0;
                        float a = 25.0;
                        float b = 0.2;
                        float x = radius - t + 1.0;
                        
                        if (x>w) {y=0.0;}
                        else {
                            float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
                            y = (k * pow( x, a ) * pow( 1.0-x, b ) )/(4.*t);
                        }
                        if (y>1.0) {y=1.0;}

                        vec3 rcolor = vec3( max(0.0,y-1.+rippleColor.r), max(0.0,y-1.+rippleColor.g), max(0.0,y-1.+rippleColor.b) );
                        float alpha = max(max(rcolor.r, rcolor.g), rcolor.b);
                        gl_FragColor += vec4(rcolor,alpha);
                    }`);

                };
                child.material.needsUpdate = true;
                RippleEffect.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

RippleEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: RippleEffect,
    isRippleEffect: true,
    updateParameters: function(parameters) {
        for (let key in this.uniforms) {
            if (key === "rippleColor" && parameters.color != undefined) {
                this.uniforms.rippleColor.value = new THREE.Color(parameters.color);
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

export { RippleEffect };
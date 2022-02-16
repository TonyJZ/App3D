import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { animatedPNGEffect_uniforms } from "./animatedPNGEffect_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    duration: 1.0,      //number of second(s) to run 1 loop of animation
}
*/

function AnimatedPNGEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "AnimatedPNGEffect";
    this.material = null;
    this.uniforms = {};

    let texture = new THREE.TextureLoader().load(parameters.tUrl);
    var material = new THREE.MeshBasicMaterial({ map: texture });

    for (let key in animatedPNGEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, animatedPNGEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        if (key === "textureImg" && parameters.textureUrl != undefined) {
            this.uniforms.textureImg.value = THREE.ImageUtils.loadTexture(parameters.textureUrl);
        } else {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        }
    }
    if (parameters.restore === undefined) {
        parameters.restore = false;
    }
    addAnimatedPNGEffect(parameters.object, parameters.meshName);

    function addAnimatedPNGEffect(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                child.material = material;
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.duration = uniforms.duration;
                    shader.uniforms.textureImg = uniforms.textureImg;
                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float time;
                        uniform float duration;
                        uniform sampler2D textureImg;
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
                    // shader.fragmentShader = shader.fragmentShader.replace(
                    //     "void main() {", `
                    //     void main() {
                    // `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}(?=[^}]*$)/, `
                        float numX = 8.0;
                        float numY = 8.0;
                        float tInt = duration/64.0;
                        float t = floor(time/tInt);
                        float i = fract(t/numX)*numX;
                        float j = floor(t/numY);

                        vec2 coor = vec2(vUv.x/numX+i/numX, vUv.y/numY+fract(j/numY));
                        vec4 st = texture2D( textureImg, coor );
                        gl_FragColor = st;
                    }`);
                };
                child.material.side = 2;
                child.material.transparent = true;
                child.material.needsUpdate = true;
                AnimatedPNGEffect.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

AnimatedPNGEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: AnimatedPNGEffect,
    isAnimatedPNGEffect: true,
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

export { AnimatedPNGEffect };
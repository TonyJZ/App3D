import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { heatmapEffect_uniforms } from "./heatmapEffect_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    duration: 1.0,      //number of second(s) to run 1 loop of animation
}
*/

function HeatmapEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "HeatmapEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in heatmapEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, heatmapEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        if (key === "tMap" && parameters.tMapUrl != undefined) {
            uniforms.tMap.value = parameters.tMapUrl === undefined ? uniforms.tMap.value : THREE.ImageUtils.loadTexture(parameters.tMapUrl);
        } else {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        }
    }
    addHeatmapEffect(parameters.object, parameters.meshName);

    function addHeatmapEffect(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    // shader.uniforms.duration = uniforms.duration;
                    shader.uniforms.locations = uniforms.locations;
                    shader.uniforms.values = uniforms.values;
                    shader.uniforms.power = uniforms.power;
                    shader.uniforms.tMap = uniforms.tMap;
                    let numLocations = uniforms.locations.value.length;
                    shader.fragmentShader =
                        "uniform float values[" + numLocations + "];" +
                        "uniform vec3 locations[" + numLocations + "];" + `
                        uniform float power;
                        uniform sampler2D tMap;
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
                    shader.vertexShader = shader.vertexShader.replace(
                        "void main() {", `
                        varying vec3 pos;
                        precision highp float;
                        void main() {
                    `);
                    shader.vertexShader = shader.vertexShader.replace(
                        /}(?=[^}]*$)/, `
                        pos = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }`);

                    // add the rest of the shader codes at the bottom of the code
                    shader.fragmentShader = shader.fragmentShader.replace(
                        "#include <uv_pars_fragment>", `
                        varying vec3 pos;
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}(?=[^}]*$)/, `
                        float n = 0.0;
                        float d = 0.0;
                        float l = 0.0;
                        for(int i = 0; i<` + numLocations + `; i+=1){
                            float distPL = distance(pos,locations[i]);
                            n += (1.0/pow(distPL,power)) * values[i];
                            d += (1.0/pow(distPL,power));
                        }
                        float mixh = n/d;
                        vec2 tPos = vec2(0, mixh);
                        vec4 mixrgb = texture2D(tMap, tPos);
                        float alpha = abs(mixh*2.0-1.0);
                        gl_FragColor = vec4(mixrgb.rgb, alpha);
                    }`);
                };
                // child.material.emissive = { r: 1.0, g: 0.0, b: 0.0 };
                child.material.side = THREE.DoubleSide;
                child.material.needsUpdate = true;
                HeatmapEffect.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

HeatmapEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: HeatmapEffect,
    isHeatmapEffect: true,
    updateParameters: function(parameters) {
        for (let key in this.uniforms) {
            this.uniforms[key].value = parameters[key] === undefined ? this.uniforms[key].value : parameters[key];
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

export { HeatmapEffect };
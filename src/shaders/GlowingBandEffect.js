import { ShaderEffect } from "../ShaderEffect.js";
import { glowingBandEffect_uniforms } from "./glowingBand_uniforms.js";
import { Animation } from "../Animation.js";

function GlowingBandEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "GlowingBandEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in glowingBandEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, glowingBandEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
    }
    if (parameters.restore === undefined) {
        parameters.restore = false;
    }

    addGlowingBand(parameters.object, parameters.meshName);

    function addGlowingBand(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.alpha = uniforms.alpha;
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.direction = uniforms.direction;
                    shader.uniforms.bandWidth = uniforms.bandWidth;
                    shader.uniforms.redBase = uniforms.redBase;
                    shader.uniforms.greenBase = uniforms.greenBase;
                    shader.uniforms.blueBase = uniforms.blueBase;
                    shader.uniforms.redAmp = uniforms.redAmp;
                    shader.uniforms.greenAmp = uniforms.greenAmp;
                    shader.uniforms.blueAmp = uniforms.blueAmp;
                    shader.uniforms.uSpeed = uniforms.uSpeed;
                    shader.uniforms.vSpeed = uniforms.vSpeed;

                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float alpha;
                        uniform float time;
                        uniform float direction;
                        uniform float bandWidth;
                        uniform float redBase;
                        uniform float greenBase;
                        uniform float blueBase;
                        uniform float redAmp;
                        uniform float greenAmp;
                        uniform float blueAmp;
                        uniform float uSpeed;
                        uniform float vSpeed;
                        ${shader.fragmentShader}
                    `;

                    // add the rest of the shader codes at the bottom of the code
                    shader.fragmentShader = shader.fragmentShader.replace(
                        "#include <uv_pars_fragment>", `
                        varying vec2 vUv;
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}$/gm, `
                        float red = 0.0;
                        float green = 0.0;
                        float blue = 0.0;
                        float alphaOut = 0.0;
                        float redCritical = bandWidth * (redAmp - redBase);
                        float greenCritical = bandWidth * (greenAmp - greenBase);
                        float blueCritical = bandWidth * (blueAmp - blueBase);
                        vec2 position = vUv + vec2(uSpeed, vSpeed) * time;
                            if(direction == 1.0) {
                                red = redAmp * abs(sin(position.y)) + redBase;
                                green = greenAmp * abs(sin(position.y)) + greenBase;
                                blue = blueAmp * abs(sin(position.y)) + blueBase;
                            }else{
                                red = redAmp * abs(sin(position.x)) + redBase;
                                green = greenAmp * abs(sin(position.x)) + greenBase;
                                blue = blueAmp * abs(sin(position.x)) + blueBase;
                            }
                            if(red < redCritical || green < greenCritical || blue < blueCritical) {
                                red = redBase;
                                green = greenBase;
                                blue = blueBase;
                            }
                            gl_FragColor = gl_FragColor.rgba + vec4(red, green, blue, alpha);
                            
                    }`);
                    shader.vertexShader = shader.vertexShader.replace(
                        "#include <uv_pars_vertex>", `
                        varying vec2 vUv;
                        uniform mat3 uvTransform;
                    `);
                    shader.vertexShader = shader.vertexShader.replace(
                        "#include <uv_vertex>", `
                        vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
                    `);
                };
                child.material.needsUpdate = true;
                GlowingBandEffect.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

GlowingBandEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: GlowingBandEffect,
    isGlowingBandEffect: true,
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

export { GlowingBandEffect };
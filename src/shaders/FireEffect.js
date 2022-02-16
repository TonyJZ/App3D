import { ShaderEffect } from "../ShaderEffect.js";
import { fireEffect_uniforms } from "./fire_uniforms.js";
import { Animation } from "../Animation.js";

/*
##initial parameter
    parameters = {
        object: object, // object for adding effect
        color: {r: 0.9, g: 0.9, b: 0.05}, // setup color
        speed: 0.2, // setup the speed
    };

##update parameter
    parameters = {
        restore: false, // switch for close effect
        color: {r: 0.9, g: 0.9, b: 0.05}, // update color
        speed: 0.2, // setup the speed
    };
*/

function FireEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "FireEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in fireEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, fireEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
    }

    if (parameters.restore === undefined) {
        parameters.restore = false;
    }

    addFire(parameters.object, parameters.meshName);

    function addFire(object) {
        object.traverse((child) => {
            if (child.isMesh && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.speed = uniforms.speed;
                    shader.uniforms.color = uniforms.color;
                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float time;
                        uniform float speed;
                        uniform float alpha;
                        uniform vec3 color;
                        float innerTime = time * speed;
                        ${shader.fragmentShader}
                    `;

                    // add the rest of the shader codes at the bottom of the code
                    shader.fragmentShader = shader.fragmentShader.replace(
                        "#include <uv_pars_fragment>", `
                        varying vec2 vUv;
                        
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}$/gm, `
                        float d1 = 1e30;
                        float d2 = 1e30;
                        float d3 = 1e30;
                        float d4 = 1e30;
                        float d5 = 1e30;
                        float d6 = 1e30;
                        float d7 = 1e30;
                        vec2 p1 = vUv + innerTime;
                        vec2 p2 = vUv * 2.0 + 1.3 + innerTime * 0.5;
                        vec2 p3 = vUv * 4.0 + 2.3 + innerTime *.25;
                        vec2 p4 = vUv * 8.0 + 3.3 + innerTime *.125;
                        vec2 p5 = vUv * 32.0 + 4.3 + innerTime *.125;
                        vec2 p6 = vUv * 64.0 + 5.3 + innerTime * .0625;
                        vec2 p7 = vUv * 128.0 + 7.3;

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p1) + vec2(xo, yo);
                                vec2 temp = p1 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d1 = min(d1, dot(temp, temp));
                            }
                        }
                        float w1 = 3.0 * exp(-4.0 * abs(2.0 * d1 - 1.0));

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p2) + vec2(xo, yo);
                                vec2 temp = p2 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d2 = min(d2, dot(temp, temp));
                            }
                        }
                        float w2 = 3.0 * exp(-4.0 * abs(2.0 * d2 - 1.0));

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p3) + vec2(xo, yo);
                                vec2 temp = p3 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d3 = min(d3, dot(temp, temp));
                            }
                        }
                        float w3 = 3.0 * exp(-4.0 * abs(2.0 * d3 - 1.0));

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p4) + vec2(xo, yo);
                                vec2 temp = p4 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d4 = min(d4, dot(temp, temp));
                            }
                        }
                        float w4 = 3.0 * exp(-4.0 * abs(2.0 * d4 - 1.0));

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p5) + vec2(xo, yo);
                                vec2 temp = p5 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d5 = min(d5, dot(temp, temp));
                            }
                        }
                        float w5 = 3.0 * exp(-4.0 * abs(2.0 * d5 - 1.0));

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p6) + vec2(xo, yo);
                                vec2 temp = p6 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d6 = min(d6, dot(temp, temp));
                            }
                        }
                        float w6 = 3.0 * exp(-4.0 * abs(2.0 * d6 - 1.0));

                        for (int xo = -1; xo <= 1; ++xo) {
                            for (int yo = -1; yo <= 1; ++yo) {
                                vec2 tp = floor(p7) + vec2(xo, yo);
                                vec2 temp = p7 - tp - vec2(fract(sin(fract(sin(tp.x) * (4313.13311)) + tp.y) * 3131.0011));
                                d7 = min(d7, dot(temp, temp));
                            }
                        }
                        float w7 = 3.0 * exp(-4.0 * abs(2.0 * d7 - 1.0));
                        float t = sqrt(sqrt(sqrt(pow(w1, 2.0) * w2 * w3 * w4 * w5 * sqrt(w6) * sqrt(sqrt(w7)))));
                        vec3 color = t * vec3(2.0 * color.r, 2.0 * color.g * t, 2.0 * color.b + pow(t, 2.-t));

                        gl_FragColor = gl_FragColor.rgba + vec4(color, alpha);
                            
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
                FireEffect.material = child.material;
                let animation = new Animation("Fire", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

FireEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: FireEffect,
    isFireEffect: true,
    updateParameters: function(parameters) {
        for (let key in this.uniforms) {
            this.uniforms[key].value = parameters[key] === undefined ? this.uniforms[key].value : parameters[key];
        }
        if (parameters.restore === true) {
            this.uniforms.object.value.traverse((child) => {
                if (child.isMesh) {
                    child.material.onBeforeCompile = () => {};
                    child.material.needsUpdate = true;
                }
            });
        }

    }
});

export { FireEffect };
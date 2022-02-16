import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { waterEffect2_uniforms } from "./waterEffect2_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    duration: 1.0,      //number of second(s) to run 1 loop of animation
}
*/

function WaterEffect2(parameters) {
    ShaderEffect.call(this);
    this.type = "WaterEffect2";
    this.material = null;
    this.uniforms = {};

    for (let key in waterEffect2_uniforms) {
        this.uniforms[key] = Object.assign({}, waterEffect2_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        if (key === "color" && parameters.color != undefined) {
            uniforms.color.value = new THREE.Color(parameters.color);
        } else {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        }
    }
    addWaterEffect2(parameters.object, parameters.meshName);

    function addWaterEffect2(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.duration = uniforms.duration;
                    shader.uniforms.isalpha = uniforms.isalpha;
                    shader.uniforms.waveWidth = uniforms.waveWidth;
                    shader.uniforms.waveHeight = uniforms.waveHeight;
                    shader.uniforms.color = uniforms.color;
                    shader.uniforms.contrast = uniforms.contrast;
                    // Add the uniforms at the top of the vert/frag shader
                    shader.vertexShader = `
                        uniform float time;
                        uniform float duration;
                        uniform bool isalpha;
                        uniform float waveWidth;
                        uniform float waveHeight;
                        ${shader.vertexShader}
                    `;
                    shader.fragmentShader = `
                        uniform float contrast;
                        uniform vec3 color;

                        varying float vHeight;
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
                        varying float vHeight;
                        
                        float num_k(float H, float L, float s)
                        {
                            float k = 4.0*(1.0+1.0/s)*H/(L*L);	
                            return k;
                        }
                        float num_a(float L, float s)
                        {
                            float a = L/(2.0*(1.0+1.0/s));	
                            return a;
                        }
                        float get_y(vec2 p, vec2 D, float H, float L, float s, float t)
                        {
                            float k = num_k(H, L, s);
                            float a = num_a(L, s);
                            float w = fract(dot(D,p)/L + t)*L-a;
                            float y;
                            if (w>=-a && w<=a)
                                y = k*w*w;
                            else if (w>a && w<=a*(1.0+2.0/s))
                                y = -k*s*(w-a-a/s)*(w-a-a/s) + H;
                            else
                                y = 0.0;
                            return y;
                        }
                        vec2 get_xz(float y, vec2 D, float H)
                        {
                            vec2 xz = vec2((H-y)*D.x, (H-y)*D.y);
                            return xz;
                        }

                        vec3 get_B(vec2 p, vec2 D, float H, float L, float s, float t)
                        {
                            float k = num_k(H, L, s);
                            float a = num_a(L, s);
                            float w = fract(dot(D,p)/L + t)*L-a;
                            float dydx;
                            if (w>=-a && w<=a)
                                dydx = 2.0*k*w*D.x;
                            else if (w>a && w<=a*(1.0+2.0/s))
                                dydx = -2.0*k*s*(w-a-a/s)*D.x;
                            else
                                dydx = 0.0;
                            vec3 B = vec3(-D.x*dydx, dydx, -D.y*dydx);
                            return B;
                        }
                        vec3 get_T(vec2 p, vec2 D, float H, float L, float s, float t)
                        {
                            float k = num_k(H, L, s);
                            float a = num_a(L, s);
                            float w = fract(dot(D,p)/L + t)*L-a;
                            float dydz;
                            if (w>=-a && w<=a)
                                dydz = 2.0*k*w*D.y;
                            else if (w>a && w<=a*(1.0+2.0/s))
                                dydz = -2.0*k*s*(w-a-a/s)*D.y;
                            else
                                dydz = 0.0;
                            vec3 T = vec3(-D.x*dydz, dydz, -D.y*dydz);
                            return T;
                        }
                        float random (vec2 p)
                        {
                            return fract(sin(p.x));
                        }
                        
                        void main() {
                    `);
                    shader.vertexShader = shader.vertexShader.replace(
                        /}(?=[^}]*$)/, `
                        vUv = uv;
                        vec4 v = vec4( position, 1.0 );
                        float t = time / duration;
                        vec2 p = vec2(position.x, position.z);
                        float s = 100.0;
                        vec2 D1 = vec2(1.0, 1.0); float H1 = random(p); float L1 = 21.0; 
                        float y1 = get_y(p, D1, H1, L1, s, t);
                        vec2 xz1 = get_xz(y1, D1, H1);
                        vec3 B1 = get_B(p, D1, H1, L1, s, t);
                        vec3 T1 = get_T(p, D1, H1, L1, s, t);

                        vec2 D2 = vec2(0.9, 1.0); float H2 = 0.4; float L2 = 42.0;
                        float y2 = get_y(p, D2, H2, L2, s, t);
                        vec2 xz2 = get_xz(y2, D2, H2);
                        vec3 B2 = get_B(p, D2, H2, L2, s, t);
                        vec3 T2 = get_T(p, D2, H2, L2, s, t);

                        vec2 D3 = vec2(-0.2, -1.0); float H3 = 0.5; float L3 = 20.0;
                        float y3 = get_y(p, D3, H3, L3, s, t);
                        vec2 xz3 = get_xz(y3, D3, H3);
                        vec3 B3 = get_B(p, D3, H3, L3, s, t);
                        vec3 T3 = get_T(p, D3, H3, L3, s, t);

                        vec2 D4 = vec2(0.6, -0.0); float H4 = 0.5; float L4 = 6.0;
                        float y4 = get_y(p, D4, H4, L4, s, t);
                        vec2 xz4 = get_xz(y4, D4, H4);
                        vec3 B4 = get_B(p, D4, H4, L4, s, t);
                        vec3 T4 = get_T(p, D4, H4, L4, s, t);
                        
                        v.y = y1 + y2 + y3 + y4;
                        v.x += xz1.x + xz2.x + xz3.x + xz4.x;
                        v.z += xz1.y + xz2.y + xz3.y + xz4.y;

                        vec3 BB = B1 + B2 + B3 + B4;
                        vec3 TT = T1 + T2 + T3 + T4;
                        BB.x += 1.0;
                        TT.z += 1.0;

                        vNormal = -normalize(cross(BB, TT));

                        vHeight = v.y;
                        gl_Position = projectionMatrix * modelViewMatrix * v;

                    }`);

                    // add the rest of the shader codes at the bottom of the code
                    shader.fragmentShader = shader.fragmentShader.replace(
                        "#include <uv_pars_fragment>", `
                        varying vec2 vUv;
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}(?=[^}]*$)/, `
                        // vec3 col = vHeight * contrast * color;
                        // gl_FragColor += vec4( col, 0.1 );
                        
                        vec3 light = vec3(0.0, 0.01, 1.0);
                        light = normalize(light);
                        float dProd = max(0.0, dot(vNormal, light));
                        gl_FragColor += vec4(dProd, dProd, dProd, 0.01);
                    }`);
                };
                // child.material.emissive = { r: 1.0, g: 0.0, b: 0.0 };
                child.material.side = THREE.DoubleSide;
                child.material.needsUpdate = true;
                WaterEffect2.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

WaterEffect2.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: WaterEffect2,
    isWaterEffect2: true,
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

export { WaterEffect2 };
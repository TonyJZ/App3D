import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { starNestEffect_uniforms } from "./starNestEffect_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    duration: 1.0,      //number of second(s) to run 1 loop of animation
    transparent: true   // set the shader material transparent or not
}
*/

function StarNestEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "StarNestEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in starNestEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, starNestEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;

    for (let key in uniforms) {
        if (key === "color" && parameters.color != undefined) {
            uniforms.color.value = new THREE.Color(parameters.color);
        } else {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        }
    }
    addStarNest(parameters.object, parameters.meshName);

    function addStarNest(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.duration = uniforms.duration;
                    shader.uniforms.transparent = uniforms.transparent;
                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float time;
                        uniform float duration;
                        uniform bool transparent;
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
                        #define iterations 17
                        #define formuparam 0.53
                        #define volsteps 20
                        #define stepsize 0.1
                        #define zoom   0.800
                        #define tile   0.850
                        #define brightness 0.0015
                        #define darkmatter 0.300
                        #define distfading 0.730
                        #define saturation 0.850

                        void main() {
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}(?=[^}]*$)/, `
                        vec3 dir=vec3(vUv,1.);
                        
                        float a1=.5;
                        float a2=.8;
                        mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
                        mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
                        dir.xz*=rot1;
                        dir.xy*=rot2;
                        vec3 from=vec3(1.,.5,0.5);
                        from+=vec3(time*2./duration,time/duration,-2.);
                        from.xz*=rot1;
                        from.xy*=rot2;
                        
                        //volumetric rendering
                        float s=0.1,fade=1.;
                        vec3 v=vec3(0.);
                        for (int r=0; r<volsteps; r++) {
                            vec3 p=from+s*dir*.5;
                            p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
                            float pa,a=pa=0.;
                            for (int i=0; i<iterations; i++) { 
                                p=abs(p)/dot(p,p)-formuparam;
                                a+=abs(length(p)-pa); // absolute sum of average change
                                pa=length(p);
                            }
                            float dm=max(0.,darkmatter-a*a*.001); //dark matter
                            a*=a*a; // add contrast
                            if (r>6) fade*=1.-dm; // dark matter, don't render near
                            //v+=vec3(dm,dm*.5,0.);
                            v+=fade;
                            v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
                            fade*=distfading; // distance fading
                            s+=stepsize;
                        }
                        v=mix(vec3(length(v)),v,saturation); //color adjust

                        float alpha;
                        if (transparent) {
                            alpha = max(max(v.r, v.g), v.b)*.01;
                        } else {
                            alpha = 1.0;
                        }
                        gl_FragColor = vec4(v*.01,alpha);	
                    }`);
                };
                // child.material.emissive = { r: 1.0, g: 0.0, b: 0.0 };
                child.material.side = THREE.DoubleSide;
                child.material.needsUpdate = true;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

StarNestEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: StarNestEffect,
    isStarNestEffect: true,
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

export { StarNestEffect };
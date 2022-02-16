import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { radarEffect_uniforms } from "./radarEffect_uniforms.js";
import { Animation } from "../Animation.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    meshName: meshName, //name of the mesh to add this effct
    restore: false,     //if true, restore to the condition before add effect
    color: "#ff0000",   //color of ripple
    duration: 1.0,      //number of second(s) to run 1 loop of animation
    fadeAngle: 90.0,      //angle of fading in degree
}
*/

function RadarEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "RadarEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in radarEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, radarEffect_uniforms[key]);
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
    addRadarEffect(parameters.object, parameters.meshName);

    function addRadarEffect(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                // eslint-disable-next-line space-before-blocks
                child.material.onBeforeCompile = function(shader){
                    shader.uniforms.time = uniforms.time;
                    shader.uniforms.color = uniforms.color;
                    shader.uniforms.duration = uniforms.duration;
                    shader.uniforms.fadeAngle = uniforms.fadeAngle;
                    // Add the uniforms at the top of the frag shader
                    shader.fragmentShader = `
                        uniform float time;
                        uniform vec3 color;
                        uniform float duration;
                        uniform float fadeAngle;
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
                        #define SMOOTH(r,R) (smoothstep(R-1.0,R+1.0, r))
                        #define RANGE(a,b,x) ( step(a,x)*(1.0-step(b,x)) )
                        #define RS(a,b,x) ( smoothstep(a-1.0,a+1.0,x)*(1.0-smoothstep(b-1.0,b+1.0,x)) )
                        #define M_PI 3.1415926535897932384626433832795

                        #define blue1 vec3(0.74,0.95,1.00)
                        #define red   vec3(1.00,0.38,0.227)

                        #define MOV(a,b,c,d,t) (vec2(a*cos(t)+b*cos(0.1*(t)), c*sin(t)+d*cos(0.1*(t))))

                        float movingLine(vec2 uv, vec2 center, float radius)
                        {
                            //angle of the line
                            float theta0 = 360.0 * time / duration;
                            vec2 d = uv - center;
                            float r = length(d);
                            if(r<radius)
                            {
                                //compute the distance to the line theta=theta0
                                vec2 p = radius*vec2(cos(theta0*M_PI/180.0),
                                                    -sin(theta0*M_PI/180.0));
                                // float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
                                d = normalize(d);
                                //compute gradient based on angle difference to theta0
                                float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
                                float gradient = clamp(1.0-theta/fadeAngle,0.0,1.0);
                                float header;
                                if (gradient>=0.995)
                                    header = 1.0;
                                else header = 0.0;
                                return header+0.5*gradient;
                            }
                            else return 0.0;
                        }
                        float circle(vec2 uv, vec2 center, float radius, float width)
                        {
                            float r = length(uv - center);
                            if (r<(radius+width/2.0) && r>(radius-width/2.0))
                                return 1.0;
                            else return 0.0;
                        }
                        float _cross(vec2 uv, vec2 center, float radius)
                        {
                            vec2 d = uv - center;
                            float dx = abs(d.x - d.y);
                            float dy = abs(d.x + d.y);
                            float r = length(d);
                            if( (r<radius) && ( (dx<0.005) || (dy<0.005) ) )
                                {return 1.0;}
                            else {return 0.0;}
                        }

                        void main() {
                    `);
                    shader.fragmentShader = shader.fragmentShader.replace(
                        /}(?=[^}]*$)/, `
                        vec3 finalColor;

                        vec2 c = vec2(0.,0.);
                        finalColor = vec3( 0.3*_cross(vUv, c, 1.0) );
                        finalColor += ( circle(vUv, c, 0.5, 0.005) + circle(vUv, c, 0.8, 0.005) ) * blue1 + circle(vUv, c, 0.04, 0.01) * color;;
                        finalColor += movingLine(vUv, c, 1.0) * color;
                        float alpha = max(max(finalColor.r, finalColor.g), finalColor.b);

                        gl_FragColor = vec4( finalColor, alpha );
                    }`);
                };
                child.material.side = 2;
                child.material.needsUpdate = true;
                RadarEffect.material = child.material;
                let animation = new Animation(meshName + "_updateTime", updateTime, [uniforms]);
                object.animations.addWithReplace(animation);
            }
        });
    }
    function updateTime(uniforms, delta) {
        uniforms["time"].value += delta;
    }
}

RadarEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: RadarEffect,
    isRadarEffect: true,
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

export { RadarEffect };
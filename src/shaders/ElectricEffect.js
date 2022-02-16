import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { electricEffect_uniforms } from "./electric_uniforms.js";
import electricEffect_fragment from "./electric_fragment.glsl";
import electricEffect_vertex from "./electric_vertex.glsl";
import { Animation } from "../Animation.js";
/*
##initial parameter
    parameters = {
        object: object, // object for adding effect
        meshName: meshName, // name of mesh for adding effect
        noiseSeed: "images/lava.jpg", // path for noise source
        restore: false, // switch for close effect
        speed: 0.2, // setup the speed
        color: { r: 0.9, g: 0.4, b: 0.5}, // setup the color
        initialPosition: { x: 0.5, y: -0.5}, // setup the center of effect
    };

##update parameter
    parameters = {
        noiseSeed: "images/lava.jpg", // path for noise source
        restore: false, // switch for close effect
        speed: 0.2, // setup the speed
        color: { r: 0.9, g: 0.4, b: 0.5}, // setup the color
        initialPosition: { x: 0.5, y: -0.5}, // setup the center of effect
    };
*/
function ElectricEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "ElectricEffect";
    this.material = null;
    this.uniforms = {};

    for (let key in electricEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, electricEffect_uniforms[key]);
    }
    let uniforms = this.uniforms;
    for (let key in uniforms) {
        if (key != "noiseSeed") {
            uniforms[key].value = parameters[key] === undefined ? uniforms[key].value : parameters[key];
        } else {
            uniforms[key].value = new THREE.ImageUtils.loadTexture(parameters.noiseSeed);
        }
    }

    addElectric(parameters.object, parameters.meshName);

    function addElectric(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName && parameters.restore === false) {
                let material = new THREE.ShaderMaterial({
                    color: 0x0000ff,
                    uniforms: uniforms,
                    vertexShader: electricEffect_vertex,
                    fragmentShader: electricEffect_fragment,
                    transparent: true,
                    side: THREE.DoubleSide
                });
                ElectricEffect.material = child.material;
                child.material = material;
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

ElectricEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: ElectricEffect,
    isElectricEffect: true,
    updateParameters: function(parameters) {
        if (parameters.noiseSeed != null) {
            this.uniforms["noiseSeed"].value = new THREE.ImageUtils.loadTexture(parameters.noiseSeed);
        }
        for (let key in this.uniforms) {
            if (key != "noiseSeed") {
                this.uniforms[key].value = parameters[key] === undefined ? this.uniforms[key].value : parameters[key];
            }
        }
        if (parameters.restore === true) {
            this.uniforms.object.value.traverse((child) => {
                if (child.isMesh && child.name === this.uniforms.meshName.value) {
                    child.material = ElectricEffect.material;
                    child.material.needsUpdate = true;
                }
            });
        }
    }
});

export { ElectricEffect };
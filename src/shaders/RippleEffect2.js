import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import rippleEffect2_vertex from "./rippleEffect2_vertex.glsl";
import rippleEffect2_fragment from "./rippleEffect2_fragment.glsl";
import { rippleEffect2_uniforms } from "./rippleEffect2_uniforms.js";
import { BaseObject } from "../BaseObject.js";
import { Animation } from "../Animation.js";

// ripples
function RippleEffect2(parameters) {// parameters = {}
    ShaderEffect.call(this);
    this.type = "RippleEffect2";
    this.vertexShader = rippleEffect2_vertex;
    this.fragmentShader = rippleEffect2_fragment;
    this.uniforms = {};
    for (let key in rippleEffect2_uniforms) {
        this.uniforms[key] = Object.assign({}, rippleEffect2_uniforms[key]);
    }
    this.baseObject = new BaseObject();
    this.updateParameters(parameters);
    this.rippleMesh = this.addRipple(this.vertexShader, this.fragmentShader, this.uniforms);
    let animation = new Animation("updateTime", this.updateTime, [this.rippleMesh]);
    this.baseObject.animations.addWithReplace(animation);

    // add mesh to baseObject
    this.baseObject.add(this.rippleMesh);
}

RippleEffect2.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: RippleEffect2,
    isRippleEffect2: true,
    updateParameters: function(parameters) {
        this.diameter = parameters.diameter === undefined ? 20 : parameters.diameter;
    },
    addRipple: function(vertShader, fragShader, uniforms) {
        let geometry = new THREE.PlaneBufferGeometry(20, 20);
        let material = this.createMaterial(vertShader, fragShader, uniforms);
        return new THREE.Mesh(geometry, material);
    },
    createMaterial: function(vertShader, fragShader, uniforms) {
        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        return shaderMaterial;
    },
    updateTime: function(mesh, delta) {
        if (mesh.isMesh && mesh.material.uniforms != null) {
            mesh.material.uniforms.time.value += delta;
        }
    }
});

export { RippleEffect2 };
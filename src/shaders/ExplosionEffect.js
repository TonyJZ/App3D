import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import explosionEffect_vertex from "./explosionEffect_vertex.glsl";
import explosionEffect_fragment from "./explosionEffect_fragment.glsl";
import { explosionEffect_uniforms } from "./explosionEffect_uniforms.js";
import { BaseObject } from "../BaseObject.js";
import { Animation } from "../Animation.js";

// explosion
// parameters = {diameter, textureUrl}
function ExplosionEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "ExplosionEffect";
    this.vertexShader = explosionEffect_vertex;
    this.fragmentShader = explosionEffect_fragment;
    this.uniforms = {};
    for (let key in explosionEffect_uniforms) {
        this.uniforms[key] = Object.assign({}, explosionEffect_uniforms[key]);
    }
    this.baseObject = new BaseObject();
    this.updateParameters(parameters);
    this.explosionMesh = this.addExplosion(this.vertexShader, this.fragmentShader, this.uniforms);
    let animation = new Animation("updateTime", this.updateTime, [this.explosionMesh]);
    this.baseObject.animations.addWithReplace(animation);

    // add mesh to baseObject
    this.baseObject.add(this.explosionMesh);
}

ExplosionEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: ExplosionEffect,
    isExplosionEffect: true,
    updateParameters: function(parameters) {
        this.diameter = parameters.diameter === undefined ? 20 : parameters.diameter;
        // this.updateTime(this.explosionMesh);
        this.uniforms.tExplosion.value = parameters.textureUrl === undefined ? this.uniforms.tExplosion.value : new THREE.TextureLoader().load(parameters.textureUrl);
    },
    addExplosion: function(vertShader, fragShader, uniforms) {
        let geometry = new THREE.IcosahedronGeometry(this.diameter / 2, 4);
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

export { ExplosionEffect };
import * as THREE from "../../thirdParty/build/three.module.js";
import * as EXTRA from "../../thirdParty/build/extra.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { BaseObject } from "../BaseObject.js";

/*
parameters = {
    object: baseObject, //BaseObject to add this effct
    upNormal: normal, // Vector3D specify the up axis, like Vector3D(0, 1, 0)
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1,
    normal1Url: "Water_1_M_Normal.jpg",
    normal2Url: "Water_2_M_Normal.jpg",
}
*/

function WaterEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "WaterEffect";

    this.baseObject = addWaterEffect(parameters);

    function addWaterEffect(parameters) {
        let baseObject = new BaseObject();
        let waterObj;
        let object = parameters.object;
        object.updateMatrixWorld();
        object.traverse((child) => {
            if (child.isMesh) {
                let geometry = child.geometry;
                var textureLoader = new THREE.TextureLoader();
                waterObj = new EXTRA.Water2(geometry, {
                    color: parameters.color,
                    scale: parameters.scale,
                    flowDirection: new THREE.Vector2(parameters.flowX, parameters.flowY),
                    textureWidth: 1024,
                    textureHeight: 1024,
                    normalMap0: textureLoader.load(parameters.normal1Url),
                    normalMap1: textureLoader.load(parameters.normal2Url),
                    clipBias: parameters.clipBias,
                    flowSpeed: parameters.flowSpeed,
                    reflectivity: parameters.reflectivity,
                    shader: parameters.shader,
                    upNormal: parameters.upNormal
                });
                let group = new THREE.Group();
                group.applyMatrix(child.matrixWorld);
                group.add(waterObj);
                baseObject.add(group);
            }
        });
        if (object.parent) {
            object.parent.remove(object);
        }

        return baseObject;
    }
}

WaterEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: WaterEffect,
    isWaterEffect: true,
    updateParameters: function(parameters) {
        this.baseObject.traverse((child) => {
            if (child.type == "Water2") {
                if (parameters.color !== undefined) {
                    child.material.uniforms.color.value.set(parameters.color);
                }
                if (parameters.scale !== undefined) {
                    child.material.uniforms.config.value.w = parameters.scale;
                }
                if (parameters.flowX !== undefined) {
                    child.material.uniforms.flowDirection.value.x = parameters.flowX;
                    child.material.uniforms.flowDirection.value.normalize();
                }
                if (parameters.flowY !== undefined) {
                    child.material.uniforms.flowDirection.value.y = parameters.flowY;
                    child.material.uniforms.flowDirection.value.normalize();
                }
            }
        });
    }
});

export { WaterEffect };
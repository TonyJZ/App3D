import * as THREE from "../thirdParty/build/three.module.js";
import { BaseObject } from "./BaseObject.js";
import { Animation } from "./Animation.js";

// config = {
//     near: 1,
//     far: 500,
//     resolution: 256,
//     options: {format: RGBFormat, magFilter: LinearFilter, minFilter: LinearFilter},
//     enableReflective: true
// }
function ReflectiveObject(object, render, scene, config) {
    BaseObject.call(this);
    this.type = "ReflectiveObject";

    this.reflectiveRender = render;
    this.reflectiveScene = scene;

    this.enableReflective = true;

    var near = 1, far = 100, resolution = 256, options = undefined;
    if (config !== undefined) {
        near = config.near === undefined ? near : config.near;
        far = config.far === undefined ? far : config.far;
        resolution = config.resolution === undefined ? resolution : config.resolution;
        options = config.options;
        this.enableReflective = config.enableReflective === undefined ? true : config.enableReflective;
    }

    // Commenting this out for now as it doesn't appear to be necessary:
    // object.visible = false;
    object.updateMatrixWorld();
    this.mirrorObjCam = new THREE.CubeCamera(near, far, resolution, options);
    // this.mirrorObjCam.applyMatrix(object.matrixWorld);

    var mirrorObjMaterial = new THREE.MeshBasicMaterial({ envMap: this.mirrorObjCam.renderTarget });

    var singleGeometry = object.geometry; // .applyMatrix(object.matrixWorld);
    // new THREE.Geometry();
    // object.traverse((child) => {
    //     if (child.isMesh) {
    //         child.updateMatrix(); // as needed
    //         singleGeometry.merge(child.geometry, child.matrix);
    //     }
    // });

    var mirrorObj = new THREE.Mesh(singleGeometry, mirrorObjMaterial);
    mirrorObj.applyMatrix(object.matrixWorld);
    // hide original object
    object.visible = false;

    // let pos = new APP3D.Vector3();
    // object.getWorldPosition(pos);
    this.mirrorObjCam.position.copy(mirrorObj.position);

    this.add(mirrorObj);
    this.add(this.mirrorObjCam);

    function updateCubeCamera(object) {
        if (object.enableReflective) {
            object.visible = false;
            object.mirrorObjCam.update(object.reflectiveRender, object.reflectiveScene);
            object.visible = true;
        }
    }

    let animation = new Animation("updateCubeCamera", updateCubeCamera, [this]);
    this.animations.addWithReplace(animation);
}

ReflectiveObject.prototype = Object.create(BaseObject.prototype);
ReflectiveObject.prototype.constructor = ReflectiveObject;

export { ReflectiveObject };

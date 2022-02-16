import * as THREE from "../thirdParty/build/three.module.js";
import {BaseObject} from "./BaseObject.js";
import {GlowingObject} from "./GlowingObject.js";

function EnergyBox(object, height, color, camera) {
    BaseObject.call(this);
    this.type = "EnergyBox";

    var ePath =  new THREE.LineCurve3(new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, height, 0));

    var defaultConfig = {
        steps: 1,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 1,
        extrudePath: ePath
    };

    object.updateMatrixWorld();
    var polygon = object.geometry;
    if (polygon.type === "BufferGeometry") {
        var position = polygon.attributes.position;
        var p = position.array;

        var numPts = position.count;
        var itemSize = position.itemSize;
        var pts = [];
        for (var i = 0; i < numPts; i++) {
            var vec = new THREE.Vector3(p[i * itemSize], p[i * itemSize + 1], p[i * itemSize + 2]);
            object.localToWorld(vec);
            pts.push(new THREE.Vector2(vec.z, vec.x));
        }

        var shape = new THREE.Shape(pts);
        var geometry = new THREE.ExtrudeGeometry(shape, defaultConfig);

        var glowObj = new GlowingObject(geometry, camera, {
            color: color,
            c: 1.0,
            p: 0.1,
            side: "FrontSide",
            blending: "NormalBlending"
        });
        glowObj.traverse((mesh) => {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.rotation.set(0, Math.PI, 0);
            this.add(mesh);
        });

    } else {
        console.log("only support 'BufferGeometry'! Current type is " + polygon.type);
    }

}

EnergyBox.prototype = Object.create(BaseObject.prototype);
EnergyBox.prototype.constructor = EnergyBox;
EnergyBox.prototype.isEnergyBox = true;

export {EnergyBox};

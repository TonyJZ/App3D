import * as THREE from "../thirdParty/build/three.module.js";
import {BaseObject} from "./BaseObject.js";

// config = {
//             color: 0xff0000,
//             c: 1.0,
//             p: 1.0,
//             side: "FrontSide"/"BackSide"/"DoubleSide",
//             blending: "NormalBlending"/"AdditiveBlending"
// }
function GlowingObject(geometry, camera, config) {
    BaseObject.call(this);
    this.type = "GlowingObject";

    this.externalCam = camera;

    var shadowMaterial = {
        uniforms:
        {
        	"c":   { type: "f", value: 1.0 },
        	"p":   { type: "f", value: 1.0 },
        	glowColor: { type: "c", value: new THREE.Color(0xffff00) },
        	viewVector: { type: "v3", value: this.externalCam.position }
        },

        vertexShader: [
            "uniform vec3 viewVector;",
            "uniform float c;",
            "uniform float p;",
            "varying float intensity;",
            "void main() {",
            "vec3 vNormal = normalize( normalMatrix * normal );",
            "vec3 vNormel = normalize( normalMatrix * viewVector );",
            "intensity = pow( c - dot(vNormal, vNormel), p );",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform vec3 glowColor;",
            "varying float intensity;",
            "void main() {",
            "vec3 glow = glowColor * intensity;",
            "gl_FragColor = vec4( glow, 1.0 );",
            "}"
        ].join("\n"),

        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    };

    // var singleGeometry = new THREE.Geometry();
    // object.traverse((child) => {
    //     if (child.isMesh) {
    //         child.updateMatrix(); // as needed
    //         singleGeometry.merge(child.geometry, child.matrix);
    //     }
    // });

    var glowMesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial(shadowMaterial));

    if (config !== undefined) {
        if (config.color !== undefined) {
            glowMesh.material.uniforms.glowColor.value.setHex(config.color);
        }
        if (config.c !== undefined) {
            glowMesh.material.uniforms[ "c" ].value = config.c;
        }
        if (config.p !== undefined) {
            glowMesh.material.uniforms[ "p" ].value = config.p;
        }
        if (config.side !== undefined) {
            if (config.side === "FrontSide") {
                glowMesh.material.side = THREE.FrontSide;
            }
            if (config.side === "BackSide") {
                glowMesh.material.side = THREE.BackSide;
            }
            if (config.side === "DoubleSide") {
                glowMesh.material.side = THREE.DoubleSide;
            }
        }
        if (config.blending !== undefined) {
            if (config.blending === "NormalBlending") {
                glowMesh.material.blending = THREE.NormalBlending;
            }
            if (config.blending === "AdditiveBlending") {
                glowMesh.material.blending = THREE.AdditiveBlending;
            }
        }
    }

    this.add(glowMesh);
}

GlowingObject.prototype = Object.create(BaseObject.prototype);
GlowingObject.prototype.constructor = GlowingObject;

export {GlowingObject};
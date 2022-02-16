import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";
import fog_fragment from "./particleShaders/fog_fragment.glsl";
import fog_vertex from "./particleShaders/fog_vertex.glsl";
import { fog_uniforms } from "./particleShaders/fog_uniforms.js";

function ParticleFogGPU(parameters) {
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.removelist = [];
    this.meshList = [];
    this.fragmentSize = 52;
    this.fragmentRandomXBase = 0.6;
    this.fragmentRandomXAmp = 0.8;
    this.fragmentRandomYBase = 0.6;
    this.fragmentRandomYAmp = 0.8;
}

ParticleFogGPU.prototype = Object.assign(Object.create(ParticleFogGPU.prototype), {
    constructor: ParticleFogGPU,
    isParticleFogGPU: true,
    fog: function(range, alpha) {
        let rangeXCount = range.x / 10;
        let rangeYCount = range.y / 10;
        let rangeZCount = range.z / 10;
    
        let randomX = this.fragmentRandomXBase + this.fragmentRandomXAmp * Math.random();
        let randomY = this.fragmentRandomYBase + this.fragmentRandomYAmp * Math.random();
        let geometry = new THREE.PlaneGeometry(this.fragmentSize * randomX, this.fragmentSize * randomY);
        fog_uniforms["alpha"].value = alpha;
        let materialPlane = new THREE.ShaderMaterial({
            color: 0x0000ff,
            uniforms: fog_uniforms,
            vertexShader: fog_vertex,
            fragmentShader: fog_fragment,
            transparent: true,
            side: THREE.DoubleSide
        });
    
        for (let i = 0; i < rangeXCount; i++) {
            for (let j = 0; j < rangeYCount; j++) {
                for (let k = 0; k < rangeZCount; k++) {
                    let mesh = new THREE.Mesh(geometry, materialPlane);
                    mesh.position.set(i * 10 - range.x / 2 - 4 + 8 * Math.random(), j * 10 + 7.5 + 2 * Math.random(), k * 10 - range.z / 2 - 4 + 8 * Math.random());
                    mesh.quaternion.copy(this.camera.quaternion);
                    this.scene.add(mesh);
                    this.meshList.push(mesh);
                    this.removelist.push(mesh);
                }
            }
        }
    
        let animation = new Animation("fog", updateTime, [fog_uniforms, this.meshList, this.camera]);
        this.scene.animations.addWithReplace(animation);
    
        function updateTime(uniforms, meshList, camera, delta) {
            uniforms["time"].value += delta;
            for (let i = 0; i < meshList.length; i++) {
                meshList[i].quaternion.copy(camera.quaternion);
            }
        }
    },
    clear: function() {
        for (let i = 0; i < this.removelist.length; i++) {
            this.scene.remove(this.removelist[i]);
        }
        this.removelist = [];
        this.range = null;
        this.type = null;
    },
});

export { ParticleFogGPU };
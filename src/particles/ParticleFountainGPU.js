import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";
import fountain_fragment from "./particleShaders/fountain_fragment.glsl";
import fountain_vertex from "./particleShaders/fountain_vertex.glsl";
import { fountain_uniforms } from "./particleShaders/fountain_uniforms.js";

function ParticleFountainGPU(parameters) {
    this.type = "ParticleFountainGPU";
    this.scene = parameters.scene;

    this.particleFountain = null;
    this.direction = [];
    this.velocity = [];
    this.vertice = [];
    this.numPt = parameters.pointNumber;
    this.sizePt = parameters.pointSize; // pixels
    this.startLoc = parameters.startLocation;
    this.stopHeight = parameters.stopHeight;
    this.dirtX = parameters.directionRangeX;
    this.dirtY = parameters.directionRangeY;
    this.dirtZ = parameters.directionRangeZ;
    this.startV = parameters.startVelocity;
    this.sprayAngle = parameters.sprayAngle * Math.PI / 180; // radian
    this.textureUrl = parameters.textureUrl;

    this.fountainGPU();
}

ParticleFountainGPU.prototype = Object.assign(Object.create(ParticleFountainGPU.prototype), {
    constructor: ParticleFountainGPU,
    isParticleFountainGPU: true,

    fountainGPU: function() {
        // geometry
        let geometry = new THREE.BufferGeometry();
        let centerAxis = new THREE.Vector3((this.dirtX[0] + this.dirtX[1]) / 2, (this.dirtY[0] + this.dirtY[1]) / 2, (this.dirtZ[0] + this.dirtZ[1]) / 2);
        for (let i = 0; i < this.numPt; i++) {
            let oneDirtX = Math.random() * (this.dirtX[1] - this.dirtX[0]) + this.dirtX[0];
            let oneDirtY = Math.random() * (this.dirtY[1] - this.dirtY[0]) + this.dirtY[0];
            let oneDirtZ = Math.random() * (this.dirtZ[1] - this.dirtZ[0]) + this.dirtZ[0];
            let oneStartV = Math.random() * (this.startV[1] - this.startV[0]) + this.startV[0];
            let oneDirt = new THREE.Vector3(oneDirtX, oneDirtY, oneDirtZ);
            oneDirt = this.moveDirt2Circle(centerAxis, oneDirt, this.sprayAngle);
            this.direction.push(oneDirt.getComponent(0), oneDirt.getComponent(1), oneDirt.getComponent(2));
            this.velocity.push(oneStartV);
            this.vertice.push(this.startLoc.x, this.startLoc.y, this.startLoc.z);
        }
        geometry.addAttribute("direction", new THREE.Float32BufferAttribute(this.direction, 3));
        geometry.addAttribute("velocity", new THREE.Float32BufferAttribute(this.velocity, 1));
        geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(this.vertice), 3));
        // material
        let texture = new THREE.TextureLoader().load(this.textureUrl);
        fountain_uniforms.texture.value = texture;
        fountain_uniforms.pointSize.value = this.sizePt;
        fountain_uniforms.stopHeight.value = this.stopHeight;
        let material = new THREE.ShaderMaterial({
            uniforms: fountain_uniforms,
            vertexShader: fountain_vertex,
            fragmentShader: fountain_fragment,
            transparent: true,
            alphaTest: 0.4,
            // depthTest: false,
            side: THREE.DoubleSide,
        });
        // particle
        this.particleFountain = new THREE.ParticleSystem(geometry, material);
        this.scene.add(this.particleFountain);
        // this.removelist.push(particleFountain);
        let animation = new Animation("FountainGPU", update, []);
        this.scene.animations.addWithReplace(animation);
        function update(delta) {
            fountain_uniforms["time"].value += delta;
        }
    },
    moveDirt2Circle: function(centerAxis, oneDirt, sprayAngle) {
        // let vecZero = new THREE.Vector3(startLoc.x, startLoc.y, startLoc.z);
        let newCA1 = new THREE.Vector3(centerAxis.getComponent(0), centerAxis.getComponent(1), centerAxis.getComponent(2));
        let newCA2 = new THREE.Vector3(centerAxis.getComponent(0), centerAxis.getComponent(1), centerAxis.getComponent(2));
        let rotAxis = newCA1.cross(oneDirt).normalize();
        // let signRotAxis = rotAxis.getComponent(0) * rotAxis.getComponent(2);
        let angle_i = newCA2.angleTo(oneDirt);

        if (angle_i > sprayAngle) {
            let rotAngle = angle_i - sprayAngle;
            oneDirt.applyAxisAngle(rotAxis, -rotAngle);
        }
        return oneDirt;
    },
    clear: function() {
        this.scene.remove(this.particleFountain);
    }

});

export { ParticleFountainGPU };
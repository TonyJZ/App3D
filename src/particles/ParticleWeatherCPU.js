import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";

function ParticleWeatherCPU(parameters) {
    this.scene = parameters.scene;
    this.particleAmount = parameters.particleAmount;
    this.wind = parameters.wind

    this.removelist = [];
}

ParticleWeatherCPU.prototype = Object.assign(Object.create(ParticleWeatherCPU.prototype), {
    constructor: ParticleWeatherCPU,
    isParticleWeatherCPU: true,

    rain: function(range) {
        let texture = new THREE.TextureLoader().load("./images/rain.png");
        let pointsMaterial = new THREE.PointsMaterial({
            size: 3,
            transparent: true,
            opacity: 1.0,
            map: texture,
            sizeAttenuation: false,
        });
        let geometry = new THREE.Geometry();
        let points = null;
        for (let i = 0; i < this.particleAmount; i++) {
            let vertice = new THREE.Vector3(
                Math.random() * range.x - range.x / 2,
                Math.random() * range.y,
                Math.random() * range.z - range.z / 2);
            vertice.velocityY = 0.5 + Math.random() / 10;
            vertice.velocityX = this.wind;
            geometry.vertices.push(vertice);
        }
        points = new THREE.Points(geometry, pointsMaterial);
        this.scene.add(points);
        this.removelist.push(points);
        let animation = new Animation("RainCPU", update, []);
        this.scene.animations.addWithReplace(animation);
        function update() {
            let vertices = points.geometry.vertices;
            vertices.forEach(function(v) {
                v.y = v.y - (v.velocityY);
                v.x = v.x - (v.velocityX);
                if (v.y <= 0) {
                    v.y = range.y;
                }
                if (v.x <= -range.x / 2) {
                    v.x = range.x / 2;
                }
            });
            points.geometry.verticesNeedUpdate = true;
        }
    },

    snow: function(range) {
        let texture = new THREE.TextureLoader().load("./images/snowflake1.png");
        let pointsMaterial = new THREE.PointsMaterial({
            size: 3,
            transparent: true,
            depthTest: false,
            // opacity: 1.0,
            map: texture,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        pointsMaterial.color.setHSL(1.0, 0.2, 0.5);
        let geometry = new THREE.Geometry();
        let points = null;
        for (let i = 0; i < this.particleAmount; i++) {
            let vertice = new THREE.Vector3(
                Math.random() * range.x - range.x / 2,
                Math.random() * range.y,
                Math.random() * range.z - range.z / 2);
            vertice.velocityY = 0.1 + Math.random() / 10;
            vertice.velocityX = this.wind;
            geometry.vertices.push(vertice);
        }
        points = new THREE.Points(geometry, pointsMaterial);
        this.scene.add(points);
        this.removelist.push(points);
        let animation = new Animation("SnowCPU", update, []);
        this.scene.animations.addWithReplace(animation);
        function update() {
            let vertices = points.geometry.vertices;
            vertices.forEach(function(v) {
                v.y = v.y - (v.velocityY);
                v.x = v.x - (v.velocityX);
                if (v.y <= 0) {
                    v.y = range.y;
                }
                if (v.x <= -range.x / 2) {
                    v.x = range.x / 2;
                }
            });
            points.geometry.verticesNeedUpdate = true;
        }
    },
    clear: function() {
        var scope = this;
        clearInterval(scope.timer);
        let length = scope.removelist.length;
        for (let i = 0; i < length; i++) {
            scope.scene.remove(scope.removelist.pop());
        }
    }
});

export { ParticleWeatherCPU };
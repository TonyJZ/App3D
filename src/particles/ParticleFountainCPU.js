import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";

function ParticleFountainCPU(parameters) {
    this.removelist = [];
    this.scene = parameters.scene;
    this.count = 0;
    this.state = "adding";

    let imgTexture = parameters.imgTexture;
    let canvasVideo = parameters.canvasVideo;
    let videoBool = parameters.videoBool;
    let scene = parameters.scene;
    let size = parameters.size;
    let particles = parameters.particles;
    let totalParticles = parameters.totalParticles;
    let particleInterval = parameters.particleInterval;
    let position = parameters.position;
    let positionVariance = parameters.positionVariance;
    let initialSpeed = parameters.initialSpeed;
    let variance = parameters.variance;
    let varianceLimit = parameters.varianceLimit;
    let lowerLimit = parameters.lowerLimit;

    let texture;
    if (videoBool) {
        texture = new THREE.VideoTexture(canvasVideo);
    } else {
        texture = new THREE.TextureLoader().load(imgTexture);
    }
    let pointsMaterial = new THREE.PointsMaterial({
        size: size,
        alphaTest: 0.1,
        transparent: true,
        // opacity: 0.5,
        map: texture,
        sizeAttenuation: true,
    });
    var counter = 0;
    var scope = this;
    var timer = setInterval(addPoints, particleInterval);
    this.timer = timer;
    function addPoints() {
        let geometry = new THREE.Geometry();
        for (let i = 0; i < particles; i++) {
            let vertice = new THREE.Vector3(
                position.x + Math.random() * positionVariance.x - 0.5 * positionVariance.x,
                position.y + Math.random() * positionVariance.y - 0.5 * positionVariance.y,
                position.z + Math.random() * positionVariance.z - 0.5 * positionVariance.z
            );

            let varX = variance.x * Math.random() - variance.x / 2;
            let varZ = variance.z * Math.random() - variance.z / 2;

            if (Math.pow(varX, 2) + Math.pow(varZ, 2) >=  Math.pow(varianceLimit, 2)) {
                if (Math.random() > 0.5) {
                    if (Math.random() > 0.5) {
                        varX = Math.random() * Math.sqrt(Math.pow(varianceLimit, 2) - Math.pow(varZ, 2));
                    } else {
                        varX = -Math.random() * Math.sqrt(Math.pow(varianceLimit, 2) - Math.pow(varZ, 2));
                    }
                } else {
                    if (Math.random() > 0.5) {
                        varZ = Math.random() * Math.sqrt(Math.pow(varianceLimit, 2) - Math.pow(varX, 2));
                    } else {
                        varZ = -Math.random() * Math.sqrt(Math.pow(varianceLimit, 2) - Math.pow(varX, 2));
                    }
                }
            }

            vertice.velocityX = initialSpeed.x + varX;
            vertice.accY = -9.81;
            vertice.velocityY = initialSpeed.y + variance.y * Math.random() - variance.y / 2;
            vertice.velocityZ = initialSpeed.z + varZ;

            geometry.vertices.push(vertice);
        }
        let points = new THREE.Points(geometry, pointsMaterial);
        scene.add(points);
        scope.removelist.push(points);
        counter += 50;
        if (counter >= totalParticles) {
            clearInterval(timer);
            scope.state = "finish";
        }
        let animation = new Animation(Math.random() + "FountainCPU", update, [0.05]);
        scene.animations.addWithReplace(animation);

        function update(t) {
            let vertices = points.geometry.vertices;
            vertices.forEach(function(v) {
                v.x = v.x + v.velocityX * t;
                v.velocityY += v.accY * t;
                v.y = v.y + v.velocityY * t;
                v.z = v.z + v.velocityZ * t;

                if (v.y <= lowerLimit) {
                    v.x = position.x + Math.random() * positionVariance.x - 0.5 * positionVariance.x;
                    v.y = position.y + Math.random() * positionVariance.y - 0.5 * positionVariance.y;
                    v.z = position.z + Math.random() * positionVariance.z - 0.5 * positionVariance.z;

                    v.velocityY = initialSpeed.y + variance.y * Math.random() - 0.5 * variance.y;
                }
            });
            points.geometry.verticesNeedUpdate = true;
        }
    }

}

ParticleFountainCPU.prototype = Object.assign(Object.create(ParticleFountainCPU.prototype), {
    constructor: ParticleFountainCPU,
    isParticleFountainCPU: true,

    clear: function() {
        var scope = this;
        clearInterval(scope.timer);
        let length = scope.removelist.length;
        for (let i = 0; i < length; i++) {
            scope.scene.remove(scope.removelist.pop());
        }
    },
});

export { ParticleFountainCPU };
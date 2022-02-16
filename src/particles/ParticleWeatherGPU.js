import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";
import snow_fragment from "./particleShaders/snow_fragment.glsl";
import snow_vertex from "./particleShaders/snow_vertex.glsl";
import { snow_uniforms } from "./particleShaders/snow_uniforms.js";
import rain_fragment from "./particleShaders/rain_fragment.glsl";
import rain_vertex from "./particleShaders/rain_vertex.glsl";
import { rain_uniforms } from "./particleShaders/rain_uniforms.js";

function ParticleWeatherGPU(parameters) {
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.removelist = [];
    this.particles = 100;
    this.windSN = 0.0;
    this.windEW = 0.0;
    this.windLevel = 0.0;
}

ParticleWeatherGPU.prototype = Object.assign(Object.create(ParticleWeatherGPU.prototype), {
    constructor: ParticleWeatherGPU,
    isParticleWeatherGPU: true,
    rain: function(range) {
        if(this.type === null) {
            this.range = range;
            this.type = "rain";
            this.generate100rain(range);
            let animation = new Animation("RainGPU", update, []);
            this.scene.animations.addWithReplace(animation);
            function update(delta) {
                rain_uniforms["time"].value += delta;
            }
        }
    },
    snow: function(range) {
        if(this.type === null) {
            this.range = range;
            this.type = "snow";
            this.generate100snow(range);
            let animation = new Animation("SnowGPU", update, []);
            this.scene.animations.addWithReplace(animation);
            function update(delta) {
                snow_uniforms["time"].value += delta;
            }
        }
    },
    generate100rain: function (range) {
        let geometry = this.pointsGenerator(range);
        let texture = new THREE.TextureLoader().load("./images/rain.png");
        rain_uniforms.texture.value = texture;
        rain_uniforms.range.value = range;
        rain_uniforms.wind.value = this.windLevel;
        rain_uniforms.windDirection.value = {x: this.windSN, y: 0.0, z: this.windEW};

        let material = new THREE.ShaderMaterial({
            uniforms: rain_uniforms,
            vertexShader: rain_vertex,
            fragmentShader: rain_fragment,
            transparent: true,
            sizeAttenuation: true,
        });
        let particleRain = new THREE.ParticleSystem(geometry, material);
        this.scene.add(particleRain);
        this.removelist.push(particleRain);
    },
    generate100snow: function (range) {
        let geometry = this.pointsGenerator(range);
        let texture = new THREE.TextureLoader().load("./images/snow.png");
        snow_uniforms.texture.value = texture;
        snow_uniforms.range.value = range;
        snow_uniforms.wind.value = this.windLevel;
        snow_uniforms.windDirection.value = {x: this.windSN, y: 0.0, z: this.windEW};

        let material = new THREE.ShaderMaterial({
            uniforms: snow_uniforms,
            vertexShader: snow_vertex,
            fragmentShader: snow_fragment,
            transparent: true,
            sizeAttenuation: false,
        });
        let particleSnow = new THREE.ParticleSystem(geometry, material);
        this.scene.add(particleSnow);
        this.removelist.push(particleSnow);
    },
    pointsGenerator: function (range) {
        let geometry= new THREE.Geometry();
        for (let i = 0; i < 100; i++ ) {
            let vertice = new THREE.Vector3(
                Math.random() * range.x - range.x/2,
                Math.random() * range.y,
                Math.random() * range.z - range.z/2,
            )
            geometry.vertices.push(vertice);
        }
        return geometry;
    },
    clear: function() {
        for (let i = 0; i < this.removelist.length; i++) {
            this.scene.remove(this.removelist[i]);
        }
        this.removelist = [];
        this.particles = 100;
        this.windSN = 0.0;
        this.windEW = 0.0;
        this.windLevel = 0.0;
        this.range = null;
        this.type = null;
    },
    updateParticles: function(particles) {
        if(particles > this.particles) {
            this.addPoints(particles - this.particles);
            this.particles = particles;
        }
        if(particles < this.particles) {
            this.removePoints(this.particles - particles);
            this.particles = particles;
        }
    },
    updateWindSN: function(windSN) {
        this.windSN = windSN;
        snow_uniforms.windDirection.value = {x: this.windSN, y: 0.0, z: this.windEW};
        rain_uniforms.windDirection.value = {x: this.windSN, y: 0.0, z: this.windEW};
    },
    updateWindEW: function(windEW) {
        this.windEW = windEW;
        snow_uniforms.windDirection.value = {x: this.windSN, y: 0.0, z: this.windEW};
        rain_uniforms.windDirection.value = {x: this.windSN, y: 0.0, z: this.windEW};
    },
    updateWindLevel: function(windLevel) {
        this.windLevel = windLevel;
        snow_uniforms.wind.value = this.windLevel;
        rain_uniforms.wind.value = this.windLevel;
    },
    addPoints: function (amount) {
        let group = amount / 100;
        if(this.type === "rain") {
            for (let i = 0; i < group; i++ ) {
                this.generate100rain(this.range);
            }
        }
        if(this.type === "snow") {
            for (let i = 0; i < group; i++ ) {
                this.generate100snow(this.range);
            }
        }
    },
    removePoints: function (amount) {
        let group = amount / 100;
        for (let i = 0; i < group; i++ ) {
            this.scene.remove(this.removelist.pop());
        }
    }
});

export { ParticleWeatherGPU };
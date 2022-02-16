import * as THREE from "../thirdParty/build/three.module.js";
import * as EXTRA from "../thirdParty/build/extra.module.js";

function ParticleEffect(scene, particleNoisePath, spriteTexturePath) {
    // Properties:
    this.parentScene = scene;
    this.parentObject = null;
    this.particleSystem;
    this.particleNoisePath = particleNoisePath;
    this.spriteTexturePath = spriteTexturePath;
    this.options;
    this.spawnerOptions;
    this.clock = new THREE.Clock();
    this.tick = 0;

    this.createNewParticleEffect();
}

ParticleEffect.prototype = Object.assign(Object.create(ParticleEffect.prototype), {
    constructor: ParticleEffect,

    createNewParticleEffect: function() {
        console.log("This ParticleEffect class is discarded since V0.94.");

	    let textureLoader = new THREE.TextureLoader();

        // The GPU Particle system extends THREE.Object3D, and so you can use it as you would any
        // other scene graph component. Particle positions will be relative to the position of the
        // particle system, but you will probably only need one system for your whole scene.
	    this.particleSystem = new EXTRA.GPUParticleSystem({
		    maxParticles:       100,
            particleNoiseTex:   textureLoader.load(this.particleNoisePath),
            particleSpriteTex:  textureLoader.load(this.spriteTexturePath)
        });

        this.particleSystem.name = "particle";

        // options passed during each spawned
	    this.options = {
		    position:           new THREE.Vector3(0, 0, 0),
		    positionRandomness: 0,
		    velocity:           new THREE.Vector3(),
		    velocityRandomness: 0,
		    color:              0xaa88ff,
		    colorRandomness:    0,
		    turbulence:         0,
		    lifetime:           3,
		    size:               0, // Placeholder. The value is set dynamically below.
		    sizeRandomness:     0
	    };
        this.startingSize = 40;
	    this.spawnerOptions = {
		    spawnRate:          1,
		    horizontalSpeed:    1.5,
		    verticalSpeed:      1.33,
		    timeScale:          2
	    };
    },
    animateParticles: function() {
        var delta = this.clock.getDelta() * this.spawnerOptions.timeScale;
	    this.tick += delta;
	    if (this.tick < 0) {
            this.tick = 0;
        }

        let controls = this.parentScene.appParent.orbitControl;
        let camDist = controls.object.position.distanceTo(this.options.position);
        let scalingFactor = 50; // Arbitrary, based on what looks good
        this.options.size = (this.startingSize / (camDist / scalingFactor));

        if (this.parentObject) {
            // this.parentObject.updateMatrixWorld();
            this.options.position.copy(this.parentObject.getCenter());
        }
        this.options.position.setY(this.options.position.y / 2);
        for (var x = 0; x < this.spawnerOptions.spawnRate * delta; x++) {
            this.particleSystem.spawnParticle(this.options);
        }

        this.particleSystem.update(this.tick);

        return true;
    },
    copy: function(source) {

        // Properties:
        this.parentObject = source.parentObject;
        this.particleSystem = source.particleSystem;
        this.options = source.options;
        this.spawnerOptions = source.spawnerOptions;
        this.tick = source.tick;

        return this;
    },
    clone: function() {
        return new this.constructor(this.parentScene, this.particleNoisePath, this.spriteTexturePath).copy(this);
    }
});

export {ParticleEffect};

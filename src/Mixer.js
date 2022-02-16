import * as THREE from "../thirdParty/build/three.module.js";

function Mixer(name, root, isPlaying = true) {
    THREE.AnimationMixer.call(this, root);
    this.root  = root;
    this.playing = isPlaying;
    this.animationAction = null;
    this.name = name;
}

Mixer.prototype = Object.assign(Object.create(THREE.AnimationMixer.prototype), {

    constructor: Mixer,
    play: function() {
        this.playing = true;
    },
    pause: function() {
        this.playing = false;
    },
    reset: function() {
        this.animationAction.stop().reset();
    },
    update: function(delta) {
        if (this.playing) {
            THREE.AnimationMixer.prototype.update.call(this, delta);
        }
    },
    setClipAction: function(clipAction) {
        this.animationAction = clipAction;
    },
    playOnce: function(timeScale = null) {
        this.animationAction.setLoop(THREE.LoopRepeat);
        this.animationAction.repetitions = 1;
        this.playing = true;
        this.timeScale = timeScale || this.timeScale;
        this.animationAction.clampWhenFinished = true;
        this.animationAction.play().reset();
    },
    clone: function() {
        return new this.constructor(this.root, this.playing);
    }
});

export {Mixer};

function AnimationManager() {
    this.animations = [];

}
Object.assign(AnimationManager.prototype, {
    add: function(animation) {
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].name === animation.name) {
                return false;
            }
        }

        this.animations.push(animation);
        return true;
    },
    addWithReplace: function(animation) {
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].name === animation.name) {
                this.animations[i].sendSignal(15);
                // TO DO : implement another way of immidiate replacement
                // this.updateAnimation(i, 0.0);
                break;
            }
        }
        this.animations.push(animation);
        return true;

    },
    updateAnimation: function(animationInd, delta) {
        let toContinue = this.animations[animationInd].update(delta);
        if (toContinue === false) {
            this.animations.splice(animationInd, 1);
        }
    },
    updateAnimations: function(delta) {
        if (this.animations.length !== 0) {
            for (let i = this.animations.length - 1; i >= 0; i--) {
                this.updateAnimation(i, delta);
            }
        }
    },
    get: function(name) {
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].name === name) {
                return this.animations[i];
            }
        }
        return null;
    },
    removeAll: function() {
        for (let i = 0;i < this.animations.length;i++) {
            this.animations[i].sendSignal(15);
        }

    },
    broadcastSignal: function(signal) {
        for (let i = 0;i < this.animations.length;i++) {
            this.animations[i].sendSignal(signal);
        }

    },
    removeAllImmidiately: function() {
        if (this.animations.length !== 0) {
            for (let i = this.animations.length - 1; i >= 0; i--) {
                this.animations[i].sendSignal(9);
                this.updateAnimation(i, 0.0);
            }
        }
    },
    remove: function(name) {
        if (this.animations.length !== 0) {
            for (let i = this.animations.length - 1; i >= 0; i--) {
                if (this.animations[i].name === name) {
                    this.animations[i].sendSignal(9);
                    this.updateAnimation(i, 0.0);
                }
            }
        }
    }

});


function Animation(name, updateFunction, parameters) {
    this.name = name;
    this.updateFunction = updateFunction;
    this.parameters = parameters.concat(0);
    this.signal = 1;
    this.onExit = null;
}

Object.assign(Animation.prototype, {
    update: function(delta) {
        this.parameters[this.parameters.length - 1]  = delta;
        let retValue = this.updateFunction.apply(this, this.parameters);
        if (this.signal === 15 || this.signal === 9) {
            if (this.onExit) {
                this.onExit();
            }
            return false;
        } else {
            if (retValue === false && this.onExit) {
                this.onExit();
            }
            return retValue;
        }

    },
    sendSignal: function(signal) {
        this.signal = signal;
    }
});
export {Animation, AnimationManager};

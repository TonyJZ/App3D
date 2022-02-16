import {FireMesh} from "./FireShader.js";
import {ObjectLabel} from "./ObjectLabel.js";
import {ObjectIcon} from "./ObjectIcon.js";
import * as THREE from "../thirdParty/build/three.module.js";
import * as Const from "./Constants.js";
import {EquirectangularToCubemap}  from "../thirdParty/build/extra.module.js";
import {Animation, AnimationManager} from "./Animation.js";
import {Loader} from "./Loader.js";
import {Events} from "./Constants.js";
import {LabelPosition} from "./Constants.js";


function BaseObject(objConfig = null, cb = null) {
    THREE.Object3D.call(this);
    this.info = {};

    if (objConfig !== null) {
        this.name = objConfig.name;
        this.info = Object.assign({}, objConfig); // this might cause circular reference and memory issue
        this.info.type = objConfig.type;
        this.info.subType = objConfig.subType;

        if (cb !== null) {
            let callbacks = {};
            callbacks[Events.FILE_LOADED] = cb;
            Loader.loadComponent(this, objConfig, null, null, callbacks, null);
        }
    }

    this.type = "BaseObject"; // TO DO: check if anything is using it and remove
    this.eventCallbacks = {}; // {"leftClick": null, "rightClick": null, "doubleClick": null};
    this.opacity = 1;
    this.preOpacity = this.opacity;
    this.objectLabels = [];
    this.objectIcon = null;
    this.trail = {};
    this.objectLabelIsVisible = false;
    this.objectIconIsVisible = false;
    this.boundingBoxHelper = null;
    // animations
    this.animations = new AnimationManager();
    this.mixers = [];
    this.fires = [];

    this.textureEnvMap = null;

    this.particleEffect = null;
}

BaseObject.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {

    constructor: BaseObject,
    isBaseObject: true,
    onEvent: function(eventName, callBack) {
        this.eventCallbacks[eventName] = callBack;
    },
    setOverlayColour: function(colour) {
        this.traverse((child) => {
            if (child.isMesh) {
                // if originalMaterial does not exist save originalMaterial
                if (child.originalMaterial === null || child.originalMaterial === undefined) {
                    child.originalMaterial = child.material;
                }
                // change the colour
                if (child.material instanceof Array) {
                    child.material = [];
                    for (let i = 0; i < child.originalMaterial.length; i++) {
                        child.material[i] = child.originalMaterial[i].clone();
                        child.material[i].color.set(colour);
                    }
                } else {
                    child.material = child.originalMaterial.clone();
                    child.material.color.set(colour);
                }
            }
        });
    },
    removeOverlayColour: function() {
        this.traverse((child) => {
            if (child.isMesh) {
                if (child.originalMaterial !== null && child.originalMaterial !== undefined) {
                    if (child.originalMaterial instanceof Array) {
                        for (let i = 0; i < child.originalMaterial.length; i++) {
                            child.material[i] = child.originalMaterial[i].clone();
                        }
                    } else {
                        child.material = child.originalMaterial.clone();
                    }
                }
            }
        });
    },
    setOpacity: function(opacity, exceptions = null) {
        let stack = [this];
        while (stack.length !== 0) {
            let child = stack.pop();
            if (exceptions !== null) {
                let sIdx = exceptions.indexOf(child);
                if (sIdx !== -1) {
                    continue;
                }
            }
            if (child.isMesh) {
                if (child.material instanceof Array) {
                    // copy and store original material when called for the first time
                    if (child.originalMaterial === null || child.originalMaterial === undefined) {
                        child.originalMaterial = [];
                        for (let i = 0; i < child.material.length; i++) {
                            child.originalMaterial[i] = child.material[i].clone();
                            child.material[i] = child.material[i].clone();
                        }
                    }
                    // return to normal when opacity >=0;
                    if (opacity >= 1) {
                        for (let i = 0; i < child.material.length; i++) {
                            child.material[i].transparent = child.originalMaterial[i].transparent;
                            child.material[i].opacity = child.originalMaterial[i].opacity;
                            child.castShadow = true;
                        }
                    } else if (child.originalMaterial[0].opacity > opacity) {
                        // set the material opacity as long as it is < original opacity
                        for (let i = 0; i < child.material.length; i++) {
                            if (child.originalMaterial[i].opacity >= opacity) {
                                child.material[i].transparent = true;
                                child.material[i].opacity = opacity;
                                child.castShadow = false;
                            }
                        }
                    }
                } else {
                    // copy and store original material when called for the first time
                    if (child.originalMaterial === null || child.originalMaterial === undefined) {
                        child.originalMaterial = child.material.clone();
                        child.material = child.material.clone();
                    }
                    // return to normal when opacity >=0;
                    if (opacity >= 1) {
                        child.material.opacity = child.originalMaterial.opacity;
                        child.material.transparent = child.originalMaterial.transparent;
                        child.castShadow = true;
                    } else if (child.originalMaterial.opacity > opacity) {
                        // set the material opacity as long as it is < original opacity
                        child.material.transparent = true;
                        child.material.opacity = opacity;
                        child.castShadow = false;
                    }
                }
            }
            child.children.forEach((grandChildren) => {
                stack.push(grandChildren);
            });
        }
        this.preOpacity = this.opacity;
        this.opacity = opacity;
    },
    setVisibility: function(bVisible) {
        this.visible = bVisible;
        this.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = bVisible;
            }
        });
        if (this.particleEffect !== null) {
            this.particleEffect.particleSystem.visible = bVisible;
        }
    },
    getVisibility: function() {
        return this.visible;
    },

    getOptimalCameraParams: function(camera, angleToGround, ratio, padding = null) {

        let xLeft = 0;
        let xRight = 0;
        let yPercentage = 1;
        let yOffset = 0;
        if (padding !== null) {
            xLeft = padding.xLeft;
            xRight = padding.xRight;
            yPercentage = padding.yPercentage;
            yOffset = padding.yOffset;
        }
        let boundBox = this.getBoundingBox();
        let boundBoxCenter = new THREE.Vector3();
        boundBoxCenter = this.getCenter();
        let initialRadius = Math.sqrt(Math.pow(0.5 * (boundBox.max.x - boundBox.min.x), 2) + Math.pow(0.5 * (boundBox.max.z - boundBox.min.z), 2)) / ratio;
        let expandedBoundBoxonXHalf = initialRadius;
        let expandedBoundBoxonYHalf = boundBox.max.y - boundBox.min.y;
        let expandedBoundBoxonZHalf = initialRadius / (1 - xLeft - xRight);
        let expandedBoundBoxCenterX = boundBoxCenter.x;
        let expandedBoundBoxCenterZ = boundBoxCenter.z + (initialRadius) * (xLeft - xRight) / (1 - xLeft - xRight);
        let expandedBoundBoxCenterY = boundBoxCenter.y;
        let finalLookAtPosition = new THREE.Vector3(expandedBoundBoxCenterX, expandedBoundBoxCenterY, expandedBoundBoxCenterZ);
        let cameraDirection = new THREE.Vector3(1, Math.tan(angleToGround), 0);
        cameraDirection.normalize();
        let initialDistanceToObjectOnX = 400;
        let initialCameraLocationX = finalLookAtPosition.x + initialDistanceToObjectOnX;
        let initialCameraLocationZ = finalLookAtPosition.z;
        let initialCameraLocationY = finalLookAtPosition.y + initialDistanceToObjectOnX * Math.tan(angleToGround);
        let initialCameraLocation = new THREE.Vector3(initialCameraLocationX, initialCameraLocationY, initialCameraLocationZ);
        let localCamera = camera.clone();
        localCamera.setPosition(initialCameraLocation.x, initialCameraLocation.y, initialCameraLocation.z);
        localCamera.setLookAtPoint(finalLookAtPosition);
        localCamera.updateMatrix();
        localCamera.updateMatrixWorld();
        let viewParameter = this.getViewParameter(localCamera);
        let criticalVerticalAngle = Math.atan(Math.tan(0.5 * yPercentage * localCamera.fov * Math.PI  / 180));
        let criticalHorizontalAngle = Math.atan((viewParameter[0] / localCamera.far));
        let finalDistanceX = expandedBoundBoxonZHalf / Math.sin(criticalHorizontalAngle);
        let expandedBoundBoxThickness = expandedBoundBoxonXHalf;
        let expandedboundBoxHeight = 0.5 * expandedBoundBoxonYHalf;
        let pointDistancetoAxis = expandedboundBoxHeight * Math.cos(angleToGround) + expandedBoundBoxThickness * Math.sin(angleToGround);
        let tanOfCriticalVerticalAngle = Math.tan(criticalVerticalAngle);
        let finalDistancePositiveY = (pointDistancetoAxis / tanOfCriticalVerticalAngle) + Math.sqrt(Math.pow(expandedBoundBoxThickness, 2) + Math.pow(expandedboundBoxHeight, 2) - Math.pow(pointDistancetoAxis, 2));
        let finalDistanceNegativeY = (pointDistancetoAxis / tanOfCriticalVerticalAngle) - Math.sqrt(Math.pow(expandedBoundBoxThickness, 2) + Math.pow(expandedboundBoxHeight, 2) - Math.pow(pointDistancetoAxis, 2));
        let criticalDistance = Math.max(finalDistanceX, finalDistancePositiveY, finalDistanceNegativeY);
        let finalLocalCamPosition = new THREE.Vector3(finalLookAtPosition.x, finalLookAtPosition.y, finalLookAtPosition.z);
        finalLocalCamPosition.add(cameraDirection.setLength(criticalDistance));
        finalLocalCamPosition.x = finalLocalCamPosition.x - yOffset;
        finalLookAtPosition.x = finalLookAtPosition.x - yOffset;
        return {"position": finalLocalCamPosition, "lookAt": finalLookAtPosition};
    },
    getViewParameter: function(camera) {
        let viewParameter = new Array();
        let far = camera.far;
        let fov = camera.fov;
        let aspect = camera.aspect;
        let viewHeight = far * Math.tan(0.5 * fov * Math.PI / 180);
        let viewWidth = viewHeight * aspect;
        viewParameter[0] = viewWidth;
        viewParameter[1] = viewHeight;

        return viewParameter;
    },
    isInCameraFrustum: function(camera) {

        let checkPoints = this.getCornerPoints();
        camera.updateMatrix(); // make sure camera's local matrix is updated
        camera.updateMatrixWorld(); // make sure camera's world matrix is updated
        camera.matrixWorldInverse.getInverse(camera.matrixWorld);
        let frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        for (let i = 0; i < checkPoints.length; i++) {
            if (!frustum.containsPoint(checkPoints[i])) {
                return false;
            }
        }
        return true;

    },
    getCornerPoints: function() {
        let boundBox = this.getBoundingBox();
        let cpArray = new Array();
        cpArray.push(new THREE.Vector3(boundBox.min.x, boundBox.min.y, boundBox.min.z));
        cpArray.push(new THREE.Vector3(boundBox.min.x, boundBox.min.y, boundBox.max.z));
        cpArray.push(new THREE.Vector3(boundBox.min.x, boundBox.max.y, boundBox.min.z));
        cpArray.push(new THREE.Vector3(boundBox.min.x, boundBox.max.y, boundBox.max.z));
        cpArray.push(new THREE.Vector3(boundBox.max.x, boundBox.min.y, boundBox.min.z));
        cpArray.push(new THREE.Vector3(boundBox.max.x, boundBox.min.y, boundBox.max.z));
        cpArray.push(new THREE.Vector3(boundBox.max.x, boundBox.max.y, boundBox.min.z));
        cpArray.push(new THREE.Vector3(boundBox.max.x, boundBox.max.y, boundBox.max.z));
        return cpArray;
    },
    getChildrenObjects: function() {
        let baseObjects = [];
        this.traverse((child) => {
            if (child.isBaseObject && child  !== this) {
                baseObjects.push(child);
            }
        });
        return baseObjects;
    },
    getParentObject: function() {
        var parent = this.parent;
        while (!parent.isBaseObject && parent !== null && !parent.isBaseScene) {
            parent = parent.parent;
        }
        return parent;
    },
    scaleTo: function(scale, speed, callback) {
        let curScale = this.scale;
        // path Curve
        let scaleCurve = new THREE.LineCurve3(curScale, scale);
        let scalePoints = scaleCurve.getPoints((scaleCurve.getLength() / speed) * Const.MAX_EXPECTED_FPS);

        // This happens when start and end point are same
        if (isNaN(scalePoints[0].x) || isNaN(scalePoints[0].y) ||  isNaN(scalePoints[0].z)) {
            if (callback !== null) {
                callback();
            }
            return;
        }
        // register animation
        let animation = new Animation("scaleTo", this.animateScaleTo, [this, scalePoints, speed, callback]);
        animation.animateCurveI = 0;
        this.animations.addWithReplace(animation);


        // this.animations.push(this.animateScaleTo.bind(this, scale, speed, callback));
    },
    cancelAllAnimations: function() {
        this.animations.removeAll();
    },
    animateScaleTo: function(object, scalePoints, speed, callback = null, delta) {
        let scale = scalePoints[Math.round(this.animateCurveI)].clone();

        object.scale.copy(scale);

        if (this.animateCurveI >= scalePoints.length - 1) {
            this.animateCurveI = null;
            if (callback !== null) {
                callback();
            }
            return false;
        }
        this.animateCurveI += speed * delta;
        // if animateCurveItr jumps beyond last point, pull it back tox the last point
        // so the animation always ends at pathPoint[pathPoint.length-1] position.
        if (this.animateCurveI > scalePoints.length - 1) {
            this.animateCurveI = scalePoints.length - 1 ;
        }
        return true;
    },
    getCenter: function(target) {
        if (target === undefined) {
            target = new THREE.Vector3();
        }
        var bbox = new THREE.Box3().setFromObject(this);
        return bbox.getCenter(target);
    },
    getBoundingBox: function() {
        let bbox = new THREE.Box3().setFromObject(this);
        return bbox;
    },
    getPositionWorld: function(target) {
        if (target === undefined) {
            target = new THREE.Vector3();
        }
        if (!this.info.hasAnimationPath) {
            this.getWorldPosition(target);
        } else {
            var bbox = new THREE.Box3().setFromObject(this);
            bbox.getCenter(target);
            target.y = bbox.min.y;
        }
        return target;
    },
    getLabelAnchor: function(target, anchorType = LabelPosition.LABEL_TOP) {
        if (target === undefined) {
            target = new THREE.Vector3();
        }
        var bbox = new THREE.Box3().setFromObject(this);
        bbox.getCenter(target);
        if (anchorType === LabelPosition.LABEL_TOP) {
            target.y = bbox.max.y;
        } else if (anchorType === LabelPosition.LABEL_BOTTOM) {
            target.y = bbox.min.y;
        }
        return target;
    },
    moveTo: function(finalPos, speed, callback = null) {
        let vec = new THREE.Vector3();
        let curPosition = this.getWorldPosition(vec);
        // path Curve
        let pathCurve = new THREE.LineCurve3(curPosition, finalPos);
        let pathPoints = pathCurve.getPoints((pathCurve.getLength() / speed) * Const.MAX_EXPECTED_FPS);

        // This happens when start and end point are same
        if (isNaN(pathPoints[0].x) || isNaN(pathPoints[0].y) ||  isNaN(pathPoints[0].z)) {
            if (callback !== null) {
                callback();
            }
            return;
        }
        // get LookAt curve
        let curDir = new THREE.Vector3();
        this.getWorldDirection(curDir);
        let lookAtPoints = [];
        let animation = new Animation("moveTo", this.animateCurve, [this, pathPoints, lookAtPoints, speed, callback]);
        animation.animateCurveI = 0;
        this.animations.addWithReplace(animation);

    },

    animateCurve: function(object, pathPoints, lookAtPoints, speed, callback, delta) {
        let localPosition = pathPoints[Math.round(this.animateCurveI)].clone();
        object.parent.worldToLocal(localPosition);

        object.position.copy(localPosition);

        if (this.animateCurveI >= pathPoints.length - 1) {
            this.animateCurveI = null;
            if (callback !== null) {
                callback();
            }
            return false;
        }
        this.animateCurveI += speed * delta;
        // if animateCurveItr jumps beyond last point, pull it back tox the last point
        // so the animation always ends at pathPoint[pathPoint.length-1] position.
        if (this.animateCurveI > pathPoints.length - 1) {
            this.animateCurveI = pathPoints.length - 1 ;
        }
        return true;
    },
    distanceBetweenPoints: function(pos1, pos2) {
        return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2) + Math.pow((pos1.z - pos2.z), 2));
    },
    playAllAnimations: function() {
        this.mixers.forEach((anime) => {
            anime.playing = true;
        });
    },
    pauseAllAnimations: function() {
        this.mixers.forEach((anime) => {
            anime.playing = false;
        });
    },
    resetAllAnimations: function() {
        this.mixers.forEach((anime) => {
            anime.reset();
        });
    },
    playAnimation: function(name) {
        this.mixers.forEach((anime) => {
            if (anime.name === name) {
                anime.playing = true;
            }
        });
    },
    pauseAnimation: function(name) {
        this.mixers.forEach((anime) => {
            if (anime.name === name) {
                anime.playing = false;
            }
        });
    },
    playAnimationOnce: function(name, timeScale = null) {
        this.mixers.forEach((anime) => {
            if (anime.name === name) {
                anime.playOnce(timeScale);
            }
        });
    },
    getAllAnimationMixerNames: function() {
        let names = [];
        this.mixers.forEach((anime) => {
            names.push(anime.name);
        });
        return names;
    },
    updateAnimations: function(delta, camera = null) {
        // Play animations
        this.animations.updateAnimations(delta);

        if (this.particleEffect !== null) {
            this.particleEffect.animateParticles();
        }

        // Play mixers
        for (let i = 0; i < this.mixers.length; i++) {

            /* For animation object the position doesnt get updated, so fire position needs to be updated manually */
            for (let i = 0; i < this.fires.length;i++) {
                this.fires[i].position.copy(this.worldToLocal(this.getCenter()));
            }
            this.mixers[i].update(delta);
        }
        // Play fires
        for (let i = 0; i < this.fires.length;i++) {
            this.fires[i].update(delta);
        }
        // Update label
        this.objectLabels.forEach((label) => {
            label.updatePosition(camera);
        });

        // Update icon
        if (this.objectIcon != null) {
            this.objectIcon.updatePosition(camera);
        }
    },
    removeFire: function() {

        this.fires.forEach((fire) => {
            this.remove(fire);
        });
        this.fires = [];
    },
    getScene:  function() {
        var parent = this.parent;
        while (parent !== null && !parent.isBaseScene) {
            parent = parent.parent;
        }
        return parent;
    },
    setOnFire: function() {
        if (this.fires.length  === 0) {
            let bbox = new THREE.Box3().setFromObject(this);
            let fire = new FireMesh();
            fire.scale.set(bbox.getSize().x / 2, bbox.getSize().y / 2, bbox.getSize().z / 2);
            fire.name = "fire";
            let center = new THREE.Vector3();
            bbox.getCenter(center);
            this.worldToLocal(center);
            fire.position.set(center.x, center.y + bbox.getSize().y / 2, center.z);
            this.add(fire);
            this.fires.push(fire);
        }
        return this.fires[0];
    },
    addLabel: function(opts, onClick = null) {
        // Create the label object with the BaseObject's ID, then give it to the parent
        // application (which will be responsible for rendering / animating it)
        // let labelText = (customText !== undefined && customText !== null) ? customText + "" : this.info.label;
        // this.removeLabel();
        let label = new ObjectLabel(this, opts, onClick);
        this.objectLabels.push(label);
        if (this.objectLabelIsVisible) {
            this.showLabel();
        }
    },
    getLabel: function(index) {
        if (index < 0 || index > this.objectLabels.length - 1) {
            return null;
        }
        return this.objectLabels[index];
    },
    showLabel: function() {
        if (this.objectLabels.length > 0) {
            this.objectLabels.forEach((label) => {
                label.show();
            });
            this.objectLabelIsVisible = true;
        }
    },
    hideLabel: function() {
        if (this.objectLabels.length > 0) {
            this.objectLabels.forEach((label) => {
                label.hide();
            });
            this.objectLabelIsVisible = false;
        }
    },
    removeLabel: function() {
        this.objectLabels.forEach((label) => {
            label.remove();
        });
        this.objectLabels = [];
        this.objectLabelIsVisible = false;
    },
    addIcon: function(opts, onClick) {
        this.removeIcon();
        this.objectIcon = new ObjectIcon(opts, this, onClick);

        if (this.objectIconIsVisible) {
            this.showIcon();
        }
    },
    showIcon: function() {
        if (this.objectIcon !== null) {
            this.objectIcon.show();
            this.objectIconIsVisible = true;
        }
    },
    hideIcon: function() {
        if (this.objectIcon !== null) {
            this.objectIcon.hide();
            this.objectIconIsVisible = false;
        }
    },
    removeIcon: function() {
        if (this.objectIcon != null) {
            this.objectIcon.remove();
            this.objectIconIsVisible = false;
        }
    },
    dispatchEvent: function(event) {
        THREE.Object3D.prototype.dispatchEvent.call(event);
    },
    add: function(object, selectable = null) {
        if (selectable !== null) {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.isSelectable = selectable;
                }
            });
        }
        THREE.Object3D.prototype.add.call(this, object);
    },
    remove: function(object) {
        THREE.Object3D.prototype.remove.call(this, object);
    },
    bboxHelper: function() {
        let helper = new THREE.BoundingBoxHelper(this, 0xff0000);
        if (this.boundingBoxHelper == null) {
            this.boundingBoxHelper = helper;
            this.getScene().add(this.boundingBoxHelper);
        } else {
            this.getScene().remove(this.boundingBoxHelper);
            this.boundingBoxHelper = helper;
            this.getScene().add(this.boundingBoxHelper);
        }
    },
    attachParticleEffect: function(pFX) {
        this.particleEffect = pFX;
        this.particleEffect.parentObject = this;
        this.getParentObject().add(pFX.particleSystem);
    },
    detachParticleEffect: function() {
        this.particleEffect = null;
    },
    setEnvMapCubeImage: function(format, path) {
        let textureEnvMap = Loader.loadCubeTexture(format, path);

        this.setEnvMapTexture(textureEnvMap);
    },
    setEnvMapEquirectangularImage: function(url, renderer, resolution = 128) {
        let equiToCube = new EquirectangularToCubemap(renderer);
        let loader = new THREE.TextureLoader();
        let scope = this;
        loader.load(url, function(res) {
            let texture = equiToCube.convert(res, resolution);
            scope.setEnvMapTexture(texture);
        });
    },
    setEnvMapTexture: function(texture) {
        this.textureEnvMap = texture;
        this.traverse((child) => {
            if (child.isMesh) {
                child.material.envMap = this.textureEnvMap;
                child.material.needsUpdate = true;
            }
        });
    },
    setSelectable: function(bSelectable) {
        this.traverse((child) => {
            if (child.isMesh) {
                child.isSelectable = bSelectable;
            }
        });
    },
    showOutline: function() {
        this.getScene().appParent.showOutline([this]);
    },
    hideOutline: function() {
        this.getScene().appParent.hideOutline([this]);
    },
    showTransformationControl: function(mode) {
        this.getScene().appParent.addTransformController(this, mode);
    },
    hideTransformationControl: function() {
        this.getScene().appParent.removeTransformController(this);
    },
    copy: function(source) {

        THREE.Object3D.prototype.copy.call(this, source);

        this.info = Object.assign({}, source.info);

        this.type = source.type;
        this.eventCallbacks = Object.assign({}, source.eventCallbacks);
        this.opacity = source.opacity;
        this.preOpacity = source.preOpacity;
        this.trail = Object.assign({}, source.trail);
        this.objectLabelIsVisible = source.objectLabelIsVisible;
        this.objectIconIsVisible = source.objectIconIsVisible;
        // animations
        // this.animations = new AnimationManager();
        this.animations = source.animations;

        this.mixers = [];
        source.mixers.forEach((mixer) => {
            let newMixer = mixer.clone();
            // newMixer.clipAction(anime, object.animationRoot).play();
            // newMixer.timeScale = objConfig.timeScale || mixer.timeScale;
            this.mixers.push(newMixer);
        });

        this.fires = source.fires;

        this.objectLabels = [];
        if (source.objectLabels !== []) {
            source.objectLabels.forEach((label) => {
                this.objectLabels.push(label.clone());
            });
        }

        this.objectIcon = null;
        if (source.objectIcon !== null) {
            this.objectIcon = source.objectIcon.clone();
        }

        this.textureEnvMap = null;
        if (source.textureEnvMap !== null) {
            this.textureEnvMap = source.textureEnvMap.clone();
        }


        this.particleEffect = null;
        if (source.particleEffect !== null) {
            this.particleEffect = source.particleEffect.clone();
        }

        return this;
    },

    getHeatMapMaterial: function(locations, values, power) {
        let numLocations = locations.length;
        return new THREE.ShaderMaterial({
            uniforms: {
                "values":     {type: "fv1", value: values},
                "locations": {type: "v3v", value: locations},
                "power":      {type: "f",   value: power}
            },
            vertexShader: [
                "varying vec3 pos;",
                "precision highp float;",

                "void main() {",
                "   pos = position;",
                "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "}",
            ].join("\n"),
            fragmentShader: [
                "uniform float values[" + numLocations + "];",
                "uniform vec3 locations[" + numLocations + "];",
                "uniform float power;",
                "varying vec3 pos;",

                "vec3 hsv2rgb(vec3 c){",
                "    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
                "    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
                "    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
                "}",
                "void main() {",
                "   float n = 0.0;",
                "   float d = 0.0;",
                "   for(int i = 0; i< " + numLocations + " ; i+=1){",
                "       n+= (1.0/pow(distance(pos,locations[i]),power)) * values[i];",
                "       d+= (1.0/pow(distance(pos,locations[i]),power));",
                "   }",
                "   float mixh = n/d;",
                "   mixh = 0.6 - (mixh * 0.6);",
                "   vec3 mix = vec3(mixh,1.0,0.7);",
                "   vec3 mixrgb = hsv2rgb(mix);",
                "   gl_FragColor = vec4(mixrgb,1.0);",
                "}",
            ].join("\n"),
        });

    },
    removeHeatMap: function() {
        this.traverse((child) => {
            if (child.isMesh) {
                child.material = child.heatOriginalMaterial;
            }
        });
    },
    setOpacityThreshold: function(opacity) {
        function setAlphaTest(material, opacity) {
            material.alphaTest = opacity;
            material.needsUpdate = true;
        }
        this.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    for (let i = 0; i < object.material.length; i++) {
                        setAlphaTest(object.material[i], opacity);
                    }
                } else  {
                    setAlphaTest(object.material, opacity);
                }

            }
        });
    },
    setHeatMap: function(locations, values, power = 2) {
        let heatMapMaterial = this.getHeatMapMaterial(locations, values, power);
        this.traverse((child) => {
            if (child.isMesh) {
                child.heatOriginalMaterial = child.material;
                child.material = heatMapMaterial;
            }
        });

    },
    clone: function() {
        return new this.constructor().copy(this);
    },
});

export {BaseObject};

import * as THREE from "../thirdParty/build/three.module.js";
import * as Const from "./Constants.js";
import {Animation, AnimationManager} from "./Animation.js";

function Camera(app) {
    THREE.Camera.call(this);
    this.appParent = app;
    this.oldPosition = this.position.clone();
    this.animations = new AnimationManager();
}
Camera.prototype = Object.assign(Object.create(THREE.Camera.prototype), {
    constructor:    Camera,
    getPosition: function() {
        return this.position;
    },
    setPosition: function(x, y, z) {
        this.position.set(x, y, z);
    },
    getLookAtVector: function() {
        let lookAtVector = new THREE.Vector3(0, 0, -1);
        lookAtVector.applyQuaternion(this.quaternion);
        return lookAtVector;
    },
    setLookAtPoint: function(pointJS) {
        this.lookAt(pointJS.x, pointJS.y, pointJS.z);
        let point = new THREE.Vector3(pointJS.x, pointJS.y, pointJS.z);
        if (this.appParent) {
            this.appParent.orbitControl.target.copy(point);
        }
    },
    setLookAtVector: function(pointJS, controlsDepth = 10) {
        let newPoint = new THREE.Vector3(pointJS.x, pointJS.y, pointJS.z);
        newPoint = newPoint.multiplyScalar(controlsDepth);
        this.lookAt(newPoint.x, newPoint.y, newPoint.z);
    },
    getRaycastPoint: function(position, direction) {
        let rayCast = new THREE.Raycaster(position, direction);
        let allStuff = [];
        let retPoint = null;
        this.appParent.getCurrentScene().traverse((object) => {
            if (object.isMesh) {
                allStuff.push(object);
            }
        });
        let intersects = rayCast.intersectObjects(allStuff);
        if (intersects.length > 0) {
            retPoint = intersects[0].point;
        }
        return retPoint;
    },
    getDirection: function(startPoiont, endPoint, target = null) {
        target = target || new THREE.Vector3();

        let dist = this.distanceBtwnPoints(startPoiont, endPoint);
        if (dist !== 0) {
            target.set(
                (endPoint.x - startPoiont.x) / dist,
                (endPoint.y - startPoiont.y) / dist,
                (endPoint.z - startPoiont.z) / dist
            );
        }
        return target;
    },
    distanceBtwnPoints: function(pos1, pos2) {
        return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2) + Math.pow((pos1.z - pos2.z), 2));
    },
    zoomOutZoomInPoint: function(finalPosition, stopDistance, duration, finalLookAt = null, pullOutPosition = null, callback = null, steepnessFactor = .5) {
        let start = this.position;
        let endPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);

        let middle = null;
        if (pullOutPosition === null || pullOutPosition === undefined) {
            middle = start.clone();
            middle.add(endPoint).divideScalar(2);
            middle.y += (start.distanceTo(endPoint) * steepnessFactor);
        } else {
            middle = new THREE.Vector3(pullOutPosition.x, pullOutPosition.y, pullOutPosition.z);
        }
        // get pathCurve
        var pathCurve = new THREE.QuadraticBezierCurve3(start, middle, endPoint);
        var pathPoints = pathCurve.getPoints(duration * Const.MAX_EXPECTED_FPS);

        let stoppingPointIndex = pathPoints.length - 1;
        for (stoppingPointIndex = pathPoints.length - 1; stoppingPointIndex > 0; stoppingPointIndex--) {
            if (this.distanceBtwnPoints(pathPoints[stoppingPointIndex], endPoint) >= stopDistance) {
                break;
            }
        }
        if (stoppingPointIndex === 0) {
            console.warn("stopDistance is larger than path length");
            if (callback) {
                callback();
            }
            return false;
        }
        // Now that we've computed our stopping point away from the object, simply calculate a new
        // curve and that one will be the final curve used:
        pathCurve = new THREE.QuadraticBezierCurve3(start, middle, pathPoints[stoppingPointIndex - 1]);
        pathPoints = pathCurve.getPoints(duration * Const.MAX_EXPECTED_FPS);

        // get LookAt Curve
        let curDir = new THREE.Vector3();
        this.getWorldDirection(curDir);
        let endDir;
        if (finalLookAt !== null) {
            // if finalLookAt.type == "direction"
            endDir = finalLookAt;
            if (finalLookAt.type === "point") {
                endDir = this.getDirection(pathPoints[pathPoints.length - 1], finalLookAt);
            }
        } else {
            endDir = this.getDirection(pathCurve.getPoint(.99), finalPosition);
        }
        let lookAtCurve = new THREE.LineCurve3(curDir, endDir);
        let lookAtPoints = lookAtCurve.getPoints(duration * Const.MAX_EXPECTED_FPS);

        // set speed
        var speed = pathPoints.length / duration;

        // animate camera movement
        let animation = new Animation("flying", this.animateCurve, [this, pathPoints, lookAtPoints, speed, false, callback, null]);
        animation.animateCurveItr = 0;
        animation.setFinalOrbitControl = this.setOribitControl.bind(this, pathPoints[pathPoints.length - 1 ], lookAtPoints[lookAtPoints.length - 1]);
        this.animations.addWithReplace(animation);

        return pathPoints[pathPoints.length - 1];

    },
    zoomOutZoomIn: function(object, stopDistance = null, duration, finalLookAt, pullOutPosition = null, fadeEffect = null, callback = null, steepnessFactor = 0.5) {
        // let endPoint = null;
        let params = this.setEndPointAndStopDistance(object, stopDistance);
        // if (stopDistance == null){
        //     let ocp = object.getOptimalCameraParams(this,Math.PI/4, 1.0,null);
        //     stopDistance = ocp.position.distanceTo(ocp.lookAt);
        //     endPoint = ocp.lookAt;
        // }
        // if(!endPoint)
        //     endPoint = object.getCenter();

        let finalPoint = this.zoomOutZoomInPoint(params.endPoint, params.stopDistance, duration, finalLookAt, pullOutPosition, callback, steepnessFactor);
        // go fade out effect
        if (fadeEffect !== null && finalPoint) {
            this.fadeEffect(object, finalPoint, params.stopDistance, fadeEffect);
        }
    },
    flyInPath: function(path, repeat, onFinish, onProgress, onProgressThreshold) {
        let ctrlPoints = [];
        let focalPoints = [];
        let sectionTimes = [];
        let stopTimes = [];

        path.forEach((object) => {
            ctrlPoints.push(object.ctrlPoint);
            focalPoints.push(object.focalPoint);
            sectionTimes.push(object.sectionTime);
            stopTimes.push(object.stopTime);
        });

        let scope = this;
        let callback = function() {
            scope.flyingInspection(ctrlPoints, focalPoints, sectionTimes, onFinish, repeat, onProgress, onProgressThreshold, stopTimes);
        };

        this.flyToPoint(path[0].ctrlPoint, 2, 0, callback, path[0].focalPoint);
    },
    /* private. Do not use this function directly anymore
    */
    flyingInspection: function(ctrlPoints, focalPoints, sectionTimes, onFinish = null, repeat = false, onProgress = null, onProgressThreshold = 10, stopTimes = null) {
        let totalInspectionDurationSeconds = 0;
        sectionTimes.forEach((ea) => {
            totalInspectionDurationSeconds += ea;
        });

        // Convert control points to three.js vectors:
        let ctrlPointsThreejs = [];
        ctrlPoints.forEach((ea) => {
            ctrlPointsThreejs.push(new THREE.Vector3(ea.x, ea.y, ea.z));
        });
        let pathCurve = new THREE.CatmullRomCurve3(ctrlPointsThreejs);
        let discretePathPoints = pathCurve.getPoints(totalInspectionDurationSeconds * Const.MAX_EXPECTED_FPS);
        let discreteSegmentLengths = pathCurve.getLengths(totalInspectionDurationSeconds * Const.MAX_EXPECTED_FPS);
        // check the length of all the segments, if all is equal to zero abort
        let abort = true;
        discreteSegmentLengths.forEach((segmentLength) => {
            if (segmentLength > 0.000001) {
                abort = false;
            }
        });
        if (abort) {
            if (onFinish !== null) {
                onFinish();
            }
        }

        // Convert focal points to three.js vectors:
        let focalPointsThreejs = [];
        for (let i = 0; i < focalPoints.length; i++) {
            if (focalPoints[i].type == "point") {
                focalPointsThreejs.push(this.getDirection(ctrlPoints[i], focalPoints[i]));
            } else {
                focalPointsThreejs.push(new THREE.Vector3(focalPoints[i].x, focalPoints[i].y, focalPoints[i].z));
            }
        }
        let lookAtCurve = new THREE.CatmullRomCurve3(focalPointsThreejs);
        let discreteLookAtPoints = lookAtCurve.getPoints(totalInspectionDurationSeconds * Const.MAX_EXPECTED_FPS);

        // Next, "aggregate" our discrete lengths into their logical segments, as defined by the
        // position control points
        let userPathByLogicalSegments = this.getPathByLogicalSegments(discretePathPoints, ctrlPointsThreejs);

        // Set the stopperArray to stop at certain points
        let stopperArray  = [];
        let totalIndex = 0;
        if (stopTimes !== null && stopTimes.length >= userPathByLogicalSegments.length) {
            for (let i = 0; i < userPathByLogicalSegments.length;i++) {
                stopperArray.push({
                    point: totalIndex,
                    stopTime: stopTimes[i]
                });
                totalIndex += userPathByLogicalSegments[i].segmentPoints.length;
            }
        }
        // This `speeds` array will tell the animation function how fast to flip through all of the
        // "frames" of the animation. `speeds` has the same array length as `discretePathPoints` and
        // `discreteLookAtPoints`.
        let speeds = [];
        for (let i = 0; i < userPathByLogicalSegments.length; i++) {
            let numSegmentPoints = userPathByLogicalSegments[i].segmentPoints.length;
            let segmentSpeed = numSegmentPoints / sectionTimes[i + 1];
            for (let j = 0; j < numSegmentPoints; j++) {
                speeds.push(segmentSpeed);
            }
        }
        // Handle the onProgress callback
        let onProgressCallbacks = null;
        if (onProgress !== null) {
            onProgressCallbacks = {
                callbacks: new Array(discretePathPoints.length).fill(null),
                repeatFlag:  new Array(ctrlPointsThreejs.length).fill(true),
                function: onProgress,
                ctrlPoints: ctrlPoints
            };
            // Good enough optimization
            let ctrlPointStartPos = 0;
            for (let i = 0; i < discretePathPoints.length; i++) {
                for (let j = ctrlPointStartPos; j < ctrlPointsThreejs.length; j++) {
                    if (ctrlPointsThreejs[j].distanceTo(discretePathPoints[i]) < onProgressThreshold) {
                        onProgressCallbacks.callbacks[i] = j;
                        ctrlPointStartPos = j;
                        break;
                    }
                }
            }
        }
        // This is our main iterator to flip through our collection of frames
        let animation = new Animation("flying", this.animateCurve, [this, discretePathPoints, discreteLookAtPoints, speeds, repeat, onFinish, onProgressCallbacks]);
        animation.animateCurveItr = 0;
        animation.stopperArray = stopperArray;
        animation.stopperIndex = 0;
        animation.setFinalOrbitControl = this.setOribitControl.bind(this, discretePathPoints[discretePathPoints.length - 1 ], discreteLookAtPoints[discreteLookAtPoints.length - 1]);
        this.animations.remove("fadeEffect");
        return this.animations.addWithReplace(animation);
    },
    getPathByLogicalSegments: function(discretePathPoints, ctrlPointsThreejs) {
        // this is a good code
        let output = [];
        let segmentsItr = 1;
        // Iterate through our control points to "match" each one up with the closest curve points to
        // signify the boundaries of each logical user segment
        for (let i = 1; i < ctrlPointsThreejs.length; i++) {
            // Each object in our output array will contain an array of all discrete points in that
            // segment, plus the length of the segment.
            let obj = {
                segmentPoints: []
            };
            // Because we're starting at 1, we need to save the 0th element:
            if (segmentsItr === 1) {
                obj.segmentPoints.push(discretePathPoints[0]);
            }
            let nextCtrlPoint = ctrlPointsThreejs[i];
            // Iterate through and add up all discrete segments until we've finished the current user
            // segment, as defined by reaching the next control point.
            for (; segmentsItr < discretePathPoints.length; segmentsItr++) {
                obj.segmentPoints.push(discretePathPoints[segmentsItr]);

                // Check if there is a "next point" in the curve :
                if ((segmentsItr + 1) < discretePathPoints.length) {
                    // At the last contrl point, just keep adding
                    if (i === ctrlPointsThreejs.length - 1) {
                        continue;
                    }
                    // Figure out if we've reached the end of our current user segment:
                    let currSegPoint = discretePathPoints[segmentsItr];
                    let nextSegPoint = discretePathPoints[segmentsItr + 1];
                    let distFromCurr = this.distanceBtwnPoints(currSegPoint, nextCtrlPoint);
                    let distFromNext = this.distanceBtwnPoints(nextSegPoint, nextCtrlPoint);
                    // If the distance from the current segment point is less than or equal to the
                    // distance to the next point, then we know that we've reached our control point,
                    // and we can "cap off" the current user segment length.
                    if (distFromCurr <= distFromNext) {
                        break;
                    } // Else continue adding up segment lengths
                } else {
                    break;
                }
            }
            output.push(obj);
        }

        return output;
    },

    flyTo: function(object, duration, stopDistance = null, fadeEffect = null, callback) {
        let params = this.setEndPointAndStopDistance(object, stopDistance);
        // stopDistance check
        if (params.stopDistance >= this.distanceBtwnPoints(params.endPoint, this.position)) {
            console.error("stopDistance is larger than path length");
            if (callback) {
                callback();
            }
            return;
        }
        // play FadeEffect
        if (fadeEffect !== null) {
            this.fadeEffect(object, params.endPoint, params.stopDistance, fadeEffect);
        }

        this.flyToPoint(params.endPoint, duration, params.stopDistance, callback);
    },
    flyToPoint: function(finalPos, duration, stopDistance, callback = null, finalLookAt = null) {
        let curPosition = this.position;
        // path Curve
        let pathCurve = new THREE.LineCurve3(curPosition, finalPos);
        if (stopDistance !== 0) {
            let lastPoint = new THREE.Vector3();
            for (let t = 0; t <= 1 ; t += 0.001) {
                pathCurve.getPoint(t, lastPoint);
                if (this.distanceBtwnPoints(lastPoint, finalPos) <= stopDistance) {
                    break;
                }
            }
            pathCurve = new THREE.LineCurve3(curPosition, lastPoint);
        }
        let pathPoints = pathCurve.getPoints(duration * Const.MAX_EXPECTED_FPS);

        // get LookAt curve
        let curDir = new THREE.Vector3();
        this.getWorldDirection(curDir);
        let endDir;
        if (finalLookAt !== null) {
            // if finalLookAt.type == "direction"
            endDir = finalLookAt;
            if (finalLookAt.type === "point") {
                endDir = this.getDirection(pathPoints[pathPoints.length - 1], finalLookAt);
            }
        } else {
            endDir = this.getDirection(pathCurve.getPoint(.99), finalPos);
        }
        let lookAtCurve = new THREE.LineCurve3(curDir, endDir);
        let lookAtPoints = lookAtCurve.getPoints(duration * Const.MAX_EXPECTED_FPS);

        // set speed
        let speed = pathPoints.length / duration;

        // register animation
        let animation = new Animation("flying", this.animateCurve, [this, pathPoints, lookAtPoints, speed, false, callback, null]);
        animation.animateCurveItr = 0;
        animation.setFinalOrbitControl = this.finalOrbitSetup.bind(this, pathPoints[pathPoints.length - 1], finalLookAt, finalPos);
        this.animations.addWithReplace(animation);
    },
    setEndPointAndStopDistance: function(object, stopDistance) {
        let endPoint = null;

        if (stopDistance == null) {
            let ocp = object.getOptimalCameraParams(this, Math.PI / 4, 1.0, null);
            stopDistance = ocp.position.distanceTo(ocp.lookAt);
            endPoint = ocp.lookAt;
        }
        if (!endPoint) {
            endPoint = object.getCenter();
        }
        return {endPoint: endPoint, stopDistance: stopDistance};
    },
    finalOrbitSetup: function(finalPoint, finalLookAt, finalPos) {
        if (this.appParent) {
            let target = null;
            if (finalLookAt !== null) {
                if (finalLookAt.type === "point") {
                    target = finalLookAt;
                } else {
                    target = this.getRaycastPoint(finalPoint, finalLookAt);
                }
            } else {
                target = finalPos;
            }
            if (target !== null) {
                this.appParent.orbitControl.target.copy(target);
            }
        }
    },
    setOribitControl: function(position, direction) {
        if (this.appParent !== null) {
            let target = this.getRaycastPoint(position, direction);
            if (target !== null) {
                this.appParent.orbitControl.target.copy(target);
            }
        }
    },
    animateCurve: function(object, pathPoints, lookAtPoints, speed, repeat, onFinish, onProgress, delta) {
        object.position.copy(pathPoints[Math.round(this.animateCurveItr)]);

        let lookAtPoint = lookAtPoints[Math.round(this.animateCurveItr)].clone();
        lookAtPoint.add(object.position);
        object.lookAt(lookAtPoint);

        if (this.signal === Const.Signals.SIGKILL || this.signal === Const.Signals.SIGTERM) {
            object.setOribitControl(object.position, object.getLookAtVector());

        }
        if (this.animateCurveItr >= pathPoints.length - 1) {
            this.animateCurveItr = 0;

            // reset the stopperIndex
            if (this.stopperArray !== undefined) {
                this.stopperIndex = 0;
            }
            // reset the onProgress repeat flags
            if (onProgress !== null) {
                onProgress.repeatFlag = new Array(onProgress.repeatFlag.length).fill(true);
            }

            // notify any fadeEffect end of flying
            let fadeEffect = object.animations.get("fadeEffect");
            if (fadeEffect) {
                fadeEffect.sendSignal(20);
            }

            if (onFinish !== null) {
                onFinish();
            }
            // set oribit control
            if (this.setFinalOrbitControl !== undefined) {
                this.setFinalOrbitControl();
            }
            return repeat;
        }

        if (onProgress !== null) {
            let ctrlPointIndex = onProgress.callbacks[Math.round(this.animateCurveItr)];
            if (ctrlPointIndex !== null && onProgress.repeatFlag[ctrlPointIndex]) {
                onProgress.repeatFlag[ctrlPointIndex] = onProgress.function(onProgress.ctrlPoints[ctrlPointIndex]);
            }
        }

        // stopperarray
        if (this.stopperArray !== undefined) {
            if (this.stopperIndex < this.stopperArray.length) {
                if (this.animateCurveItr >=  this.stopperArray[this.stopperIndex].point) {
                    this.startTime = this.stopperArray[this.stopperIndex].stopTime;
                    this.pauseAnimateCurveItr = true;
                    this.stopperIndex++;
                }
            }
            this.startTime -= delta;
            if (this.startTime >=  0) {
                this.pauseAnimateCurveItr = true;
            } else {
                this.pauseAnimateCurveItr = false;
            }
        }
        if (!this.pauseAnimateCurveItr) {
            if (Array.isArray(speed)) {
                this.animateCurveItr += speed[Math.round(this.animateCurveItr)] * delta;
            } else {
                this.animateCurveItr += speed * delta;
            }
        }

        // if animateCurveItr jumps beyond last point, pull it back tox the last point
        // so the animation always ends at pathPoint[pathPoint.length-1] position.
        if (this.animateCurveItr > pathPoints.length - 1) {
            this.animateCurveItr = pathPoints.length - 1 ;
        }
        return true;
    },
    fadeEffect: function(object, finalPos, stopDistance, fadeEffect, onExit) {
        let otherObjects = [];
        let exceptions = [object].concat(object.getChildrenObjects());
        this.appParent.getCurrentScene().traverse((child) => {
            if (child.isBaseObject) {
                if (child.info.type === "ground") {
                    exceptions.push(child);
                } else {
                    otherObjects.push(child);
                }
            }
        });

        let radius = fadeEffect.radius;
        let dimB = fadeEffect.dimB ;
        let dimRate = (1 - dimB) / radius;
        object.setOpacity(1.1, null);

        var dimOnPositionChange = function(object, finalPosition, stopDistance, dimRate, dimB, objectsToDim, exceptions) {
            // handle signals
            if (this.signal === 15) { // exit with replacement
                return false;
            } else if (this.signal === 20) { // flying ended
                this.isSticky = false;
                this.signal = null;
            } else if (this.signal === 9) { // exit without replacing
                objectsToDim.forEach((child) => {
                    child.setOpacity(1.1, exceptions);
                });
                return false;
            }
            if (object.distanceBtwnPoints(object.oldPosition, object.position) > .0001) {
                let currentDistance = object.distanceBtwnPoints(finalPosition, object.position) - stopDistance;
                let opacity = dimRate * currentDistance + dimB;
                objectsToDim.forEach((child) => {
                    child.setOpacity(opacity, exceptions);
                });
                object.oldPosition.copy(object.position);
                if (opacity > 1.1 && !this.isSticky) {
                    // this.insideRadius = undefined;
                    return false;
                }
                return true;
            }
            return true;

        };
        // register fadeEffect
        let animation = new Animation("fadeEffect", dimOnPositionChange, [this, finalPos, stopDistance, dimRate, dimB, otherObjects, exceptions]);
        animation.isSticky = true;
        animation.onExit = onExit;
        this.animations.addWithReplace(animation);

    },
    updateAnimations: function(delta) {
        this.animations.updateAnimations(delta);
    },
    stopFlying: function() {
        this.animations.remove("flying");
    },
    cancelAllAnimations: function() {
        this.animations.removeAllImmidiately();
    },
    reset: function() {
        this.position.copy(this.appParent.cameraHome.position);
        this.setLookAtPoint(this.appParent.cameraHome.lookAt);
    },
    /* Helper function */
    drawPath: function(pathPoints) {
        let geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

        let material = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Create the final object to add to the scene
        let pathObject = new THREE.Line(geometry, material);
        this.appParent.getCurrentScene().add(pathObject);
    }
});

export {Camera};

import * as THREE from "../thirdParty/build/three.module.js";

// geometryConfig = {
// 	width: 	1,
// 	height: 1,
// 	depth:	1
// }
// movementConfig = {
// 	lookSpeed:
// 	movementSpeed:
// 	objectMass:
// 	eyeHeight:
//  riseInterval:
// }
var FirstPersonControls = function(camera, domElement, geometryConfig, movementConfig) {

    THREE.Object3D.call(this);

    var PI_2 = Math.PI / 2;
    var scope = this;
    this.isControls = true;

    this.domElement = domElement || document.body;
    this.isLocked = false;
    this.enabled = true;

    // collision detection
    this.collidableMeshes = [];
    this.enableCollision = false;
    this.raycaster = new THREE.Raycaster();

    // The four arrow keys and space key
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, JUMP: 32, LOCK: 76, UNLOCK: 27, RISEUP: 107, DECLINE: 109 };
    this.canJump = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.prevPosition = new THREE.Vector3();

    this.camera = camera;
    // this.camera.position.set( 0, 0, 0 );
    // this.camera.rotation.set( 0, 0, 0 );

    var pitchObject = new THREE.Object3D();
    pitchObject.add(this.camera);
    this.camera.parent = null;

    var yawObject = new THREE.Object3D();
    // yawObject.position.y = this.eyeHeight;
    yawObject.add(pitchObject);

    this.add(yawObject);

    var cubeW = 2, cubeH = 2, cubeD = 2;
    if (geometryConfig !== undefined && geometryConfig !== null) {
        cubeW = geometryConfig.width === undefined ? cubeW : geometryConfig.width;
        cubeH = geometryConfig.height === undefined ? cubeH : geometryConfig.height;
        cubeD = geometryConfig.depth === undefined ? cubeD : geometryConfig.depth;
    }

    var geometry = new THREE.BoxGeometry(cubeW, cubeH, cubeD);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.visible = false;
    yawObject.add(this.cube);

    this.lookSpeed = 0.002;
    this.movementSpeed = 400;
    this.objectMass = 50;
    this.eyeHeight = 1.5;
    this.riseInterval = 0.2;

    if (movementConfig !== undefined && movementConfig !== null) {
        this.lookSpeed = movementConfig.lookSpeed === undefined ? this.lookSpeed : movementConfig.lookSpeed;
        this.movementSpeed = movementConfig.movementSpeed === undefined ? this.movementSpeed : movementConfig.movementSpeed;
        this.objectMass = movementConfig.objectMass === undefined ? this.objectMass : movementConfig.objectMass;
        this.eyeHeight = movementConfig.eyeHeight === undefined ? this.eyeHeight : movementConfig.eyeHeight;
        this.riseInterval = movementConfig.riseInterval === undefined ? this.riseInterval : movementConfig.riseInterval;
    }


    function onMouseMove(event) {

        if (scope.enabled === false) {
            return;
        }

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * scope.lookSpeed;
        pitchObject.rotation.x -= movementY * scope.lookSpeed;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

    }

    function onPointerlockChange() {

        if (document.pointerLockElement === scope.domElement) {

            scope.dispatchEvent({ type: "lock" });

            scope.isLocked = true;

        } else {

            scope.dispatchEvent({ type: "unlock" });

            scope.isLocked = false;

        }

    }

    function onPointerlockError() {

        console.error("FirstPersonControls: Unable to use Pointer Lock API");

    }

    function onRemove() {
        scope.camera.parent = null;
    }

    function onAdd() {
        scope.camera.parent = pitchObject;
    }

    function onKeyDown(event) {

        if (scope.enabled === false) {
            return;
        }

        switch (event.keyCode) {

            case scope.keys.UP:
                scope.moveForward = true;
                break;

            case scope.keys.BOTTOM:
                scope.moveBackward = true;
                break;

            case scope.keys.LEFT:
                scope.moveLeft = true;
                break;

            case scope.keys.RIGHT:
                scope.moveRight = true;
                break;

            case scope.keys.JUMP:
                if (scope.canJump === true) {
                    scope.velocity.y += 100;
                }
                scope.canJump = false;
                break;

            case scope.keys.LOCK:
                scope.lock();
                break;

            case scope.keys.UNLOCK:
                scope.unlock();
                break;

            case scope.keys.RISEUP:
                scope.eyeHeight += scope.riseInterval;
                break;

            case scope.keys.DECLINE:
                scope.eyeHeight -= scope.riseInterval;
                break;
        }

    }

    function onKeyUp(event) {
        if (scope.enabled === false) {
            return;
        }

        switch (event.keyCode) {

            case scope.keys.UP:
                scope.moveForward = false;
                break;

            case scope.keys.BOTTOM:
                scope.moveBackward = false;
                break;

            case scope.keys.LEFT:
                scope.moveLeft = false;
                break;

            case scope.keys.RIGHT:
                scope.moveRight = false;
                break;
        }
    }
    this.setCollidableMeshes = function(meshes) {
        this.collidableMeshes = meshes;
        this.enableCollision = true;
    };

    this.reset = function() {
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
    };

    this.setPosition = function(pos) {
        pos.y = this.eyeHeight;
        yawObject.position.copy(pos);
    };

    this.lookAt = function(targetPos) {
        var dx = targetPos.x - yawObject.position.x;
        var dy = targetPos.y - scope.eyeHeight;
        var dz = targetPos.z - yawObject.position.z;

        var rotY = Math.atan2(dx, dz) + Math.PI;
        yawObject.rotation.y = rotY;

        var rotX = Math.atan2(dy, dz);
        pitchObject.rotation.x = rotX;
    };

    this.getObject = function() {

        return yawObject;

    };

    this.getDirection = function() {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function(v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        };

    }();

    this.updateControls = function(delta) {

        // let is_collision = false; //

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.velocity.y -= 9.8 * this.objectMass * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
        this.direction.normalize(); // this ensures consistent movements in all directions

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.movementSpeed * delta;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.movementSpeed * delta;
        }

        if (this.enableCollision && this.collidableMeshes.length > 0) {
            var originPoint = yawObject.position;
            var MovingCube = this.cube;
            this.prevPosition.copy(originPoint);

            // test vertical direction
            this.raycaster.ray.origin.copy(originPoint);
            this.raycaster.ray.origin.y -= this.eyeHeight;
            // this.raycaster.set(originPoint, new THREE.Vector3( 0, -1, 0 ));

            var intersections = this.raycaster.intersectObjects(this.collidableMeshes);


            // if ( intersections.length > 0 &&
            //     intersections[0].distance < this.firstPersonController.eyeHeight - 0.5*this.firstPersonController.height ) {
            if (intersections.length > 0) {
                if (intersections[0].distance < this.eyeHeight) {
                    // this.velocity.y = Math.max(0, this.velocity.y);
                    this.velocity.y = 0;
                    this.canJump = true;
                }
            }

            yawObject.translateX(this.velocity.x * delta);
            yawObject.translateY(this.velocity.y * delta);
            yawObject.translateZ(this.velocity.z * delta);

            yawObject.updateMatrixWorld();


            for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++) {
                var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();

                var globalVertex = localVertex.applyMatrix4(MovingCube.matrixWorld);
                var directionVector = globalVertex.sub(originPoint);

                this.raycaster.set(originPoint, directionVector.clone().normalize());
                var collisionResults = this.raycaster.intersectObjects(this.collidableMeshes);
                if (collisionResults.length > 0 &&
					collisionResults[0].distance < directionVector.length()) {

                    // is_collision = true;
                    this.velocity.x = 0;
                    this.velocity.z = 0;
                    // this.velocity.y = 0;
                    yawObject.position.copy(this.prevPosition);
                    break;
                } else {
                    // is_collision = false;
                }
            }
        } else {
            yawObject.translateX(this.velocity.x * delta);
            yawObject.translateY(this.velocity.y * delta);
            yawObject.translateZ(this.velocity.z * delta);
        }

        if (yawObject.position.y < this.eyeHeight) {
            this.velocity.y = 0;
            yawObject.position.y = this.eyeHeight;
            this.canJump = true;
        }
    };

    this.connect = function() {

        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("pointerlockchange", onPointerlockChange, false);
        document.addEventListener("pointerlockerror", onPointerlockError, false);
        window.addEventListener("keydown", onKeyDown, false);
        window.addEventListener("keyup", onKeyUp, false);
        this.addEventListener("added", onAdd, false);
        this.addEventListener("removed", onRemove, false);
    };

    this.disconnect = function() {

        document.removeEventListener("mousemove", onMouseMove, false);
        document.removeEventListener("pointerlockchange", onPointerlockChange, false);
        document.removeEventListener("pointerlockerror", onPointerlockError, false);
        window.removeEventListener("keydown", onKeyDown, false);
        window.removeEventListener("keyup", onKeyUp, false);
        this.removeEventListener("added", onAdd, false);
        this.removeEventListener("removed", onRemove, false);
    };

    this.dispose = function() {

        this.disconnect();

    };

    this.lock = function() {

        this.domElement.requestPointerLock();

    };

    this.unlock = function() {

        document.exitPointerLock();
        // this.domElement.exitPointerLock();

    };

    this.connect();

};

FirstPersonControls.prototype = Object.create(THREE.Object3D.prototype);
FirstPersonControls.prototype.constructor = FirstPersonControls;

export {FirstPersonControls};

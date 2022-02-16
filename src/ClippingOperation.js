import * as THREE from "../thirdParty/build/three.module.js";
import {BaseObject} from "./BaseObject.js";

function ClippingOperation(object, scene, camera, renderer) {
    this.type = "ClippingOperation";
    this.object = object;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.rotationY_X = 0;
    this.rotationY_Z = 0;

    this.planeX = new THREE.Plane(new THREE.Vector3(1,  0,  0), 0);
    this.planeY = new THREE.Plane(new THREE.Vector3(0, 1,  0), -160);
    this.planeZ = new THREE.Plane(new THREE.Vector3(0,  0, 1), 180);
    this.planeXInit = this.planeX.constant;
    this.planeYInit = this.planeY.constant;
    this.planeZInit = this.planeZ.constant;
    this.planeXNormal = new THREE.Vector3(1,  0,  0);
    this.planeYNormal = new THREE.Vector3(0, -1,  0);
    this.planeZNormal = new THREE.Vector3(0,  0, -1);
    this.clipPlanes = [this.planeX, this.planeY, this.planeZ];
    this.helperX = new THREE.Object3D();
    this.helperY = new THREE.Object3D();
    this.helperZ = new THREE.Object3D();
    this.initialized = false;

    this.points = [];
    this.planes = [];
}

ClippingOperation.prototype = Object.assign(Object.create(BaseObject.prototype), {

    constructor: ClippingOperation,
    isClippingOperation: true,
    generateClippingPlanes: function(parameters) {
        switch(parameters.type) {
            case "custom":
                this.points = [];
                this.planes = [];
                this.points = parameters.points;
                let vertexPoint = this.camera.position;
                for (var i = 0; i < this.points.length; i++) {
                    // this.object.parent.add(marker(this.points[i])); // THIS LINE IS FOR POINT MARKER
                    if (i < this.points.length - 1) {
                        let point1 = new THREE.Vector3();
                        let point2 = new THREE.Vector3();
                        point1.copy(this.points[i]);
                        point2.copy(this.points[i + 1]);
                        this.planes.push(planeCalculater(point1, point2, vertexPoint));
                    } else {
                        let point1 = new THREE.Vector3();
                        let point2 = new THREE.Vector3();
                        point1.copy(this.points[i]);
                        point2.copy(this.points[0]);
                        this.planes.push(planeCalculater(point1, point2, vertexPoint));
                    }
                    // this.object.parent.add(helper(this.planes[i]));// THIS LINE IS FOR PLANE HELPER
                }
                let x = 0;
                let y = 0;
                let z = 0;
                for (var i = 0; i < this.points.length; i++) {
                    x = x + this.points[i].x;
                    y = y + this.points[i].y;
                    z = z + this.points[i].z;
                }
                let center = new THREE.Vector3(x / this.points.length, y / this.points.length, z / this.points.length);
                let checkCenter = checkSide(center, this.planes);
                if (checkCenter === false) {
                    for (var i = 0; i < this.planes.length; i++) {
                        this.planes[i].negate();
                    }
                }
                this.renderer.localClippingEnabled = true;
                this.object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.clippingPlanes = this.planes;
                        child.material.clipIntersection = true;
                        child.material.needsUpdate = true;
                    }
                });
        
                function checkSide(point, planes) {
                    for (var i = 0; i < planes.length; i++) {
                        let planeTest = planes[i].normal.x * point.x + planes[i].normal.y * point.y + planes[i].normal.z * point.z + planes[i].constant;
                        if (planeTest > 0) {
                            return false;
                        }
                    }
                    return true;
                }
        
                function helper(plane) {
                    let helper = new THREE.PlaneHelper(plane, 400, 0xff00ff);
                    return helper;
                }
        
                function marker(position) {
                    let markerGeo = new THREE.SphereBufferGeometry(2, 32, 32);
                    let markerMat = new THREE.MeshBasicMaterial({
                        color: 0xff00ff
                    });
                    let marker = new THREE.Mesh(markerGeo, markerMat);
                    marker.position.set(position.x, position.y, position.z);
                    return marker;
                }
        
                function planeCalculater(point1, point2, point3) {
                    let vector1 = point1.sub(point3);
                    let vector2 = point2.sub(point3);
                    let planeNormal = vector1.cross(vector2);
                    let planeNormalNormlize = new THREE.Vector3((-1) * planeNormal.normalize().x, (-1) * planeNormal.normalize().y, (-1) * planeNormal.normalize().z);
                    let constant = 0 - point3.x * planeNormalNormlize.x - point3.y * planeNormalNormlize.y - point3.z * planeNormalNormlize.z;
                    let plane = new THREE.Plane(planeNormalNormlize, constant);
                    return plane;
                }
                break;
                
            case "default":
                this.planeX.constant = this.planeXInit;
                this.planeY.constant = this.planeYInit;
                this.planeZ.constant = this.planeZInit;
                this.planeX.normal = this.planeXNormal;
                this.planeY.normal = this.planeYNormal;
                this.planeZ.normal = this.planeZNormal;
                this.rotationY_X = 0;
                this.rotationY_Z = 0;
                if (this.initialized != true) {
                    this.helperX = new THREE.PlaneHelper(this.planeX, 600, 0xff0000);
                    this.helperY = new THREE.PlaneHelper(this.planeY, 600, 0x00ff00);
                    this.helperZ = new THREE.PlaneHelper(this.planeZ, 600, 0x0000ff);
                    this.scene.add(this.helperX);
                    this.scene.add(this.helperY);
                    this.scene.add(this.helperZ);
                    this.initialized = true;
                }
                this.renderer.localClippingEnabled = true;
                this.object.traverse((child) => {
                    if (child.isMesh) {
                        child.material.clippingPlanes = this.clipPlanes;
                        child.material.clipIntersection = true;
                        child.material.needsUpdate = true;
                    }
                });
                break;
        }
    },
    planeXMoveForward: function() {
        this.planeX.constant = this.planeX.constant + 2;
    },
    planeXMoveBackward: function() {
        this.planeX.constant = this.planeX.constant - 2;
    },

    planeYMoveForward: function() {
        this.planeY.constant = this.planeY.constant + 2;
    },
    planeYMoveBackward: function() {
        this.planeY.constant = this.planeY.constant - 2;
    },
    planeZMoveForward: function() {
        this.planeZ.constant = this.planeZ.constant + 2;
    },
    planeZMoveBackward: function() {
        this.planeZ.constant = this.planeZ.constant - 2;
    },
    planeRotateClock: function() {
        this.rotationY_X = this.rotationY_X - 0.05;
        this.rotationY_Z = this.rotationY_Z + 0.05;
        this.planeX.normal = new THREE.Vector3(Math.cos(this.rotationY_X),  0,  -Math.sin(this.rotationY_X));
        this.planeZ.normal = new THREE.Vector3(Math.sin(this.rotationY_Z),  0, -Math.cos(this.rotationY_Z));
    },
    planeRotateCounterClock: function() {
        this.rotationY_X = this.rotationY_X + 0.05;
        this.rotationY_Z = this.rotationY_Z - 0.05;
        this.planeX.normal = new THREE.Vector3(Math.cos(this.rotationY_X),  0,  -Math.sin(this.rotationY_X));
        this.planeZ.normal = new THREE.Vector3(Math.sin(this.rotationY_Z),  0, -Math.cos(this.rotationY_Z));
    },
    showPlaneHelpers: function(bShow) {
        this.helperX.visible = bShow;
        this.helperY.visible = bShow;
        this.helperZ.visible = bShow;

        this.renderer.localClippingEnabled = bShow;
        this.object.traverse((child) => {
            if (child.isMesh) {
                child.material.clipIntersection = bShow;
                child.material.needsUpdate = true;
            }
        });
    },
    findCloseVisiblePoint: function(app, event) {
        let mouse = event.mouse;
        let camera = app.getCurrentCamera();
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        let selectableMeshes =  [];
        let stack = [this.object];
        while (stack.length !== 0) {
            let child = stack.pop();
            if (child.isBaseObject && !child.visible) {
                continue;
            }
            if (child.isMesh && child.isSelectable && child.visible) {
                selectableMeshes.push(child);
            }
            child.children.forEach((grandChildren) => {
                stack.push(grandChildren);
            });
        }
        var intersects = raycaster.intersectObjects(selectableMeshes);
        let closestVisiblePoint = null;
        let scope = this;
        for (var i = 0; i < intersects.length; i++) {
            if (clippingTest(scope, intersects[i].point)) {
                closestVisiblePoint = intersects[i].point;
                break;
            }
        }
        
        function clippingTest(scope, inputPoint) {
            if (scope.renderer.localClippingEnabled === true) {
                let planeXTest = scope.planeX.normal.x * inputPoint.x + scope.planeX.normal.y * inputPoint.y + scope.planeX.normal.z * inputPoint.z + scope.planeX.constant;
                let planeYTest = scope.planeY.normal.x * inputPoint.x + scope.planeY.normal.y * inputPoint.y + scope.planeY.normal.z * inputPoint.z + scope.planeY.constant;
                let planeZTest = scope.planeZ.normal.x * inputPoint.x + scope.planeZ.normal.y * inputPoint.y + scope.planeZ.normal.z * inputPoint.z + scope.planeZ.constant;
                if (planeXTest < 0 && planeYTest < 0 && planeZTest < 0) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
        return closestVisiblePoint;
    },
});
ClippingOperation.prototype.constructor = ClippingOperation;

export {ClippingOperation};
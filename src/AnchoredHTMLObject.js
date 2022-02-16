import * as THREE from "../thirdParty/build/three.module.js";
import {LabelPosition} from "./Constants.js";

function AnchoredHTMLObject(selectedObject, opts) {
    this.coords3D = new THREE.Vector3();
    this.followScaling = true;
    this.anchorType = LabelPosition.LABEL_TOP;
    this.attachToObject(selectedObject, opts);
}

AnchoredHTMLObject.prototype = Object.assign({

    constructor: AnchoredHTMLObject,

    attachToObject: function(selectedObject, opts) {
        this.parentObject = selectedObject;
        this.opts = opts;

        if (opts !== undefined && opts !== null) {
            this.anchorType = opts.anchorType ? opts.anchorType : this.anchorType;
        }

        let offset = new THREE.Vector3(0, 0, 0);
        let anchoredPoint = new THREE.Vector3(0, 0, 0);
        let initialPosition = new THREE.Vector3(0, 0, 0);
        this.initialScale = new THREE.Vector3(1, 1, 1);
        if (selectedObject !== undefined && selectedObject !== null) {
            selectedObject.getLabelAnchor(anchoredPoint, this.anchorType);
            initialPosition = selectedObject.getPositionWorld();
            this.initialScale.copy(selectedObject.scale);
        }

        if (opts !== undefined && opts !== null) {
            offset = opts.offset === undefined ? offset : new THREE.Vector3(opts.offset.x, opts.offset.y, opts.offset.z);
            anchoredPoint = opts.fixedPosition === undefined ?
                anchoredPoint : new THREE.Vector3(opts.fixedPosition.x, opts.fixedPosition.y, opts.fixedPosition.z);
            this.followScaling = opts.followScaling === undefined ? this.followScaling : opts.followScaling;
        }

        this.displacement = new THREE.Vector3();
        this.displacement.copy(anchoredPoint);
        this.displacement.sub(initialPosition);
        this.displacement.add(offset);
    },

    getAnchorPoint2D: function(camera) {
        if (this.parentObject === undefined || this.parentObject === null ||
            this.parentObject.getScene() === null || this.parentObject.getScene().appParent === null) {
            console.warn("Can not find anchor position, the parentObject is null.");
            return new THREE.Vector3();
        }
        let coords3D = this.parentObject.getPositionWorld();

        // translate
        coords3D.add(this.displacement);


        this.parentObject.worldToLocal(coords3D);

        // scale
        if (this.followScaling) {
            let scale = new THREE.Vector3();
            scale.copy(this.parentObject.scale);
            scale.divide(this.initialScale);
            coords3D.multiply(scale);
        }
        this.parentObject.localToWorld(coords3D);

        // store theo cooreds3D for future frustum check
        this.coords3D.copy(coords3D);
        // get 2D position
        let coords2d = this.get2DCoords(coords3D, camera);
        return coords2d;
    },
    get2DCoords: function(position, camera) {
        let vector = position.project(camera);
        vector.x = (vector.x + 1) / 2 * this.parentObject.getScene().appParent.container.dom.offsetWidth;
        vector.y = -(vector.y - 1) / 2 * this.parentObject.getScene().appParent.container.dom.offsetHeight;
        return vector;
    },
    isInsideFrustum: function(camera) {
        var frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        if (this.coords3D !== null) {
            if (frustum.containsPoint(this.coords3D)) {
                return true;
            }
            return false;
        }
    },
    copy: function(source) {

        this.opts = source.opts;
        this.parentObject = source.parentObject;
        this.displacement = source.displacement;

        return this;

    },
    clone: function() {
        return new this.constructor(this.parentObject, this.opts).copy(this);
    }
});
export {AnchoredHTMLObject};

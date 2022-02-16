import * as THREE from "../thirdParty/build/three.module.js";
import {BaseObject} from "./BaseObject.js";
import {BillboardFormat} from "./Constants.js";

function Billboard(name, canvas, size, format) {
    BaseObject.call(this);
    if (format === BillboardFormat.VIDEO) {
        this.name = name;
        this.type = "BillboardVideo";
    }
    if (format === BillboardFormat.IMAGE) {
        this.name = name;
        this.type = "BillboardImage";
    }
    this.canvas = canvas;
    this.size = size;
    this.transparent = true;
    this.format = format;
    if (format === BillboardFormat.VIDEO) {
        this.canvasTexture = new THREE.VideoTexture(canvas);
        this.canvasTexture.wrapS = this.canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.canvasTexture.minFilter = THREE.LinearFilter;
    }
    if (format === BillboardFormat.IMAGE) {
        this.canvasTexture = new THREE.CanvasTexture(canvas);
    }
    this.canvasTexture.repeat.set(1, 1);
    this.material = new THREE.MeshBasicMaterial({
        map: this.canvasTexture,
        side: THREE.DoubleSide,
        transparent: this.transparent,
    });
    this.geometry = new THREE.PlaneBufferGeometry(size.width, size.height);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
}

Billboard.prototype = Object.assign(Object.create(BaseObject.prototype), {

    constructor: Billboard,
    isBillboard: true,
    updateCanvas: function(canvas) {
        this.canvasTexture = new THREE.CanvasTexture(canvas);
        this.mesh.material.map = this.canvasTexture;
    },
    setTransparency: function(transparency) {
        this.mesh.material.transparent = transparency;
    },
    getTransparency: function() {
        return this.mesh.material.transparent;
    },
    getSize: function() {
        return this.size;
    }

});


export {Billboard};
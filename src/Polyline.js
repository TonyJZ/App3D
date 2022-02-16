import * as THREE from "../thirdParty/build/three.module.js";
import * as EXTRA from "../thirdParty/build/extra.module.js";

function Polyline() {
    THREE.Group.call(this);
    this.type = 'Polyline';
    this.points = [];
    this.isClosed = false;

    this.config = {
        pointStyle: {
            color: 0x0000ff,
            size: 0.002,
        },
        lineSegmentStyle: {
            color: 0xff0000,
            linewidth: 0.002,
        }
    }
}

Polyline.prototype = Object.assign(Object.create(THREE.Group.prototype), {
    constructor: Polyline,
    isPolyline: true,

    // config: {pointStyle, lineSegmentStyle}
    addPoint: function (pt3, config = this.config) {
        if (this.isClosed == false) {
            // point marker
            let markerGeo = new THREE.SphereBufferGeometry(config.pointStyle.size, 32, 32);
            let markerMat = new THREE.MeshBasicMaterial({
                color: config.pointStyle.color,
            });
            let marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(pt3.x, pt3.y, pt3.z);
            this.add(marker);
            // line
            let numPt = this.points.length;
            if (numPt > 0) {
                let lastPt = this.points[numPt - 1];
                let line = this.createLine(lastPt, pt3, config);
                this.add(line);
            }
            this.points.push(pt3);
        }
    },
    createLine: function (pt1, pt2, config = this.config) {
        let linePos = [pt1.x, pt1.y, pt1.z, pt2.x, pt2.y, pt2.z];
        let lineGeo = new EXTRA.LineGeometry();
        lineGeo.setPositions(linePos);
        let lineMat = new EXTRA.LineMaterial({
            color: config.lineSegmentStyle.color,
            linewidth: config.lineSegmentStyle.linewidth,
            dashed: false
        });
        let line = new THREE.Mesh(lineGeo, lineMat);
        return line;
    },
    deleteFirstPoint: function () {
        this.remove(this.children[0]);
        this.remove(this.children[1]);
        this.points.shift();
    },
    deleteLastPoint: function () {
        let numPt = this.children.length;
        this.remove(this.children[numPt - 1]);
        this.remove(this.children[numPt - 2]);
        if (this.isClosed == true) {
            this.remove(this.children[numPt - 3]);
            this.isClosed = false;
        }
        this.points.pop();
    },
    clear: function() {
        if(this.children.length > 0) {
            let numObj = this.children.length;
            for (let i = 0; i < numObj; i++) {
                this.remove(this.children[0]);
            }
            this.points = [];
            this.isClosed = false;
        }
    },
    closePath: function (config = this.config) {
        if (this.isClosed == false && this.points.length>1) {
            let numPt = this.points.length;
            let lastPt = this.points[numPt - 1];
            let firstPt = this.points[0];
            let line = this.createLine(lastPt, firstPt, config);
            this.add(line);
            this.isClosed = true;
        }
    },
});

export {Polyline};
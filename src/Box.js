import {BaseObject} from "./BaseObject.js";
import * as THREE from "../thirdParty/build/three.module.js";

function Box(name, center, size, colour = 0xffff00) {
    BaseObject.call(this);
    this.name = name;
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    var geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry( geometry )
    var mat = new THREE.LineBasicMaterial({ color: colour, linewidth: 2 });
    var wireframe = new THREE.LineSegments(geo, mat);
    this.position.copy(center);
    this.add(wireframe);
}

Box.prototype = Object.assign(Object.create(BaseObject.prototype), {
    constructor: Box,
    isBox: true


});
export {Box};
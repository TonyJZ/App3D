/**
 * @author mattatz / http://github.com/mattatz
 *
 * Ray tracing based real-time procedural volumetric fire object for three.js
 */
import {BaseObject} from "./BaseObject.js";
import {FireMesh} from "./FireShader.js";

function Fire(fireTex, color) {
    BaseObject.call(this);
    this.type = "Fire";
    var mesh = new FireMesh(fireTex, color);
    BaseObject.prototype.add.call(this, mesh);
    // this.fires = [];
    this.fires.push(mesh);

}
Fire.prototype = Object.assign(Object.create(BaseObject.prototype), {

    constructor: Fire,
    isFire: true,
});

export { Fire };

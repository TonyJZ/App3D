import * as THREE from "../../thirdParty/build/three.module.js";
import { ShaderEffect } from "../ShaderEffect.js";
import { flowingLineEffect_uniforms_pipe } from "./flowingLine_uniforms_pipe.js";
import flowingLineEffect_fragment_pipe from "./flowingLine_fragment_pipe.glsl";
import flowingLineEffect_vertex_pipe from "./flowingLine_vertex_pipe.glsl";
import { BaseObject } from "../BaseObject.js";
import { Animation } from "../Animation.js";
/*
##initial parameter
    parameters = {
        meshName: line.name, // will involoved into effect Animation ID.
        restore: false, // trigger to display or remove effect
        closed: false, // setup the route to be a close or open
        direction: 0.0 / 1.0 // set the motion direction
        path: line.routeArray[0].route, // read the path information from route.js
        shaderStyle: lineStyles[line.name], // read the effect style information from route.js
        style: line.routeArray[0].segStyle, // read the route style information from route.js
    };
##update parameter
    parameters = {
        direction: 0.0 / 1.0 // set the motion direction
        headLength: 0.2, // adjust the head length (part that will not fading)
        tailLength: 0.5, // adjust the tail length (part that will fading)
        headPosition: 0.0, // adjust initial head position or
        maxAcc: 0.9, // setup the maximin acc, when be 0.9, the maxspeed will be 1.9. and minspeed will be 0.1
        duration: 2.0, // number of second to run 1 loop of animation if maxAcc = 0. if maxAcc is not 0, will still define the basic speed.
        glowColor: 0xff0000, // color of flow
    };
##attention
1) The sum of headLength and tailLength must be smalle than 1.0;
2) If the geometry of pipe is a close loop. The material will also be a close loop. Means that "closed" has higher priority than "circle"
*/
function FlowingLineEffectPipe(parameters) {
    ShaderEffect.call(this);
    this.type = "FlowingLineEffectPipe";
    let vertShader = flowingLineEffect_vertex_pipe;
    let fragShader = flowingLineEffect_fragment_pipe;
    this.duration = null;
    this.uniforms = {};
    if (parameters.style.close === true) {
        parameters.shaderStyle.circle = 1.0;
    }
    for (let key in flowingLineEffect_uniforms_pipe) {
        this.uniforms[key] = Object.assign({}, flowingLineEffect_uniforms_pipe[key]);
    }
    let uniforms = this.uniforms;
    for (let key in uniforms) {
        uniforms[key].value = parameters.shaderStyle[key] === undefined ? uniforms[key].value : parameters.shaderStyle[key];
    }
    for (let key in uniforms) {
        if (key === "glowColor" && parameters.shaderStyle.glowColor != undefined) {
            uniforms.glowColor.value = new THREE.Color(parameters.shaderStyle.glowColor);
        } else {
            uniforms[key].value = parameters.shaderStyle[key] === undefined ? uniforms[key].value : parameters.shaderStyle[key];
        }
    }
    parameters.layers = parameters.layers === undefined  ? 0 : parameters.layers;
    let material = new THREE.ShaderMaterial({
        // color: 0x0000ff,
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        side: THREE.FrontSide
    });
    this.baseObject = new BaseObject();
    let path = [];
    for (let k = 0; k < parameters.path.length; ++k) {
        let temp = parameters.path[k][1];
        parameters.path[k][1] = parameters.path[k][2];
        parameters.path[k][2] = temp;
        path.push({x: parameters.path[k][0], y: parameters.path[k][1], z: parameters.path[k][2]});
    }
    let pipeconfig = parameters.style;
    let spline = new THREE.CurvePath();
    for (let m = 0; m < path.length - 1; ++m) {
        spline.add(new THREE.LineCurve3(path[m], path[m + 1]));
    }
    let geo = new THREE.TubeBufferGeometry(spline, pipeconfig.tubularSegments, pipeconfig.radius, pipeconfig.radialSegments, pipeconfig.close);
    let mesh = new THREE.Mesh(geo, material);
    mesh.layers.set(parameters.layers);
    this.baseObject.add(mesh);
    this.baseObject.name = parameters.meshName;
    let animation = new Animation(parameters.meshName + "_updateTime", updateTime, [uniforms]);
    this.baseObject.animations.addWithReplace(animation);

    function updateTime(uniforms, delta) {
        if (uniforms.direction.value === 1.0) {
            uniforms.headPosition.value += (1 / uniforms.duration.value) * delta * (1 + uniforms.maxAcc.value * Math.sin(Math.PI * 2 * (1 / uniforms.accPeriod.value) * uniforms.headPosition.value));
        } else {
            uniforms.headPosition.value -= (1 / uniforms.duration.value) * delta * (1 + uniforms.maxAcc.value * Math.sin(Math.PI * 2 * (1 / uniforms.accPeriod.value) * uniforms.headPosition.value));
        }
    }
}

FlowingLineEffectPipe.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: FlowingLineEffectPipe,
    isFlowingLineEffectPipe: true,
    updateParameters: function(parameters) {
        for (let key in this.uniforms) {
            if (key === "glowColor" && parameters.glowColor != undefined) {
                this.uniforms.glowColor.value = new THREE.Color(parameters.glowColor);
            } else {
                this.uniforms[key].value = parameters[key] === undefined ? this.uniforms[key].value : parameters[key];
            }

        }
    },
});

export { FlowingLineEffectPipe };
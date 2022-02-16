export let flowingLineEffect_uniforms_pipe = {
    meshName: {value: null},
    headPosition: { type: "f", value: 1.0 },
    glowColor: {type: "vec3", value: {r: 1.0, g: 1.0, b: 0.0}},
    headLength: {type: "f", value: 0.002},
    tailLength: {type: "f", value: 0.04},
    duration: {type: "f", value: 0.05},
    accPeriod: {type: "f", value: 1.0},
    maxAcc: {type: "f", value: 0.0},
    direction: {type: "f", value: 1.0},
    circle: {type: "f", value: 0.0},
};
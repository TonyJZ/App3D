export let rippleEffect_uniforms = {
    object: { value: null },
    meshName: { value: null },
    time: { type: "f", value: 0.0 },
    rippleColor: { type: "vec3", value: { r: 1, g: 0, b: 0 } },
    duration: { type: "f", value: 1.0 },
    rippleCenter: { type: "vec2", value: { x: 0.0, y: 0.0 } },
};
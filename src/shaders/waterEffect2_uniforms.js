export let waterEffect2_uniforms = {
    object: { value: null },
    meshName: { value: null },
    time: { type: "f", value: 0.0 },
    duration: { type: "f", value: 1.0 },
    isalpha: { type: "bool", value: true },
    waveWidth: { type: "f", value: 100.0 },
    waveHeight: { type: "f", value: 0.1 },
    color: { type: "vec3", value: { r: 0.643, g: 0.965, b: 1.0 } },
    contrast: { type: "f", value: 1.0 },
};
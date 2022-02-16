export let snow_uniforms = {
    time: { type: "f", value: 1.0 },
    color: { type: "vec3", value: {r: 1.0, g: 1.0, b: 1.0} },
    texture: { type: "sampler2D", value: null },
    range: { type: "vec3", value: {x: 0.0, y: 0.0, z: 0.0} },
    wind: { type: "f", value: 0.0 },
    windDirection: { type: "vec3", value: {x: 0.0, y: 0.0, z: 0.0} },
};
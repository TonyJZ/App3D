export let heatmapEffect_uniforms = {
    object: { value: null },
    meshName: { value: null },
    time: { type: "f", value: 0.0 },
    values: { type: "fv1", value: [0.0] },
    locations: { type: "v3v", value: [{ x: 0.0, y: 0.0, z: 0.0 }] },
    power: { type: "f", value: 2.0 },
    tMap: { type: "t", value: null }
};
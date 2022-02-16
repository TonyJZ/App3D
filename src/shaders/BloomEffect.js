import { ShaderEffect } from "../ShaderEffect.js";

function BloomEffect(parameters) {
    ShaderEffect.call(this);
    this.type = "BloomEffect";
    this.object = parameters.object;
    this.object.traverse((child) => {
        if (child.isMesh) {
            child.material.onBeforeCompile = function(shader) {
                shader.uniforms.alpha = {type: "f", value: 0.5};
                shader.fragmentShader = `
                        uniform float alpha;
                        ${shader.fragmentShader}
                    `;
                // add the rest of the shader codes at the bottom of the code
                shader.fragmentShader = shader.fragmentShader.replace(
                    "#include <uv_pars_fragment>", `
                        varying vec2 vUv;
                    `);
                shader.fragmentShader = shader.fragmentShader.replace(
                    /}$/gm, `
                        gl_FragColor = vec4(gl_FragColor.rgb, 0.5);
                            
                    }`);
                shader.vertexShader = shader.vertexShader.replace(
                    "#include <uv_pars_vertex>", `
                        varying vec2 vUv;
                        uniform mat3 uvTransform;
                    `);
                shader.vertexShader = shader.vertexShader.replace(
                    "#include <uv_vertex>", `
                        vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
                    `);
            };
        }
    });
}

BloomEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: BloomEffect,

});

export { BloomEffect };
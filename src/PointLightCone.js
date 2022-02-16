import * as THREE from "../thirdParty/build/three.module.js";

function PointLightCone(scene, color, power, transparent, lightPosition, angle) {

    let spotLight = new THREE.SpotLight(color);
    spotLight.penumbra = 1.0;
    spotLight.power = power;
    spotLight.angle = angle;
    spotLight.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
    spotLight.castShadow = true;
    scene.add(spotLight);

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
    spotLight.shadow.camera.rotation.set(-Math.PI / 2, 0, 0);
    spotLight.shadow.camera.updateMatrix();
    spotLight.shadow.camera.updateMatrixWorld();

    // var helper = new THREE.CameraHelper( spotLight.shadow.camera );
    // scene.add( helper );

    var geometry = new THREE.ConeGeometry(lightPosition.y * Math.tan(angle), lightPosition.y, 32);
    geometry.openEnded = true;
    var material = new THREE.MeshBasicMaterial({color: color, transparent: true});
    var cone = new THREE.Mesh(geometry, material);
    cone.position.set(0, lightPosition.y / 2, 0);
    scene.add(cone);
    cone.material.onBeforeCompile = function(shader) {
        shader.uniforms.alpha = {type: "f", value: transparent};
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
                        gl_FragColor = vec4(gl_FragColor.rgb, alpha);
                            
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

PointLightCone.prototype = Object.assign(Object.create(PointLightCone.prototype), {

});

export { PointLightCone };
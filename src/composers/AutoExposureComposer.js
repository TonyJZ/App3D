import * as EXTRA from "../../thirdParty/build/extra.module.js";
import * as THREE from "../../thirdParty/build/three.module.js";
import { Animation } from "../Animation.js";

function AutoExposureComposer(parameters) {
    EXTRA.EffectComposer.call(this, parameters.renderer, parameters.renderTarget);

    this.type = "AutoExposureComposer";
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.ratio = window.innerWidth / window.innerHeight;
    this.position = new THREE.Vector3(parameters.position.x, parameters.position.y, parameters.position.z);
    this.direction = new THREE.Vector3(parameters.direction.x, parameters.direction.y, parameters.direction.z);
    this.direction.normalize();
    this.color = parameters.color;
    this.helper = parameters.helper || false;
    this.criticalAngle = parameters.criticalAngle || 0.75;
    this.criticalDistance = parameters.criticalDistance * 2 || 0.8;
    this.armAmount = parameters.armAmount || 2.0;
    this.armRotationSpeed = parameters.armRotationSpeed || 0.0;
    this.armMaxBrightness = parameters.armMaxBrightness || 0.84;
    this.armVerticalDistribute = parameters.armVerticalDistribute || 1.0;
    this.pointSize = parameters.pointSize || 0.03;
    this.pointMaxBrightness = parameters.pointMaxBrightness || 0.84;
    this.pointDistance12 = parameters.pointDistance12 || 1.3;
    this.pointDistance13 = parameters.pointDistance13 || 1.6;
    this.centerSize = parameters.centerSize || 0.15;
    this.centerMaxBrightness = parameters.centerMaxBrightness || 3.5;

    let renderPass = new EXTRA.RenderPass(this.scene, this.camera);
    let exposureArmShader = {
        uniforms: {
            tDiffuse: { value: null },
            color: { value: this.color },
            exposure: { value: 0.0 },
            angle: { value: 0.0 },
            distance: { value: 0.0 },
            positionX: { value: 0.0 },
            positionY: { value: 0.0 },
            centerX: { value: 0.5 },
            centerY: { value: 0.5 },
            time: { value: 0.0 },
            criticalAngle: { value: this.criticalAngle },
            armAmount: { value: this.armAmount },
            armRotationSpeed: { value: this.armRotationSpeed },
            armMaxBrightness: { value: this.armMaxBrightness },
            armVerticalDistribute: { value: this.armVerticalDistribute },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform sampler2D tDiffuse;
            uniform float exposure;
            uniform float angle;
            uniform float distance;
            uniform float positionX;
            uniform float positionY;
            uniform float centerX;
            uniform float centerY;
            uniform float time;
            uniform float criticalAngle;
            uniform float armAmount;
            uniform float armRotationSpeed;
            uniform float armMaxBrightness;
            uniform float armVerticalDistribute;

            varying vec2 vUv;

            float trans = armMaxBrightness * (angle - criticalAngle * 3.1415926535);
            float angleToX = 0.0;
            
            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                float distanceC = sqrt((vUv.x - centerX) * (vUv.x - centerX) + (vUv.y - centerY) * (vUv.y - centerY));
                if( vUv.x >= centerX && vUv.y >= centerY) {
                    angleToX = asin((vUv.y - centerY) / distanceC);
                }
                if( vUv.x < centerX && vUv.y >= centerY) {
                    angleToX = 3.1415926535 / 2.0 + asin((centerX - vUv.x) / distanceC);
                }
                if( vUv.x < centerX && vUv.y < centerY) {
                    angleToX = 3.1415926535 + asin((centerY - vUv.y) / distanceC);
                }
                if( vUv.x >= centerX && vUv.y < centerY) {
                    angleToX = 3.1415926535 * 3.0 / 2.0 + asin((vUv.x - centerX) / distanceC);
                }

                trans *= 1.5 - abs(armVerticalDistribute * sin(armAmount * angleToX + 3.1415926 * fract(time * armRotationSpeed)));
                trans *= abs(distanceC - 1.414) / 1.414;

                if(exposure == 1.0) {
                    float r = (1.0 - trans) * previousPassColor.r + trans * color.r;
                    float g = (1.0 - trans) * previousPassColor.g + trans * color.g;
                    float b = (1.0 - trans) * previousPassColor.b + trans * color.b;
                    gl_FragColor = vec4(r, g, b, previousPassColor.a);
                } 
                else {
                    gl_FragColor = previousPassColor;
                }
                
            }
        `,
    };
    let exposurePointShader = {
        uniforms: {
            tDiffuse: { value: null },
            color: { value: this.color },
            exposure: { value: 0.0 },
            distance: { value: 0.0 },
            angle: { value: 0.0 },
            positionX: { value: 0.0 },
            positionY: { value: 0.0 },
            centerX: { value: 0.5 },
            centerY: { value: 0.5 },
            ratio: { value: this.ratio},
            criticalAngle: { value: this.criticalAngle },
            pointSize: { value: this.pointSize },
            pointMaxBrightness: { value: this.pointMaxBrightness },
            pointDistance12: { value: this.pointDistance12 },
            pointDistance13: { value: this.pointDistance13 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform sampler2D tDiffuse;
            uniform float exposure;
            uniform float distance;
            uniform float angle;
            uniform float positionX;
            uniform float positionY;
            uniform float centerX;
            uniform float centerY;
            uniform float ratio;
            uniform float criticalAngle;
            uniform float pointSize;
            uniform float pointMaxBrightness;
            uniform float pointDistance12;
            uniform float pointDistance13;

            varying vec2 vUv;      

            float size = pointSize * 100.0 / distance;
            float trans = pointMaxBrightness * (angle - criticalAngle * 3.1415926535);

            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                vec2 position1 = vec2(positionX, positionY);
                vec2 position2 = vec2(centerX, centerY) + pointDistance12 * (position1 - vec2(centerX, centerY));
                vec2 position3 = vec2(centerX, centerY) + pointDistance13 * (position1 - vec2(centerX, centerY));

                float distanceX1 = vUv.x - position1.x;
                float distanceY1 = (vUv.y - position1.y) / ratio;
                float distanceC1 = sqrt(distanceX1 * distanceX1 + distanceY1 * distanceY1);
                
                float distanceX2 = vUv.x - position2.x;
                float distanceY2 = (vUv.y - position2.y) / ratio;
                float distanceC2 = sqrt(distanceX2 * distanceX2 + distanceY2 * distanceY2);
                
                float distanceX3 = vUv.x - position3.x;
                float distanceY3 = (vUv.y - position3.y) / ratio;
                float distanceC3 = sqrt(distanceX3 * distanceX3 + distanceY3 * distanceY3);

                if(exposure == 1.0 && abs(distanceX1) < size && abs(distanceY1) < size && distanceC1 < size) {
                    float trans1 = trans * (size - distanceC1) / size;
                    float r = (1.0 - trans1) * previousPassColor.r + trans1 * color.r;
                    float g = (1.0 - trans1) * previousPassColor.g + trans1 * color.g;
                    float b = (1.0 - trans1) * previousPassColor.b + trans1 * color.b;
                    gl_FragColor = vec4(r, g, b, previousPassColor.a);
                } 
                else if(exposure == 1.0 && abs(distanceX2) < size && abs(distanceY2) < size && distanceC2 < size) {
                    float trans2 = trans * (size - distanceC2) / size;
                    float r = (1.0 - trans2) * previousPassColor.r + trans2 * color.r;
                    float g = (1.0 - trans2) * previousPassColor.g + trans2 * color.g;
                    float b = (1.0 - trans2) * previousPassColor.b + trans2 * color.b;
                    gl_FragColor = vec4(r, g, b, previousPassColor.a);
                } 
                else if(exposure == 1.0 && abs(distanceX3) < size && abs(distanceY3) < size && distanceC3 < size) {
                    float trans3 = trans * (size - distanceC3) / size;
                    float r = (1.0 - trans3) * previousPassColor.r + trans3 * color.r;
                    float g = (1.0 - trans3) * previousPassColor.g + trans3 * color.g;
                    float b = (1.0 - trans3) * previousPassColor.b + trans3 * color.b;
                    gl_FragColor = vec4(r, g, b, previousPassColor.a);
                } 
                else {
                    gl_FragColor = previousPassColor;
                }
            }
        `,
    };
    let exposureCenterShader = {
        uniforms: {
            tDiffuse: { value: null },
            color: { value: this.color },
            exposure: { value: 0.0 },
            distance: { value: 0.0 },
            angle: { value: 0.0 },
            centerX: { value: 0.5 },
            centerY: { value: 0.5 },
            ratio: { value: this.ratio},
            criticalAngle: { value: this.criticalAngle },
            centerSize: { value: this.centerSize },
            centerMaxBrightness: { value: this.centerMaxBrightness },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform sampler2D tDiffuse;
            uniform float exposure;
            uniform float distance;
            uniform float angle;
            uniform float centerX;
            uniform float centerY;
            uniform float ratio;
            uniform float criticalAngle;
            uniform float centerSize;
            uniform float centerMaxBrightness;

            varying vec2 vUv;
            
            float size = centerSize * 100.0 / distance;
            float trans = centerMaxBrightness * (angle - criticalAngle * 3.1415926535);
            float angleToX = 0.0;

            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                float distanceX = vUv.x - centerX;
                float distanceY = (vUv.y - centerY) / ratio;
                float distanceC = sqrt(distanceX * distanceX + distanceY * distanceY);
                trans *= (size - distanceC) / size;
                if(exposure == 1.0 && abs(distanceX) < size && abs(distanceY) < size && distanceC < size) {
                    float r = (1.0 - trans) * previousPassColor.r + trans * color.r;
                    float g = (1.0 - trans) * previousPassColor.g + trans * color.g;
                    float b = (1.0 - trans) * previousPassColor.b + trans * color.b;
                    gl_FragColor = vec4(r, g, b, previousPassColor.a);
                } else {
                    gl_FragColor = previousPassColor;
                }
            }
        `,
    };
    let vignetteShader = {
        uniforms: {
            tDiffuse: { value: null },
            range: { value: 1.5 },
            level: { value: 0.02 },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float range;
            uniform float level;

            varying vec2 vUv;
            
            void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);
                float distance = sqrt((vUv.x - 0.5) * (vUv.x - 0.5) + (vUv.y - 0.5) * (vUv.y - 0.5));
                float d = max(0.0, distance - range);
                float v = level * d * d;
                float h = level * d * d;

                vec4 sum = vec4(0.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * (0.051/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * (0.1633/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * (0.051/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * (0.051/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * (0.1633/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * (0.1531/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * (0.12245/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * (0.0918/2.0);
                sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * (0.051/2.0);

                gl_FragColor = sum;

            }
        `,
    };

    this.exposureArmPass = new EXTRA.ShaderPass(exposureArmShader);
    this.exposurePointPass = new EXTRA.ShaderPass(exposurePointShader);
    this.exposureCenterPass = new EXTRA.ShaderPass(exposureCenterShader);
    this.vignettePass = new EXTRA.ShaderPass(vignetteShader);
    this.addPass(renderPass);
    this.addPass(this.exposureArmPass);
    this.addPass(this.exposurePointPass);
    this.addPass(this.exposureCenterPass);
    this.addPass(this.vignettePass);

    if (parameters.helper) {
        let geo = new THREE.SphereGeometry(0.4, 32, 32);
        let mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        let mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.scene.add(mesh);
        let positions = [this.position.x, this.position.y, this.position.z, this.position.x + this.direction.x * 5, this.position.y + this.direction.y * 5, this.position.z + this.direction.z * 5];
        let geometry = new EXTRA.LineGeometry();
        geometry.setPositions(positions);
        let material = new EXTRA.LineMaterial({
            linewidth: 0.005,
            vertexColors: THREE.VertexColors,
            dashed: false
        });
        let line = new THREE.Mesh(geometry, material);
        this.scene.add(line);
    }

    let animation = new Animation("autoExp", checkDirection, [this, this.direction, this.camera]);
    this.scene.animations.addWithReplace(animation);

    var projectPoint, positionX, positionY, centerX, centerY, updateParameters;
    var time = 0.0;
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;

    function checkDirection(composer, direction, camera, delta) {
        time += delta;
        camera.updateMatrix();
        camera.updateMatrixWorld();
        projectPoint = composer.position.clone().project(camera);
        centerX = (projectPoint.x * halfWidth + halfWidth) / window.innerWidth;
        centerY = 1 - (-projectPoint.y * halfHeight + halfHeight) / window.innerHeight;

        let angle = Math.acos(direction.dot(camera.getLookAtVector()));
        let distance = Math.sqrt(Math.pow(camera.position.x - composer.position.x, 2) + Math.pow(camera.position.y - composer.position.y, 2) + Math.pow(camera.position.z - composer.position.z, 2));
        if (angle > Math.PI * composer.criticalAngle && projectPoint.x > -composer.criticalDistance && projectPoint.x < composer.criticalDistance && projectPoint.y > -composer.criticalDistance && projectPoint.y < composer.criticalDistance) {
            positionX = (centerX + 0.5) / 2;
            positionY = (centerY + 0.5) / 2;
            updateParameters = {
                exposure: 1.0,
                angle: angle,
                distance: distance,
                positionX: positionX,
                positionY: positionY,
                centerX: centerX,
                centerY: centerY,
                time: time
            };
            update(composer, updateParameters);
        } else {
            updateParameters = {
                exposure: 0.0,
                angle: angle,
                distance: distance,
                positionX: positionX,
                positionY: positionY,
                centerX: centerX,
                centerY: centerY,
                time: time
            };
            update(composer, updateParameters);
        }
    }

    function update(composer, updateParameters) {
        composer.exposureArmPass.uniforms.exposure.value = updateParameters.exposure;
        composer.exposureArmPass.uniforms.angle.value = updateParameters.angle;
        composer.exposureArmPass.uniforms.distance.value = updateParameters.distance;
        composer.exposureArmPass.uniforms.positionX.value = updateParameters.positionX;
        composer.exposureArmPass.uniforms.positionY.value = updateParameters.positionY;
        composer.exposureArmPass.uniforms.centerX.value = updateParameters.centerX;
        composer.exposureArmPass.uniforms.centerY.value = updateParameters.centerY;
        composer.exposureArmPass.uniforms.time.value = updateParameters.time;
        composer.exposurePointPass.uniforms.exposure.value = updateParameters.exposure;
        composer.exposurePointPass.uniforms.distance.value = updateParameters.distance;
        composer.exposurePointPass.uniforms.angle.value = updateParameters.angle;
        composer.exposurePointPass.uniforms.positionX.value = updateParameters.positionX;
        composer.exposurePointPass.uniforms.positionY.value = updateParameters.positionY;
        composer.exposurePointPass.uniforms.centerX.value = updateParameters.centerX;
        composer.exposurePointPass.uniforms.centerY.value = updateParameters.centerY;
        composer.exposureCenterPass.uniforms.exposure.value = updateParameters.exposure;
        composer.exposureCenterPass.uniforms.angle.value = updateParameters.angle;
        composer.exposureCenterPass.uniforms.distance.value = updateParameters.distance;
        composer.exposureCenterPass.uniforms.centerX.value = updateParameters.centerX;
        composer.exposureCenterPass.uniforms.centerY.value = updateParameters.centerY;
        if (updateParameters.exposure === 1.0) {
            composer.vignettePass.uniforms.range.value = 0.0;
            composer.vignettePass.uniforms.level.value = 0.01 * updateParameters.angle / Math.PI;
        } else {
            composer.vignettePass.uniforms.range.value = 1.5;
        }
    }
}

AutoExposureComposer.prototype = Object.assign(Object.create(EXTRA.EffectComposer.prototype), {
    constructor: AutoExposureComposer,
    isAutoExposureComposer: true,
});

export { AutoExposureComposer };
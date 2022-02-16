/**
 * @author Toukir Imam toukir@appropolis.com
 *
 */
import {Pass} from "../thirdParty/build/extra.module.js";
import * as THREE from "../thirdParty/build/three.module.js";
let DepthPeelRenderPass = function(renderer, scene, camera, numLayers = 3) {
    // Check if the depth extension is available, if not, return false
    if (!renderer.extensions.get("WEBGL_depth_texture")) {
        console.error("DepthPeelRenderPass: DepthPeelRenderPass needs WEBGL_depth_texture extension to work");
        return null;
    }

    Pass.call(this);

    this.scene = scene;
    this.camera = camera;

    this.numLayers = numLayers;

    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;

    this.peelUniforms = {
        isFrontLayer: {value: 0},
        tDepthFront:   {value: null},
        tDepthBack:    {value: null},
        screenSize:    {value: new THREE.Vector2(0, 0)}
    };
    this.drawBuffersize = renderer.getDrawingBufferSize();

    this.setUpTargets();
    this.setUpQuadScene();

};

DepthPeelRenderPass.prototype = Object.assign(Object.create(Pass.prototype), {

    constructor: DepthPeelRenderPass,
    isDepthPeelRenderPass: true,

    setSize: function(width, height) {
        this.drawBuffersize.width = width;
        this.drawBuffersize.height = height;
        this.setUpTargets();
    },
    dispose: function() {
        this.opaqueTarget.dispose();
        this.transparentTargets.forEach((target) => {
            target.dispose();
        });
        this.removePeelShaderBeforeCompile();
    },
    disable: function() {
        this.removePeelShaderBeforeCompile();
    },
    setNumLayers: function(numLayers) {
        this.numLayers = numLayers;
        this.setUpTargets();
        this.setUpQuadScene();
    },
    getNumLayers: function() {
        return this.numLayers;
    },
    setUpTargets: function() {
        let opaqueTarget = new THREE.WebGLRenderTarget(this.drawBuffersize.width, this.drawBuffersize.height);
        opaqueTarget.texture.format = THREE.RGBFormat;
        opaqueTarget.stencilBuffer = false;
        opaqueTarget.depthBuffer = true;
        opaqueTarget.depthTexture = new THREE.DepthTexture();
        opaqueTarget.depthTexture.type = THREE.UnsignedShortType;
        this.opaqueTarget = opaqueTarget;

        this.transparentTargets = [];
        for (let i  = 0; i < this.numLayers; i++) {
            let target  = new THREE.WebGLRenderTarget(this.drawBuffersize.width, this.drawBuffersize.height);
            target.texture.format = THREE.RGBAFormat;
            target.texture.type = THREE.UnsignedByteType;
            target.stencilBuffer = false;
            target.depthBuffer = true;
            target.depthTexture = new THREE.DepthTexture();
            target.depthTexture.type = THREE.UnsignedShortType;
            this.transparentTargets.push(target);
        }
    },
    setUpQuadScene: function() {
        this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quadMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tBackDiffuse:   { type: "t", value: null},
                tLDiffuses:     { type: "tv", value: null}
            },
            vertexShader: `
				varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,

            fragmentShader: `
			#include <packing>

			varying vec2 vUv;
			uniform sampler2D tBackDiffuse;
			uniform sampler2D tLDiffuses[${this.numLayers}];


			void main() {
				vec3 bDiffuse = texture2D( tBackDiffuse, vUv ).rgb;
				
				//gl_FragColor.rgb = diffuse * (1.0 - alpha1) *(1.0 -alpha2) * (1.0 -alpha3) +
				//	diffuse3 * alpha3 * (1.0 - alpha1) *(1.0 - alpha2) +
				//	diffuse2 * alpha2 * (1.0 - alpha1) +
				//	diffuse1 * alpha1 ; //leave this comment here

				vec3 tempDiffuse;
				vec3 transDiffuse;
				transDiffuse = vec3(0,0,0);
				for (int i = 0; i < ${this.numLayers}; i ++){
					tempDiffuse = texture2D( tLDiffuses[i], vUv ).rgb * texture2D(tLDiffuses[i], vUv).a;
					bDiffuse *= (1.0 - texture2D(tLDiffuses[i], vUv).a );
					for (int j = 0 ; j < ${this.numLayers}; j++ ){
						if(j == i)
							break;
						tempDiffuse *=  (1.0 - texture2D(tLDiffuses[j], vUv).a);		
					}	 
					transDiffuse += tempDiffuse;	
				}
				gl_FragColor.rgb = bDiffuse + transDiffuse;
				gl_FragColor.a = 1.0;
			}`,

            transparent: true,
            blending: THREE.NoBlending,
            needsUpdate: true
        });
        let quadPlane = new THREE.PlaneBufferGeometry(2, 2);
        this.quadMaterial.transparent = true;
        let quadMesh = new THREE.Mesh(quadPlane, this.quadMaterial);
        this.quadScene = new THREE.Scene();
        this.quadScene.add(quadMesh);
    },
    setOpaqueVisible: function() {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    let isTransparent = false;
                    for (let i = 0; i < object.material.length; i++) {
                        if (object.material[i].transparent) {
                            isTransparent = true;
                            break;
                        }
                    }
                    if (isTransparent) {
                        object.depthPeelOldVisibility = object.visible;
                        object.visible = false;
                    }
                } else if (object.material.transparent) {
                    object.depthPeelOldVisibility = object.visible;
                    object.visible = false;
                }
            }
        });
    },
    setTransparentVisible: function() {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    let isTransparent = false;
                    for (let i = 0; i < object.material.length; i++) {
                        if (object.material[i].transparent) {
                            isTransparent = true;
                            break;
                        }
                    }
                    if (isTransparent) {
                        // if transparent restore visibility
                        object.visible = object.depthPeelOldVisibility;
                    } else {
                        // if opaque invisible
                        object.depthPeelOldVisibility = object.visible;
                        object.visible = false;
                    }
                } else if (object.material.transparent) {
                    object.visible = object.depthPeelOldVisibility;
                } else {
                    object.depthPeelOldVisibility = object.visible;
                    object.visible = false;
                }
            }
        });
    },
    restoreOpaqueVisibility: function() {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    let isTransparent = false;
                    for (let i = 0; i < object.material.length; i++) {
                        if (object.material[i].transparent) {
                            isTransparent = true;
                            break;
                        }
                    }
                    if (!isTransparent) {
                        // if opaque restore visibility
                        object.visible = object.depthPeelOldVisibility;
                    }
                } else if (!(object.material.transparent)) {
                    object.visible = object.depthPeelOldVisibility;
                }
            }
        });
    },
    removePeelShaderBeforeCompile: function() {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    for (let i = 0; i < object.material.length; i++) {
                        if (object.material[i].transparent) {
                            if (object.material[i].hasPeelShader) {
                                object.material[i].onBeforeCompile = () => {};
                                object.material[i].hasPeelShader = undefined;
                                object.material[i].needsUpdate = true;
                                object.material[i].blending = object.material[i].oldBlending;
                            }
                        }
                    }
                } else if (object.material.transparent) {
                    if (object.material.hasPeelShader) {
                        object.material.onBeforeCompile = () => {};
                        object.material.hasPeelShader = undefined;
                        object.material.needsUpdate = true;
                        object.material.blending = object.material.oldBlending;
                    }
                }
            }
        });
    },
    peelShaderBeforeCompile: function(shader) {
        shader.uniforms.tDepthFront = this.peelUniforms.tDepthFront;
        shader.uniforms.tDepthBack = this.peelUniforms.tDepthBack;
        shader.uniforms.screenSize = this.peelUniforms.screenSize;
        shader.uniforms.isFrontLayer = this.peelUniforms.isFrontLayer;
        shader.fragmentShader = `
			uniform sampler2D tDepthFront;
			uniform sampler2D tDepthBack;
			uniform vec2 screenSize;
			uniform int isFrontLayer;
			${shader.fragmentShader}
		`;
        // peel depth
        shader.fragmentShader = shader.fragmentShader.replace(
            /}$/gm,
            `	vec2 depthCoord = gl_FragCoord.xy * screenSize;
				float oldBackDepth = texture2D(tDepthBack, depthCoord).x;
				if (isFrontLayer == 1){
					if (gl_FragCoord.z > oldBackDepth){
						discard;
					}
				} else{
					float oldFrontDepth = texture2D(tDepthFront, depthCoord).x;
					if(gl_FragCoord.z > oldBackDepth || gl_FragCoord.z <= oldFrontDepth ){
						discard;
					} 
				}
		    }
			`
        );
    },

    setPeelShaderBeforeCompile: function() {
        let scope = this;
        this.scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    for (let i = 0; i < object.material.length; i++) {
                        if (object.material[i].transparent) {
                            if (object.material[i].hasPeelShader === undefined) {
                                console.warn("DepthPeelRenderPass: overwriting onBeforeCompile of mesh");
                                object.material[i].onBeforeCompile = scope.peelShaderBeforeCompile.bind(scope);
                                object.material[i].hasPeelShader = true;
                                object.material[i].needsUpdate = true;
                                object.material[i].oldBlending = object.material.blending;
                                object.material[i].blending = THREE.NoBlending;
                            }
                        }
                    }
                } else if (object.material.transparent) {
                    if (object.material.hasPeelShader === undefined) {
                        console.warn("DepthPeelRenderPass: overwriting onBeforeCompile of mesh");
                        object.material.onBeforeCompile = scope.peelShaderBeforeCompile.bind(scope);
                        object.material.hasPeelShader = true;
                        object.material.needsUpdate = true;
                        object.material.oldBlending = object.material.blending;
                        object.material.blending = THREE.NoBlending;
                    }
                }
            }

        });

    },
    depthPeelRender: function(renderer, readBuffer) {
        // ---- Draw the opaque meshes
        let oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;
        renderer.setRenderTarget(this.opaqueTarget);
        renderer.clear();
        this.setOpaqueVisible();
        renderer.render(this.scene, this.camera, this.opaqueTarget);

        // ---- Draw the transparent layers
        this.setTransparentVisible();
        this.setPeelShaderBeforeCompile();

        // Set the screenSize
        this.peelUniforms.screenSize.value.set(1 / (renderer.getDrawingBufferSize().width), 1 / (renderer.getDrawingBufferSize().height));
        this.peelUniforms.tDepthBack.value = this.opaqueTarget.depthTexture;

        // Save background and clear color
        let oldBackground = this.scene.background;
        let oldClearColor = renderer.getClearColor().getHex();
        let oldClearAlpha = renderer.getClearAlpha();

        this.scene.background = null;
        renderer.setClearColor(0x000000, 0);
        for (let i = 0 ; i < this.numLayers; i++) {
            let curTarget = this.transparentTargets[i];
            renderer.setRenderTarget(curTarget);
            renderer.clear();
            if (i == 0) {
                this.peelUniforms.isFrontLayer.value = 1;
            } else {
                this.peelUniforms.isFrontLayer.value = 0;
                this.peelUniforms.tDepthFront.value = this.transparentTargets[i - 1].depthTexture;
            }
            renderer.render(this.scene, this.camera, curTarget);

        }

        // ---- Compose the scene
        renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
        renderer.clear();
        this.quadMaterial.uniforms.tBackDiffuse.value = this.opaqueTarget.texture;
        this.quadMaterial.uniforms.tLDiffuses.value = this.transparentTargets.map((rt) => rt.texture);
        this.quadScene.overrideMaterial = this.quadMaterial;
        renderer.render(this.quadScene, this.quadCamera, this.renderToScreen ? null : readBuffer, true);

        // ---- Resotre stuff
        this.restoreOpaqueVisibility();
        this.scene.background = oldBackground;
        renderer.setClearColor(oldClearColor, oldClearAlpha);
        renderer.autoClear = oldAutoClear;

    },
    /* eslint-disable no-unused-vars */
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        this.depthPeelRender(renderer, readBuffer);
    }
    /* eslint-enable no-unused-vars */
});

export {DepthPeelRenderPass};
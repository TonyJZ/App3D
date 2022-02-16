import { Loader } from "./Loader.js";
import { EventDispatcher } from "./EventDispatcher.js";
import { Events, PERSPECTIVE_CAMERA, ORTHOGRAPHIC_CAMERA, TransparencyMethods, AntialiasingMethods } from "./Constants.js";
import { PerspectiveCamera } from "./PerspectiveCamera.js";
import { OrthographicCamera } from "./OrthographicCamera.js";
import * as THREE from "../thirdParty/build/three.module.js";
import * as EXTRA from "../thirdParty/build/extra.module.js";
import { Stats } from "../thirdParty/build/stats.module.js";
import { BaseObject } from "./BaseObject.js";
import { BaseScene } from "./BaseScene.js";
import { DepthPeelRenderPass } from "./DepthPeelRenderPass.js";

function App(domElementID, siteObj = null, onLoadCallback = null, onProgressCallback = null) {
    // Set up our container
    this.container = new EXTRA.UI.Panel();
    this.container.setId("viewport");
    this.container.setPosition("absolute");
    // Need the following line so that our SVG elements will render on top of our three.js canvas
    this.container.dom.style["z-index"] = "-1";

    document.createElement("div");
    document.getElementById(domElementID).appendChild(this.container.dom);
    this.addSVGContainer(document.getElementById(domElementID));

    // default camera component
    this.defaultCameraComponent = {
        initialPosition: {
            x: 200,
            y: 200,
            z: 200
        },
        initialFocalPoint: {
            x: 0,
            y: 0,
            z: 0
        },
        homePosition: {
            x: 200,
            y: 200,
            z: 200.0
        },
        homeFocalPoint: {
            x: 0,
            y: 0,
            z: 0
        }
    };
    this.transparencyMethod = {
        method: TransparencyMethods.NO_METHOD,
        params: null
    };
    // Set up the camera
    this.cameraList = [];  // [0]: perspectiveCamera, [1]: orthographicCameras
    this.cameraList.push(new PerspectiveCamera(45, this.container.dom.clientWidth / this.container.dom.clientHeight, 0.25, 20000, this));

    this.cameraList.push(new OrthographicCamera(-this.container.dom.clientWidth / 2, this.container.dom.clientWidth / 2, this.container.dom.clientHeight / 2,
        -this.container.dom.clientHeight / 2, 0.25, 1000, this));

    this.camera = this.cameraList[0];
    this.backupSkyBox = null; // for camera switch. the skybox is not rendering with orthographic camera

    // Set up controls
    this.orbitControl = new EXTRA.OrbitControls(this.camera, this.container.dom);
    // this.setCameraParams(Loader.getPrimaryScene(siteObj), this.camera, this.orbitControl);

    this.orbitControl.mouseButtons = {
        LEFT: THREE.MOUSE.RIGHT,
        MIDDLE: THREE.MOUSE.MIDDLE,
        RIGHT: THREE.MOUSE.LEFT
    };
    this.orbitControl.update();

    this.transformControls = null;

    // Note: Leave this commented-out LOC here for instructional purposes. "setLookAtVector"
    // only works when placed here, after the above orbitControl setup:
    // this.camera.setLookAtVector(0, -1000, 0);

    // Set up our scene
    // this.scene = null;
    this.scene = null;
    // Set up Event Dispatcher
    this.eventCallbacks = {};
    this.eventCallbacks[Events.ONLOAD] = onLoadCallback;
    this.eventCallbacks[Events.ONPROGRESS] = onProgressCallback;

    this.eventDispacher = new EventDispatcher(this);


    // Set up renderer
    this.renderer = this.createRenderer();

    // Load selected site

    // this.siteObj = siteObj;
    // Need this field to be able to get from a scene back to the parent App:

    this.scene = new BaseScene("defaultScene", this);
    if (siteObj !== null) {
        this.loadSiteConfig(siteObj);
        this.scene = this.siteObj.currentScene;
        this.siteObj.currentScene.appParent = this;
    }

    // this.siteObj.currentScene = Loader.loadSite(null, this.siteObj, this.eventCallbacks);



    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    // clock
    this.clock = new THREE.Clock();

    // postprocessing
    this.OutlineParams = {
        edgeStrength: 7.0,
        edgeGlow: 1.0,
        edgeThickness: 1.0,
        pulsePeriod: 1.5,
        visibleEdgeColor: 0xffff00,
        hiddenEdgeColor: 0x190a05
    };

    this.BloomParams = {
        renderToScreen: false,
        exposure: 1,
        bloomStrength: 1.5,
        bloomThreshold: 0,
        bloomRadius: 0
    };

    this.dpr = 4;
    if (window.devicePixelRatio !== undefined) {
        if (this.dpr < window.devicePixelRatio) {
            this.dpr = window.devicePixelRatio;
        }
        this.dpr = window.devicePixelRatio;
    }

    this.composer = new EXTRA.EffectComposer(this.renderer);
    this.composer.setSize(this.container.dom.offsetWidth * this.dpr, this.container.dom.offsetHeight * this.dpr);

    this.renderPass = new EXTRA.RenderPass(this.getCurrentScene(), this.getCurrentCamera());
    this.composer.addPass(this.renderPass);


    this.bloomPass = new EXTRA.UnrealBloomPass(new THREE.Vector2(this.container.dom.offsetWidth, this.container.dom.offsetHeight),
        1.5, 0.4, 0.85);
    this.bloomPass.enabled = false;
    this.composer.addPass(this.bloomPass);

    // note: the SMAA and SSAA should be rendered before OutlinePass
    this.antialiasPasses = [];
    this.smaaPass = new EXTRA.SMAAPass(this.container.dom.offsetWidth * this.dpr, this.container.dom.offsetHeight * this.dpr);
    this.smaaPass.renderToScreen = false;
    this.smaaPass.enabled = false;
    this.composer.addPass(this.smaaPass);

    this.ssaaPass = new EXTRA.SSAARenderPass(this.getCurrentScene(), this.getCurrentCamera());
    this.ssaaPass.unbiased = true;
    this.ssaaPass.sampleLevel = 2;
    this.ssaaPass.renderToScreen = false;
    this.ssaaPass.enabled = false;
    this.composer.addPass(this.ssaaPass);

    this.antialiasPasses.push(this.smaaPass);
    this.antialiasPasses.push(this.ssaaPass);

    this.outlinePass = new EXTRA.OutlinePass(new THREE.Vector2(this.container.dom.offsetWidth, this.container.dom.offsetHeight),
        this.getCurrentScene(), this.getCurrentCamera());

    // Second outline for the hover effect
    // TODO : Change this, this cant be a good idea.
    this.outlinePass2 = new EXTRA.OutlinePass(new THREE.Vector2(this.container.dom.offsetWidth, this.container.dom.offsetHeight),
        this.getCurrentScene(), this.getCurrentCamera());

    this.composer.addPass(this.outlinePass);
    this.composer.addPass(this.outlinePass2);

    this.effectFXAA = new EXTRA.ShaderPass(EXTRA.FXAAShader);
    this.effectFXAA.uniforms.resolution.value.set(1 / (this.container.dom.offsetWidth * this.dpr), 1 / (this.container.dom.offsetHeight * this.dpr));

    this.effectFXAA.renderToScreen = true;
    this.composer.addPass(this.effectFXAA);

    this.antialiasingMode = AntialiasingMethods.FXAA;

    this.setOutlineStyle(this.OutlineParams);
    this.setBloomStyle(this.BloomParams);

    // Object attributes:
    // this.objectAttrBox = null;
    // this.objectAttrBoxisShowing = false;
    // stats
    this.stats = new Stats();
    this.enableStats = false;
    this.pauseRendering = false;
    // this.container.dom.appendChild(this.stats.dom);
    //
    this.animate();
}

App.prototype = Object.assign(Object.create(App.prototype), {

    constructor: App,

    getCurrentScene: function() {
        return this.scene;
    },
    getCurrentCamera: function() {
        return this.camera;
    },
    getCurrentRender: function() {
        return this.renderer;
    },
    loadSiteConfig: function(siteConfig) {
        this.siteObj = siteConfig;

        // DO MD5 check before
        let MD5 = function(d) {
            let result = M(V(Y(X(d), 8 * d.length)));return result.toLowerCase();
        };function M(d) {
            for (var _, m = "0123456789ABCDEF", f = "", r = 0;r < d.length;r++) {
                _ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
            } return f;
        } function X(d) {
            for (var _ = Array(d.length >> 2), m = 0;m < _.length;m++) {
                _[m] = 0;
            } for (m = 0;m < 8 * d.length;m += 8) {
                _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
            } return _;
        } function V(d) {
            for (var _ = "", m = 0;m < 32 * d.length;m += 8) {
                _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
            } return _;
        } function Y(d, _) {
            d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0;n < d.length;n += 16) {
                var h = m, t = f, g = r, e = i;f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e);
            } return Array(m, f, r, i);
        } function md5_cmn(d, _, m, f, r, i) {
            return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m);
        } function md5_ff(d, _, m, f, r, i, n) {
            return md5_cmn(_ & m | ~_ & f, d, _, r, i, n);
        } function md5_gg(d, _, m, f, r, i, n) {
            return md5_cmn(_ & f | m & ~f, d, _, r, i, n);
        } function md5_hh(d, _, m, f, r, i, n) {
            return md5_cmn(_ ^ m ^ f, d, _, r, i, n);
        } function md5_ii(d, _, m, f, r, i, n) {
            return md5_cmn(m ^ (_ | ~f), d, _, r, i, n);
        } function safe_add(d, _) {
            var m = (65535 & d) + (65535 & _);return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m;
        } function bit_rol(d, _) {
            return d << _ | d >>> 32 - _;
        }
        // let x  = MD5("LDKFJ")
        let x = MD5(this.renderer.hudScene.children[0].material.map.image.src);
        if (x !== "2f1817a9426f41d0d33d7514b5125238") {
            this.siteObj.currentScene = new BaseScene();
            this.scene = this.siteObj.currentScene;
            return;
        }
        // setCamera Parameters
        this.setCameraParams(Loader.getPrimaryScene(this.siteObj), this.camera, this.orbitControl);
        this.orbitControl.update();
        this.siteObj.currentScene = Loader.loadSite(null, this.siteObj, this.eventCallbacks, this.getCurrentScene());
        this.scene = this.siteObj.currentScene;

    },
    addSVGContainer: function(parent) {
        // <svg xmlns="http://www.w3.org/2000/svg" id="svgCont" height="100%" width="100%" style="position: absolute; pointer-events: none;"></svg>

        let svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgContainer.setAttribute("id", "svgCont");
        svgContainer.setAttribute("style", "position: absolute; pointer-events: none;");
        svgContainer.setAttribute("height", "100%");
        svgContainer.setAttribute("width", "100%");
        parent.appendChild(svgContainer);
    },
    updateWaterMark: function() {
        this.watermarkSprite.position.set(-this.container.dom.clientWidth / 2 + 25,
            this.container.dom.clientHeight / 2 - 25 - this.watermarkSprite.scale.y, 1);
    },
    showStatsInfo: function(enable) {
        if (this.enableStats === enable) {
            return;
        }

        this.enableStats = enable;
        if (this.enableStats) {
            this.container.dom.appendChild(this.stats.dom);
        } else {
            this.container.dom.removeChild(this.stats.dom);
        }
    },
    isShadowEnabled: function() {
        return this.renderer.shadowMap.enabled;
    },
    showShadow: function(enable) {
        this.renderer.shadowMap.enabled = enable;
        this.renderer.shadowMapAutoUpdate = false;
        for (var i = 0; i < this.getCurrentScene().lights.length; i++) {
            if (this.scene.lights[i].shadow !== undefined) {
                this.renderer.clearTarget(this.scene.lights[i].shadow.map);
                this.scene.lights[i].castShadow = enable;
            }
        }
        this.renderer.shadowMapAutoUpdate = true;
        // if(enable) {
        //     this.getCurrentScene().updateShadowRange(this.getCurrentScene().sun);
        // }
    },
    updateOrthographicCameraFrustum: function(camera, boundingBox) {

        var box = boundingBox;

        if (this.getCurrentScene().gridHelper !== undefined && this.getCurrentScene().gridHelper.visible) {
            let size = this.getCurrentScene().gridSize;
            box.expandByPoint(new THREE.Vector3(-size / 2, 0, -size / 2));
            box.expandByPoint(new THREE.Vector3(-size / 2, 0, size / 2));
            box.expandByPoint(new THREE.Vector3(size / 2, 0, size / 2));
            box.expandByPoint(new THREE.Vector3(size / 2, 0, -size / 2));
        }
        let w = box.max.x - box.min.x;
        let h = box.max.z - box.min.z;
        let screenW = this.container.dom.clientWidth;
        let screenH = this.container.dom.clientHeight;

        let scale = 1;
        if (screenW < screenH) {
            scale = w / screenW;
        } else {
            scale = h / screenH;
        }

        let zoom = 1.05;
        camera.left = -this.container.dom.clientWidth / 2 * scale * zoom;
        camera.right = this.container.dom.clientWidth / 2 * scale * zoom;
        camera.top = this.container.dom.clientHeight / 2 * scale * zoom;
        camera.bottom = -this.container.dom.clientHeight / 2 * scale * zoom;
        camera.updateProjectionMatrix();

        // let center = new THREE.Vector3(0, 0, 0);
        // center.x = (box.max.x + box.min.x)*0.5;
        // center.z = (box.max.z + box.min.z)*0.5;
        // camera.position.copy(center);
        // camera.lookAt(center.x, center.y, center.z);
    },
    setCameraParams: function(sceneComponent, camera, orbitControl, sceneCenter = undefined) {

        let cameraComponent = (sceneComponent === undefined || sceneComponent.camera === undefined) ? this.defaultCameraComponent : sceneComponent.camera;
        if (sceneCenter !== undefined) {
            cameraComponent.initialPosition.x += sceneCenter.x;
            cameraComponent.initialPosition.y += sceneCenter.y;
            cameraComponent.initialPosition.z += sceneCenter.z;

            cameraComponent.initialFocalPoint.x += sceneCenter.x;
            cameraComponent.initialFocalPoint.y += sceneCenter.y;
            cameraComponent.initialFocalPoint.z += sceneCenter.z;

            cameraComponent.homePosition.x += sceneCenter.x;
            cameraComponent.homePosition.y += sceneCenter.y;
            cameraComponent.homePosition.z += sceneCenter.z;

            cameraComponent.homeFocalPoint.x += sceneCenter.x;
            cameraComponent.homeFocalPoint.y += sceneCenter.y;
            cameraComponent.homeFocalPoint.z += sceneCenter.z;
        }

        this.cameraHome = {
            position: cameraComponent.homePosition,
            lookAt: cameraComponent.homeFocalPoint,
        };
        camera.position.set(cameraComponent.initialPosition.x, cameraComponent.initialPosition.y, cameraComponent.initialPosition.z);
        camera.lookAt(cameraComponent.initialFocalPoint.x, cameraComponent.initialFocalPoint.y, cameraComponent.initialFocalPoint.z);
        // Set up our orbit controller
        orbitControl.target.set(
            cameraComponent.initialFocalPoint.x,
            cameraComponent.initialFocalPoint.y,
            cameraComponent.initialFocalPoint.z
        );
        orbitControl.object = camera;
        orbitControl.update();
    },
    setOutlineStyle2: function(param) {
        if (param !== undefined) {
            if (param.edgeStrength !== undefined) {
                this.outlinePass2.edgeStrength = param.edgeStrength;
            }
            if (param.edgeGlow !== undefined) {
                this.outlinePass2.edgeGlow = param.edgeGlow;
            }
            if (param.edgeThickness !== undefined) {
                this.outlinePass2.edgeThickness = param.edgeThickness;
            }
            if (param.pulsePeriod !== undefined) {
                this.outlinePass2.pulsePeriod = param.pulsePeriod;
            }
            if (param.visibleEdgeColor !== undefined) {
                this.outlinePass2.visibleEdgeColor.setHex(param.visibleEdgeColor);
            }
            if (param.hiddenEdgeColor !== undefined) {
                this.outlinePass2.hiddenEdgeColor.setHex(param.hiddenEdgeColor);
            }
            if (param.setDifffernthiddenColor !== undefined) {
                this.outlinePass2.setDifffernthiddenColor = param.setDifffernthiddenColor;
            }

        }
    },

    setOutlineStyle: function(param) {
        if (param !== undefined) {
            if (param.edgeStrength !== undefined) {
                this.outlinePass.edgeStrength = param.edgeStrength;
                this.OutlineParams.edgeStrength = param.edgeStrength;
            }
            if (param.edgeGlow !== undefined) {
                this.outlinePass.edgeGlow = param.edgeGlow;
                this.OutlineParams.edgeGlow = param.edgeGlow;
            }
            if (param.edgeThickness !== undefined) {
                this.outlinePass.edgeThickness = param.edgeThickness;
                this.OutlineParams.edgeThickness = param.edgeThickness;
            }
            if (param.pulsePeriod !== undefined) {
                this.outlinePass.pulsePeriod = param.pulsePeriod;
                this.OutlineParams.pulsePeriod = param.pulsePeriod;
            }
            if (param.visibleEdgeColor !== undefined) {
                this.outlinePass.visibleEdgeColor.setHex(param.visibleEdgeColor);
                this.OutlineParams.visibleEdgeColor = param.visibleEdgeColor;
            }
            if (param.hiddenEdgeColor !== undefined) {
                this.outlinePass.hiddenEdgeColor.setHex(param.hiddenEdgeColor);
                this.OutlineParams.hiddenEdgeColor = param.hiddenEdgeColor;
            }
            if (param.setDifffernthiddenColor !== undefined) {
                this.outlinePass.setDifffernthiddenColor = param.setDifffernthiddenColor;
                this.OutlineParams.setDifffernthiddenColor = param.setDifffernthiddenColor;
            }
        }
    },

    setBloomStyle: function(params) {
        if (params !== undefined) {
            if (params.renderToScreen !== undefined) {
                this.bloomPass.renderToScreen = params.renderToScreen;
                this.BloomParams.renderToScreen = params.renderToScreen;
            }
            if (params.enabled !== undefined) {
                this.bloomPass.enabled = params.enabled;
                this.BloomParams.enabled = params.enabled;
            }
            if (params.bloomThreshold !== undefined) {
                this.bloomPass.threshold = params.bloomThreshold;
                this.BloomParams.threshold = params.bloomThreshold;
            }
            if (params.bloomStrength !== undefined) {
                this.bloomPass.strength = params.bloomStrength;
                this.BloomParams.bloomStrength = params.bloomStrength;
            }
            if (params.bloomRadius !== undefined) {
                this.bloomPass.radius = params.bloomRadius;
                this.BloomParams.radius = params.bloomRadius;
            }
            if (params.exposure !== undefined) {
                this.renderer.toneMappingExposure = params.exposure;
                this.BloomParams.exposure = params.exposure;
            }
        }
    },
    showOutline: function(objects, visibleEdgeColor, hiddenEdgeColor) {
        if (objects !== undefined && objects !== null) {
            this.outlinePass.selectedObjects = [];
            if (objects.length > 0) {
                objects.forEach((object) => {
                    this.outlinePass.selectedObjects.push(object);
                });
            } else if (objects.isBaseObject) {
                this.outlinePass.selectedObjects.push(objects);
            }

            this.getCurrentScene().selectedObjects = this.outlinePass.selectedObjects;
        } else {
            this.outlinePass.selectedObjects = [];
            this.getCurrentScene().selectedObjects = [];
        }
        if (visibleEdgeColor !== undefined && visibleEdgeColor !== null) {
            this.setOutlineStyle({
                visibleEdgeColor: visibleEdgeColor,
            });
        }
        if (hiddenEdgeColor !== undefined && hiddenEdgeColor !== null) {
            this.setOutlineStyle({
                hiddenEdgeColor: hiddenEdgeColor
            });
        }
    },
    hideOutline: function(objects) {
        objects.forEach((eaObject) => {
            let indexToSplice = this.outlinePass.selectedObjects.findIndex((ea) => ea.name === eaObject.name);
            this.outlinePass.selectedObjects.splice(indexToSplice, 1);
        });
    },

    showOutline2: function(objects, color) {
        if (objects !== undefined && objects !== null) {
            this.outlinePass2.selectedObjects = [];
            if (objects.length > 0) {
                objects.forEach((object) => {
                    this.outlinePass2.selectedObjects.push(object);
                });
            } else if (objects.isBaseObject) {
                this.outlinePass2.selectedObjects.push(objects);
            }

            this.getCurrentScene().selectedObjects = this.outlinePass2.selectedObjects;
        } else {
            this.outlinePass2.selectedObjects = [];
            this.getCurrentScene().selectedObjects = [];
        }
        if (color !== undefined && color !== null) {
            this.setOutlineStyle2({
                visibleEdgeColor: color,
                hiddenEdgeColor: color
            });
        }
    },


    onWindowResize: function() {
        if (this.camera.isPerspectiveCamera) {
            this.camera.aspect = this.container.dom.clientWidth / this.container.dom.clientHeight;
        }
        if (this.camera.isOrthographicCamera) {
            this.updateOrthographicCameraFrustum(this.camera, this.getCurrentScene().getBoundingBox());
        }
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.dom.clientWidth, this.container.dom.clientHeight);
        this.composer.setSize(this.container.dom.clientWidth * this.dpr, this.container.dom.clientHeight * this.dpr);
        this.effectFXAA.uniforms.resolution.value.set(1 / (this.container.dom.clientWidth * this.dpr), 1 / (this.container.dom.clientHeight * this.dpr));

        // update hud camera
        this.renderer.hudCamera.left = -this.container.dom.clientWidth / 2;
        this.renderer.hudCamera.right = this.container.dom.clientWidth / 2;
        this.renderer.hudCamera.top = this.container.dom.clientHeight / 2;
        this.renderer.hudCamera.bottom = -this.container.dom.clientHeight / 2;
        this.renderer.hudCamera.updateProjectionMatrix();

        // update watermarksprite
        this.updateWaterMark();

    },

    onEvent: function(eventName, callback) {
        this.eventCallbacks[eventName] = callback;
    },


    queryForObject: function(nameExp) {
        return this.getCurrentScene().queryForObject(nameExp);
    },
    createRenderer: function() {
        // set renderer
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.container.dom.clientWidth, this.container.dom.clientHeight);
        // renderer.autoClear = false;
        // renderer.setClearColor( 0x000000, 0 );
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.toneMapping = THREE.Uncharted2ToneMapping;

        // shadow Default to no shadow [doesn't seem to matter]
        renderer.shadowMap.enabled = false;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.dom.appendChild(renderer.domElement);

        // watermark
        let scope = this;
        function createHUD(container) {
            // Create the HUD camera and scene
            let hudCamera = new OrthographicCamera(-container.dom.clientWidth / 2, container.dom.clientWidth / 2, container.dom.clientHeight / 2,
                -container.dom.clientHeight / 2, 1, 1000, scope);
            hudCamera.position.z = 10;
            let hudScene = new THREE.Scene();
            return {
                "hudScene": hudScene,
                "hudCamera": hudCamera
            };

        }
        function addWaterMark(hudScene) {
            // Create the logo sprite
            let imgData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJEAAAATCAYAAACQoO/wAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTA0MjlCNzlGMDgwMTFFOEI0M0JBNkYzNDJFMkM1NDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTA0MjlCN0FGMDgwMTFFOEI0M0JBNkYzNDJFMkM1NDkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDQyOUI3N0YwODAxMUU4QjQzQkE2RjM0MkUyQzU0OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDQyOUI3OEYwODAxMUU4QjQzQkE2RjM0MkUyQzU0OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgoGjggAAAghSURBVHja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";
            let image = new window.Image();
            image.src = imgData;
            let texture = new THREE.Texture();
            let spriteMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
            let watermarkSprite = new THREE.Sprite(spriteMaterial);
            scope.watermarkSprite = watermarkSprite;
            hudScene.add(watermarkSprite);
            texture.image = image;
            // let scope = this;
            image.onload = function() {
                texture.needsUpdate = true;
                spriteMaterial.depthTest = false;
                watermarkSprite.center.set(0, 0);
                watermarkSprite.scale.set(image.width, image.height, 1); // hard coded width and height
                scope.updateWaterMark();
            };
        }
        let hudObj = createHUD(this.container);
        addWaterMark(hudObj["hudScene"]);
        renderer.hudScene = hudObj["hudScene"];
        renderer.hudCamera = hudObj["hudCamera"];

        return renderer;
    },
    setAnimateCallback: function(preCb = null, postCb = null) {
        if (preCb) {
            if (this.eventCallbacks["pre-render"]) {
                delete this.eventCallbacks["pre-render"];
            }

            this.eventCallbacks["pre-render"] = preCb;
        }
        if (postCb) {
            if (this.eventCallbacks["post-render"]) {
                delete this.eventCallbacks["post-render"];
            }

            this.eventCallbacks["post-render"] = postCb;
        }
    },
    setCustomizedRender: function(render = null) {
        if (this.eventCallbacks["customized-render"]) {
            delete this.eventCallbacks["customized-render"];
        }

        this.eventCallbacks["customized-render"] = render;
    },
    animate: function() {
        let delta = this.clock.getDelta();
        window.requestAnimationFrame(this.animate.bind(this));
        if (this.pauseRendering) {
            return;
        }
        // Update camera animations;
        this.camera.updateAnimations(delta);

        // Update scene animations;
        this.getCurrentScene().updateAnimations(delta, this.camera);

        if (this.eventCallbacks["customized-render"]) {
            this.eventCallbacks["customized-render"]();
        } else {
            if (this.eventCallbacks["pre-render"]) {
                this.eventCallbacks["pre-render"]();
            }

            // this.renderer.render(this.getCurrentScene(), this.camera);
            this.renderPass.scene = this.getCurrentScene();
            this.renderPass.camera = this.getCurrentCamera();
            this.outlinePass.renderScene = this.getCurrentScene();
            this.outlinePass.renderCamera = this.getCurrentCamera();
            this.outlinePass2.renderScene = this.getCurrentScene();
            this.outlinePass2.renderCamera = this.getCurrentCamera();

            // autoclear to false so hud can be drawn
            this.renderer.autoClear = false;
            this.renderer.clear();
            // draw the regular scene
            this.composer.render();

            if (this.eventCallbacks["post-render"]) {
                this.eventCallbacks["post-render"]();
            }
        }

        this.stats.update();
    },

    addTransformController: function(baseObject, mode) {
        if (this.transformControls !== null && this.transformControls.object !== undefined
            && this.transformControls.object !== null) {
            this.removeTransformController(this.transformControls.object);
        }

        this.transformControls = new EXTRA.TransformControls(this.getCurrentCamera(), this.renderer.domElement);
        this.transformControls.setMode(mode);
        this.transformControls.attach(baseObject);
        this.transformControls.addEventListener("dragging-changed", function(event) {
            this.orbitControl.enabled = !event.value;
        }.bind(this));
        baseObject.transformControl = this.transformControls;
        let scene = baseObject.getScene();
        if (scene === null) {
            console.log("no scene to attach controller to");
            return;
        }
        scene.add(this.transformControls, false);

    },
    removeTransformController: function(baseObject) {
        if (baseObject.transformControl !== null && baseObject.transformControl !== undefined) {
            baseObject.transformControl.detach();
            baseObject.transformControl.dispose();
            baseObject.getScene().remove(baseObject.transformControl);
            delete baseObject.transformControl;
        }

    },
    getSite: function() {
        return this.sitesiteObj;
    },
    normalizeScene: function(sceneName) {
        let targetScene = null;
        if (sceneName !== undefined) {
            targetScene = this.getScene(sceneName);
        } else {
            targetScene = this.getCurrentScene();
        }

        if (targetScene === null) {
            console.log("can not find scene: " + sceneName);
            return;
        }

        let bbox = targetScene.getBoundingBox();
        let sceneSite = this.siteObj.scenes.filter((ea) => ea.name === targetScene.name)[0];

        let center = new THREE.Vector3();
        center.x = (bbox.min.x + bbox.max.x) * 0.5;
        center.y = bbox.min.y;
        center.z = (bbox.min.z + bbox.max.z) * 0.5;

        this.setCameraParams(sceneSite, this.getCurrentCamera(), this.orbitControl, center);
    },

    /*
     * Following functions are about scene switching
     * */
    getScene: function(sceneName) {
        let targetScene = this.siteObj.scenes.filter((ea) => ea.name === sceneName)[0];
        return targetScene;
    },
    switchScene: function(scene, onLoad, onprogress, updateCamera = true) {
        let eventCallbacks = {};
        eventCallbacks[Events.ONLOAD] = onLoad;
        eventCallbacks[Events.ONPROGRESS] = onprogress;
        if (scene.isBaseScene === undefined) {
            scene = Loader.loadSite(scene, this.siteObj, eventCallbacks);
        }
        if (this.scene !== null) {
            this.scene.dispatchEvent({ type: "switched-out" });
        }
        this.scene = scene;
        this.scene.appParent = this;
        if (this.outlinePass !== undefined) {
            // this.outlinePass.selectedObjects = this.scene.selectedObjects;
        }
        // if (this.bloomPass !== undefined) {
        //     this.bloomPass.renderToScreen = false;
        // }
        scene.dispatchEvent({ type: "switched-in" });

        if (updateCamera) {
            this.setCameraParams(this.getScene(scene.name), this.camera, this.orbitControl);
        }
    },
    switchCamera: function(cameraType) {
        if (cameraType === PERSPECTIVE_CAMERA) {
            if (!this.camera.isPerspectiveCamera) {
                this.camera = this.cameraList[0];
                this.setCameraParams(this.getScene(this.getCurrentScene().name), this.camera, this.orbitControl);

                // restore sky box for perspective camera
                if (this.getCurrentScene().needReplacedSkyBox) {
                    this.getCurrentScene().background = this.getCurrentScene().envMap;
                }
            }
        } else if (cameraType === ORTHOGRAPHIC_CAMERA) {
            if (!this.camera.isOrthographicCamera) {
                if (this.getCurrentScene().background
                    && this.getCurrentScene().background.isCubeTexture) {
                    // sky box is not rendering with orthographic camera, choose one facet instand.
                    this.getCurrentScene().needReplacedSkyBox = true;
                }
                this.camera = this.cameraList[1];
                let sceneBB = this.getCurrentScene().getBoundingBox();
                this.updateOrthographicCameraFrustum(this.camera, sceneBB);
                let center = sceneBB.getCenter();
                center.y += 100;
                // center.x = (this.camera.left + this.camera.right) * 0.5;
                // center.z = (this.camera.top + this.camera.bottom) * 0.5;
                this.camera.position.copy(center);
                this.camera.lookAt(center.x, center.y, center.z);

                this.orbitControl.target.set(center.x, 0, center.z);
                this.orbitControl.object = this.camera;
                this.orbitControl.update();
            }
        } else {
            console.log("unknown camera type");
        }
    },
    addObject: function(objConfig, scene = null, callback) {
        if (scene === null) {
            scene = this.getCurrentScene();
        }
        let eventCallbacks = {};
        eventCallbacks[Events.ONLOAD] = callback;
        eventCallbacks[Events.FILE_LOADED] = function(filledObj, scene) {
            scene.add(filledObj, true);
        };
        let count = { total: 1, remaining: 1 };
        // Look for whichever scene the user designated as their primary scene, otherwise simply
        // use the first scene in the array.
        // let targetSceneConfig = this.siteObj.scenes.filter(ea => ea.isPrimary)[0]; // eslint-disable-line arrow-parens
        // if (targetSceneConfig === undefined) {
        //    targetSceneConfig = this.siteObj.scenes[0];
        // }
        let baseObj = new BaseObject(objConfig);
        Loader.loadComponent(baseObj, objConfig, null, scene, eventCallbacks, count);
    },
    showCameraHelper: function(bShow) {
        if (bShow) {
            if (this.cameraHelper !== undefined) {
                this.cameraHelper.parent.remove(this.cameraHelper);
            }
            this.cameraHelper = new THREE.CameraHelper(this.getCurrentCamera());
            this.getCurrentScene().add(this.cameraHelper);
        } else {
            if (this.cameraHelper !== undefined) {
                this.cameraHelper.parent.remove(this.cameraHelper);
            }
        }
    },
    setDefaultCameraComponent: function(cameraComponent) {
        if (cameraComponent !== undefined) {
            if (cameraComponent.initialPosition !== undefined && cameraComponent.initialPosition !== null) {
                this.defaultCameraComponent.initialPosition = cameraComponent.initialPosition;
            }
            if (cameraComponent.initialFocalPoint !== undefined && cameraComponent.initialFocalPoint !== null) {
                this.defaultCameraComponent.initialFocalPoint = cameraComponent.initialFocalPoint;
            }
            if (cameraComponent.homePosition !== undefined && cameraComponent.homePosition !== null) {
                this.defaultCameraComponent.homePosition = cameraComponent.homePosition;
            }
            if (cameraComponent.homeFocalPoint !== undefined && cameraComponent.homeFocalPoint !== null) {
                this.defaultCameraComponent.homeFocalPoint = cameraComponent.homeFocalPoint;
            }
        }
    },
    getXZIntersection: function(event, y = 0) {
        let mouse = new THREE.Vector3();
        let rect = this.renderer.domElement.getBoundingClientRect();
        let cam = this.getCurrentCamera().position;
        let pos = new THREE.Vector3();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        mouse.z = .25;
        mouse.unproject(this.getCurrentCamera());

        if (this.getCurrentCamera().isOrthographicCamera) {
            pos.x = mouse.x;
            pos.z = mouse.z;
        } else {
            let m = (y - mouse.y) / (cam.y - mouse.y);
            pos.x = mouse.x + (cam.x - mouse.x) * m;
            pos.z = mouse.z + (cam.z - mouse.z) * m;
        }
        pos.y = y;
        return pos;
    },
    getYPlaneIntersection: function(event, center) {
        let mouse = new THREE.Vector3();
        let rect = this.renderer.domElement.getBoundingClientRect();
        let cam = this.getCurrentCamera().position;
        let pos = new THREE.Vector3();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        mouse.z = 0.25;
        mouse.unproject(this.getCurrentCamera());

        // camera to intersection point unit vector
        let xyz = mouse.clone();
        xyz.sub(cam).normalize();

        // camera to center
        let abc = center.clone();
        abc.sub(cam);

        // scaler factor
        let n = (abc.x * xyz.x + abc.y * xyz.y + abc.z * xyz.z) / (xyz.x * xyz.x + xyz.y * xyz.y + xyz.z * xyz.z);

        // final intersection point
        pos = center.clone();
        pos.y = cam.y + n * xyz.y;
        return pos;
    },
    setTransparencyMethod: function(method, params) {
        if (method === TransparencyMethods.DEPTH_PEEL) {
            if (params.numLayers <= 0) {
                console.error("For the depth peel method number of layers must be greater than 0");
                return false;
            }
            if (this.renderPass.isDepthPeelRenderPass) {
                if (this.renderPass.getNumLayers() !== params.numLayers) {
                    this.renderPass.setNumLayers(params.numLayers);
                }
            } else {
                let depthPeelPass = null;
                this.composer.passes.forEach((pass) => {
                    if (pass.isDepthPeelRenderPass) {
                        depthPeelPass = pass;
                    }
                });
                if (depthPeelPass !== null) {
                    this.renderPass.enabled = false;
                    this.renderPass = depthPeelPass;
                    this.renderPass.enabled = true;
                } else {
                    let depthPeelPass = new DepthPeelRenderPass(this.renderer, this.getCurrentScene(), this.getCurrentCamera(), params.numLayers);
                    this.composer.insertPass(depthPeelPass, 0);
                    this.renderPass.enabled = false;
                    this.renderPass = depthPeelPass;
                    this.renderPass.enabled = true;
                }
            }
        } else if (method === TransparencyMethods.NO_METHOD) {
            if (this.renderPass.isDepthPeelRenderPass) {
                this.renderPass.removePeelShaderBeforeCompile();
            }
            if (!this.renderPass.isRenderPass) {
                this.composer.passes.forEach((pass) => {
                    if (pass.isRenderPass) {
                        this.renderPass.enabled = false;
                        this.renderPass = pass;
                        this.renderPass.enabled = true;
                    }
                });
            }
        }
        this.transparencyMethod.method = method;
        this.transparencyMethod.params = params;
    },
    getTransparencyMethod: function() {
        return this.transparencyMethod;
    },
    stop: function() {
        this.pauseRendering = true;
    },
    resume: function() {
        this.pauseRendering = false;
    },
    setAntialiasingMethod: function(method, params) {
        if (method === AntialiasingMethods.FXAA && method !== this.antialiasingMode) {
            this.smaaPass.enabled = false;
            this.ssaaPass.enabled = false;
            this.antialiasingMode = method;
        } else if (method === AntialiasingMethods.SMAA && method !== this.antialiasingMode) {
            this.smaaPass.enabled = true;
            this.ssaaPass.enabled = false;
            this.antialiasingMode = method;
        } else if (method === AntialiasingMethods.SSAA && method !== this.antialiasingMode) {
            if (params !== undefined) {
                if (params.unbiased !== undefined) {
                    this.ssaaPass.unbiased = params.unbiased;
                }
                if (params.sampleLevel !== undefined) {
                    this.ssaaPass.sampleLevel = params.sampleLevel;
                }
            }
            this.smaaPass.enabled = false;
            this.ssaaPass.enabled = true;
            this.antialiasingMode = method;
        }
    }
});

export { App };

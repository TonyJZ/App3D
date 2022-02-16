import { Loader } from "./Loader.js";
import { BaseObject } from "./BaseObject.js";
import { Animation, AnimationManager } from "./Animation.js";
import * as THREE from "../thirdParty/build/three.module.js";

function BaseScene(name, appParent = null) {

    THREE.Scene.call(this);
    this.type = "BaseScene";
    this.playDayNightAnimation = false;

    this.axesHelper = new THREE.AxesHelper(50);
    this.axesHelper.visible = false;
    this.add(this.axesHelper);

    this.selectedObjects = [];

    this.name = name;
    this.lights = [];
    //    this.sunPos = new THREE.Vector3(0, 1000, 0);

    this.sun = new THREE.DirectionalLight(0xFFFFFF, 1);
    this.sun.position.set(0, 1000, 0);

    // shadow setting
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 500;
    this.sun.shadow.camera.left = -300;
    this.sun.shadow.camera.right = 300;
    this.sun.shadow.camera.top = 350;
    this.sun.shadow.camera.bottom = -350;
    this.sun.shadow.bias = -.0003;

    // default is not casting shadow
    this.sun.castShadow = false;

    // default ambient light
    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5); // soft white light
    this.add(this.ambientLight);
    this.add(this.sun);

    this.background = new THREE.Color(0x000000);
    this.envMap = undefined;
    this.needReplacedSkyBox = false;

    this.skySphere = null;

    this.appParent = appParent;
    this.lights.push(this.sun);
    this.lights.push(this.ambientLight);

    this.clock = new THREE.Clock();

    // Animation
    this.animations = new AnimationManager();
}

BaseScene.prototype = Object.assign(Object.create(THREE.Scene.prototype), {

    constructor: BaseScene,

    isBaseScene: true,
    // These two needs to be modified, should take Vector3
    // ......................................
    setSunPosition: function(x, y, z) {

        // this.sunPos.x = x;
        // this.sunPos.y = y;
        // this.sunPos.z = z;
        this.sun.position.set(x, y, z);
        this.sun.updateMatrixWorld();
    },

    setSunTarget: function(x, y, z) {
        if (this.sunTargetObj === undefined) {
            this.sunTargetObj = new THREE.Object3D();
            // this.sunTargetObj.visible = false;
            this.add(this.sunTargetObj);
            this.sun.target = this.sunTargetObj;
        }
        this.sunTargetObj.position.set(x, y, z);
        this.updateMatrixWorld();
    },
    // ..............................................
    setSunLookAt: function(lookAt) {
        if (this.sunTargetObj === undefined) {
            this.sunTargetObj = new THREE.Object3D();
            // this.sunTargetObj.visible = false;
            this.add(this.sunTargetObj);
            this.sun.target = this.sunTargetObj;
        }
        this.sunTargetObj.position.set(lookAt.x, lookAt.y, lookAt.z);
        this.updateMatrixWorld();
    },
    setSunIntensity: function(intensity) {
        this.sun.intensity = intensity;
    },

    setSunColor: function(color) {
        this.sun.color.setHex(color);
    },

    addLight: function(lightType, config) {

        var light = null;
        switch (lightType) {
            case "DirectionalLight":
                light = createDirectionalLight(config.color, config.intensity);
                break;
            case "HemisphereLight":
                light = createHemisphereLight(config.skyColor, config.groundColor, config.intensity);
                break;
            case "PointLight":
                light = createPointLight(config.color, config.intensity, config.distance, config.decay);
                break;
            case "SpotLight":
                light = createSpotLight(config.color, config.intensity, config.distance, config.angle, config.penumbra, config.decay);
                break;
            case "RectAreaLight":
                light = createRectAreaLight(config.color, config.intensity, config.width, config.height);
                break;
            case "AmbientLight":
                light = createAmbientLight(config.color, config.intensity);
            default:
                break;
        }
        if (light !== null) {
            this.lights.push(light);
            this.add(light);
        }

        return light;

        function createDirectionalLight(color, intensity) {
            var light = new THREE.DirectionalLight(color, intensity);
            return light;
        }

        function createHemisphereLight(skyColor, groundColor, intensity) {
            var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
            return light;
        }

        function createPointLight(color, intensity, distance, decay) {
            var light = new THREE.PointLight(color, intensity, distance, decay);
            return light;
        }

        function createSpotLight(color, intensity, distance, angle, penumbra, decay) {
            var light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
            return light;
        }

        function createRectAreaLight(color, intensity, width, height) {
            var light = new THREE.RectAreaLight(color, intensity, width, height);
            return light;
        }

        function createAmbientLight(color, intensity) {
            var light = new THREE.AmbientLight(color, intensity);
            return light;
        }
    },

    removeLight: function(light) {
        var index = this.lights.indexOf(light);
        if (index > 1) {
            this.remove(light);
            this.lights.splice(index, 1);
        }
    },

    removeDefaultLights: function() {
        this.remove(this.sun);
        this.remove(this.ambientLight);
    },
    // replaceSkyBoxForOrthoCamera: function() {
    //     // let texture = new THREE.Texture();
    //     // texture.image = this.envMap.image[3]; // use the bottom image
    //     // texture.needsUpdate = true;
    //     // this.background = texture;
    //     this.hasReplacedSkyBox = true;
    // },
    setSkyBoxImage: function(format, path) {
        this.envMap = Loader.loadCubeTexture(format, path);
        if (this.appParent && this.appParent.getCurrentCamera().isOrthographicCamera) {
            this.needReplacedSkyBox = true;
        } else {
            this.background = this.envMap;
        }
    },
    setSkyBox: function(px, nx, py, ny, pz, nz) {
        this.envMap = Loader.loadCubeTextureSeparate(px, nx, py, ny, pz, nz);
        if (this.appParent && this.appParent.getCurrentCamera().isOrthographicCamera) {
            this.needReplacedSkyBox = true;
        } else {
            this.background = this.envMap;
        }
    },
    setEquirectangularSkyBox: function(url) {
        let loader = new THREE.TextureLoader();
        let scope = this;
        loader.load(url, function(res) {
            if (scope.skySphere !== null) {
                scope.remove(scope.skySphere);
            }

            let radius = 100;
            let camera = scope.appParent.getCurrentCamera();
            if (camera.isPerspectiveCamera) {
                radius = 0.5 * (camera.far - camera.near);
            }

            let mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(radius, 5),
                new THREE.MeshBasicMaterial({ map: res, side: THREE.BackSide, depthWrite: false })
            );
            mesh.name = "skySphere";
            scope.skySphere = new BaseObject();
            scope.skySphere.add(mesh);
            scope.add(scope.skySphere);
            scope.background = null;
        });
    },
    getSkySphere: function() {
        if (this.skySphere === null) {
            let radius = 100;
            let camera = this.appParent.getCurrentCamera();
            if (camera.isPerspectiveCamera) {
                radius = 0.5 * (camera.far - camera.near);
            }
            let mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(radius, 5),
                new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, depthWrite: false })
            );
            mesh.name = "skySphere";
            this.skySphere = new BaseObject();
            this.skySphere.add(mesh);
            this.add(this.skySphere);
        }
        return this.skySphere;
    },
    setBackgroundColor: function(cl) {
        if (cl === null) {
            this.background = null;
            return;
        }
        this.background = new THREE.Color(cl);
    },

    setBackgroundTexture: function(path) {
        if (path === null) {
            this.background = null;
            return;
        }
        this.backgroundTexture = Loader.loadTexture(path);
        this.background = this.backgroundTexture;
    },

    showAxesHelper: function(bShow) {
        this.axesHelper.visible = bShow;
    },

    showGridHelper: function(bShow, size, center) {

        if (this.gridHelper === undefined) {
            this.gridSize = size === undefined ? 30 : (size > 30 ? size : 30);
        } else {
            if (size !== undefined) {
                this.gridSize = size;
                this.remove(this.gridHelper);
            }
        }
        let divisions = this.gridSize > 30 ? 30 : this.gridSize;
        this.gridHelper = new THREE.GridHelper(this.gridSize, divisions, 0x0000ff, 0x808080);
        this.add(this.gridHelper);

        if (center !== undefined) {
            this.gridHelper.position.copy(center);
        }
        this.gridHelper.visible = bShow;
    },

    updateGridHelper: function() {
        let bbox = this.getBoundingBox();
        let width = bbox.max.x - bbox.min.x;
        let height = bbox.max.z - bbox.min.z;
        let center = new THREE.Vector3(0, 0, 0);
        center.x = (bbox.max.x + bbox.min.x) * 0.5;
        center.z = (bbox.max.z + bbox.min.z) * 0.5;

        let size = width > height ? width : height;
        size = Math.ceil(size / 2) * 2;
        if (size < 9) {
            size = 9;
        }
        this.showGridHelper(true, size, center);
    },
    showLightHelper: function(bShow) {
        if (bShow) {
            if (this.sunHelper !== undefined) {
                this.remove(this.sunHelper);
            }
            this.sunHelper = new THREE.DirectionalLightHelper(this.sun, 10);
            this.add(this.sunHelper);
        } else {
            if (this.sunHelper !== undefined) {
                this.remove(this.sunHelper);
            }
        }
    },
    showShadowCameraHelper: function(bShow) {
        if (bShow) {
            if (this.cameraHelper !== undefined) {
                this.cameraHelper.parent.remove(this.cameraHelper);
            }
            let shadowCamera = this.sun.shadow.camera;
            let lightPositionWorld = new THREE.Vector3(0, 0, 0);
            let lightLookTarget = new THREE.Vector3(0, 0, 0);

            shadowCamera.updateProjectionMatrix();
            lightPositionWorld.setFromMatrixPosition(this.sun.matrixWorld);
            shadowCamera.position.copy(lightPositionWorld);
            lightLookTarget.setFromMatrixPosition(this.sun.target.matrixWorld);
            shadowCamera.lookAt(lightLookTarget);
            shadowCamera.updateMatrixWorld();
            this.cameraHelper = new THREE.CameraHelper(shadowCamera);
            this.add(this.cameraHelper);
        } else {
            if (this.cameraHelper !== undefined) {
                this.cameraHelper.parent.remove(this.cameraHelper);
            }
        }
    },

    clearSceneState: function() {
        // reset lights


        // reset objects outlines and labels
        this.children.forEach((element) => {
            element.traverse((child) => {
                if (child.isBaseObject) {
                    child.removeLabel();
                    child.hideOutline();
                }
            });
        });
    },

    //  config = {
    //     TIMEPERIOD: t,         // unit second
    //     ZENITHHEIGHT:     z,   //unit meter
    //     ZENITHANGLE: zAngle,   //0~PI/2
    //     AZIMUTH:  angle,       //0~2*PI
    //     INTENSITY: intensity,  //float
    //     COLOR: color,          //0xFFFFFF
    //     LOOP: true,           // true/false
    //     SHOWSUNHELPER: false,  //true/false
    //     NIGHTSKYBOX:   ""
    // }
    createDayNightAnimation: function(config) {

        this.sunAngle = 0;
        var nightSkyBoxPath = null;

        this.zenithHeight = 5000;
        this.zenithAngle = 75 / 180 * Math.PI; // default 75 degree
        this.azimuth = 0;
        this.dayNightPeriod = 5.0;
        this.enableLoop = true;
        this.playDayNightAnimation = true;
        this.aniSunColor = 0xFFFFFF;
        this.aniSunIntensity = 1;
        this.showSunLightHelper = false;

        this.aniSun = new THREE.DirectionalLight(this.aniSunColor, this.aniSunIntensity);

        this.aniSun.castShadow = true;
        this.aniSun.shadow.mapSize.width = 2048;
        this.aniSun.shadow.mapSize.height = 2048;
        this.aniSun.shadow.camera.near = 0.5;
        this.aniSun.shadow.camera.far = 1000;
        this.aniSun.shadow.camera.left = -300;
        this.aniSun.shadow.camera.right = 300;
        this.aniSun.shadow.camera.top = 350;
        this.aniSun.shadow.camera.bottom = -350;
        this.aniSun.shadow.bias = -.0003;

        if (config) {
            if (config.TIMEPERIOD !== undefined) {
                this.dayNightPeriod = config.TIMEPERIOD;
            }
            if (config.ZENITHHEIGHT !== undefined) {
                this.zenithHeight = config.ZENITHHEIGHT;
            }
            if (config.ZENITHANGLE !== undefined) {
                this.zenithAngle = config.ZENITHANGLE;
            }
            if (config.AZIMUTH !== undefined) {
                this.azimuth = config.AZIMUTH;
            }
            if (config.INTENSITY !== undefined) {
                this.aniSunIntensity = config.INTENSITY;
            }
            if (config.COLOR !== undefined) {
                this.aniSunColor = config.COLOR;
            }
            if (config.LOOP !== undefined) {
                this.enableLoop = config.LOOP;
            }
            if (config.SHOWSUNHELPER !== undefined) {
                this.showSunLightHelper = config.SHOWSUNHELPER;
            }
            if (config.NIGHTSKYBOX !== undefined) {
                nightSkyBoxPath = config.NIGHTSKYBOX;
            }
        }

        this.aniSun.intensity = this.aniSunIntensity * (0.5 + Math.sin(this.sunAngle));
        this.aniSun.color.setHex(this.aniSunColor);


        this.cosAz = Math.cos(this.azimuth);
        this.sinAz = Math.sin(this.azimuth);
        this.cosZa = Math.cos(Math.PI / 2 - this.zenithAngle);
        this.sinZa = Math.sin(Math.PI / 2 - this.zenithAngle);

        // rotate sunAngle around z-axis
        var x0 = Math.cos(this.sunAngle) * this.zenithHeight;
        var y0 = Math.sin(this.sunAngle) * this.zenithHeight;
        var z0 = 0;

        // rotate zenithAngle around x-axis
        var x1 = x0;
        var y1 = y0 * this.cosZa - z0 * this.sinZa;
        var z1 = y0 * this.sinZa + z0 * this.cosZa;

        // rotate azimuth around y-axis
        var x = x1 * this.cosAz - z1 * this.sinAz;
        var y = y1;
        var z = x1 * this.sinAz + z1 * this.cosAz;

        this.aniSun.position.set(x, y, z);

        if (this.envMap) {
            this.backupEnvMap = this.envMap;
        } else {
            this.backupBackground = this.background;
        }

        // create a night sky box
        // var nightSkyBoxPath = "../assets/MilkyWay/";
        if (nightSkyBoxPath !== null) {
            var format = "jpg";
            this.nightEnvMap = Loader.loadCubeTexture(format, nightSkyBoxPath);
        }

        this.aniAmbLight = new THREE.AmbientLight(0xFFFFFF, 1);

        this.lights.forEach((element) => {
            this.remove(element);
        });

        this.add(this.aniSun);
        this.add(this.ambientLight);

        if (this.showSunLightHelper) {
            this.sunHelper = new THREE.DirectionalLightHelper(this.aniSun, 10);
            this.add(this.sunHelper);
        }

        this.clock.start();
        this.dayNigthtEnabled = true;
        this.updateDayNightAnimation();
    },

    setSunAngle: function(angle, distance = 100) {
        this.sun.position.x = Math.cos(angle) * distance;
        this.sun.position.y = Math.sin(angle) * distance;
        this.sun.position.z = 0;
    },

    setSunAzimuth: function(azimuth) {
        this.sun.position.x = this.sun.position.x * Math.cos(azimuth) - this.sun.position.z * Math.sin(azimuth);// this.sinAz;
        // this.sun.y = this.sun.y;
        this.sun.position.z = this.sun.position.x * Math.sin(azimuth) + this.sun.position.z * Math.cos(azimuth);// this.cosAz;

    },

    pauseDayNightAnimation: function() {
        if (this.dayNigthtEnabled) {
            this.playDayNightAnimation = false;
        }
    },

    startDayNightAnimation: function() {
        if (this.dayNigthtEnabled) {
            this.playDayNightAnimation = true;
        }
    },

    stopDayNightAnimation: function() {
        this.playDayNightAnimation = false;
        if (this.backupEnvMap) {
            this.background = this.backupEnvMap;
        } else {
            this.background = this.backupBackground;
        }

        this.remove(this.aniSun);
        this.remove(this.aniAmbLight);
        if (this.showSunLightHelper) {
            this.remove(this.sunHelper);
        }

        this.lights.forEach((element) => {
            this.add(element);
        });
        this.dayNigthtEnabled = false;
    },

    updateDayNightAnimation: function() {
        let delta = this.clock.getDelta();
        // if (!this.pauseAnimation)
        this.sunAngle += delta / this.dayNightPeriod * Math.PI * 2;

        if (this.sunAngle > Math.PI * 2) {
            if (!this.enableLoop) {
                this.stopDayNightAnimation();
                return;
            }

            while (this.sunAngle > Math.PI * 2) {
                this.sunAngle -= Math.PI * 2;
            }
        }

        // rotate sunAngle around z-axis
        var x0 = Math.cos(this.sunAngle) * this.zenithHeight;
        var y0 = Math.sin(this.sunAngle) * this.zenithHeight;
        var z0 = 0;

        // rotate zenithAngle around x-axis
        var x1 = x0;
        var y1 = y0 * this.cosZa - z0 * this.sinZa;
        var z1 = y0 * this.sinZa + z0 * this.cosZa;

        // rotate azimuth around y-axis
        var x = x1 * this.cosAz - z1 * this.sinAz;
        var y = y1;
        var z = x1 * this.sinAz + z1 * this.cosAz;

        this.aniSun.position.set(x, y, z);

        var phase = this.getCurrentPhase(this.sunAngle);
        if (phase === "day") {
            this.aniSun.color.setHex(this.aniSunColor);
            this.aniSun.intensity = this.aniSunIntensity * (0.5 + Math.sin(this.sunAngle));
            this.aniAmbLight.intensity = 1;

            if (this.backupEnvMap) {
                this.background = this.backupEnvMap;
            } else {
                this.background = this.backupBackground;
            }
        } else if (phase === "twilight") {
            this.aniSun.color.set("rgb(" + (255 - Math.floor(Math.sin(this.sunAngle) * 510 * -1)) +
                "," + (55 - Math.floor(Math.sin(this.sunAngle) * 110 * -1)) + ",0)");
            this.aniSun.intensity = this.aniSunIntensity * (0.5 + Math.sin(this.sunAngle));
            this.aniAmbLight.intensity = 0.5 + Math.sin(this.sunAngle);

            if (this.backupEnvMap) {
                this.background = this.backupEnvMap;
            } else {
                this.background = this.backupBackground;
            }
        } else {
            if (this.nightEnvMap) {
                this.background = this.nightEnvMap;
            }
            this.aniSun.intensity = 0;
            this.aniAmbLight.intensity = 0.1;
        }

        if (this.showSunLightHelper) {
            this.updateSunHelper();
        }
    },
    updateSunHelper: function() {
        if (this.sunHelper) {
            this.sunHelper.update();
        }
    },

    getCurrentPhase: function(sunAngle) {
        if (Math.sin(sunAngle) > Math.sin(0)) {
            return "day";
        } else if (Math.sin(sunAngle) > Math.sin(-Math.PI / 6)) {
            return "twilight";
        } else {
            return "night";
        }
    },
    //  selectable = null : it will preserve the isSelectable field of all the meshes
    //  selectable = false / true, it will override the isSelectable field of all child meshes

    add: function(object, selectable = null) {

        THREE.Scene.prototype.add.call(this, object);
        if (selectable !== null) {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.isSelectable = selectable;
                }
            });
        }
    },
    remove: function(object) {
        THREE.Scene.prototype.remove.call(this, object);
    },
    getBoundingBox: function() {
        let bbox = new THREE.Box3();
        let iBox = new THREE.Box3();
        this.updateMatrixWorld();
        this.traverse((object) => {
            if (object.isMesh) {
                bbox.union(iBox.setFromObject(object));
            }
        });

        if (bbox.min.x === Infinity || bbox.max.x === -Infinity) {
            bbox.min.x = bbox.max.x = 0;
        }
        if (bbox.min.y === Infinity || bbox.max.y === -Infinity) {
            bbox.min.y = bbox.max.y = 0;
        }
        if (bbox.min.z === Infinity || bbox.max.z === -Infinity) {
            bbox.min.z = bbox.max.z = 0;
        }

        return bbox;
    },
    updateShadowRange: function(sun) {
        this.updateMatrixWorld();
        let bboxShadow = new THREE.Box3();
        let bbox = new THREE.Box3();
        this.traverse((object) => {
            if (object.isMesh && object.castShadow) {
                // if (object.isMesh) {
                bboxShadow.union(bbox.setFromObject(object));
            }
        });
        if (bboxShadow.min.x === Infinity || bboxShadow.min.y === Infinity || bboxShadow.min.y === Infinity ||
            bboxShadow.max.x === -Infinity || bboxShadow.max.y === -Infinity || bboxShadow.max.y === -Infinity) {
            return;
        }
        let pts = [
            { x: bboxShadow.min.x, y: bboxShadow.min.y, z: bboxShadow.min.z },
            { x: bboxShadow.min.x, y: bboxShadow.max.y, z: bboxShadow.min.z },
            { x: bboxShadow.min.x, y: bboxShadow.max.y, z: bboxShadow.max.z },
            { x: bboxShadow.min.x, y: bboxShadow.min.y, z: bboxShadow.max.z },
            { x: bboxShadow.max.x, y: bboxShadow.min.y, z: bboxShadow.min.z },
            { x: bboxShadow.max.x, y: bboxShadow.max.y, z: bboxShadow.min.z },
            { x: bboxShadow.max.x, y: bboxShadow.max.y, z: bboxShadow.max.z },
            { x: bboxShadow.max.x, y: bboxShadow.min.y, z: bboxShadow.max.z }
        ];

        let shadowCamera = sun.shadow.camera;
        let lightPositionWorld = new THREE.Vector3(0, 0, 0);
        let lightLookTarget = new THREE.Vector3(0, 0, 0);

        shadowCamera.updateProjectionMatrix();
        lightPositionWorld.setFromMatrixPosition(sun.matrixWorld);
        shadowCamera.position.copy(lightPositionWorld);
        lightLookTarget.setFromMatrixPosition(sun.target.matrixWorld);
        shadowCamera.lookAt(lightLookTarget);
        shadowCamera.updateMatrixWorld();

        let width = shadowCamera.right - shadowCamera.left;
        let height = shadowCamera.top - shadowCamera.bottom;

        let lightNormal = new THREE.Vector3(lightLookTarget.x - lightPositionWorld.x, lightLookTarget.y - lightPositionWorld.y, lightLookTarget.z - lightPositionWorld.z);
        let far = -Infinity, near = Infinity;
        let rangeBox = new THREE.Box3();
        pts.forEach((pt) => {
            let v0 = new THREE.Vector3(pt.x - lightPositionWorld.x, pt.y - lightPositionWorld.y, pt.z - lightPositionWorld.z);

            let projectVec = v0.projectOnVector(lightNormal);
            var scalar = v0.dot(lightNormal) / lightNormal.lengthSq();

            let dis = projectVec.length();
            if (scalar > 0) {
                if (far < dis) {
                    far = dis;
                }
            } else {
                if (near > dis) {
                    near = -dis;
                }
            }

            let v1 = new THREE.Vector3(pt.x, pt.y, pt.z);
            v1.project(shadowCamera);
            let v2 = new THREE.Vector3();
            v2.x = (v1.x + 1) * width / 2;
            v2.y = (-v1.y - 1) * height / 2;
            rangeBox.min.min(v2);
            rangeBox.max.max(v2);
        });

        let v0 = new THREE.Vector3(lightPositionWorld.x, lightPositionWorld.y, lightPositionWorld.z);
        v0.project(shadowCamera);
        v0.x = Math.round((v0.x + 1) * width / 2),
        v0.y = Math.round((-v0.y - 1) * height / 2);

        shadowCamera.far = far > 500 ? far : 500;
        shadowCamera.near = near < 0.1 ? near : 0.1;
        shadowCamera.left = rangeBox.min.x - v0.x;
        shadowCamera.right = rangeBox.max.x - v0.x;
        shadowCamera.top = v0.y - rangeBox.min.y;
        shadowCamera.bottom = v0.y - rangeBox.max.y;

        width = shadowCamera.right - shadowCamera.left;
        height = shadowCamera.top - shadowCamera.bottom;

        sun.shadow.mapSize.width = Math.pow(2, Math.floor(Math.log2(width)));
        sun.shadow.mapSize.height = Math.pow(2, Math.floor(Math.log2(height)));

        if (sun.shadow.mapSize.width > 4096) {
            sun.shadow.mapSize.width = 4096;
        }
        if (sun.shadow.mapSize.height > 4096) {
            sun.shadow.mapSize.height = 4096;
        }
    },
    updateAnimations: function(delta, camera) {
        if (this.playDayNightAnimation) {
            this.updateDayNightAnimation();
        }

        if (this.showSunLightHelper) {
            this.updateSunHelper();
        }

        this.traverse((object) => {
            if (object.isBaseObject) {
                object.updateAnimations(delta, camera);
            }

            if (object.isControls) {
                object.updateControls(delta);
            }
        });

        if (this.skySphere) {
            this.skySphere.position.copy(this.appParent.getCurrentCamera().position);
        }

        // Play animations
        this.animations.updateAnimations(delta);
    },
    dispatchEvent: function(event) {
        THREE.Scene.prototype.dispatchEvent.call(this, event);
        if (event.type === "switched-out") {
            this.traverse((object) => {
                if (object.isBaseObject) {
                    object.removeLabel();
                }
            });
        }
    },
    queryForObject: function(nameExp) {
        var result = [];
        this.traverse((child) => {
            if (child.isBaseObject) {
                if (child.name.search(nameExp) !== -1) {
                    result.push(child);
                }
            }
        });
        return result;
    },
    addFixedTexture: function(name, image, scalex, scaley, positionx, positiony) {
        let texture = Loader.loadTexture(image);
        var spriteMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, sizeAttenuation: false });
        spriteMaterial.depthTest = false;
        var plane = new THREE.Sprite(spriteMaterial);

        plane.scale.set(scalex, scaley, 1);


        if (plane.geometry.boundingBox === null) {
            plane.geometry.computeBoundingBox();
        }
        let halfLogoWidth = (plane.geometry.boundingBox.max.x - plane.geometry.boundingBox.min.x) / 2;
        let halfLogoHeight = (plane.geometry.boundingBox.max.y - plane.geometry.boundingBox.min.y) / 2;
        let pivot = new BaseObject();
        pivot.name = name;
        pivot.add(plane);
        plane.position.x -= halfLogoWidth;
        plane.position.y += halfLogoHeight;

        this.add(pivot);

        let logoUpdate = function(logo, scene) {
            if (scene.appParent == null) {
                return true;
            }

            // scene.updateMatrixWorld();
            let camera = scene.appParent.getCurrentCamera();
            let updateObject = camera;
            while (updateObject.parent !== null) {
                updateObject = updateObject.parent;
            }
            updateObject.updateMatrixWorld();
            camera.updateProjectionMatrix();

            // if (this.oldCameraPosition === undefined) {
            //    this.oldCameraPosition  = new THREE.Vector3();
            //    camera.getWorldPosition(this.oldCameraPosition);
            //    this.oldCameraRotation = new THREE.Vector3();
            //    this.oldCameraRotation.copy(camera.rotation);
            // }else if (this.oldCameraPosition.distanceTo(camera.position) < .0001 && (this.oldCameraRotation.distanceTo(camera.rotation) < .0001)) {
            //    return true;
            // }
            // this.oldCameraPosition.copy(camera.position);
            // this.oldCameraRotation.copy(camera.rotation);


            var vector = new THREE.Vector3(positionx, positiony, .5);

            vector.unproject(camera);
            let worldPosition = new THREE.Vector3();
            camera.getWorldPosition(worldPosition);
            var dir = vector.sub(worldPosition).normalize();
            var distance = 10;
            camera.getWorldPosition(logo.position);
            logo.position.add(dir.multiplyScalar(distance));
            let quaternion = new THREE.Quaternion();
            camera.getWorldQuaternion(quaternion);
            logo.setRotationFromQuaternion(quaternion);
            return true;
        };
        let animation = new Animation("name", logoUpdate, [pivot, this]);
        this.animations.addWithReplace(animation);
    },
    addFog: function(color, near, far) {
        this.fog = new THREE.Fog(color, near, far);
    },
    addFogExp2: function(color, density) {
        this.fog = new THREE.FogExp2(color, density);
    }
});

export { BaseScene };

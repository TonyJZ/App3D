import * as THREE from "../thirdParty/build/three.module.js";
import * as EXTRA from "../thirdParty/build/extra.module.js";
import {BaseObject} from "./BaseObject.js";
import {BaseScene} from "./BaseScene.js";
import {Events} from "./Constants.js";
import {Mixer} from "./Mixer.js";

var JsonLoader = function() {};

JsonLoader.prototype.load = function(modelPath, callback) {
    let jsonLoader = new THREE.JSONLoader();
    jsonLoader.load(modelPath, (geometry) => {
        let material = new THREE.MeshLambertMaterial({ morphTargets: true, vertexColors: THREE.FaceColors });
        let mesh = new THREE.Mesh(geometry, material);
        let group = new THREE.Group();
        group.add(mesh);
        callback({
            scene: group,
            animations: geometry.animations,
            animationRoot: mesh
        });
    });
};

var Loader = (function() {

    function gltfSceneFix(scene) {
        var group = new THREE.Group();
        for (let i = scene.children.length - 1; i >= 0; i--) {
            group.add(scene.children[i]);
        }
        return group;
    }


    return {
        loadSite: function(sceneName, siteObj, eventCallbacks = {}, newScene = null) {
            let targetSceneConfig;
            // If name isn't specified, that means that we're loading the default scene
            if (sceneName === null) {
                targetSceneConfig = this.getPrimaryScene(siteObj);
            } else {
                targetSceneConfig = siteObj.scenes.filter(ea => ea.name === sceneName)[0]; // eslint-disable-line arrow-parens
            }
            if (targetSceneConfig !== undefined) {
                if (targetSceneConfig.baseScene === undefined) {
                    if (newScene === null) {
                        newScene = new BaseScene();
                    }

                    newScene.name = targetSceneConfig.name;
                    targetSceneConfig.baseScene = newScene;
                    newScene.info = targetSceneConfig;
                    let sceneObjs = targetSceneConfig.objects;

                    let count = {
                        total:      sceneObjs.length,
                        remaining:  sceneObjs.length
                    };

                    if (count.remaining == 0) {
                        if (eventCallbacks !== null && (eventCallbacks[Events.ONPROGRESS] !== null && eventCallbacks[Events.ONPROGRESS] !== undefined)) {
                            eventCallbacks[Events.ONPROGRESS](count);
                        }
                        if (eventCallbacks !== null && (eventCallbacks[Events.ONLOAD] !== null && eventCallbacks[Events.ONLOAD] !== undefined)) {
                            eventCallbacks[Events.ONLOAD](newScene);
                        }
                    } else {
                        eventCallbacks[Events.FILE_LOADED] = function(filledObj, scene) {
                            scene.add(filledObj, true);
                        };
                        // Load all the objects
                        sceneObjs.forEach((objConfig) => {
                            let tempObj = new BaseObject(objConfig);
                            this.loadComponent(tempObj, objConfig, targetSceneConfig, newScene, eventCallbacks, count);

                        });
                    }
                    // set sun parameters
                    if (targetSceneConfig.sun !== undefined && targetSceneConfig.sun !== null) {
                        if (targetSceneConfig.sun.intensity !== undefined) {
                            newScene.setSunIntensity(targetSceneConfig.sun.intensity);
                        } else if (targetSceneConfig.sun.angle !== undefined) {
                            newScene.setSunAngle(targetSceneConfig.sun.angle);
                        } else if (targetSceneConfig.sun.azimuth !== undefined) {
                            newScene.setSunAzimuth(targetSceneConfig.sun.azimuth);
                        }
                    }


                    // load skybox
                    if (
                        (targetSceneConfig.environment !== undefined && targetSceneConfig.environment !== null) &&
                        (targetSceneConfig.environment.skybox !== undefined && targetSceneConfig.environment.skybox !== null)
                    ) {
                        newScene.setSkyBox(
                            targetSceneConfig.environment.skybox.px,
                            targetSceneConfig.environment.skybox.nx,
                            targetSceneConfig.environment.skybox.py,
                            targetSceneConfig.environment.skybox.ny,
                            targetSceneConfig.environment.skybox.pz,
                            targetSceneConfig.environment.skybox.nz
                        );
                    }
                } else {
                    if (eventCallbacks !== null && (eventCallbacks[Events.ONLOAD] !== null && eventCallbacks[Events.ONLOAD] !== undefined)) {
                        eventCallbacks[Events.ONLOAD](targetSceneConfig.baseScene);
                    }
                }
                return targetSceneConfig.baseScene;
            } else {
                // If 'targetSceneConfig' is still undefined by this point, that means there's a problem with the scenes array
                console.error("There is a problem with the 'scenes' array of your site object. " +
                              "Please consult the APP3D tutorials for instructions on how to initialize a scene");
            }
        },
        loadComponent: function(baseObj, objConfig, targetSceneConfig, scene, eventCallbacks, count = {total: 1, remaining: 1}) {
            this.loadModel(objConfig.path, (object) => {
                if (objConfig.type === "ground") {
                    object.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = false;
                        }
                    });
                }

                let objectThree = object.scene;
                // Fix the gltf scene load issue:
                if (objectThree.type === "Scene") {
                    objectThree = gltfSceneFix(objectThree);
                }
                objectThree.updateMatrixWorld(true);
                // Create a BaseObject and wrap the object:
                baseObj.add(objectThree);
                if (object.animations !== undefined && object.animations.length !== 0) {
                    object.animations.forEach((anime) => {
                        let animeConfig = null;
                        if (objConfig.animations !== undefined) {
                            animeConfig = objConfig.animations.filter((ea) => ea.name === anime.name)[0];
                        }
                        if (!animeConfig) {
                            animeConfig = {
                                startPaused: objConfig.startPaused === undefined ? false : objConfig.startPaused,
                                timeScale:   objConfig.timeScale === undefined ? 1 : objConfig.timeScale
                            };
                        }
                        let isPaused = animeConfig.startPaused === undefined ? false : animeConfig.startPaused;
                        let timeScale = animeConfig.timeScale === undefined ? 1 : animeConfig.timeScale;
                        let mixer = new Mixer(anime.name, objectThree, !isPaused);
                        let animationAction = mixer.clipAction(anime, object.animationRoot).play();
                        mixer.setClipAction(animationAction);
                        mixer.timeScale = timeScale;
                        baseObj.mixers.push(mixer);
                    });
                }
                if (objConfig.loadHidden) {
                    baseObj.setVisibility(false);
                }

                // Correct "pivot point"
                let vec3 = new THREE.Vector3();
                let bbox = new THREE.Box3().setFromObject(objectThree);
                bbox.getCenter(vec3);
                let originalPosition = new THREE.Vector3();
                objectThree.getWorldPosition(originalPosition);
                baseObj.position.setX(vec3.x);
                baseObj.position.setZ(vec3.z);
                baseObj.position.setY(bbox.min.y);
                objectThree.position.setX(originalPosition.x - vec3.x);
                objectThree.position.setZ(originalPosition.z - vec3.z);
                objectThree.position.setY(originalPosition.y - bbox.min.y);

                if (objConfig.matrix !== null && objConfig.matrix !== undefined) {
                    baseObj.applyMatrix(objConfig.matrix);
                }

                if (objConfig.selectableObjectExp !== null && objConfig.selectableObjectExp !== undefined) {
                    this.preprocess(baseObj, objConfig.selectableObjectExp);
                }
                objConfig.model = baseObj;

                eventCallbacks[Events.FILE_LOADED](baseObj, scene);

                if (count) {
                    count.remaining -= 1;
                    if (eventCallbacks !== null &&
                        (eventCallbacks[Events.ONPROGRESS] !== null && eventCallbacks[Events.ONPROGRESS] !== undefined)) {
                        eventCallbacks[Events.ONPROGRESS](count);
                    }
                    if (count.remaining == 0 && eventCallbacks !== null &&
                        (eventCallbacks[Events.ONLOAD] !== null && eventCallbacks[Events.ONLOAD] !== undefined)) {
                        if (targetSceneConfig !== null) {
                            this.finishedLoading(targetSceneConfig, scene);
                        }
                        eventCallbacks[Events.ONLOAD](scene);
                    }
                }

            });
        },
        preprocess: function(object, selectableObjectExp) {
            let toPreprocess = [];

            object.traverse((child) => {
                if (child.type == "Group" || child.type == "Object3D" || child.type == "Mesh") {
                    let name = child.name;
                    for (let i = 0; i < selectableObjectExp.length; i++) {
                        let searchExp = (selectableObjectExp[i].searchExp === null || selectableObjectExp[i].searchExp === undefined) ? selectableObjectExp[i].name : selectableObjectExp[i].searchExp;
                        if (name !== null && name === searchExp) {
                            toPreprocess.push({
                                object: child,
                                info:   selectableObjectExp[i]
                            });
                            break;
                        }
                    }
                }
            });

            toPreprocess.forEach((child) => {
                let parent = child.object.parent;
                let baseObj = new BaseObject();
                baseObj.name = child.info.name;
                parent.remove(child.object);
                baseObj.add(child.object);
                baseObj.info = child.info;
                parent.add(baseObj);

                if (child.info.loadHidden) {
                    baseObj.setVisibility(false);
                }
            });
        },
        loadModel: function(modelPath, cb) {
            let ext = modelPath.split(".").pop().toLowerCase();

            let loader = null;
            switch (ext) {
                case "app1":    loader = new EXTRA.ColladaLoader(); break;
                case "app2":
                case "app3":    loader = new EXTRA.GLTFLoader();    break;
                case "app4":    loader = new EXTRA.FBXLoader();     break;
                case "app5":    loader  = new JsonLoader();         break;
                case "stl":     loader = new EXTRA.STLLoader();    break;
                default:
                    console.error("Unsupported model file type: '" + ext + "' (" + modelPath + "). " +
                                  "Please check the API docs and double-check your file extensions");
                    return;
            }
            // loader.setCrossOrigin("");
            // loader.crossOrigin = '';
            loader.load(modelPath, (buf) => {
                let object = null;
                if (ext === "app4") {
                    object = {
                        scene:      buf,
                        animations: buf.animations
                    };
                } else if (ext === "stl") {
                    let geometry = buf;
                    let material = new THREE.MeshPhongMaterial({ color: 0xFFFF00, specular: 0x111111, shininess: 200, side: THREE.DoubleSide });
                    let mesh = new THREE.Mesh(geometry, material);
                    object = {
                        scene:      mesh,
                    };
                } else {
                    object = buf;
                }
                object.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                if (cb !== null) {
                    cb(object);
                }
            });
        },
        finishedLoading: function(siteObj, scene) {
            let sceneObjs = siteObj.objects;
            sceneObjs.forEach((obj) => {
                if (obj.subObjects !== undefined && obj.subObjects !== null) {
                    obj.subObjects.forEach((deviceName) => {
                        let subObj = scene.queryForObject(deviceName)[0];
                        if (subObj === undefined) {
                            // console.error("Could not find child object '" + deviceName +
                            //   "' while loading parent object '" + obj.name + "'");
                        } else {
                            let parent = subObj.parent;
                            parent.updateMatrixWorld();
                            EXTRA.SceneUtils.detach(subObj, parent, scene);
                            obj.model.updateMatrixWorld();
                            EXTRA.SceneUtils.attach(subObj, scene, obj.model);
                            subObj.info.name = deviceName;
                            subObj.info.labelMode = "boundingBox";
                        }
                    });
                }
            });
        },
        loadTexture: function(path) {
            var texture = new THREE.TextureLoader().load(path);
            return texture;
        },
        loadCubeTexture: function(format, path) {
            var ext = "." + format; // ".jpg";
            var skyboxPath = path;
            var texture = new THREE.CubeTextureLoader().load([
                skyboxPath + "px" + ext, skyboxPath + "nx" + ext,
                skyboxPath + "py" + ext, skyboxPath + "ny" + ext,
                skyboxPath + "pz" + ext, skyboxPath + "nz" + ext
            ]);

            return texture;
        },
        loadCubeTextureSeparate: function(px, nx, py, ny, pz, nz) {
            var loader = new THREE.CubeTextureLoader();
            loader.crossOrigin = "";
            var texture = loader.load([
                px, nx,
                py, ny,
                pz, nz
            ]);

            return texture;
        },
        getPrimaryScene: function(siteObj) {
            // Look for whichever scene the user designated as their primary scene, otherwise simply
            // use the first scene in the array.
            let targetSceneConfig = siteObj.scenes.filter(ea => ea.isPrimary)[0]; // eslint-disable-line arrow-parens
            if (targetSceneConfig === undefined) {
                targetSceneConfig = siteObj.scenes[0];
            }
            return targetSceneConfig;
        }
    };
}());

export {Loader};

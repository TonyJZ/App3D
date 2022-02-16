import * as THREE from "../thirdParty/build/three.module.js";
// import {Loader} from "./Loader.js";
import {BaseObject} from "./BaseObject.js";
import {Animation} from "./Animation.js";

function Pipeline() {
    BaseObject.call(this);
    this.type = "Pipeline";
    this.playAnimation = true;
}

Pipeline.prototype = Object.assign(Object.create(BaseObject.prototype), {

    constructor: Pipeline,
    isPipeline: true,

    create: function(name, label, pipeStyle, routeArray) {
        // var scope = this;
        this.name = name;
        this.fullRoute = new THREE.CurvePath();
        // this.fullGeometry = null;
        this.arrowsTextures = [];

        this.style = {
            tubularSegments: 0,
            radialSegments: 0,
            closed: false,
            color:  0xffffff,
            textureUrl: "",
            textureRotation:    0,
            speed:              1,
            radius:             1,
            textureUnitS:  1,
            textureUnitT:  1,
            routeType:          0,
            connectionRadius:   0,
            tileDisplayDuration:   50
        };

        if (pipeStyle !== undefined) {
            this.style.tubularSegments = pipeStyle.tubularSegments === undefined ? this.style.tubularSegments : pipeStyle.tubularSegments;
            this.style.radialSegments = pipeStyle.radialSegments === undefined ? this.style.radialSegments : pipeStyle.radialSegments;
            this.style.closed = pipeStyle.closed === undefined ? this.style.closed : pipeStyle.closed;
            this.style.color = pipeStyle.color === undefined ? this.style.color : pipeStyle.color;
            this.style.textureUrl = pipeStyle.textureUrl === undefined ? this.style.textureUrl : pipeStyle.textureUrl;
            this.style.textureRotation = pipeStyle.textureRotation === undefined ? this.style.textureRotation : pipeStyle.textureRotation;
            this.style.speed = pipeStyle.speed === undefined ? this.style.speed : pipeStyle.speed;
            this.style.radius = pipeStyle.radius === undefined ? this.style.radius : pipeStyle.radius;
            this.style.textureUnitS = pipeStyle.textureUnitS === undefined ? this.style.textureUnitS : pipeStyle.textureUnitS;
            this.style.textureUnitT = pipeStyle.textureUnitT === undefined ? this.style.textureUnitT : pipeStyle.textureUnitT;
            this.style.routeType = pipeStyle.routeType === undefined ? this.style.routeType : pipeStyle.routeType;
            this.style.connectionRadius = pipeStyle.connectionRadius === undefined ? this.style.connectionRadius : pipeStyle.connectionRadius;
            this.style.tileDisplayDuration = pipeStyle.tileDisplayDuration === undefined ? this.style.tileDisplayDuration : pipeStyle.tileDisplayDuration;
        }

        routeArray.forEach((segment) => {

            let style = segment.segStyle;
            if (style !== undefined) {
                this.style.tubularSegments = style.tubularSegments === undefined ? this.style.tubularSegments : style.tubularSegments;
                this.style.radialSegments = style.radialSegments === undefined ? this.style.radialSegments : style.radialSegments;
                this.style.routeType = style.routeType === undefined ? this.style.routeType : style.routeType;
                this.style.connectionRadius = style.connectionRadius === undefined ? this.style.connectionRadius : style.connectionRadius;
            }

            let route  = segment.route;
            let curev = buildPipes(route, this.style.routeType, this.style.connectionRadius);
            let curevLen = curev.getLength();
            if (this.style.tubularSegments === 0) {
                this.style.tubularSegments = Math.ceil(curevLen) * 1;
                if (this.style.tubularSegments < 256) {
                    this.style.tubularSegments = 256;
                }
                if (this.style.tubularSegments > 1024) {
                    this.style.tubularSegments = 1024;
                }
            }

            if (this.style.radialSegments === 0) {
                this.style.radialSegments = this.style.radius * 8;
                if (this.style.radialSegments < 8) {
                    this.style.radialSegments = 8;
                }
                if (this.style.radialSegments > 64) {
                    this.style.radialSegments = 64;
                }
            }

            // geometry
            let geometry = new THREE.TubeGeometry(curev,  this.style.tubularSegments, this.style.radius,
                this.style.radialSegments, this.style.closed);

            let arrowsTexture = new THREE.TextureLoader().load(this.style.textureUrl);
            let arrowsMaterial = new THREE.MeshBasicMaterial({ map: arrowsTexture });

            arrowsMaterial.transparent = true;
            arrowsMaterial.side = THREE.FrontSide;

            let repeatHor = Math.floor(curevLen / this.style.textureUnitS);
            let repeatVer = Math.floor(this.style.radius * 2 * Math.PI / this.style.textureUnitT);
            if (repeatHor < 1) {
                repeatHor = 1;
            }
            if (repeatVer < 1) {
                repeatVer = 1;
            }

            arrowsTexture.repeat.set(repeatHor, repeatVer);
            arrowsTexture.wrapS = arrowsTexture.wrapT = THREE.RepeatWrapping;
            arrowsMaterial.color.setHex(this.style.color);

            let textureMap = arrowsMaterial.map;
            textureMap.rotation = this.style.textureRotation;

            // let material =  new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.3, wireframe: true, transparent: true } );
            let mesh = new THREE.Mesh(geometry, arrowsMaterial);
            mesh.renderOrder = -1;

            BaseObject.prototype.add.call(this, mesh);

            this.arrowsTextures.push(arrowsTexture);

            this.fullRoute.add(curev);
        });


        this.setVisibility(true);


        // how long has the current image been displayed?
        this.currentDisplayTime = 0;
        // which image is currently being displayed?
        this.currentTile = 0;

        // set info
        this.info = {
            name: name,
            route: routeArray,
            style: pipeStyle,
            label: (label === undefined || label  === null) ? "Pipe " + name : label
        };


        this.setAnimationSpeed(this.style.speed);
        this.tilesVertical = 0;

        let animation = new Animation("pipeLineAnimation", this.updateTextureAnimation, [this]);
        this.animations.add(animation);
        return;


        function buildPipes(route, routeType, connectionRadius) {
            var points = [];
            var pipePath = null;

            if (route.length < 2) {
                console.log("cannot create a pipeline with less than 2 vertices!");
            } else {
                for (var j = 0; j < route.length; ++j) {
                    var pt = route[j];
                    points.push(new THREE.Vector3(pt[0], pt[2], -pt[1]));
                }
                pipePath = new THREE.CurvePath();

                if (routeType === 0) {
                    createPipePathStraight(points, pipePath);
                } else if (routeType === 1) {
                    createPipePathSmoothCorner(points, pipePath, connectionRadius);
                }
            }
            return pipePath;
        }

        function createPipePathStraight(points, path) {
            for (var i = 0; i < points.length - 1; i++) {

                var line = new THREE.LineCurve3(points[i], points[i + 1]);
                path.add(line);
            }
        }

        function createPipePathSmoothCorner(points, path, denseInterval) {

            if (points.length === 2) {
                let line = new THREE.LineCurve3(points[0], points[1]);
                path.add(line);
            } else {
                for (var i = 0; i < points.length - 2; i++) {
                    let line1 = new THREE.LineCurve3(points[i], points[i + 1]);
                    let line2 = new THREE.LineCurve3(points[i + 1], points[i + 2]);

                    let len1 = line1.getLength();
                    let len2 = line2.getLength();

                    if (len1 < denseInterval && len2 < denseInterval) {
                        let curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], points[i + 2]);
                        path.add(curve);
                        i++;
                    } else {
                        if (len1 < denseInterval) {
                            // let t1 = 0.5;
                            // let pt1 = line1.getPoint(t1);


                            let t2 = denseInterval / len2;
                            let pt2 = line2.getPoint(t2);


                            let curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], pt2);
                            path.add(curve);
                            points[i + 1] = pt2;
                            continue;
                        }

                        if (len2 < denseInterval) {
                            let t1 = 1 - denseInterval / len1;
                            let pt1 = line1.getPoint(t1);


                            let t2 = 0.5;
                            let pt2 = line2.getPoint(t2);


                            let line = new THREE.LineCurve3(points[i], pt1);
                            path.add(line);
                            let curve = new THREE.QuadraticBezierCurve3(pt1, points[i + 1], pt2);
                            path.add(curve);
                            points[i + 1] = pt2;
                            continue;
                        }

                        {
                            let t1 = 1 - denseInterval / len1;
                            let pt1 = line1.getPoint(t1);

                            let t2 = denseInterval / len2;
                            let pt2 = line2.getPoint(t2);

                            let line = new THREE.LineCurve3(points[i], pt1);
                            path.add(line);
                            let curve = new THREE.QuadraticBezierCurve3(pt1, points[i + 1], pt2);
                            path.add(curve);
                            points[i + 1] = pt2;
                        }
                    }
                }
                let line = new THREE.LineCurve3(points[i], points[i + 1]);
                path.add(line);
            }
        }
    },

    updateTextureAnimation: function(object, delta) {
        if (object.playAnimation) {
            let milliSec = 1000 * delta;
            object.currentDisplayTime += milliSec;
            while (object.currentDisplayTime > object.style.tileDisplayDuration) {
                object.currentDisplayTime -= object.style.tileDisplayDuration;
                object.currentTile++;

                if (object.tilesHorizontal === 0) {
                    object.arrowsTextures.forEach((arrowsTexture) => {
                        arrowsTexture.offset.x = 0;
                    });
                } else {
                    let currentColumn = object.currentTile % object.tilesHorizontal;
                    object.arrowsTextures.forEach((arrowsTexture) => {
                        arrowsTexture.offset.x = -(currentColumn / object.tilesHorizontal);
                    });
                }

                if (object.tilesVertical === 0) {
                    object.arrowsTextures.forEach((arrowsTexture) => {
                        arrowsTexture.offset.y = 0;
                    });
                } else {
                    let currentRow = object.currentTile % object.tilesVertical;
                    object.arrowsTextures.forEach((arrowsTexture) => {
                        arrowsTexture.offset.y = currentRow / object.tilesVertical;
                    });
                }
            }
        }
    },

    setAnimationSpeed: function(speed) {
        this.style.speed = speed;
        if (speed === 0) {
            this.tilesHorizontal = 0;
        } else {
            this.tilesHorizontal = 100 / this.style.speed;
        }
    },

    pauseAnimation: function() {
        this.playAnimation = false;
    },

    startAnimation: function() {
        this.playAnimation = true;
    },
    getLabelAnchor: function(target) {
        if (target === undefined) {
            target = new THREE.Vector3();
        }
        target.copy(this.fullRoute.getPoint(0.5));
        return target;
    }

});

export {Pipeline};

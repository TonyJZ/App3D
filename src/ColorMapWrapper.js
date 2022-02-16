import * as THREE from "../thirdParty/build/three.module.js";
import { Lut } from "../thirdParty/build/extra.module.js";

function ColorMapWrapper(obj, parameters) {
    this.colors;
    this.values;
    this.obj = obj;
    this.lut = new Lut();
    this.params = {
        colorMap: "rainbow",
        colorValueMax: 1000,
        colorValueMin: -1000,
        datas: [],
        valueMethod: "gradual", // "default","gradual","idw"
        valueName: null,
        opacity: 1.0,
        transparent: false,
    };
    this.apply(parameters);
}

ColorMapWrapper.prototype = Object.assign(Object.create(ColorMapWrapper.prototype), {

    constructor: ColorMapWrapper,
    isColormapWrapper: true,

    apply: function (parameters) {
        this.updateParameters(parameters);
        this.obj.traverse((child) => {
            if (child.isMesh) {
                this.iniColorsValues(child);
                this.changeMaterial(child, this.params);
                this.updateColors(child, this.params);
            }
        });
    },
    update: function (parameters) {
        this.updateParameters(parameters);
        this.obj.traverse((child) => {
            if (child.isMesh) {
                this.updateColors(child, this.params);
            }
        });
    },

    updateParameters: function (parameters) {
        for (let key in this.params) {
            this.params[key] = parameters[key] === undefined ? this.params[key] : parameters[key];
        }
    },
    iniColorsValues: function (mesh) {
        if (!mesh.geometry.attributes.position == undefined) {
            console.log("Error: No position attributes in geometry.");
            return;
        }
        var colors = [], values = [];
        for (var i = 0, n = mesh.geometry.attributes.position.count; i < n; ++i) {
            colors.push(1, 1, 1);
            values.push(0);
        }
        this.colors = new THREE.Float32BufferAttribute(colors, 3);
        this.values = new THREE.Float32BufferAttribute(values, 1);
    },
    changeMaterial: function (mesh, params) {
        mesh.material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: 0xF5F5F5,
            vertexColors: THREE.VertexColors,
            opacity: params.opacity,
            transparent: params.transparent,
        });
    },
    updateColors: function (mesh, params) {
        this.lut.setColorMap(params.colorMap);
        this.lut.setMax(params.colorValueMax);
        this.lut.setMin(params.colorValueMin);
        var geometry = mesh.geometry;
        var values = this.values;
        var colors = this.colors;
        if (params.valueMethod == "default" && params.valueName) {
            if (mesh.geometry.attributes[params.valueName]) {
                values = mesh.geometry.attributes[params.valueName];
            } else {
                console.log("ERROR: Attribute [" + params.valueName + "] NOT exist.");
            }
        } else if (params.valueMethod == "gradual") {
            this.gradualValues(values.array, params.colorValueMax, params.colorValueMin);
        } else if (params.valueMethod == "idw") {
            this.idwComputer(params.datas, geometry.attributes.position, values.array);
        } else {
            console.log(params.valueMethod + " is NOT a valid method.");
        }
        for (var i = 0; i < values.count; i++) {
            var colorValue = values.array[i];
            var color = this.lut.getColor(colorValue);
            if (color === undefined) {
                console.log("Unable to determine color for value:", colorValue);
            } else {
                colors.setXYZ(i, color.r, color.g, color.b);
            }
        }
        colors.needsUpdate = true;
        mesh.geometry.addAttribute("color", colors);
    },
    gradualValues: function (values, vMax, vMin) {
        if (values.length == 0) {
            return values;
        }
        for (var i = 0; i < values.length; i++) {
            values[i] = i / values.length * (vMax - vMin) + vMin;
        }
    },
    idwComputer: function (datas, position, values) {
        if (datas.length < 3) {
            return values;
        }
        var m0 = datas.length;
        var m1 = position.count;
        // distance
        var r = [];
        for (var i = 0; i < m1; i++) {
            for (var j = 0; j < m0; j++) {
                let vector = { x: position.array[i * 3], y: position.array[i * 3 + 1], z: position.array[i * 3 + 2] };
                var tmpDis = Math.sqrt(Math.pow(vector.x - datas[j].x, 2) + Math.pow(vector.y - datas[j].y, 2) + Math.pow(vector.z - datas[j].z, 2));
                r.push(tmpDis);
            }
        }
        // interpolation
        for (var i = 0; i < m1; i++) {
            var ifFind = false;
            for (var j = m0 * i; j < m0 * i + m0; j++) {
                if (Math.abs(r[j]) < 0.0001) {
                    values[i] = datas[j - m0 * i].v;
                    ifFind = true;
                    break;
                }
            }
            if (ifFind) {
                continue;
            }
            var numerator = 0;
            var denominator = 0;
            for (var j = m0 * i; j < m0 * i + m0; j++) {
                numerator += datas[j - m0 * i].v / (r[j] * r[j]);
                denominator += 1 / (r[j] * r[j]);
            }
            values[i] = numerator / denominator;
        }
    },
});

export { ColorMapWrapper };
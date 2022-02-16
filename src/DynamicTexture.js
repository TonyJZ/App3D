import { Texture } from "./Texture.js";

function DynamicTexture(object, meshName, canvas) {
    this.parentObject = object;
    this.meshName = meshName;
    this.canvas = canvas;
    this.texture = Texture.create(canvas);
    this.addTexture(object, meshName);
}

Object.assign(DynamicTexture.prototype, {
    constructor: DynamicTexture,
    isDynamicTexture: true,
    addTexture: function(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName) {
                if (Array.isArray(child.material)) {
                    console.error("Material array is not supported for Dynamic Texture.");
                    return;
                }
                this.oldMaterial = child.material.clone();
                child.material.transparent = true;
                child.material.map = this.texture;
                child.material.map.needsUpdate = true;
                child.material.needsUpdate = true;
                if (!child.dynamicTextureUVCorrected) {
                    this.correctUVCoordinate(child);
                    child.dynamicTextureUVCorrected = true;
                }
            }
        });
    },
    restoreTexture: function(object, meshName) {
        object.traverse((child) => {
            if (child.isMesh && child.name === meshName) {
                if (Array.isArray(child.material)) {
                    console.error("Material array is not supported for Dynamic Texture.");
                    return;
                }
                child.material = this.oldMaterial;
                if (child.dynamicTextureUVCorrected) {
                    this.correctUVCoordinate(child);
                    child.dynamicTextureUVCorrected = false;
                }
            }
        });
    },
    updateTexture: function(canvas = null) {
        if (canvas) {
            this.canvas = canvas;
            this.texture = Texture.create(canvas);
            this.addTexture(this.parentObject, this.meshName);
        }
        this.texture.needsUpdate = true;
    },
    correctUVCoordinate: function(mesh) {
        let uvAttribute = mesh.geometry.attributes.uv;
        for (let i = 0; i < uvAttribute.count; ++i) {
            uvAttribute.setY(i, -uvAttribute.getY(i));
            // uvAttribute.setX(i, 1.0 - uvAttribute.getX(i));
        }
        if (mesh.geometry.isBufferGeometry) {
            mesh.geometry.attributes.uv.needsUpdate = true;
        } else if (mesh.geometry.isGeometry) {
            mesh.geometry.uvsNeedUpdate = true;
        }
    }
});
export { DynamicTexture };

import * as THREE from "../thirdParty/build/three.module.js";


var Texture = (function() {
    return {
        load: function(url, cb = undefined) {
            var texture = new THREE.TextureLoader().load(url, cb);
            return texture;
        },
        create: function(content) {
            var texture = new THREE.Texture(content);
            return texture;
        }
    };
}());

export { Texture };

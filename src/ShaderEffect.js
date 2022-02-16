function ShaderEffect() {
    this.baseObject = undefined;
}
ShaderEffect.prototype = Object.assign(Object.create(ShaderEffect.prototype), {
    constructor: ShaderEffect,
    isShaderEffect: true,
    getBaseObject: function() {
        return this.baseObject;
    },
    updateParameters: function() {
        console.error("this is the virtual method, you must implement it by yourself!");
    }
});

export { ShaderEffect };
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
        
void main() {
    vec3 objectNormal = vec3(normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vec4 mvPosition = viewMatrix * vec4(vWorldPosition, 1.0);
    vNormal.xyz = normalMatrix * objectNormal;
    vViewPosition = -mvPosition.xyz;
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}

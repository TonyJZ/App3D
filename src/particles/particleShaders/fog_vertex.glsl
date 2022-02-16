uniform float time;
varying vec2 vUv;
varying vec3 positionR;
void main() {
	vUv = uv;
	positionR = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
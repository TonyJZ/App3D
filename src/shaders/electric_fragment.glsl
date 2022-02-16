#define tau 6.2831853

uniform float time;
uniform float speed;
uniform vec2 initialPosition;
uniform sampler2D noiseSeed;
uniform vec3 color;

varying vec2 vUv;

float intime = time * speed;
float alphaOffset = 0.5;
mat2 makem2(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c,-s,s,c);
}

float noise2(vec2 x) {
    return texture2D(noiseSeed, x*.01 + vec2(0.5, 0.5)).x;
}

float circle(vec2 p) {
    float r = length(p);
    r = log(sqrt(r));
    return abs(mod(r * 4.0, 6.28) - 3.13) * 3.0 + 0.2;
}

float fbm(vec2 p) {
    float z = 2.0;
    float rz = 0.0;
    for (float i= 1.0; i < 8.0; i++) {
		rz+= abs((noise2(p) - 0.5) * 2.0)/z;
		z = z * 2.0;
		p = p * 2.0;
	}
	return rz;
}

float dualfbm(vec2 p) {
    vec2 p2 = p * 0.5;
    vec2 basis = vec2(fbm(p2 - intime * 0.5), fbm(p2 + intime * 2.0));
    basis = (basis) * 0.2;
    p -= basis;
    return fbm(p * makem2(intime * 0.5));
}

void main( void ) {
    vec2 p = vec2(vUv.x - initialPosition.x, vUv.y - initialPosition.y);
    p *= 4.0;
    float rz = dualfbm(p);
    p /= exp(mod(intime*10.0, 3.14));
    rz *= pow(abs((0.1 - circle(p))), 0.9);
    vec3 col = color/rz;
    col=pow(abs(col),vec3(.99));
    float alpha = max(max(col.r, col.g), col.b);
    gl_FragColor = vec4(col, (alpha - alphaOffset) / alphaOffset);  
}
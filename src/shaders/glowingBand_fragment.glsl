uniform float time;
uniform float direction;
uniform sampler2D baseTexture;
uniform float redBase;
uniform float greenBase;
uniform float blueBase;
uniform float redAmp;
uniform float greenAmp;
uniform float blueAmp;
uniform float uSpeed;
uniform float vSpeed;
uniform float bandWidth;
uniform float alpha;
uniform bool restore;
varying vec2 vUv;
float red = 0.0;
float green = 0.0;
float blue = 0.0;
float alphaOut = 0.0;
float redCritical = bandWidth * (redAmp - redBase);
float greenCritical = bandWidth * (greenAmp - greenBase);
float blueCritical = bandWidth * (blueAmp - blueBase);
void main( void ) { 
    vec2 position = vUv + vec2(uSpeed, vSpeed) * time;
    if(direction == 1.0) {
        red = redAmp * abs(sin(position.y)) + redBase;
        green = greenAmp * abs(sin(position.y)) + greenBase;
        blue = blueAmp * abs(sin(position.y)) + blueBase;
    }else{
        red = redAmp * abs(sin(position.x)) + redBase;
        green = greenAmp * abs(sin(position.x)) + greenBase;
        blue = blueAmp * abs(sin(position.x)) + blueBase;
    }
    if(red < redCritical || green < greenCritical || blue < blueCritical) {
        red = redBase;
        green = greenBase;
        blue = blueBase;
    }  
    gl_FragColor = texture2D(baseTexture, vUv) + vec4(red, green, blue, alpha);  
}
uniform vec3 glowColor;
uniform float headPosition;
uniform float headLength;
uniform float tailLength;
uniform float accPeriod;
uniform float maxAcc;
uniform float direction;
uniform float circle;
varying vec2 vUv;
varying float intensity;

void main( void ) { 
    if(direction == 1.0) {
        if(circle == 1.0) {
            float xposition = (headPosition - floor(headPosition));
            float xtailposition = xposition - headLength - tailLength;
            if (xposition < headLength) {
                float flowHighLimit1 = xposition;
                float flowLowLimit1 = 0.0;
                float flowHighLimit2 = 1.0;
                float flowLowLimit2 = 1.0 - (headLength - xposition);
                float flowHighLimit3 = flowLowLimit2;
                float flowLowLimit3 = flowLowLimit2 - tailLength;
                float headEnd = xposition - headLength;
                if(vUv.x < flowHighLimit1 && vUv.x > flowLowLimit1 || vUv.x < flowHighLimit2 && vUv.x > flowLowLimit2) {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
                if(vUv.x < flowHighLimit3 && vUv.x > flowLowLimit3) {
                    float alpha = 1.0 - (1.0 + xposition - headLength - vUv.x) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            }
            if (xposition > headLength && xtailposition < 0.0) {
                float flowHighLimit1 = xposition;
                float flowLowLimit1 = xposition - headLength;
                float flowHighLimit2 = xposition - headLength;
                float flowLowLimit2 = 0.0;
                float flowHighLimit3 = 1.0;
                float flowLowLimit3 = 1.0 - (tailLength - (xposition - headLength));
                if(vUv.x < flowHighLimit1 && vUv.x > flowLowLimit1) {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
                if(vUv.x < flowHighLimit2 && vUv.x > flowLowLimit2) {
                    float alpha = (vUv.x - xtailposition) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
                if(vUv.x < flowHighLimit3 && vUv.x > flowLowLimit3) {
                    float alpha = 1.0;
                    alpha = (vUv.x - (1.0 + xtailposition)) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            }
            if (xtailposition > 0.0 && xposition < 1.0) {
                float flowHighLimit1 = xposition;
                float flowLowLimit1 = xposition - headLength;
                float flowHighLimit2 = xposition - headLength;
                float flowLowLimit2 = xtailposition;
                if(vUv.x < flowHighLimit1 && vUv.x > flowLowLimit1) {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
                if(vUv.x < flowHighLimit2 && vUv.x > flowLowLimit2) {
                    float alpha = (vUv.x - xtailposition) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            }

        } else {
            float startPosition = 0.0 - headLength;
            float stopPosition = 1.0 + tailLength;
            float totalLength = 1.0 + headLength + tailLength;
            float xposition = (headPosition - floor(headPosition)) * totalLength + startPosition;
            vec2 position = vec2(xposition, 0.75);
            float flowHighLimit = position.x + headLength;
            float flowLowLimit = position.x - tailLength;
            if(vUv.x < flowHighLimit && vUv.x > flowLowLimit) {
                float alpha = 1.0;
                if (vUv.x < position.x) {
                    alpha = 1.0 - (position.x - vUv.x) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                } else {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
            }  
        } 
    } else {
        if(circle == 1.0) {
            float xposition = (headPosition - floor(headPosition));
            float xtailposition = xposition + headLength + tailLength;
            if (xposition > 1.0 - headLength && xposition < 1.0) {
                float flowHighLimit1 = 1.0;
                float flowLowLimit1 = xposition;
                float flowHighLimit2 = xposition + headLength - 1.0;
                float flowLowLimit2 = 0.0;
                float flowHighLimit3 = flowHighLimit2 + tailLength;
                float flowLowLimit3 = flowHighLimit2;
                float headEnd = xposition - headLength;
                if(vUv.x < flowHighLimit1 && vUv.x > flowLowLimit1 || vUv.x < flowHighLimit2 && vUv.x > flowLowLimit2) {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
                if(vUv.x < flowHighLimit3 && vUv.x > flowLowLimit3) {
                    float alpha = (xtailposition - vUv.x - 1.0) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            }
            if (xposition < 1.0 - headLength && xtailposition > 1.0) {
                float flowHighLimit1 = xposition + headLength;
                float flowLowLimit1 = xposition;
                float flowHighLimit2 = 1.0;
                float flowLowLimit2 = xposition + headLength;
                float flowHighLimit3 = xtailposition - 1.0;
                float flowLowLimit3 = 0.0;
                if(vUv.x < flowHighLimit1 && vUv.x > flowLowLimit1) {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
                if(vUv.x < flowHighLimit2 && vUv.x > flowLowLimit2) {
                    float alpha = (xtailposition - vUv.x) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
                if(vUv.x < flowHighLimit3 && vUv.x > flowLowLimit3) {
                    float alpha = (xtailposition - 1.0 - vUv.x) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            }
            if (xposition < 1.0 - headLength - tailLength && xtailposition < 1.0) {
                float flowHighLimit1 = xposition + headLength;
                float flowLowLimit1 = xposition;
                float flowHighLimit2 = xtailposition;
                float flowLowLimit2 = xposition + headLength;
                if(vUv.x < flowHighLimit1 && vUv.x > flowLowLimit1) {
                    gl_FragColor = vec4(glowColor, 1.0);
                }
                if(vUv.x < flowHighLimit2 && vUv.x > flowLowLimit2) {
                    float alpha = (xtailposition - vUv.x) / tailLength;
                    gl_FragColor = vec4(glowColor, alpha);
                } 
            }
        } else {
            float startPosition = 0.0 - headLength;
            float stopPosition = 1.0 + tailLength;
            float totalLength = 1.0 + headLength + tailLength;
            float innerheadPosition = headPosition;
            float xposition = (headPosition - floor(headPosition)) * totalLength + startPosition;
            vec2 position = vec2(xposition, 0.75);
            float flowHighLimit = position.x + headLength;
            float flowLowLimit = position.x - tailLength;
            if(vUv.x < flowHighLimit && vUv.x > flowLowLimit) {
                    float alpha = 1.0;
                    if (vUv.x > position.x) {
                        alpha = 1.0 - (vUv.x - position.x) / tailLength;
                        gl_FragColor = vec4(glowColor, alpha);
                    } else {
                        gl_FragColor = vec4(glowColor, 1.0);
                    }
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); 
                }   
        }
    }
                  
}
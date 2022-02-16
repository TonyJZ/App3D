uniform float time;
uniform vec3 range;
uniform float wind;
uniform vec3 windDirection;
uniform sampler2D texture;

float innertime = 0.1 * time;
float counter = 0.0;
vec3 initialPosition;
float windConst = 2.0;
float gravityConst = 2.4;

void main() {

    initialPosition = position;
    vec3 vPos;

    float xPosition = initialPosition.x + windDirection.x * windConst * wind * innertime;
    vPos.x = range.x * (xPosition - floor(xPosition)) - 0.5 * range.x;

    float yPosition = initialPosition.y - gravityConst * innertime;
    yPosition = yPosition - (9.81 / yPosition);
    vPos.y = range.y * (yPosition - floor(yPosition));

    float zPosition = initialPosition.z + windDirection.z * windConst * wind * innertime;
    vPos.z = range.z * (zPosition - floor(zPosition)) - 0.5 * range.z;

    vec4 mvPosition = modelViewMatrix * vec4( vPos, 1.0 );

    gl_PointSize = 4.0;
    gl_Position = projectionMatrix * mvPosition;

}
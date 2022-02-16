uniform float time;
uniform float pointSize;
uniform float stopHeight;
uniform sampler2D texture;
attribute vec3 direction;
attribute float velocity;

float g = 9.81;

void main() {

    vec3 vPos;
    float d = sqrt( pow(direction.x,2.0) + pow(direction.y,2.0) + pow(direction.z,2.0) );
    vec3 v0 = vec3(direction.x*abs(velocity)/d, direction.y*abs(velocity)/d, direction.z*abs(velocity)/d);
    float tPeriod = v0.y/g + sqrt(2.0/g*(position.y+pow(v0.y,2.0)/(2.0*g)-stopHeight));
    float t = tPeriod * fract( time / tPeriod );

    vPos.x = v0.x * t + position.x;
    vPos.y = v0.y * t - g*pow(t,2.0)/2.0 + position.y;
    vPos.z = v0.z * t + position.z;

    gl_PointSize = pointSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPos,1.0);
}
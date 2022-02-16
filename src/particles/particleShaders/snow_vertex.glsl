uniform float time;
uniform vec3 range;
uniform float wind;
uniform vec3 windDirection;
uniform sampler2D texture;

float innertime = 0.1 * time;
float counter = 0.0;
float windConst = 2.0;
float gravityConst = 0.6;

float rand(vec2 n)
{
  return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

void main() {
    vec3 vPos;
    float yPosition;
    float zPosition;
    float xPosition;

    if(wind == 0.0) {
      yPosition = position.y - gravityConst * innertime;
      vPos.y = range.y * fract(yPosition);

      float switchZ = rand(vec2(25.86, position.y));
      if(switchZ < 0.25) {
        zPosition = position.z + 0.1 * rand(vec2(position.y, 33.942)) * sin(5.0 * rand(vec2(position.y, 15.835)) * innertime);
      }
      if(switchZ >= 0.25 && switchZ < 0.5) {
        zPosition = position.z - 0.15 * rand(vec2(position.y, 25.183)) * sin(5.0 * rand(vec2(position.y, 5.834)) * innertime);
      }
      if(switchZ >= 0.5 && switchZ < 0.75) {
        zPosition = position.z - 0.08 * rand(vec2(position.y, 5873.24)) * sin(5.0 * rand(vec2(position.y, 268.59)) * innertime);
      }
      if(switchZ >= 0.75) {
        zPosition = position.z + 0.12 * rand(vec2(position.y, 468.251)) * sin(5.0 * rand(vec2(position.y, 704.261)) * innertime);
      }
      vPos.z = range.z * fract(zPosition) - 0.5 * range.z;
      
      float switchX = rand(vec2(3601.257, position.y));
      if(switchX < 0.25) {
        xPosition = position.x + 0.1 * rand(vec2(position.y, 252.277)) * sin(5.0 * rand(vec2(position.y, 907.705)) * innertime);
      }
      if(switchX >= 0.25 && switchX < 0.5) {
        xPosition = position.x - 0.15 * rand(vec2(position.y, 215.183)) * sin(5.0 * rand(vec2(position.y, 4202.7501)) * innertime);
      }
      if(switchX >= 0.5 && switchX < 0.75) {
        xPosition = position.x - 0.08 * rand(vec2(position.y, 262.5603)) * sin(5.0 * rand(vec2(position.y, 279.179)) * innertime);
      }
      if(switchX >= 0.75) {
        xPosition = position.x + 0.12 * rand(vec2(position.y, 5974.538)) * sin(5.0 * rand(vec2(position.y, 758.241)) * innertime);
      }

      vPos.x = range.x * fract(xPosition) - 0.5 * range.x;
    } else {
      yPosition = position.y - gravityConst * innertime;
      vPos.y = range.y * (fract(yPosition));
      zPosition = position.z + windDirection.z * windConst * wind * innertime;
      vPos.z = range.z * (fract(zPosition)) - 0.5 * range.z;
      xPosition = position.x + windDirection.x * windConst * wind * innertime;
      vPos.x = range.x * (fract(xPosition)) - 0.5 * range.x;
    }

    vec4 mvPosition = modelViewMatrix * vec4( vPos, 1.0 );

    gl_PointSize = max(min(7.0, 7.0 * fract(yPosition)), 2.0);
    gl_Position = projectionMatrix * mvPosition;

}
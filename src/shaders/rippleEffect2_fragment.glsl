varying vec2 vUv;
uniform float time;

vec2 center = vec2(0.5,0.5);
float speed = 0.035;

void main(){
	float invAr = 1.0 / 1.0;		
	vec3 col = vec4(vUv,0.5+0.5*sin(time),1.0).xyz;
   
    vec3 texcol;
			
	float x = (center.x-vUv.x);
	float y = (center.y-vUv.y) *invAr;
		
	//float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
	float r = -(x*x + y*y);
	float z = 1.0 + 0.5*sin((r+time*speed)/0.013);
	
	texcol.x = z;
	texcol.y = z;
	texcol.z = z;
	
	gl_FragColor = vec4(col*texcol,1.0);
}
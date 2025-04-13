uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;
uniform vec3 uPaletteD;
uniform float uDotRadius;
uniform float uDotSpacing;
uniform float uDotCenterRadius;
uniform float uRadialRepetitions;
uniform float uTanOscAmplitude;
uniform float uTanOscFrequency;
uniform float uTanOscPhaseSpeed;
uniform float uRadOscAmplitude;
uniform float uRadOscFrequency;
uniform float uRadOscPhaseSpeed;

uniform float uTime;
uniform vec3 uCameraPosition;
varying vec4 vFragWorldPosition;

#define PI2 6.28318530718
#define PI 3.14159265359

// https://iquilezles.org/articles/distfunctions/
float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float sdPyramid( vec3 p, float h ) {
  float m2 = h*h + 0.25;
    
  p.xz = abs(p.xz);
  p.xz = (p.z>p.x) ? p.zx : p.xz;
  p.xz -= 0.5;

  vec3 q = vec3( p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
   
  float s = max(-q.x,0.0);
  float t = clamp( (q.y-0.5*p.z)/(m2+0.25), 0.0, 1.0 );
    
  float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
  float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
    
  float d2 = min(q.y,-q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
    
  return sqrt( (d2+q.z*q.z)/m2 ) * sign(max(q.z,-p.y));
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdCylinder( vec3 p, vec3 c ) {
  return length(p.xz-c.xy)-c.z;
}

float smin(float a, float b, float k) {
    float h = max(k-abs(a-b), 0.0)/k;
    return min(a,b)-h*h*h*k*(1.0 / 6.0);
}

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

vec3 palette(float t) {
  return uPaletteA + uPaletteB * cos(PI2 * (uPaletteC * t + uPaletteD));
}

float map(vec3 p) {
    float oscPy = floor(p.y / (uDotRadius * 2.0 + uDotSpacing)) * (uDotRadius * 2.0 + uDotSpacing);

    float tanOscSinAngle = oscPy * uTanOscFrequency + uTime * uTanOscPhaseSpeed;
    p.xz *= rotate2D(sin(tanOscSinAngle) * uTanOscAmplitude);

    float r = length(p.xz);

    float theta = acos(p.x / r);
    
    float newTheta = mod(theta, PI2 / uRadialRepetitions);

    p.xz = r * vec2(cos(newTheta), sin(newTheta));

    float radOscRadius = uDotCenterRadius + (sin(oscPy * uRadOscFrequency + uTime * uRadOscPhaseSpeed) * uRadOscAmplitude) * 0.5 + 0.5;
    vec2 geom1xz = radOscRadius * vec2(cos(PI / uRadialRepetitions), sin(PI / uRadialRepetitions));

    p.y = mod(p.y, -uDotRadius * 2.0 - uDotSpacing);

    vec3 geom1Position = vec3(geom1xz.x, -uDotRadius - uDotSpacing * 0.5, geom1xz.y);
    float geom1 = sdSphere(p - geom1Position, uDotRadius);

    float d = geom1;
    return d;
}

void main() {
    // Initialization
    vec3 rayOrigin = vFragWorldPosition.xyz;

    vec3 rayDirection = normalize(rayOrigin - uCameraPosition);

    vec3 finalPixelColor = vec3(0.0);

    float travelDistance = 0.0;

    // Raymarching
    int i;
    vec3 travelPoint;
    for (i = 0; i < 80; i++) {
        travelPoint = rayOrigin + rayDirection * travelDistance;

        float currentDistance = map(travelPoint);

        travelDistance += currentDistance;

        if (currentDistance < 0.001 || travelDistance > 100.0) break;
    }

    float theta = mod(uTime * 0.51 + travelPoint.y, PI2);
    vec2 spiralPoint = uDotCenterRadius * vec2(cos(theta), sin(theta));

    finalPixelColor = palette(uTime * 0.01 + 1.0 - (travelDistance * 0.04) + clamp(1.0 - distance(spiralPoint, travelPoint.xz), 0.0, 0.5));
    finalPixelColor *= smoothstep(0.0, 100.0, 100.0 - travelDistance);

    gl_FragColor = vec4(finalPixelColor, 1.0);
}
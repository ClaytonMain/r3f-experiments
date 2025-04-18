uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;
uniform vec3 uPaletteD;

uniform float uTime;
uniform vec3 uCameraPosition;
uniform vec2 uResolution;
uniform float uGlZ;
uniform int uFrameNumber;

varying mat4 vViewMatrix;
varying mat4 vProjectionMatrix;

#define PI2 6.28318530718
#define PI 3.14159265359

// https://iquilezles.org/articles/distfunctions/
float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
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

float maxcomp(vec2 p) {
  return max(p.x, p.y);
}

vec3 map(vec3 p) {
  float pDistance = distance(p, uCameraPosition.xyz);
  p.xy *= rotate2D(sin(mod(pDistance * 1.5 + uTime * 0.1, PI2)) * 0.2);
  p.yz *= rotate2D(sin(mod(pDistance * 1.5 + uTime * 0.1, PI2)) * 0.2);
  p.xz *= rotate2D(sin(mod(pDistance * 1.5 + uTime * 0.1, PI2)) * 0.2);
  float d = sdBox(p, vec3(1.0));
  vec3 res = vec3(d, 1.0, 0.0);

  float s = 1.0;
  for (int m=0; m < 5; m++) {
    vec3 a = mod(p * s, 2.0) - 1.0;
    s *= 3.0;
    vec3 r = abs(1.0 - 3.0 * abs(a));

    r.xz *= rotate2D(sin(uTime * 0.5) * 0.2 + 0.1 * float(m));
    r.yz *= rotate2D(sin(uTime * 0.4) * 0.2 + 0.1 * float(m));
    r.xy *= rotate2D(sin(uTime * 0.3) * 0.2 + 0.1 * float(m));

    float da = max(r.x, r.y);
    float db = max(r.y, r.z);
    float dc = max(r.x, r.z);
    float c = (min(da, min(db, dc)) - 1.0) / s;
    
    if (c > d) {
      d = c;
      res = vec3(d, 0.2*da*db*dc, (1.0 + float(m)) / 4.0);
    }
    
  }

  return res;
}

// https://iquilezles.org/articles/normalsSDF/
vec3 calcNormal( in vec3 p ) { // for function f(p)
    const float h = 0.0001;      // replace by an appropriate value
    #define ZERO (min(uFrameNumber, 0)) // non-constant zero
    vec3 n = vec3(0.0);
    for( int i = ZERO; i < 3; i++ )
    {
        vec3 e = 0.5773 * (2.0 * vec3((((i + 3) >> 1) & 1), ((i >> 1) & 1),(i & 1)) - 1.0);
        n += e * map(p + e * h).x;
    }
    return normalize(n);
}

void main() {
    // Initialization
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv -= 0.5;
    uv.x *= uResolution.x / uResolution.y;

    vec3 rayOrigin = uCameraPosition;


    vec4 directionOffset = inverse(vViewMatrix) * vec4(uv.x, uv.y, uGlZ, 1.0);
    vec3 rayDirection = normalize(directionOffset.xyz - rayOrigin);

    vec3 finalPixelColor = vec3(0.0);

    float travelDistance = 0.0;

    // Raymarching
    int i;
    vec3 travelPoint;
    vec3 mapped;
    for (i = 0; i < 80; i++) {
        travelPoint = rayOrigin + rayDirection * travelDistance;

        mapped = map(travelPoint);
        float currentDistance = mapped.x;

        travelDistance += currentDistance;

        if (currentDistance < 0.001 || travelDistance > 100.0) break;
    }

    // Lighting
    vec3 lightColor = vec3(0.0);
    vec3 lightPosition = vec3(0.0, 0.0, 0.0);
    if (travelDistance < 100.0) {
      vec3 normal = calcNormal(travelPoint);
      vec3 lightDirection = normalize(travelPoint - lightPosition);
      float diffuse = max(dot(normal, lightDirection), 0.0);
      lightColor = vec3(1.0, 1.0, 1.0) * diffuse;
    }

    if (travelDistance < 80.0) {
      finalPixelColor = palette(mod(uTime * 0.05 + (travelDistance * 0.01) + float(i) * 0.01, 1.0));
      finalPixelColor *= abs(mapped.y);
      // finalPixelColor *= lightColor;
      // finalPixelColor = lightColor;
    }

    gl_FragColor = vec4(finalPixelColor, 1.0);
    // gl_FragColor = vec4(normal, 1.0);

}
uniform float uTime;
uniform vec3 uCameraPosition;
uniform vec3 uCameraRotation;
uniform vec2 uResolution;
varying vec2 vUv;
varying mat4 vProjectionMatrix;
varying mat4 vModelViewMatrix;
varying vec4 vFragWorldPosition;

float sdfSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdfBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float smin(float a, float b, float k) {
    float h = max(k-abs(a-b), 0.0)/k;
    return min(a,b)-h*h*h*k*(1.0 / 6.0);
}

vec3 rotate3D(vec3 p, vec3 axis, float angle) {
    // Rodrigues' rotation formula.
    return mix(dot(axis, p) * axis, p, cos(angle)) + cross(axis, p) * sin(angle);
}

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

// https://www.shadertoy.com/view/ll2GD3
vec3 palette(float t) {
    vec3 a = vec3(0.50, 0.50, 0.50);
    vec3 b = vec3(0.50, 0.50, 0.50);
    // vec3 c = vec3(1.62, 1.12, 1.21);
    vec3 c = vec3(1.0, 1.0, 1.0);
    // vec3 d = vec3(0.43, 1.37, 1.10);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

float sdfOctahedron(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735027;
}

float map(vec3 p) {
    p.z += uTime * 0.4;
    
    p.xy = (fract(p.xy) - 0.5);
    p.z = mod(p.z, 0.25) - 0.125;

    float box = sdfOctahedron(p, 0.1);

    return box;
}



void main() {
    // Initialization
    vec3 rayOrigin = vFragWorldPosition.xyz;

    vec3 rayDirection = normalize(rayOrigin - uCameraPosition);

    vec3 finalPixelColor = vec3(0.0);

    float travelDistance = 0.0;

    // Raymarching
    int i;
    for (i = 0; i < 80; i++) {
        vec3 travelPoint = rayOrigin + rayDirection * travelDistance;

        travelPoint.xy *= rotate2D(travelDistance * sin(uTime * 0.5) * 0.1);

        travelPoint.y += sin(travelDistance + uTime * 0.3) * 0.1;

        float currentDistance = map(travelPoint);

        travelDistance += currentDistance;

        if (currentDistance < 0.0001 || travelDistance > 1000.0) break;
    }

    // Final color
    finalPixelColor = palette(travelDistance * 0.04 + float(i) * 0.005);

    gl_FragColor = vec4(finalPixelColor, 1.0);
}
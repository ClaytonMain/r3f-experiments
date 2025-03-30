uniform float uVelocity;
uniform float uTime;

varying vec2 vPositionOffset;
varying float vDecay;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

#include ../../../../shared/shaders/includes/random.glsl

void main() {
    float minSv = random(vPositionOffset) * 0.02 + 0.01;
    float maxSv = random(vPositionOffset) * 0.05 + 0.95;

    float sv = mix(minSv, maxSv, vDecay);
    
    gl_FragColor = vec4(hsv2rgb(vec3(random(vPositionOffset), 1.0, sv)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
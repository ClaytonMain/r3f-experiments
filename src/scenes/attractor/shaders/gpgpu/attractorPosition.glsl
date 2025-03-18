uniform float uTime;
uniform float uDelta;
uniform vec3 uSystemCenter;
uniform float uPositionScale;
uniform float uVelocityScale;
uniform float uBaseTimeFactor;
uniform float uDecayFactor;
uniform float uNoiseScale;
uniform float uNoiseTimeScale;
uniform float uNoiseIntensity;

#include ../../../../shared/shaders/includes/simplexNoise4d.glsl
#include ../../../../shared/shaders/includes/random.glsl

#define PI 3.141592653589793238462643383279;

vec4 randomizePosition(vec2 uv) {
    float radius = random(uv) * 0.5;
    float phi = (random(uv + uDelta) - 0.5) * PI;
    float theta = random(uv + uDelta * 2.0) * 2.0 * PI;
    return vec4(radius * cos(theta) * cos(phi), radius * sin(phi), radius * sin(theta) * cos(phi), 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec4 velocityInfo = texture2D(textureVelocity, uv);

    vec3 position = positionInfo.xyz / uPositionScale + uSystemCenter;
    vec3 velocity = velocityInfo.xyz / uVelocityScale;

    position += (velocity * uDelta * uBaseTimeFactor);

    vec3 scaledPosition = (position - uSystemCenter) * uPositionScale;

    vec3 posNoise = vec3(
    // 
    simplexNoise4d(vec4(scaledPosition.xyz * 50.0 * (1.0 - uNoiseScale) + 0.0, uTime * uNoiseTimeScale)),
    // 
    simplexNoise4d(vec4(scaledPosition.xyz * 50.0 * (1.0 - uNoiseScale) + 1.0, uTime * uNoiseTimeScale)),
    // 
    simplexNoise4d(vec4(scaledPosition.xyz * 50.0 * (1.0 - uNoiseScale) + 2.0, uTime * uNoiseTimeScale))
    //
    );

    posNoise = normalize(posNoise) * 0.001 * uNoiseIntensity;

    scaledPosition += posNoise;

    if(length(scaledPosition) > 3.0) {
        scaledPosition = randomizePosition(uv).xyz;
    }

    float decay = positionInfo.w - uDelta * pow(uDecayFactor, 5.0);
    if(decay < 0.0) {
        scaledPosition = randomizePosition(uv).xyz;
        decay = 1.0;
    }

    gl_FragColor = vec4(scaledPosition, decay);
}
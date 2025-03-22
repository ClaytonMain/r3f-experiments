uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;
uniform vec3 uSystemCenter;
uniform float uPositionScale;
uniform float uVelocityScale;
uniform float uDpr;
uniform float uPositionRandomization;

attribute vec2 aReference;

varying float vPositionLength;
varying float vVelocityLength;
varying float vSize;
varying float vLife;

#include ../../../../shared/shaders/includes/random.glsl

void main() {
    vec4 positionInfo = texture(uTexturePosition, aReference);
    vec4 velocityInfo = texture(uTextureVelocity, aReference);

    vec3 position = positionInfo.xyz;
    vec3 velocity = velocityInfo.xyz;

    float positionLength = smoothstep(0.0, 1.0, length(position));
    float velocityLength = smoothstep(0.0, 1.0, length(velocity));

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 randomVector = vec3(random(aReference), random(aReference + 1.0), random(aReference + 2.0)) * 2.0 - 1.0;
    gl_Position = projectionMatrix * mvPosition + vec4(randomVector * uPositionRandomization, 0.0);

    float life = positionInfo.w;
    float sizeIn = smoothstep(0.0, 0.1, life);
    float sizeOut = 1.0 - smoothstep(0.9, 1.0, life);
    float size = min(sizeIn, sizeOut) * (1.0 / (3.0 - uDpr));
    float sizeRandom = random(aReference) * 4.0;
    gl_PointSize = (15.0 / -mvPosition.z) * size * sizeRandom;

    vPositionLength = positionLength;
    vVelocityLength = velocityLength;
    vSize = size;
    vLife = life;
}
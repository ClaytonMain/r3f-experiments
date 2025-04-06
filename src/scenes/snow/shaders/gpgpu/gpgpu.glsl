uniform float uDelta;
uniform vec2 uIntersectUv;
uniform float uIntersectDepth;
uniform vec2 uPlaneSize;
uniform float uPlaneScale;
uniform float uBallRadius;
uniform float uSnowHeight;
uniform float uRegrowDelay;
uniform float uRegrowSpeed;
uniform float uRegrowSpeedSpread;

#include ../../../../shared/shaders/includes/random.glsl
#include ../../../../shared/shaders/includes/noise.glsl

void main() {
    // Max depth will be 1.0, but this will need to be scaled *somehow* based on
    // the ball radius and snow height. Which I'll do at some point.
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float elevationRandom = noise(uv * 100.0) * 0.05 + 0.95;

    vec2 uvScale = uPlaneSize * uPlaneScale;

    vec4 drawInfo = texture2D(drawTexture, uv);

    float depth = drawInfo.x;
    float lifePercent = drawInfo.y;

    float distanceFromIntersect = distance(uIntersectUv * uvScale, uv * uvScale) * 0.8;

    lifePercent += step(distanceFromIntersect, 1.0);
    lifePercent = clamp(lifePercent, 0.0, 1.0);

    float life = lifePercent * (uRegrowSpeed * uRegrowDelay + 1.0);
    life -= uDelta * uRegrowSpeed;

    float newDepth = max(max(1.0 - clamp(distanceFromIntersect, 0.0, 1.0), 0.0), min(depth, min(life, 1.0)));

    lifePercent = life / (uRegrowSpeed * uRegrowDelay + 1.0);

    gl_FragColor = vec4(newDepth, lifePercent, drawInfo.zw);
}
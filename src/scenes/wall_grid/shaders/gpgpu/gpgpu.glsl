uniform float uDelta;
uniform vec2 uMousePosition;
uniform float uGrowDistance;
uniform float uGrowSpeed;
uniform float uGrowSpeedSpread;
uniform float uFadeSpeed;
uniform float uFadeSpeedSpread;

#include ../../../../shared/shaders/includes/random.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 drawInfo = texture2D(drawTexture, uv);

    float randomNumber = random(uv);
    float growSpeed = uGrowSpeed + randomNumber * uGrowSpeedSpread;
    float fadeSpeed = uFadeSpeed + randomNumber * uFadeSpeedSpread;

    float mouseDistanceFactor = smoothstep(0.0, 1.0, 1.0 - pow(abs(distance(uMousePosition, uv) * uGrowDistance), 2.0));

    float decay = min(max(drawInfo.x + mouseDistanceFactor * growSpeed - uDelta * fadeSpeed, 0.0), 1.0);

    gl_FragColor = vec4(decay, drawInfo.yzw);
}
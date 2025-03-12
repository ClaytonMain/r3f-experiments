uniform float uTime;
uniform float uDelta;
uniform float uAttractorId;
uniform float uPositionCalculationScale;
uniform float uVelocityCalculationScale;
uniform vec3 uSystemCenter;
uniform float uSystemScale;

#include ../../../../shared/shaders/includes/simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec4 velocityInfo = texture2D(textureVelocity, uv);

    vec3 position = positionInfo.xyz / uPositionCalculationScale;
    vec3 velocity = velocityInfo.xyz / uVelocityCalculationScale;

    position += (velocity * uDelta);

    vec3 newFragColorPosition = position * uPositionCalculationScale;

    if(length(newFragColorPosition) > 1.0) {
        newFragColorPosition = vec3(0.0);
    }

    gl_FragColor = vec4(newFragColorPosition, 1.0);
}
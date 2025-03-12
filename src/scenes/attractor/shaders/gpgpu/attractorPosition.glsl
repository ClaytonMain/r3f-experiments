// uniform float uTime;
uniform float uDelta;
// uniform int uAttractorId;
// uniform float uPositionCalculationScale;
// uniform float uVelocityCalculationScale;
uniform vec3 uSystemCenter;
uniform float uSystemScale;

// #include ../../../../shared/shaders/includes/simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec4 velocityInfo = texture2D(textureVelocity, uv);

    // vec3 position = positionInfo.xyz / uPositionCalculationScale;
    // vec3 velocity = velocityInfo.xyz / uVelocityCalculationScale;

    vec3 position = positionInfo.xyz / uSystemScale + uSystemCenter;
    vec3 velocity = velocityInfo.xyz / uSystemScale;

    position += (velocity * uDelta);

    // vec3 newFragColorPosition = position * uPositionCalculationScale;

    // if(length(newFragColorPosition) > 1.0) {
    //     newFragColorPosition = vec3(0.0);
    // }

    vec3 scaledPosition = (position - uSystemCenter) * uSystemScale;

    gl_FragColor = vec4(scaledPosition, 1.0);
}
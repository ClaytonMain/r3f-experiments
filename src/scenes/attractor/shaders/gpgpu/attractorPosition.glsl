uniform float uDelta;
uniform vec3 uSystemCenter;
uniform float uPositionScale;
uniform float uVelocityScale;

// #include ../../../../shared/shaders/includes/simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec4 velocityInfo = texture2D(textureVelocity, uv);

    vec3 position = positionInfo.xyz / uPositionScale + uSystemCenter;
    vec3 velocity = velocityInfo.xyz / uVelocityScale;

    position += (velocity * uDelta);

    vec3 scaledPosition = (position - uSystemCenter) * uPositionScale;

    gl_FragColor = vec4(scaledPosition, 1.0);
}
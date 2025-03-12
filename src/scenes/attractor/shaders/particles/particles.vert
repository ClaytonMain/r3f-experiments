uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;
// uniform float uPositionCalculationScale;
// uniform float uVelocityCalculationScale;
// uniform float uPositionScale;
// uniform float uVelocityScale;
uniform vec3 uSystemCenter;
uniform float uSystemScale;

attribute vec2 aReference;

varying vec4 vPositionInfo;
varying vec4 vVelocityInfo;
varying float vVelocityLength;

void main() {
    vec4 positionInfo = texture(uTexturePosition, aReference);
    vec4 velocityInfo = texture(uTextureVelocity, aReference);

    vec3 position = positionInfo.xyz;
    vec3 velocity = velocityInfo.xyz;

    float velocityLength = length(velocity);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    // gl_PointSize = 1.0 / (1.0 + pow(velocityLength, 2.0)) * 10.0;
    gl_PointSize = (2.0 - smoothstep(0.0, 20.0, velocityLength)) * 2.0 + 2.0;

    vPositionInfo = positionInfo;
    vVelocityInfo = velocityInfo;
    velocityLength = vVelocityLength;
}
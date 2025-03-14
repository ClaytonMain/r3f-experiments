uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;
uniform vec3 uSystemCenter;
uniform float uPositionScale;
uniform float uVelocityScale;

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

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (2.0 - smoothstep(0.0, 1.0, velocityLength)) * (10.0 / -mvPosition.z);

    vPositionInfo = positionInfo;
    vVelocityInfo = velocityInfo;
    velocityLength = vVelocityLength;
}
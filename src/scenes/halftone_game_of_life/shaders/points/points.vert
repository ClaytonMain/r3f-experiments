uniform float uDelta;
uniform float uTime;
uniform float uGameTextureSize;
uniform float uGameSpeed;
uniform float uLifeProbability;
uniform float uParticleGrowRate;
uniform vec3 uColor;
uniform sampler2D uGameStateTexture;

attribute vec2 aUv;

varying vec2 vUv;

void main() {
    vUv = aUv;

    vec4 mvPosition = modelViewMatrix * vec4((aUv - 0.5) * 4.0, 0.0, 1.0);

    vec4 gameState = texture(uGameStateTexture, aUv);

    mvPosition.y += (1.0 - gameState.r) * 9999.0;

    gl_PointSize = mix(0.0, 8.0, gameState.r) / -mvPosition.z;

    gl_Position = projectionMatrix * mvPosition;
}
uniform float uDelta;
uniform float uTime;
uniform float uGameTextureSize;
uniform float uGameSpeed;
uniform float uLifeProbability;
uniform float uParticleGrowRate;
uniform vec3 uColor;
uniform sampler2D uGameStateTexture;

varying vec2 vUv;

void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - 0.5);
    // float alpha = step(0.5, 1.0 - distanceToCenter);
    float alpha = (uColor.r + uColor.g + uColor.b) > 0.0 ? 0.5 : 1.0;

    gl_FragColor = vec4(uColor, alpha);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}
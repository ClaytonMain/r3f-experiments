uniform sampler2D uAgentPositionsTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uDecayRate;
uniform float uDepositRate;

varying vec2 vUv;

#define PI2 6.283185307179586

// Offsets for the 8 neighboring pixels in a 2D grid.
float neighborOffsets[8] = float[](1.0, 1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 1.0);

void main() {
    vec2 uv = vUv;

    // trailData.r := Current trail intensity.
    // trailData.g := 1.0 (unused).
    // trailData.b := 1.0 (unused).
    // trailData.a := 1.0 (unused).
    vec4 trailData = texture2D(uTrailTexture, uv);

    // agentPositionData.r := 1.0 or 0.0 -> Agent presence boolean.
    // agentPositionData.g := 1.0 (unused).
    // agentPositionData.b := 1.0 (unused).
    // agentPositionData.a := 1.0 (unused).
    vec4 agentPositionData = texture2D(uAgentPositionsTexture, uv);

    float intensity = trailData.x;

    // Diffuse the trail intensity based on the neighboring trail intensities.
    int i;
    for (i = 0; i < 8; i++) {
        vec2 neighborUv = fract(uv + vec2(neighborOffsets[i], neighborOffsets[(i + 6) % 8]) / uDisplayTextureResolution);
        float neighborIntensity = texture2D(uTrailTexture, neighborUv).x;
        intensity += neighborIntensity;
    }
    intensity *= 0.11111111111; // ~1/9th.

    // Decay the trail intensity.
    intensity *= uDecayRate;

    // Deposit trail if there is an agent present.
    intensity += agentPositionData.x * uDepositRate;

    gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
}
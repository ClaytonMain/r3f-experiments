uniform sampler2D uTrailTexture;
uniform sampler2D uAgentPositionsTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uDelta;
uniform float uTime;
uniform vec3 uPaletteA;
uniform vec3 uPaletteB;
uniform vec3 uPaletteC;
uniform vec3 uPaletteD;

varying vec2 vUv;

#define PI2 6.283185307179586

vec3 palette(float t) {
    return uPaletteA + uPaletteB * cos(6.28318 * (uPaletteC * t + uPaletteD));
}

void main() {
    vec4 trailData = texture2D(uTrailTexture, vUv);
    // vec4 agentPositionData = texture2D(uAgentPositionsTexture, vUv);

    float intensity = trailData.x;
    float lastAgentDirection = trailData.y;

    float avgIntensity = 0.0;
    for (float i = -2.0; i <= 2.0; i++) {
        for (float j = -2.0; j <= 2.0; j++) {
            vec2 offset = vec2(i, j) / uDisplayTextureResolution;
            vec4 neighborData = texture2D(uTrailTexture, vUv + offset);
            avgIntensity += neighborData.x;
        }
    }
    avgIntensity /= 25.0;

    avgIntensity = mix(intensity, avgIntensity, 0.2);

    vec3 color = palette(mod((avgIntensity + lastAgentDirection + uTime * 0.05 + (vUv.x + vUv.y) * 0.5) * 0.2, 1.0)) * (avgIntensity * (intensity * 0.5 + 0.3));

    // gl_FragColor = vec4(palette(mod(intensity + uTime * 0.05 + (vUv.x + vUv.y) * 0.01, 1.0)) * intensity, 1.0);
    gl_FragColor = vec4(color, 1.0);
}
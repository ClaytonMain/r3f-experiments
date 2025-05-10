uniform float uTime;
uniform vec2 uScreenResolution;
uniform vec2 uPlaneResolution;
uniform sampler2D uAgentPositionsTexture;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    vec4 agentPositionData = texture2D(uAgentPositionsTexture, uv);

    int i;
    float neighboringIntensities = 0.0;

    gl_FragColor = vec4(agentPositionData.x, 0.0, 0.0, 1.0);
}
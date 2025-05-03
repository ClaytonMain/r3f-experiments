uniform sampler2D uAgentTexture;
uniform sampler2D uTrailTexture;
uniform float uSensorAngle;
uniform float uRotationAngle;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uDepositPerStep;

attribute vec2 vUv;

void main() {
    vec4 agentData = texture2D(uAgentTexture, vUv);
    vec4 trailData = texture2D(uTrailTexture, vUv);

    gl_FragColor = vec4(agentData);
}
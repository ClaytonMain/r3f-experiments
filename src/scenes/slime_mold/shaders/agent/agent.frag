uniform sampler2D uAgentTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uSensorAngle;
uniform float uRotationAngle;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uDepositRate;
uniform int uInitialized;

varying vec2 vUv;

void main() {
    vec4 agentData = texture2D(uAgentTexture, vUv);
    vec4 trailData = texture2D(uTrailTexture, vUv);

    float agentDirectionAngle = agentData.z * 6.28318530718;
    vec2 agentDirection = vec2(cos(agentDirectionAngle), sin(agentDirectionAngle));

    gl_FragColor = vec4(agentData);
}
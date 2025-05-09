uniform sampler2D uAgentDataTexture;
// Keep `uTrailTexture` named as it is. Will contain post-processed AgentPositionsMaterial
// data used in the sensory stage.
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uSensorAngle;
uniform float uRotationAngle;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uDepositRate;
uniform float uTime;

varying vec2 vUv;

#define PI2 6.28318530718
#include ../../../../shared/shaders/includes/random.glsl

void main() {
    vec4 agentData = texture2D(uAgentDataTexture, vUv);

    vec2 agentPosition = floor(agentData.xy * uDisplayTextureResolution) + 0.5;
    float agentDirectionAngle = agentData.z * PI2;
    vec2 agentDirection = vec2(cos(agentDirectionAngle), sin(agentDirectionAngle));

    vec2 newAgentPosition = round(agentPosition + agentDirection * uStepSize) + 0.5;
    vec2 newAgentUv = fract(newAgentPosition / uDisplayTextureResolution);

    vec4 trailData = texture(uTrailTexture, newAgentUv);

    if (trailData.r == 0.0) {
        // If there is no agent in the new position, we can move there.
        agentPosition = newAgentPosition;
    } else {
        // Otherwise, randomize the direction.
        agentDirectionAngle = random(vUv + uTime) * PI2;
    }

    // gl_FragColor = fract(agentData);

    gl_FragColor = vec4(fract(agentPosition / uDisplayTextureResolution), agentDirectionAngle / PI2, agentData.w);
    // gl_FragColor.r = agentData.r;
    // if (vUv.x < 0.5) {
        // gl_FragColor = vec4(1.0);
    // }
}
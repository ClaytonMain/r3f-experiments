uniform sampler2D uAgentTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uSensorAngle;
uniform float uRotationAngle;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uDepositRate;
uniform float uTime;
uniform int uInitialized;

varying vec2 vUv;

#define PI2 6.28318530718
#include ../../../../shared/shaders/includes/random.glsl

void main() {
    if (uInitialized == 0) {
        gl_FragColor = gl_FragColor;
        return;
    }

    vec4 agentData = texture2D(uAgentTexture, vUv);

    vec2 agentPosition = floor(agentData.xy * uDisplayTextureResolution);
    float agentDirectionAngle = agentData.z * PI2;
    vec2 agentDirection = vec2(cos(agentDirectionAngle), sin(agentDirectionAngle));

    vec2 newAgentPosition = agentPosition + agentDirection * uStepSize;
    vec2 newAgentUv = fract(newAgentPosition / uDisplayTextureResolution);

    vec4 trailData = texture2D(uTrailTexture, newAgentUv);

    if (trailData.r > 0.0) {
        // If there is no agent in the new position, we can move there.
        agentPosition = newAgentPosition;
    } else {
        // Otherwise, randomize the direction.
        agentDirectionAngle = random(vUv + uTime) * PI2;
    }

    gl_FragColor = vec4(fract(agentPosition / uDisplayTextureResolution), agentDirectionAngle / PI2, agentData.w);
}
uniform sampler2D uAgentDataTexture;
uniform sampler2D uAgentPositionsTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uSensorAngle;
uniform float uRotationAngle;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uTime;

varying vec2 vUv;

#define PI2 6.28318530718
#include ../../../../shared/shaders/includes/random.glsl

float getTrailIntensity(vec2 position, float directionAngle, float samples) {
    float intensity = 0.0;
    for (float i = 0.0; i < samples; i++) {
        float angle = directionAngle + i * PI2 / samples;
        vec2 samplePosition = position + vec2(cos(angle), sin(angle)) * uSensorWidth;
        vec2 uv = fract(samplePosition / uDisplayTextureResolution);
        // trailData.r := Current trail intensity.
        // trailData.g := 1.0 (unused).
        // trailData.b := 1.0 (unused).
        // trailData.a := 1.0 (unused).
        vec4 trailData = texture2D(uTrailTexture, uv);
        intensity += trailData.r;
    }
    return intensity / samples;
}

void main() {
    vec2 uv = vUv;

    // agentData.r := Agent x position.
    // agentData.g := Agent y position.
    // agentData.b := Agent direction angle.
    // agentData.a := 1.0 (unused).
    vec4 agentData = texture2D(uAgentDataTexture, uv);

    // Motor stage.
    // The agent moves in the direction of its current angle by a fixed step size,
    // if it's able. If not, it randomizes its direction.

    // floor, then +0.5 to get the pixel center.
    vec2 agentPosition = floor(agentData.xy * uDisplayTextureResolution);
    float agentDirectionAngle = agentData.z * PI2;
    vec2 agentDirection = vec2(cos(agentDirectionAngle), sin(agentDirectionAngle));
    vec2 agentTrailUv = fract(agentPosition / uDisplayTextureResolution);

    vec2 newAgentPosition = round(agentPosition + agentDirection * uStepSize) + 0.5;
    vec2 newAgentTrailUv = fract(newAgentPosition / uDisplayTextureResolution);

    // agentPositionData.r := 1.0 or 0.0 -> Agent presence boolean.
    // agentPositionData.g := 1.0 (unused).
    // agentPositionData.b := 1.0 (unused).
    // agentPositionData.a := 1.0 (unused).
    vec4 newAgentPositionData = texture2D(uAgentPositionsTexture, newAgentTrailUv);

    if (newAgentPositionData.r == 0.0) {
        // If there is no agent in the new position, we can move there.
        agentPosition = newAgentPosition;
        agentTrailUv = newAgentTrailUv;
    } else {
        // Otherwise, randomize the direction.
        agentDirectionAngle = 2.0 * uRotationAngle * round(random(vUv + uTime)) * 2.0 - 1.0;
    }

    // Sensory stage.
    // Sample the trail at front, front-left, and front-right positions.
    vec2 front = agentPosition + vec2(cos(agentDirectionAngle), sin(agentDirectionAngle)) * uSensorOffset;
    float frontLeftAngle = agentDirectionAngle + uSensorAngle;
    vec2 frontLeft = agentPosition + vec2(cos(frontLeftAngle), sin(frontLeftAngle)) * uSensorOffset;
    float frontRightAngle = agentDirectionAngle - uSensorAngle;
    vec2 frontRight = agentPosition + vec2(cos(frontRightAngle), sin(frontRightAngle)) * uSensorOffset;

    float frontIntensity = getTrailIntensity(front, agentDirectionAngle, 4.0);
    float frontLeftIntensity = getTrailIntensity(frontLeft, frontLeftAngle, 4.0);
    float frontRightIntensity = getTrailIntensity(frontRight, frontRightAngle, 4.0);

    if (frontIntensity > frontLeftIntensity && frontIntensity > frontRightIntensity) {
        agentDirectionAngle = agentDirectionAngle;
    } else if (frontIntensity < frontLeftIntensity && frontLeftIntensity > frontRightIntensity) {
        agentDirectionAngle += uRotationAngle * round(random(vUv + uTime)) * 2.0 - 1.0;
    } else if (frontLeftIntensity < frontRightIntensity) {
        agentDirectionAngle -= uRotationAngle;
    } else if (frontRightIntensity < frontLeftIntensity) {
        agentDirectionAngle += uRotationAngle;
    } else {
        agentDirectionAngle = agentDirectionAngle;
    }

    agentDirectionAngle = fract(agentDirectionAngle / PI2);

    // gl_FragColor = fract(agentData);

    gl_FragColor = vec4(fract(agentPosition / uDisplayTextureResolution), agentDirectionAngle, agentData.w);
}
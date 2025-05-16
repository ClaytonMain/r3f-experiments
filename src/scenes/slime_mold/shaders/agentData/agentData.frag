uniform sampler2D uAgentDataTexture;
uniform sampler2D uAgentPositionsTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uSensorAngle;
uniform float uRotationRate;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uCrowdAvoidance;
uniform float uWanderStrength;
uniform int uSensorSampleLevel;
uniform int uBoundaryBehavior; // 0 = wrap, 1 = bounce
uniform float uDelta;
uniform float uTime;

varying vec2 vUv;

#define PI2 6.28318530718
#include ../../../../shared/shaders/includes/random.glsl

// Offsets for the 8 neighboring pixels in a 2D grid.
float neighborOffsets[8] = float[](1.0, 1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 1.0);

float getTrailIntensity(vec2 position) {
    vec2 positionToUvFactor = vec2(1.0) / uDisplayTextureResolution;
    float intensity = texture2D(uTrailTexture, position * positionToUvFactor).r;
    for (int i = 0; i < 8; i++) {
        int iy = (i + 6) % 8;
        for (int j = 1; j <= uSensorSampleLevel; j++) {
            vec2 neighborUv = (position + vec2(neighborOffsets[i], neighborOffsets[iy]) * uSensorWidth * (float(j) / float(uSensorSampleLevel))) * positionToUvFactor;
            if (neighborUv.x <= 0.0 || neighborUv.x >= 1.0 || neighborUv.y <= 0.0 || neighborUv.y >= 1.0) {
                if (uBoundaryBehavior == 0) { // Wrap
                    neighborUv = fract(neighborUv);
                } else if (uBoundaryBehavior == 1) { // Bounce
                    intensity -= 100.0;
                    continue;
                }
            }
            // trailData.r := Current trail intensity.
            // trailData.g := 1.0 (unused).
            // trailData.b := 1.0 (unused).
            // trailData.a := 1.0 (unused).
            vec4 trailData = texture2D(uTrailTexture, neighborUv);
            intensity += trailData.r;
        }
    }
    return intensity / 8.0;
}

void main() {
    vec2 uv = vUv;
    vec2 positionToUvFactor = vec2(1.0) / uDisplayTextureResolution;

    // Some values we'll need later.
    float positiveOrNegative = round(random(vUv + uTime)) * 2.0 - 1.0;
    float rotationWeight = uRotationRate * uDelta;

    // agentData.r := Agent x position.
    // agentData.g := Agent y position.
    // agentData.b := Agent direction angle.
    // agentData.a := 0.0 or 1.0 -> Agent took step boolean.
    vec4 agentData = texture2D(uAgentDataTexture, uv);

    // Motor stage.
    // The agent moves in the direction of its current angle by a fixed step size,
    // if it's able. If not, it randomizes its direction.
    vec2 agentPosition = agentData.xy * uDisplayTextureResolution;
    float agentDirectionAngle = agentData.z * PI2;
    vec2 agentDirection = vec2(cos(agentDirectionAngle), sin(agentDirectionAngle));
    vec2 agentTrailUv = agentData.xy;

    vec2 newAgentPosition = agentPosition + agentDirection * uStepSize * uDelta;
    vec2 newAgentTrailUv = newAgentPosition * positionToUvFactor;

    float agentTookStep = 1.0;

    // agentDirectionAngle = atan(-1.0, 0.0);

    if (newAgentPosition.x <= 0.0 || newAgentPosition.x >= (uDisplayTextureResolution.x - 1.0) || newAgentPosition.y <= 0.0 || newAgentPosition.y >= (uDisplayTextureResolution.y - 1.0)) {
        if (uBoundaryBehavior == 0) { // Wrap
            newAgentPosition = mod(newAgentPosition, uDisplayTextureResolution);
            newAgentTrailUv = fract(newAgentTrailUv);
        } else if (uBoundaryBehavior == 1) { // Bounce
            // if (newAgentPosition.x <= 0.0 || newAgentPosition.x >= (uDisplayTextureResolution.x - 1.0)) {
            //     agentDirection.x *= -1.0;
            // }
            // if (newAgentPosition.y <= 0.0 || newAgentPosition.y >= (uDisplayTextureResolution.y - 1.0)) {
            //     agentDirection.y *= -1.0;
            // }
            agentDirectionAngle = atan(-(agentTrailUv.y - 0.5), -(agentTrailUv.x - 0.5));
            agentDirection = vec2(cos(agentDirectionAngle), sin(agentDirectionAngle));
            newAgentPosition = agentPosition + agentDirection * uStepSize * uDelta;
            newAgentTrailUv = newAgentPosition * positionToUvFactor;

            agentTookStep = 0.0;
        }
    }

    float newAgentPositionIntensity = getTrailIntensity(newAgentPosition);

    if ((newAgentPositionIntensity < (1.0 - uCrowdAvoidance)) && (agentTookStep == 1.0)) {
        // If the new position isn't overcrowded, update the agent position.
        agentPosition = newAgentPosition;
        agentTrailUv = newAgentTrailUv;
        agentDirectionAngle += uWanderStrength * (random(vUv + uTime) * 2.0 - 1.0) * uDelta;
    } else {
        // Otherwise, randomize the direction.
        agentDirectionAngle += rotationWeight * positiveOrNegative;
        agentTookStep = 0.0;
    }

    // Sensory stage.
    // Sample the trail at front, front-left, and front-right positions.
    vec2 front = agentPosition + vec2(cos(agentDirectionAngle), sin(agentDirectionAngle)) * uSensorOffset;
    float frontLeftAngle = agentDirectionAngle + uSensorAngle;
    vec2 frontLeft = agentPosition + vec2(cos(frontLeftAngle), sin(frontLeftAngle)) * uSensorOffset;
    float frontRightAngle = agentDirectionAngle - uSensorAngle;
    vec2 frontRight = agentPosition + vec2(cos(frontRightAngle), sin(frontRightAngle)) * uSensorOffset;

    float frontIntensity = getTrailIntensity(front);
    float frontLeftIntensity = getTrailIntensity(frontLeft);
    float frontRightIntensity = getTrailIntensity(frontRight);

    if (frontIntensity > frontLeftIntensity && frontIntensity > frontRightIntensity) {
        agentDirectionAngle += 0.0;
    } else if ((frontIntensity < frontLeftIntensity) && (frontIntensity < frontRightIntensity)) {
        agentDirectionAngle += rotationWeight * positiveOrNegative;
    } else if (frontLeftIntensity < frontRightIntensity) {
        agentDirectionAngle -= rotationWeight;
    } else if (frontRightIntensity < frontLeftIntensity) {
        agentDirectionAngle += rotationWeight;
    }

    gl_FragColor = vec4(fract(agentPosition * positionToUvFactor), fract(agentDirectionAngle / PI2), agentTookStep);
}

// TODO
// Add toggle for boundary repetition.
// Add options for initial agent distribution.
// Increase UI slider ranges.
// Improve angle sliders.
// Add randomization button.
// Add reset button.
// Add color options (obviously).
// Add simulation speed slider.
// Add preset options.
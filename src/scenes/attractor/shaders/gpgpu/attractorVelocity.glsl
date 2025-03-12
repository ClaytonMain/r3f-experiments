uniform float uTime;
uniform int uAttractorId;
// uniform float uPositionCalculationScale;
// uniform float uVelocityCalculationScale;
uniform vec3 uSystemCenter;
uniform float uSystemScale;
uniform float uFlowFieldScale;
uniform float uMinVelocity;

#include ../../../../shared/shaders/includes/simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec3 position = positionInfo.xyz / uSystemScale + uSystemCenter;

    float dxDt = 0.0;
    float dyDt = 0.0;
    float dzDt = 0.0;

    if(uAttractorId == 0) {
        // Lorenz Attractor
        float sigma = 10.0;
        float rho = 28.0;
        float beta = 8.0 / 3.0;

        dxDt = sigma * (position.y - position.x);
        dyDt = position.x * (rho - position.z) - position.y;
        dzDt = position.x * position.y - beta * position.z;
    } else if(uAttractorId == 1) {
        // Thomas Attractor
        float b = 0.208186;

        dxDt = sin(position.y) - b * position.x;
        dyDt = sin(position.z) - b * position.y;
        dzDt = sin(position.x) - b * position.z;
    }

    vec3 velocity = vec3(dxDt, dyDt, dzDt);

    // Prevent zero velocity.
    if(length(velocity) < uMinVelocity) {
        velocity += vec3(uMinVelocity);
    }

    // Scale velocity & position, then add flow field for a more consistent
    // look between attractors.
    vec3 scaledVelocity = velocity * uSystemScale;

    vec3 flowField = vec3(simplexNoise4d(vec4(positionInfo.xyz + 0.0, uTime)), simplexNoise4d(vec4(positionInfo.xyz + 1.0, uTime)), simplexNoise4d(vec4(positionInfo.xyz + 2.0, uTime)));
    // vec3 flowField = vec3(simplexNoise4d(vec4(velocity.xyz + 0.0, uTime)), simplexNoise4d(vec4(velocity.xyz + 1.0, uTime)), simplexNoise4d(vec4(velocity.xyz + 2.0, uTime)));
    scaledVelocity += flowField * uFlowFieldScale;

    gl_FragColor = vec4(scaledVelocity, 1.0);
}
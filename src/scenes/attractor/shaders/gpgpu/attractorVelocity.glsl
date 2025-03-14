uniform float uTime;
uniform int uAttractorId;
uniform vec3 uSystemCenter;
uniform float uPositionScale;
uniform float uVelocityScale;
uniform float uVelocityFlowFieldScale;
uniform float uMinVelocity;

#include ../../../../shared/shaders/includes/simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec3 position = positionInfo.xyz / uPositionScale + uSystemCenter;

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
    } else if(uAttractorId == 2) {
        // Aizawa Attractor
        float a = 0.95;
        float b = 0.7;
        float c = 0.6;
        float d = 3.5;
        float e = 0.25;
        float f = 0.1;

        dxDt = (position.z - b) * position.x - d * position.y;
        dyDt = d * position.x + (position.z - b) * position.y;
        dzDt = c + a * position.z - pow(position.z, 3.0) / 3.0 - pow(position.x, 2.0) + f * position.z * pow(position.x, 3.0);
    }

    vec3 velocity = vec3(dxDt, dyDt, dzDt);

    // Prevent zero velocity.
    if(length(velocity) < uMinVelocity) {
        velocity += vec3(uMinVelocity);
    }

    // Scale velocity down, use scaled-down position, then add
    // flow field for a more consistent look between attractors.
    vec3 scaledVelocity = velocity * uVelocityScale;

    vec3 flowField = vec3(simplexNoise4d(vec4(positionInfo.xyz + 0.0, uTime)), simplexNoise4d(vec4(positionInfo.xyz + 1.0, uTime)), simplexNoise4d(vec4(positionInfo.xyz + 2.0, uTime)));

    scaledVelocity += flowField * uVelocityFlowFieldScale;

    gl_FragColor = vec4(scaledVelocity, 1.0);
}
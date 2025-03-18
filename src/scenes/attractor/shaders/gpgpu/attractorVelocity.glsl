uniform float uTime;
uniform float uDelta;
uniform int uAttractorId;
uniform vec3 uSystemCenter;
uniform float uPositionScale;
uniform float uVelocityScale;
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
    } else if(uAttractorId == 3) {
        // Dadras Attractor
        float a = 3.0;
        float b = 2.7;
        float c = 1.7;
        float d = 2.0;
        float e = 9.0;

        dxDt = position.y - a * position.x + b * position.y * position.z;
        dyDt = c * position.y - position.x * position.z + position.z;
        dzDt = d * position.x * position.y - e * position.z;
    } else if(uAttractorId == 4) {
        // Chen
        float alpha = 5.0;
        float beta = -10.0;
        float delta = -0.38;

        dxDt = alpha * position.x - position.y * position.z;
        dyDt = beta * position.y + position.x * position.z;
        dzDt = delta * position.z + position.x * position.y / 3.0;
    }

    vec3 velocity = vec3(dxDt, dyDt, dzDt);

    // Prevent zero velocity.
    if(length(velocity) < uMinVelocity) {
        velocity += vec3(uMinVelocity);
    }

    // Scale velocity down, use scaled-down position, then add
    // flow field for a more consistent look between attractors.
    vec3 scaledVelocity = velocity * uVelocityScale;

    gl_FragColor = vec4(scaledVelocity, 1.0);
}
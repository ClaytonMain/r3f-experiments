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
        dzDt = c + a * position.z - position.z * position.z * position.z / 3.0 - position.x * position.x + f * position.z * position.x * position.x * position.x;
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
    } else if(uAttractorId == 5) {
        // Lorenz83
        float a = 0.95;
        float b = 7.91;
        float f = 4.83;
        float g = 4.66;

        dxDt = a * f - a * position.x - position.y * position.y - position.z * position.z;
        dyDt = g - position.y + position.x * position.y - b * position.x * position.z;
        dzDt = b * position.x * position.y + position.x * position.z - position.z;
    } else if(uAttractorId == 6) {
        // Rössler
        float a = 0.2;
        float b = 0.2;
        float c = 5.7;

        dxDt = -(position.y + position.z);
        dyDt = position.x + a * position.y;
        dzDt = b + position.z * (position.x - c);
    } else if(uAttractorId == 7) {
        // Halvorsen
        float a = 1.89;

        dxDt = -a * position.x - 4.0 * position.y - 4.0 * position.z - position.y * position.y;
        dyDt = -a * position.y - 4.0 * position.z - 4.0 * position.x - position.z * position.z;
        dzDt = -a * position.z - 4.0 * position.x - 4.0 * position.y - position.x * position.x;
    } else if(uAttractorId == 8) {
        // Rabinovich-Fabrikant
        float alpha = 0.14;
        float gamma = 0.1;

        dxDt = position.y * (position.z - 1.0 + position.x * position.x) + gamma * position.x;
        dyDt = position.x * (3.0 * position.z + 1.0 - position.x * position.x) + gamma * position.y;
        dzDt = -2.0 * position.z * (alpha + position.x * position.y);
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
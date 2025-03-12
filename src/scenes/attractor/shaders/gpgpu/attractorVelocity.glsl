uniform float uTime;
uniform int uAttractorId;
uniform float uPositionCalculationScale;
uniform float uVelocityCalculationScale;

#include ../../../../shared/shaders/includes/simplexNoise4d.glsl

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 positionInfo = texture2D(texturePosition, uv);
    vec3 position = positionInfo.xyz / uPositionCalculationScale;

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

    vec3 flowField = vec3(simplexNoise4d(vec4(position.xyz + 0.0, uTime)), simplexNoise4d(vec4(position.xyz + 1.0, uTime)), simplexNoise4d(vec4(position.xyz + 2.0, uTime)));
    // vec3 flowField = vec3(simplexNoise4d(vec4(velocity.xyz + 0.0, uTime)), simplexNoise4d(vec4(velocity.xyz + 1.0, uTime)), simplexNoise4d(vec4(velocity.xyz + 2.0, uTime)));
    velocity += flowField * 0.1;

    vec3 newFragColorVelocity = velocity * uVelocityCalculationScale;

    if(length(newFragColorVelocity) < 0.0001) {
        newFragColorVelocity += vec3(0.001);
    }

    gl_FragColor = vec4(newFragColorVelocity, 0.0);
}
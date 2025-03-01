uniform float uTime;
uniform float uDelta;
uniform vec3 uMouse3d;
uniform sampler2D uTextureDefaultSize;
uniform int voxelsPerAxis;

#include ../../../../shared_shaders/includes/simplexNoise4d.glsl

void main() {
    float timeFactor = 0.1;
    float time = uTime * timeFactor;

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    int index = int((gl_FragCoord.x - 0.5) + (gl_FragCoord.y - 0.5) * resolution.x);

    vec4 sizeInfo = texture(textureSize, uv);

    float positionX = float(index % voxelsPerAxis);
    float positionY = floor(float(index) / float(voxelsPerAxis * voxelsPerAxis));
    float positionZ = float(int(floor(float(index) / float(voxelsPerAxis))) % int(voxelsPerAxis));

    vec3 position = vec3(positionX, positionY, positionZ);
    position = position / float(voxelsPerAxis);
    vec3 flowField = vec3(simplexNoise4d(vec4(position.xyz + 0.0, time)), simplexNoise4d(vec4(position.xyz + 1.0, time)), simplexNoise4d(vec4(position.xyz + 2.0, time)));
    flowField = normalize(flowField);

    sizeInfo.xyz = flowField * 0.5;

    gl_FragColor = sizeInfo;
}
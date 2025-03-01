uniform sampler2D uTextureSize;
uniform int uNumVoxels;
uniform float uVoxelSize;
uniform int uVoxelsPerAxis;

attribute vec2 aReference;

varying vec3 vModelPosition;

void main() {
    vec4 sizeInfo = texture(uTextureSize, aReference);
    vec3 voxelScale = smoothstep(0.0, 1.0, vec3(sizeInfo.xyz));

    float floatNumVoxels = float(uNumVoxels);
    float floatVoxelsPerAxis = float(uVoxelsPerAxis);

    vec4 modelPosition = modelMatrix * vec4(position * voxelScale.x, 1.0);

    modelPosition.x += (float(gl_InstanceID % uVoxelsPerAxis));
    modelPosition.y += floor(float(gl_InstanceID) / (pow(floatVoxelsPerAxis, 2.0)));
    modelPosition.z += float(int(floor(float(gl_InstanceID) / floatVoxelsPerAxis)) % int(floatVoxelsPerAxis));

    modelPosition.xyz -= vec3(floatVoxelsPerAxis - 1.0) / 2.0;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // vModelPosition = (modelPosition.xyz + vec3(floatVoxelsPerAxis - 1.0) / 2.0) / floatVoxelsPerAxis;
    vModelPosition = vec3(sizeInfo.x);
}
varying vec4 vPositionInfo;
varying vec4 vVelocityInfo;
varying float vVelocityLength;

void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - 0.5);
    float alpha = 0.05 / distanceToCenter - 0.1;

    // float smoothedVelocityLength = length(vVelocityInfo.xyz);
    // float smoothedVelocityLength = smoothstep(0.0, 20.0, vVelocityLength);

    float r = 1.0 - vVelocityLength;
    float g = vVelocityLength * 0.5;
    float b = vVelocityLength * 0.5;
    float a = alpha;

    gl_FragColor = vec4(r, g, b, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
uniform float uTime;
uniform int uColorMode;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uBlendScale;

varying float vPositionLength;
varying float vVelocityLength;
varying float vSize;
varying float vLife;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - 0.5);
    float alpha = pow(0.05 / distanceToCenter, 3.0) - 0.1;

    vec3 color = vec3(1.0);

    if(uColorMode == 0) {
        color = uColor1;
    } else if(uColorMode == 1) {
        color = mix(uColor1, uColor2, uBlendScale);
    } else if(uColorMode == 2) {
        color = mix(mix(uColor1, uColor2, uBlendScale / 3.0), uColor3, uBlendScale * 2.0 / 3.0);
    }

    // vec3 velocityColor = hsv2rgb(vec3(smoothstep(0.0, 0.8, length(vVelocityLength)), 1.0, vLife * 0.5 + 0.5));
    // vec3 color = velocityColor;
    
    // float a = alpha * (1.0 - pow(max(0.0, abs(vPositionLength * 1.1) * 2.0 - 1.0), 3.0));
    float a = alpha * (1.0 - pow(abs(vPositionLength), 3.0));

    gl_FragColor = vec4(color, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
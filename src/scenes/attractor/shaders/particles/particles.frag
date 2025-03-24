uniform float uTime;
uniform int uColorMode;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uBlendCenter;
uniform float uBlendScale;
uniform float uBlendSharpness;

varying float vPositionLength;
varying float vVelocityLength;
varying float vSize;
varying float vLife;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float smoothBetween(float x, float y, float w, float t) {
    float start = x - w;
    float end = y + w;
    return smoothstep(start, x, t) - smoothstep(y, end, t);
}

void main() {
    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - 0.5);
    float alpha = pow(0.05 / distanceToCenter, 3.0) - 0.1;

    vec3 color = vec3(1.0);

    if(uColorMode == 0) {
        // Single color
        color = uColor1;
    } else if(uColorMode == 1) {
        // Double color
        color = mix(uColor1, uColor2, smoothBetween(uBlendCenter + uBlendSharpness * 0.5, 1.0, uBlendSharpness, vPositionLength));
    } else if(uColorMode == 2) {
        // Triple color
        color = mix(uColor1, uColor2, smoothBetween(uBlendCenter - uBlendScale + uBlendSharpness * 0.5, 1.0, uBlendSharpness, vPositionLength));
        color = mix(color, uColor3, smoothBetween(uBlendCenter + uBlendScale + uBlendSharpness * 0.5, 1.0, uBlendSharpness, vPositionLength));
    } else if (uColorMode == 3) {
        // Rainbow cycle
        color = hsv2rgb(vec3(mod(uTime - vPositionLength * (1.0 - uBlendScale * uBlendScale) * 0.05, 1.0), 1.0, 0.8));
    }

    // vec3 velocityColor = hsv2rgb(vec3(smoothstep(0.0, 0.8, length(vVelocityLength)), 1.0, vLife * 0.5 + 0.5));
    // vec3 color = velocityColor;
    
    // float a = alpha * (1.0 - pow(max(0.0, abs(vPositionLength * 1.1) * 2.0 - 1.0), 3.0));
    float a = alpha * (1.0 - abs(vPositionLength * vPositionLength * vPositionLength));

    gl_FragColor = vec4(color, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
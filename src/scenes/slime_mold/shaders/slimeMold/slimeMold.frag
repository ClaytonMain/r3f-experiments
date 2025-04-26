uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv -= vec2(0.5 * (uResolution.x / uResolution.y), 0.5);

    gl_FragColor = vec4(uv.xy, 0.0, 1.0);
}
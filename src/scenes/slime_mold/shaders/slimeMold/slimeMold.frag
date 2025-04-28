uniform float uTime;
uniform vec2 uScreenResolution;
uniform vec2 uPlaneResolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv * uPlaneResolution / uPlaneResolution.y;

    gl_FragColor = vec4(uv.xy, 0.0, 1.0);
    if (mod(uv.x, 0.1) < 0.003 || mod(uv.y, 0.1) < 0.003) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
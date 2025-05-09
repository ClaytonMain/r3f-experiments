uniform vec2 uScreenResolution;
uniform vec2 uPlaneResolution;
uniform float uGlPositionScale;
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0) * vec4(uScreenResolution.y / uScreenResolution.x * uPlaneResolution.x / uPlaneResolution.y, 1.0, 1.0, 1.0);

    gl_Position.xy *= uGlPositionScale * 1.85;
}
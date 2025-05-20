uniform vec2 uResolution;
uniform vec2 uDisplayTextureResolution;
uniform float uGlPositionScale;

varying vec2 vUv;

void main() {
    vUv = uv;

    // gl_Position = vec4(position, 1.0) * vec4(uResolution.y / uResolution.x * uDisplayTextureResolution.x / uDisplayTextureResolution.y, 1.0, 1.0, 1.0);
    // gl_Position.xy *= uGlPositionScale * 0.8;
    gl_Position = vec4(position.xy, 0.0, 1.0) * vec4(uDisplayTextureResolution.x / uDisplayTextureResolution.y, 2.0, 1.0, 1.0);
}
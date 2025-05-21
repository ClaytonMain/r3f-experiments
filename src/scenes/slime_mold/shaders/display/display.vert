uniform vec2 uDisplayScale;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0) * vec4(uDisplayScale.xy, 1.0, 1.0);
    // gl_Position = vec4(position.xy, 0.0, 1.0) * vec4(uGlPositionScale * uDisplayTextureResolution.x / uDisplayTextureResolution.y, 2.0, 1.0, 1.0);
}
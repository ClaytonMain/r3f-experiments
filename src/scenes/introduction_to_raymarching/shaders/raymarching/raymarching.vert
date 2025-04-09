uniform vec2 uResolution;
varying vec2 vUv;
varying mat4 vProjectionMatrix;
varying mat4 vModelViewMatrix;
varying vec4 vFragWorldPosition;

void main() {
    vUv = uv;
    vProjectionMatrix = projectionMatrix;
    vModelViewMatrix = modelViewMatrix;
    vFragWorldPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
varying vec4 vFragWorldPosition;

void main() {
    vFragWorldPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
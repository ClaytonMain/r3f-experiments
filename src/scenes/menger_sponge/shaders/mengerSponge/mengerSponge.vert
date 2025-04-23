varying mat4 vViewMatrix;
varying mat4 vProjectionMatrix;

void main() {
  vViewMatrix = modelViewMatrix;
  vProjectionMatrix = projectionMatrix;
  gl_Position = vec4(position, 1.0) * vec4(2.0, 2.0, 1.0, 1.0);
}
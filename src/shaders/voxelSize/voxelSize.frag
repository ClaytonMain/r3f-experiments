varying vec3 vModelPosition;

void main() {
    gl_FragColor = vec4(1.0 - vModelPosition.x, 1.0, 1.0, 1.0);
}
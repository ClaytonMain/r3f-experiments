uniform float uCellScale;
uniform sampler2D uDrawTexture;
uniform float uDelta;
uniform float uWallWidth;
uniform float uWallHeight;

attribute vec2 aPositionOffset;

varying vec2 vPositionOffset;

#include ../../../../shared/shaders/includes/random.glsl

void main() {
    vec4 drawInfo = texture2D(uDrawTexture, aPositionOffset);

    float scaleRandom = random(aPositionOffset) * 0.1 + 0.95;
    float scale = uCellScale * scaleRandom;
    scale *= drawInfo.x;

    vec3 transformed = position * scale + vec3((aPositionOffset - 0.5) * vec2(uWallWidth, uWallHeight), 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    vPositionOffset = aPositionOffset * 20.0;
}
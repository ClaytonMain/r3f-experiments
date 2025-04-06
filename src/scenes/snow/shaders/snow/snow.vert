uniform float uCellScale;
uniform sampler2D uDrawTexture;
uniform float uDelta;
uniform float uWallWidth;
uniform float uWallHeight;

attribute vec2 aPositionOffset;

varying vec2 vPositionOffset;
varying float vDecay;

#include ../../../../shared/shaders/includes/random.glsl
#include ../../../../shared/shaders/includes/noise.glsl

void main() {
    vec4 drawInfo = texture2D(uDrawTexture, aPositionOffset);

    float scaleRandom = random(aPositionOffset) * 0.1 + 0.90;
    float scale = uCellScale * scaleRandom;
    scale *= max(0.7, drawInfo.x);

    vec3 transformed = position * scale + vec3((aPositionOffset - 0.5) * vec2(uWallWidth, uWallHeight), 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);

    vPositionOffset = aPositionOffset;
    vDecay = drawInfo.x;
}
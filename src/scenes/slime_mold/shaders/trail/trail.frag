uniform sampler2D uAgentTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uDepositRate;
uniform int uInitialized;

varying vec2 vAgentPosition;

void main() {

    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
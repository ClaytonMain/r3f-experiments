uniform sampler2D uAgentTexture;
uniform sampler2D uTrailTexture;
uniform vec2 uDisplayTextureResolution;
uniform float uDepositRate;
uniform int uInitialized;

varying vec2 vAgentPosition;

void main() {
    if (uInitialized == 0) {
        return;
    }

    vec4 trailData = texture2D(uTrailTexture, vAgentPosition);

    gl_FragColor = vec4(1.0);
}
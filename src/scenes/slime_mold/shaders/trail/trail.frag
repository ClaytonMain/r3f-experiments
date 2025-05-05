uniform sampler2D uAgentTexture;
uniform sampler2D uTrailTexture;
uniform float uSensorAngle;
uniform float uRotationAngle;
uniform float uSensorOffset;
uniform float uSensorWidth;
uniform float uStepSize;
uniform float uDepositPerStep;

attribute vec2 aAgentPosition;

void main() {

    gl_FragColor = vec4(aAgentPosition, 0.0, 1.0);
}
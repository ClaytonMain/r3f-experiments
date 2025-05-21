varying float vAgentDepositAmount;
varying float vAgentDirectionAngle;

void main() {
    gl_FragColor = vec4(1.0, vAgentDepositAmount, vAgentDirectionAngle, 1.0);
}
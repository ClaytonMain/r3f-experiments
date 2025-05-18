uniform sampler2D uAgentDataTexture;
uniform vec2 uDisplayTextureResolution;

varying float vAgentDepositAmount;

void main() {
    // agentData.r := Agent x position.
    // agentData.g := Agent y position.
    // agentData.b := Agent direction angle.
    // agentData.a := Agent deposit amount.
    vec4 agentData = texture2D(uAgentDataTexture, position.xy);

    vec3 agentPosition = vec3(agentData.xy, 0.0);

    agentPosition.xy *= uDisplayTextureResolution;

    vAgentDepositAmount = agentData.a;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(agentPosition, 1.0);

    gl_PointSize = 1.0;
}
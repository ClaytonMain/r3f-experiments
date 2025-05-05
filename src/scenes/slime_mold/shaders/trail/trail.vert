uniform sampler2D uAgentTexture;

varying vec2 vAgentPosition;

void main() {
    vec3 agentPosition = texture2D(uAgentTexture, position.xy).xyz;

    vAgentPosition = vec2(agentPosition.x, agentPosition.y);

    vec4 modelPosition = modelMatrix * vec4(agentPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = vec4(agentPosition, 1.0);

    gl_PointSize = 1.0;
}
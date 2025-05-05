uniform sampler2D uAgentPositions;
uniform float uTime;

attribute vec2 aAgentPosition;

void main() {
    vec3 agentPosition = texture2D(uAgentPositions, position.xy).xyz;

    aAgentPosition = vec2(agentPosition.x, agentPosition.y);

    vec4 modelPosition = modelMatrix * vec4(agentPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = 1.0;
}
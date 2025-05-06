uniform sampler2D uAgentTexture;
uniform vec2 uDisplayTextureResolution;

varying vec2 vAgentPosition;

void main() {
    vec3 agentPosition = vec3(texture2D(uAgentTexture, position.xy).xy, 0.0);
    // agentPosition.xy *= uDisplayTextureResolution;

    vAgentPosition = vec2(agentPosition.x, agentPosition.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(agentPosition, 1.0);

    gl_PointSize = 1.0;
}
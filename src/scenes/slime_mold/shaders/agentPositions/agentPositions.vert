uniform sampler2D uAgentDataTexture;
uniform vec2 uDisplayTextureResolution;

varying vec2 vAgentPosition;
varying vec2 vPosition;

void main() {
    vPosition = position.xy;

    vec3 agentPosition = vec3(texture2D(uAgentDataTexture, position.xy).xy, 0.0);

    agentPosition.xy *= uDisplayTextureResolution;

    vAgentPosition = vec2(agentPosition.x, agentPosition.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(agentPosition, 1.0);

    gl_PointSize = 1.0;
}
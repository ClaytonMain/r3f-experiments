uniform vec2 uResolution;

varying float foo;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    float agentIndex = floor(uv.x * uResolution.x) + floor(uv.y * uResolution.y) * uResolution.x;

    if (agentIndex > uNumberOfAgents) {
        gl_Position = vec4(9999.0, 9999.0, 9999.0, 1.0);
        return;
    }

    vec4 agentData = texture2D(agentDataTexture, uv);
    vec4 trailData = texture2D(trailDataTexture, uv);

    // agentData.r = Agent x position in [0, 1)
    // agentData.g = Agent y position in [0, 1)
    // agentData.b = Agent direction in [0, 1)
    // agentData.a = Currently nothing

    gl_PointSize = 1.0;

    gl_Position = vec4(agentData.x, agentData.y, position.z, 1.0);
}
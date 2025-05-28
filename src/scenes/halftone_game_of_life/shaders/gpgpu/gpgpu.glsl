uniform int uWrapMode; // 0: no wrap, 1: wrap x, 2: wrap y, 3: wrap both

float neighborOffsets[8] = float[](1.0, 1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 1.0);

void main() {
    vec2 uv = (gl_FragCoord.xy - vec2(0.5)) / resolution.xy;
    vec4 currentState = texture(uGameState, uv);

    int neighborCount = 0;
    for (int i = 0; i < 8; i++) {
        vec2 offset = vec2(neighborOffsets[i], neighborOffsets[(i + 6) % 8]) / resolution.xy;
        vec2 neighborUv = uv + offset;

        if ((neighborUv.x < 0.0 || neighborUv.x > 1.0)) {
            if (uWrapMode == 1 || uWrapMode == 3) {
                neighborUv.x = mod(neighborUv.x, 1.0);
            } else {
                continue; // Skip this neighbor if not wrapping
            }
        }
        if ((neighborUv.y < 0.0 || neighborUv.y > 1.0)) {
            if (uWrapMode == 2 || uWrapMode == 3) {
                neighborUv.y = mod(neighborUv.y, 1.0);
            } else {
                continue; // Skip this neighbor if not wrapping
            }
        }

        vec4 neighborState = texture(uGameState, neighborUv);
        if (neighborState.r == 1.0) {
            neighborCount++;
        }
    }

    float cellState = currentState.r;
    if (neighborCount < 2 || neighborCount > 3) {
        cellState = 0.0; // Cell dies
    } else if (neighborCount == 3) {
        cellState = 1.0; // Cell becomes alive
    }

    gl_FragColor = vec4(cellState, 0.0, 0.0, 1.0);
}
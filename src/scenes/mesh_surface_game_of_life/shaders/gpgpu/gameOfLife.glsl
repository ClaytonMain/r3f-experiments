uniform float uDelta;
uniform int uRadialSegments;
uniform int uTubularSegments;
uniform float uStepDuration;
uniform int uMaxSteps;
uniform vec2 uRandomSeed;
uniform float uRandomizationDensity;

#include ../../../../shared/shaders/includes/random.glsl

int uvToIndex(vec2 uv) {
    return int(uv.x * resolution.x) + int(uv.y * resolution.x * resolution.x);
}

int gamePositionToIndex(ivec2 gamePosition) {
    return gamePosition.x + gamePosition.y * uRadialSegments;
}

ivec2 uvToGamePosition(vec2 uv) {
    int index = uvToIndex(uv);
    int gamePositionX = index % uRadialSegments;
    int gamePositionY = index / uRadialSegments;
    return ivec2(gamePositionX, gamePositionY);
}

vec2 gamePositionToUv(ivec2 gamePosition) {
    int index = gamePositionToIndex(gamePosition);
    float uvX = float(index % int(resolution.x));
    float uvY = float(index / int(resolution.x));
    return vec2(uvX / resolution.x, uvY / resolution.x);
}

vec2 indexToGamePosition(float index) {
    float gamePositionX = mod(index, float(uRadialSegments));
    float gamePositionY = floor(index / float(uRadialSegments));
    return vec2(gamePositionX, gamePositionY);
}

int countAliveNeighbors(ivec2 gamePosition) {
    int count = 0;
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
            if(i == 0 && j == 0) {
                continue;
            }
            ivec2 neighborGamePosition = ivec2((gamePosition.x + i) % uTubularSegments, (gamePosition.y + j) % uRadialSegments);
            vec2 neighborUv = gamePositionToUv(neighborGamePosition);
            vec4 neighborState = texture(gameState, neighborUv);
            count += int(neighborState.r);
        }
    }
    return count;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - vec2(0.5)) / resolution.xy;
    vec4 currentState = texture(gameState, uv);

    // Whether the cell is alive or dead.
    float alive = currentState.r;
    // Time spent on current step.
    float stepTime = currentState.g + uDelta;
    // Total steps taken since last randomization.
    float steps = currentState.b * float(uMaxSteps);
    // Index
    float index = currentState.a * float(uRadialSegments * uTubularSegments);

    // If enough time has passed, increment the step.
    if(stepTime >= uStepDuration) {
        stepTime = 0.0;
        steps += 1.0;
    }

    // If enough steps have passed, randomize the game state.
    if(steps >= float(uMaxSteps)) {
        steps = 0.0;
        alive = random(uRandomSeed + uv) > uRandomizationDensity ? 0.0 : 1.0;

    // Otherwise, update the game state if necessary.
    } else {
        if(stepTime == 0.0) {
            ivec2 gamePosition = uvToGamePosition(uv);
            int aliveNeighbors = countAliveNeighbors(gamePosition);
            if(alive == 1.0) {
                if(aliveNeighbors < 2 || aliveNeighbors > 3) {
                    alive = 0.0;
                }
            } else {
                if(aliveNeighbors == 3) {
                    alive = 1.0;
                }
            }
        }
    }

    gl_FragColor.rgb = vec3(alive, stepTime, steps / float(uMaxSteps));

    // int indexFromUv = uvToIndex(uv);
    // int indexFromGamePosition = gamePositionToIndex(uvToGamePosition(uv));
    // if(indexFromUv != indexFromGamePosition) {
    //     gl_FragColor.r = 1.0;
    // } else {
    //     gl_FragColor.r = 0.0;
    // }
}

// uniform float uDelta;
// uniform float uRadialSegments;
// uniform float uTubularSegments;
// uniform float uStepDuration;
// uniform float uMaxSteps;
// uniform vec2 uRandomSeed;
// uniform float uRandomizationDensity;

// #include ../../../../shared/shaders/includes/random.glsl

// float uvToIndex(vec2 uv) {
//     return uv.x * resolution.x + uv.y * resolution.x * resolution.x;
// }

// float gamePositionToIndex(vec2 gamePosition) {
//     return gamePosition.x + gamePosition.y * uRadialSegments;
// }

// vec2 uvToGamePosition(vec2 uv) {
//     float index = uvToIndex(uv);
//     float gamePositionX = index % uRadialSegments;
//     float gamePositionY = index / uTubularSegments;
//     return vec2(gamePositionX, gamePositionY);
// }

// vec2 gamePositionToUv(vec2 gamePosition) {
//     float index = gamePositionToIndex(gamePosition);
//     float uvX = index % resolution.x;
//     float uvY = floor(index / int(resolution.x));
//     return vec2(uvX / resolution.x, uvY / resolution.x);
// }

// int countAliveNeighbors(ivec2 gamePosition) {
//     int count = 0;
//     for(int i = -1; i <= 1; i++) {
//         for(int j = -1; j <= 1; j++) {
//             if(i == 0 && j == 0) {
//                 continue;
//             }
//             ivec2 neighborGamePosition = ivec2((gamePosition.x + i) % uTubularSegments, (gamePosition.y + j) % uRadialSegments);
//             vec2 neighborUv = gamePositionToUv(neighborGamePosition);
//             vec4 neighborState = texture(gameState, neighborUv);
//             count += int(neighborState.r);
//         }
//     }
//     return count;
// }

// void main() {
//     vec2 uv = gl_FragCoord.xy / resolution.xy;
//     vec4 currentState = texture(gameState, uv);

//     // Whether the cell is alive or dead.
//     float alive = currentState.r;
//     // Time spent on current step.
//     float stepTime = currentState.g + uDelta;
//     // Total steps taken since last randomization.
//     float steps = currentState.b * float(uMaxSteps);

//     // If enough time has passed, increment the step.
//     if(stepTime >= uStepDuration) {
//         stepTime = 0.0;
//         steps += 1.0;
//     }

//     // If enough steps have passed, randomize the game state.
//     if(steps >= float(uMaxSteps)) {
//         steps = 0.0;
//         alive = random(uRandomSeed + uv) > uRandomizationDensity ? 0.0 : 1.0;

//     // Otherwise, update the game state if necessary.
//     } else {
//         if(stepTime == 0.0) {
//             ivec2 gamePosition = uvToGamePosition(uv);
//             int aliveNeighbors = countAliveNeighbors(gamePosition);
//             if(alive == 1.0) {
//                 if(aliveNeighbors < 2 || aliveNeighbors > 3) {
//                     alive = 0.0;
//                 }
//             } else {
//                 if(aliveNeighbors == 3) {
//                     alive = 1.0;
//                 }
//             }
//         }
//     }

//     gl_FragColor = vec4(alive, stepTime, steps / float(uMaxSteps), 0.0);

//     if ()
// }
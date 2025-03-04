uniform sampler2D uTextureGameState;
uniform float uRadialSegments;
uniform float uTubularSegments;
uniform float uTextureWidth;

varying vec2 vUv;

int gamePositionToIndex(ivec2 gamePosition) {
    return gamePosition.x + gamePosition.y * int(uRadialSegments);
}

vec2 gamePositionToUv(ivec2 gamePosition) {
    int index = gamePositionToIndex(gamePosition);
    float uvX = float(index % int(uTextureWidth));
    float uvY = float(index / int(uTextureWidth));
    return vec2(uvX / uTextureWidth, uvY / uTextureWidth);
}

void main() {
    float gamePositionY = float(vUv.y) * uRadialSegments - 1.0;
    float gamePositionX = float(vUv.x) * uTubularSegments - 1.0;
    ivec2 gamePosition = ivec2(gamePositionX, gamePositionY);

    vec2 gameStateUv = gamePositionToUv(gamePosition);
    vec4 gameState = texture2D(uTextureGameState, gameStateUv);

    gl_FragColor = vec4(vec3(1.0), gameState.r);
}

// uniform sampler2D uTextureGameState;
// uniform int uRadialSegments;
// uniform int uTubularSegments;

// varying vec2 vUv;

// void main() {
//     float floorTime = floor(uTime * 100.0);
//     float modFloorTimeRadial = mod(floorTime, uRadialSegments);
//     float modFloorTimeTubular = mod(floorTime, uTubularSegments);

//     float radialCoord = vUv.y * uRadialSegments - 1.0;
//     float tubularCoord = vUv.x * uTubularSegments - 1.0;

//     float rIntensity = 0.0;
//     float gIntensity = 0.0;
//     if (modFloorTimeRadial == radialCoord) {
//         rIntensity = 1.0;
//     }
//     if(modFloorTimeTubular == tubularCoord) {
//         gIntensity = 1.0;
//     }

//     gl_FragColor = vec4(rIntensity, gIntensity, rIntensity * gIntensity, 1.0);
// }
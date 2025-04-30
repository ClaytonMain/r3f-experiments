uniform float uTime;
uniform float uDelta;
uniform vec2 uResolution;

varying float foo;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    vec4 trailData = texture2D(trailDataTexture, uv);

    gl_FragColor = trailData;
    if (uv.x == 0.0 || uv.x == 1.0 || uv.y == 0.0 || uv.y == 1.0) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
}
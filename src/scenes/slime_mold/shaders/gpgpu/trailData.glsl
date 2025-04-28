void main() {
    vec2 uv = gl_FragCoord.xy / vec2(1920.0, 1024.0);

    vec4 trailData = texture2D(trailDataTexture, uv);

    gl_FragColor = trailData;
}
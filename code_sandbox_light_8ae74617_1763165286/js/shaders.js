// ========================================
// Ripple Effect Shaders (波紋エフェクト用シェーダー)
// ========================================

const RippleShader = {
    uniforms: {
        tDiffuse1: { value: null },  // 現在の画像
        tDiffuse2: { value: null },  // 次の画像
        progress: { value: 0.0 },    // トランジション進捗 (0.0 - 1.0)
        rippleCenter: { value: new THREE.Vector2(0.5, 0.5) }, // 波紋の中心座標
        amplitude: { value: 0.3 },   // 波紋の振幅
        frequency: { value: 20.0 },  // 波紋の周波数
        speed: { value: 3.0 }        // 波紋の拡散速度
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float progress;
        uniform vec2 rippleCenter;
        uniform float amplitude;
        uniform float frequency;
        uniform float speed;
        
        varying vec2 vUv;
        
        void main() {
            // 波紋の中心からの距離を計算
            vec2 dir = vUv - rippleCenter;
            float dist = length(dir);
            
            // 波紋の進行を計算
            float rippleProgress = progress * speed;
            
            // 波紋の影響範囲を計算
            float ripple = sin((dist - rippleProgress) * frequency) * amplitude;
            
            // 距離に応じて減衰させる
            float falloff = smoothstep(rippleProgress + 0.3, rippleProgress - 0.1, dist);
            ripple *= falloff;
            
            // エッジの滑らかさを追加
            float edge = smoothstep(0.0, 0.1, progress) * smoothstep(1.0, 0.9, progress);
            ripple *= edge;
            
            // UV座標を波紋で歪ませる
            vec2 distortedUv = vUv + normalize(dir) * ripple * (1.0 - progress);
            
            // 画像をサンプリング
            vec4 color1 = texture2D(tDiffuse1, distortedUv);
            vec4 color2 = texture2D(tDiffuse2, distortedUv);
            
            // 波紋の進行に基づいてミックス
            float mixFactor = smoothstep(rippleProgress - 0.2, rippleProgress + 0.1, dist);
            mixFactor = mix(progress, mixFactor, 0.5);
            
            // 最終カラーを出力
            gl_FragColor = mix(color1, color2, mixFactor);
        }
    `
};

// ========================================
// Time Warp Shader (タイムワープシェーダー)
// ========================================

const AdvancedRippleShader = {
    uniforms: {
        tDiffuse1: { value: null },
        tDiffuse2: { value: null },
        progress: { value: 0.0 },
        rippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
        warpIntensity: { value: 0.15 }
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float progress;
        uniform vec2 rippleCenter;
        uniform float warpIntensity;
        
        varying vec2 vUv;
        
        void main() {
            // 中心からの方向と距離
            vec2 dir = vUv - rippleCenter;
            float dist = length(dir);
            vec2 normalizedDir = dist > 0.0 ? normalize(dir) : vec2(0.0);
            
            // タイムワープの波の位置（中央から外側に広がる）
            float wavePos = progress * 1.5;
            
            // 波の影響範囲を計算（鋭いエッジを持つ1つの波）
            float waveDist = abs(dist - wavePos);
            float waveInfluence = smoothstep(0.3, 0.0, waveDist);
            
            // ワープの強度（波の位置で最大）
            float warpStrength = waveInfluence * warpIntensity * sin(progress * 3.14159);
            
            // UV座標を放射状に歪ませる（タイムワープ効果）
            vec2 warpedUv = vUv + normalizedDir * warpStrength;
            
            // 画像をサンプリング
            vec4 color1 = texture2D(tDiffuse1, warpedUv);
            vec4 color2 = texture2D(tDiffuse2, warpedUv);
            
            // 波が通過した領域は新しい画像に切り替える
            float transition = smoothstep(wavePos - 0.1, wavePos + 0.1, dist);
            
            // 最終カラー
            gl_FragColor = mix(color2, color1, transition);
        }
    `
};

// ========================================
// Simple Displacement Shader (シンプルな変位シェーダー)
// ========================================

const DisplacementShader = {
    uniforms: {
        tDiffuse1: { value: null },
        tDiffuse2: { value: null },
        progress: { value: 0.0 },
        intensity: { value: 0.5 }
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float progress;
        uniform float intensity;
        
        varying vec2 vUv;
        
        void main() {
            vec2 p = vUv;
            float displacement = intensity * (0.5 - abs(progress - 0.5));
            
            vec4 color1 = texture2D(tDiffuse1, p + vec2(displacement * progress, 0.0));
            vec4 color2 = texture2D(tDiffuse2, p - vec2(displacement * (1.0 - progress), 0.0));
            
            gl_FragColor = mix(color1, color2, progress);
        }
    `
};

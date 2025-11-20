// ========================================
// Global Variables
// ========================================

let scene, camera, renderer;
let geometry, material, mesh;
let currentIndex = 0;
let isTransitioning = false;
let lastScrollTime = 0;
let scrollCooldown = 1200; // スクロール後のクールダウン時間（ミリ秒）

// 画像URL配列（Unsplash APIから高品質な画像を使用）
const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&h=1080&fit=crop'
];

const imageTitles = [
    '山の風景',
    '森の中',
    '自然の美',
    '夕暮れ',
    '花畑'
];

let textures = [];

// ========================================
// Initialization
// ========================================

function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('webgl-canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Geometry
    geometry = new THREE.PlaneGeometry(2, 2);
    
    // Load textures
    loadTextures();
    
    // Event listeners
    setupEventListeners();
    
    // Create progress dots
    createProgressDots();
    
    // Start animation loop
    animate();
}

// ========================================
// Texture Loading
// ========================================

function loadTextures() {
    const loader = new THREE.TextureLoader();
    let loadedCount = 0;
    
    images.forEach((url, index) => {
        loader.load(
            url,
            (texture) => {
                textures[index] = texture;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                loadedCount++;
                
                if (loadedCount === images.length) {
                    onTexturesLoaded();
                }
            },
            undefined,
            (error) => {
                console.error('テクスチャの読み込みエラー:', error);
            }
        );
    });
}

function onTexturesLoaded() {
    // 初期マテリアルを設定
    material = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse1: { value: textures[0] },
            tDiffuse2: { value: textures[1] },
            progress: { value: 0.0 },
            rippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
            warpIntensity: { value: 0.15 }
        },
        vertexShader: AdvancedRippleShader.vertexShader,
        fragmentShader: AdvancedRippleShader.fragmentShader
    });
    
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // ローディング画面を非表示
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 500);
    
    // 最初の画像情報を更新
    updateImageInfo();
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Scroll event
    let scrollTimeout;
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < scrollCooldown || isTransitioning) {
            return;
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
                nextImage();
            } else {
                previousImage();
            }
            lastScrollTime = Date.now();
        }, 50);
    }, { passive: false });
    
    // Touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    window.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < scrollCooldown || isTransitioning) {
            return;
        }
        
        const swipeDistance = touchStartY - touchEndY;
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                nextImage();
            } else {
                previousImage();
            }
            lastScrollTime = Date.now();
        }
    }
    
    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < scrollCooldown) {
            return;
        }
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextImage();
            lastScrollTime = Date.now();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            previousImage();
            lastScrollTime = Date.now();
        }
    });
    
    // Navigation buttons
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (!isTransitioning) previousImage();
    });
    
    document.getElementById('next-btn').addEventListener('click', () => {
        if (!isTransitioning) nextImage();
    });
}

// ========================================
// Progress Dots
// ========================================

function createProgressDots() {
    const container = document.getElementById('progress-dots');
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (index === currentIndex) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            if (!isTransitioning && index !== currentIndex) {
                goToImage(index);
            }
        });
        container.appendChild(dot);
    });
}

function updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// ========================================
// Image Info Update
// ========================================

function updateImageInfo() {
    document.getElementById('image-title').textContent = imageTitles[currentIndex];
    document.getElementById('current-index').textContent = currentIndex + 1;
    document.getElementById('total-images').textContent = images.length;
}

// ========================================
// Navigation Functions
// ========================================

function nextImage() {
    if (isTransitioning) return;
    const nextIndex = (currentIndex + 1) % images.length;
    transitionToImage(nextIndex);
}

function previousImage() {
    if (isTransitioning) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    transitionToImage(prevIndex);
}

function goToImage(index) {
    if (isTransitioning || index === currentIndex) return;
    transitionToImage(index);
}

// ========================================
// Image Transition with Time Warp Effect
// ========================================

function transitionToImage(targetIndex) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    
    // スクロール指示を非表示
    document.getElementById('scroll-instruction').classList.add('hidden');
    
    // タイムワープトランジション開始
    startRippleTransition(targetIndex);
}

function startRippleTransition(targetIndex) {
    const startTime = Date.now();
    const duration = 1200; // トランジション時間（ミリ秒）
    
    // 波紋の中心を画面中央に設定
    material.uniforms.rippleCenter.value.set(0.5, 0.5);
    
    // テクスチャを更新
    material.uniforms.tDiffuse1.value = textures[currentIndex];
    material.uniforms.tDiffuse2.value = textures[targetIndex];
    
    function updateTransition() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        
        // イージング関数適用（ease-in-out）
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        material.uniforms.progress.value = easedProgress;
        
        if (progress < 1.0) {
            requestAnimationFrame(updateTransition);
        } else {
            // トランジション完了
            currentIndex = targetIndex;
            
            // 新しい画像を現在のテクスチャとして設定
            material.uniforms.tDiffuse1.value = textures[targetIndex];
            material.uniforms.progress.value = 0.0;
            
            isTransitioning = false;
            
            // UI更新
            updateProgressDots();
            updateImageInfo();
        }
    }
    
    updateTransition();
}

// ========================================
// Window Resize Handler
// ========================================

function onWindowResize() {
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========================================
// Animation Loop
// ========================================

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// ========================================
// Start Application
// ========================================

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

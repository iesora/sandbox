// ========================================
// スムーススクロール
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// スクロールアニメーション
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.achievement-item, .photo-item, .comparison-box, .data-box, .doctor-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ========================================
// CTAボタンのクリックイベント
// ========================================
document.querySelectorAll('.plan-cta-btn, .final-cta-button').forEach(button => {
    button.addEventListener('click', () => {
        // 実際のサービスでは検索ページへ遷移
        alert('無料検索ページへ遷移します。\n※このデモではアラート表示のみです。');
        
        // 本番環境での実装例：
        // window.location.href = '/search';
    });
});

// ========================================
// ブランドサークルのクリックイベント
// ========================================
document.querySelectorAll('.brand-circle').forEach(circle => {
    circle.addEventListener('click', () => {
        const treatment = circle.textContent.trim();
        alert(`「${treatment}」で検索します。`);
        
        // 本番環境での実装例：
        // window.location.href = `/search?treatment=${encodeURIComponent(treatment)}`;
    });
});

// ========================================
// 数値カウントアップアニメーション
// ========================================
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end.toLocaleString('ja-JP');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('ja-JP');
        }
    }, 16);
}

// 実績数値・データのカウントアップ
const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const numberElement = entry.target.querySelector('.achievement-number, .stat-num, .data-number');
            if (numberElement) {
                const text = numberElement.textContent.replace(/,/g, '').match(/\d+/);
                if (text) {
                    const targetValue = parseInt(text[0]);
                    animateValue(numberElement, 0, targetValue, 2000);
                    entry.target.dataset.animated = 'true';
                }
            }
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.achievement-item, .stat-box, .data-box').forEach(item => {
        numberObserver.observe(item);
    });
});

// ========================================
// SNS写真のスクロールスナップ
// ========================================
const socialPhotos = document.querySelector('.social-photos');
if (socialPhotos) {
    let isDown = false;
    let startX;
    let scrollLeft;

    socialPhotos.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - socialPhotos.offsetLeft;
        scrollLeft = socialPhotos.scrollLeft;
    });

    socialPhotos.addEventListener('mouseleave', () => {
        isDown = false;
    });

    socialPhotos.addEventListener('mouseup', () => {
        isDown = false;
    });

    socialPhotos.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - socialPhotos.offsetLeft;
        const walk = (x - startX) * 2;
        socialPhotos.scrollLeft = scrollLeft - walk;
    });
}

// ========================================
// 画像の遅延読み込み
// ========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// ページ読み込み完了時の処理
// ========================================
window.addEventListener('load', () => {
    // ページトップへのフェードイン
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ========================================
// デバッグ用
// ========================================
console.log('Smile Navigation (スマなび) - 美容系LP');
console.log('JavaScript loaded successfully');

// ========================================
// スライド設定（HTMLセクション）
// ========================================
const slides = Array.isArray([
  {
    id: "mainv",
    label: "Main Visual",
    centerText: "瞬間と永遠",
    html: `
      <section class="l-main_section mainv" id="mainv">
        <p class="mv_text">
          <img
            src="./assets/img/mv_text.png"
            alt="都市の風景。家族の歴史。人生が一瞬というならば、そのよろこび、かなしみは、つぎの一瞬には上書きされてしまう。切なくて愛おしい、今という瞬間。でも、蝶の羽ばたきがどこかで嵐を起こすように、あなたの今は未来につながっている。あなたの一瞬は永遠に響きつづける。世界は変わる。今ここから。ソーシャルとビジネスで、歩んでいく。マリモホールディングス。"
          >
        </p>
        <div class="mv_lead">
          <picture>
            <source srcset="./assets/img/mv_lead_sp.png" media="(max-width: 768px)">
            <img src="./assets/img/mv_lead.png" alt="瞬間と永遠">
          </picture>
        </div>
      </section>
    `,
  },
  {
    id: "section01",
    label: "(Moments)",
    centerText: "Moments",
    html: `
      <section class="l-main_section section01" id="section01">
        <p class="section01_text">
          <img
            src="./assets/img/section01_text.png"
            alt="見慣れた街角。古い建物が解体され、更地になり、新しい建物が建つ。しばらくすると以前そこに何があったのか、どんな風景だったのか、忘れられてしまう。そこで営まれた生活や、積み重ねられた家族やコミュニティのヒストリーも。そしていま、刻一刻、加速度的に変わる世界。"
          >
        </p>
        <div class="section01_lead">
          <p>(Moments)</p>
          <div>
            <img src="./assets/img/section01_lead.png" alt="瞬間">
          </div>
        </div>
      </section>
    `,
  },
  {
    id: "section02",
    label: "(Eternity)",
    centerText: "Eternity",
    html: `
      <section class="l-main_section section02" id="section02">
        <p class="section02_text">
          <img
            src="./assets/img/section02_text.png"
            alt="一方で、愛おしい「いま」が積み重なっていく。その地層は、土台となり、未来に影響を与え続けていく。バタフライ効果のように、無限に続くビリヤードのように。自分の「いま」が永遠に生きることへの希望と覚悟。「いま」と「これから」をもっと大切に生きるために。"
          >
        </p>
        <div class="section02_lead">
          <p>(Eternity)</p>
          <div>
            <img src="./assets/img/section02_lead.png" alt="永遠">
          </div>
        </div>
      </section>
    `,
  },
])
  ? window.stageSlides
  : [];
const slideCount = slides.length;
const slideIdMap = new Map();
slides.forEach((slide, index) => {
  if (!slide || !slide.id) return;
  slideIdMap.set(String(slide.id).replace(/^#/, ""), index);
});

function computeUnitHeight() {
  return window.innerHeight * SECTION_HEIGHT_MULTIPLIER + SECTION_HEIGHT_EXTRA;
}

function createStageGalleryStub() {
  return {
    getSlides: () => slides.slice(),
    getActiveIndex: () => 0,
    scrollToIndex: () => false,
    scrollToSection: () => false,
  };
}

window.stageGallery = createStageGalleryStub();

// ========================================
// DOM要素
// ========================================
const currentLayer = document.getElementById("currentLayer");
const nextLayer = document.getElementById("nextLayer");
const gradientBand = document.getElementById("gradientBand");
const indicator = document.getElementById("indicator");
const indicatorDots = document.getElementById("indicatorDots");
const navButtonUp = document.getElementById("navButtonUp");
const navButtonDown = document.getElementById("navButtonDown");
const scrollSpacer = document.querySelector(".scroll-spacer");
const galleryStageRoot = document.querySelector(".gallery-stage");
const stageTail = document.querySelector(".stage-tail");
const tailBridgeLayer = document.getElementById("tailBridgeLayer");
const rootElement = document.documentElement;
const stageTailSentinel = document.getElementById("stageTailSentinel");

const RIPPLE_FROM_ID = "section01";
const RIPPLE_TO_ID = "section02";
const RIPPLE_BODY_CLASS = "is-stage-ripple-boundary";
let rippleBodyState = false;

// ========================================
// 状態管理
// ========================================
// スクロール区間（1セクション）の伸縮係数と余白
const SECTION_HEIGHT_MULTIPLIER = 3; // 1.0 でビューポート高さと同等
const SECTION_HEIGHT_EXTRA = 150; // px単位で追加スクロール量
const SNAP_DURATION_MS = 1500;
const SWIPE_THRESHOLD_PX = 40;
const TAIL_SPACER_EXTRA = 0; // px
const STAGE_TAIL_CLASS = "is-stage-tail";
const STAGE_TAIL_OVERLAY_CLASS = "is-stage-tail-overlay";
const LAST_SECTION_HEIGHT_MULTIPLIER = 1;
const LAST_SECTION_HEIGHT_EXTRA = 0;
const TAIL_MODE_THRESHOLD = 0.92;
const LAST_SLIDE_BRIDGE_START = 0.35;
const STAGE_TAIL_EXIT_MARGIN_RATIO = 0.12;
const STAGE_TAIL_EXIT_HYSTERESIS = 0.12;
const TAIL_OVERLAY_ENTER_THRESHOLD = TAIL_MODE_THRESHOLD; // 0.92
const TAIL_OVERLAY_EXIT_THRESHOLD = Math.max(
  LAST_SLIDE_BRIDGE_START + 0.02,
  TAIL_MODE_THRESHOLD - 0.18
); // ≈0.74
// section03 ⇄ section04 のブリッジ演出を無効化し、常時シームレスに見せる
const DISABLE_BRIDGE_SECTION03_04 = true;

let viewportHeight = window.innerHeight;
let currentIndex = 0;
let nextIndex = Math.min(1, Math.max(0, slideCount - 1));
let ticking = false;
// 境界の安定化用（方向依存のインデックス更新）
let lastScrollY = window.scrollY || 0;
let activeSectionIndex = 0;
let activeSectionStartY = 0; // px 基準（unitHeightPx の倍数）
let indicatorDotElements = [];
let isSnapping = false;
let wheelLocked = false;
let lastSnapTime = 0;
let touchStartY = null;
let unitHeightPx = computeUnitHeight();
let anchorElements = [];
let tailAnchor = null;
let tailModeActive = false;
let tailObserver = null;
let tailOverlayActive = false;
let lastTailProgressHint = 0;
let lastScrollDirection = 1;
let tailModeReentryLock = null;
let rippleLatchActive = false;
const SUPPORTS_INTERSECTION_OBSERVER =
  typeof window !== "undefined" && "IntersectionObserver" in window;
const LAST_SLIDE_ID =
  slideCount > 0 && slides[slideCount - 1] && slides[slideCount - 1].id
    ? slides[slideCount - 1].id
    : null;

function getUnitHeightForIndex(index) {
  if (index === slideCount - 1) {
    const baseHeight =
      viewportHeight * LAST_SECTION_HEIGHT_MULTIPLIER +
      LAST_SECTION_HEIGHT_EXTRA;
    return Math.max(baseHeight, Math.max(viewportHeight, 1));
  }
  return unitHeightPx;
}
// シームのぼかし幅（% of viewport height）。大きいほど境界がなだらか
const FEATHER_PERCENT = 20; // 0〜100 の範囲で調整
// オーバーラップ幅（% of viewport height）。重ねて黒っぽさ（背景透け）を防ぐ
const OVERLAP_PERCENT = 0; // 推奨: 4〜16
// グラデーション（ブレンド）が始まる進捗（0〜1）。大きいほど遅く始まる
const GRADIENT_START = 0.2;
// 前段の予備ブレンド（しきい値手前で徐々に出現）
const PRE_BLEND_RANGE = 0.04; // 0〜1 の範囲（しきい値からの幅）
// 予備ブレンド中にもシームを少し持ち上げる（下端で「つっかえる」見え方を回避）
const PRE_SEAM_LIFT_PERCENT = 4; // 0〜100（下端から最大どれだけ上げるか）
// 装飾バンドのフェード幅（しきい値手前からフェードイン）
const BAND_FADE_RANGE = 0.1; // 0〜1 の範囲
// 境界ラインの持ち上げ量（% of viewport height）。中央が上に反る量（端は0、中央が -BOW）
const BOW_PERCENT = 8; // 推奨: 4〜16（見た目に合わせて調整）
// マスク生成用キャンバス解像度（大きいほど高精細だが処理が重い）
const MASK_RESOLUTION = 512; // 正方ピクセル数（幅=高さ）
// マスクキャッシュ制御（メモリ無制限蓄積を防ぐ）
const MAX_MASK_CACHE_ENTRIES = 128; // LRU上限（必要に応じて調整）
// 生成頻度削減のための量子化ステップ
const QUANT_STEP_SEAM = 0.5; // [%] シーム位置の量子化（0.25〜1程度で調整）
const QUANT_STEP_PROGRESS = 0.01; // [0-1] 進捗量子化
const QUANT_STEP_FEATHER = 1; // [%] ぼかし幅量子化
const QUANT_STEP_OVERLAP = 1; // [%] オーバーラップ量子化
// グラデーション帯追従のスムージング係数（0 < 値 <= 1）
const BAND_SMOOTHING = 0.8;
// 最終画像が完全に表示されるように確保する余剰スクロール量（ビューポート単位）
const SCROLL_BOUNDARY_MARGIN = 16;
const MASK_FULLY_VISIBLE =
  "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)";
const MASK_FULLY_HIDDEN =
  "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)";

// ========================================
// 初期化
// ========================================
function init() {
  if (
    !currentLayer ||
    !nextLayer ||
    !gradientBand ||
    !scrollSpacer ||
    slideCount === 0
  ) {
    window.stageGallery = createStageGalleryStub();
    return;
  }

  // スクロール領域の高さを設定
  updateScrollAreaHeight();
  syncActiveSectionOrigin();

  // 初期セクションを設定
  refreshLayers();

  // ドットインジケータを生成
  initializeIndicatorDots();

  // ナビゲーションボタンをセットアップ
  setupNavigationButtons();

  // マスク用キャンバスを準備
  setupMaskCanvases();
  prepareTailBridgeLayer();
  setStageBridgeProgress(0);

  // 初期レンダリング
  updateProgress();
  setupTailObserver();
  updateTailMode(window.scrollY || 0);

  // イベントリスナー
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  // キーボード操作（任意）
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  exposeStageGalleryAPI();
}

function updateScrollAreaHeight() {
  rebuildScrollAnchors();
}

function rebuildScrollAnchors() {
  if (!scrollSpacer) return;
  scrollSpacer.innerHTML = "";
  anchorElements = slides.map((slide, index) => {
    const anchor = document.createElement("div");
    anchor.className = "scroll-anchor";
    anchor.id = `stage-scroll-anchor-${index}`;
    anchor.style.height = `${getUnitHeightForIndex(index)}px`;
    scrollSpacer.appendChild(anchor);
    return anchor;
  });
  tailAnchor = document.createElement("div");
  tailAnchor.className = "scroll-anchor scroll-anchor--tail";
  tailAnchor.style.height = `${Math.max(TAIL_SPACER_EXTRA, 0)}px`;
  scrollSpacer.appendChild(tailAnchor);
}

function getScrollTargetForIndex(index) {
  const anchor = anchorElements[index];
  if (anchor) {
    return anchor.offsetTop;
  }
  let fallback = 0;
  for (let i = 0; i < index; i += 1) {
    fallback += getUnitHeightForIndex(i);
  }
  return fallback;
}

function syncActiveSectionOrigin() {
  activeSectionStartY = getScrollTargetForIndex(activeSectionIndex);
}

function smoothScrollTo(targetY, duration = SNAP_DURATION_MS, callback) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime =
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  if (duration <= 0) {
    window.scrollTo(0, targetY);
    if (typeof callback === "function") {
      callback();
    }
    return;
  }

  const step = () => {
    const now =
      typeof performance !== "undefined" && performance.now
        ? performance.now()
        : Date.now();
    const elapsed = now - startTime;
    const t = clamp(elapsed / duration, 0, 1);
    const eased = ease(t);
    const current = startY + distance * eased;
    window.scrollTo(0, current);
    if (t < 1) {
      window.requestAnimationFrame(step);
    } else if (typeof callback === "function") {
      callback();
    }
  };

  window.requestAnimationFrame(step);
}

// ========================================
// ドットインジケータ生成
// ========================================
function initializeIndicatorDots() {
  if (!indicatorDots) return;
  indicatorDots.innerHTML = "";
  indicatorDotElements = slides.map(() => {
    const dot = document.createElement("span");
    dot.className = "indicator-dot";
    indicatorDots.appendChild(dot);
    return dot;
  });
  updateIndicatorDots(currentIndex);
}

function updateIndicatorDots(activeIndex) {
  if (!indicatorDotElements || indicatorDotElements.length === 0) return;
  indicatorDotElements.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
}

function refreshLayers() {
  const currentSlide = slides[currentIndex] || null;
  const nextSlide = slides[nextIndex] || currentSlide;
  setLayerContent(currentLayer, currentSlide);
  setLayerContent(nextLayer, nextSlide);
  if (indicator && slideCount > 0) {
    indicator.textContent = `${currentIndex + 1} / ${slideCount}`;
  }
  updateIndicatorDots(currentIndex);
}

function setLayerContent(layer, slide) {
  if (!layer) return;
  layer.innerHTML = "";
  layer.dataset.stageSlideId = slide && slide.id ? slide.id : "";
  if (!slide) return;
  layer.innerHTML = slide.html;

  if (slide.id === "mainv" && typeof window.applyMvBackground === "function") {
    const mvElement = layer.querySelector("#mainv");
    if (mvElement) {
      window.applyMvBackground(mvElement);
    }
  }

  if (typeof window.activateDynamicComponents === "function") {
    window.activateDynamicComponents(layer);
  }
}

function stripIds(element) {
  if (!element) {
    return;
  }
  if (
    typeof element.removeAttribute === "function" &&
    element.hasAttribute &&
    element.hasAttribute("id")
  ) {
    element.removeAttribute("id");
  }
  if (typeof element.querySelectorAll === "function") {
    const descendants = element.querySelectorAll("[id]");
    descendants.forEach((node) => node.removeAttribute("id"));
  }
}

// ========================================
// ナビゲーションボタン
// ========================================
function setupNavigationButtons() {
  if (navButtonUp) {
    navButtonUp.addEventListener("click", () => navigateByButton(-1));
  }
  if (navButtonDown) {
    navButtonDown.addEventListener("click", () => navigateByButton(1));
  }
  updateNavigationDisabledStates();
}

function navigateByButton(direction) {
  if (direction === 0) return;
  const targetIndex = clamp(activeSectionIndex + direction, 0, slideCount - 1);
  requestSnapToIndex(targetIndex);
}

function scrollToStageIndex(targetIndex, duration = SNAP_DURATION_MS) {
  if (!Number.isFinite(targetIndex)) {
    return false;
  }
  const clamped = clamp(Math.round(targetIndex), 0, slideCount - 1);
  return requestSnapToIndex(clamped, duration);
}

function requestSnapToIndex(targetIndex, duration = SNAP_DURATION_MS) {
  const clamped = clamp(targetIndex, 0, slideCount - 1);
  const targetY = getScrollTargetForIndex(clamped);
  if (Math.abs(window.scrollY - targetY) < 1) {
    return false;
  }
  const now = Date.now();
  if (isSnapping || now - lastSnapTime < duration) {
    return false;
  }
  isSnapping = true;
  wheelLocked = true;
  lastSnapTime = now;
  smoothScrollTo(targetY, duration, () => {
    isSnapping = false;
    wheelLocked = false;
  });
  return true;
}

function updateNavigationDisabledStates(indexOverride) {
  if (!navButtonUp && !navButtonDown) return;
  const effectiveIndex = clamp(
    indexOverride !== undefined ? indexOverride : activeSectionIndex,
    0,
    slideCount - 1
  );
  if (navButtonUp) {
    navButtonUp.disabled = effectiveIndex <= 0;
  }
  if (navButtonDown) {
    navButtonDown.disabled = effectiveIndex >= slideCount - 1;
  }
}

// ========================================
// スクロールイベント
// ========================================
function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateProgress();
      ticking = false;
    });
    ticking = true;
  }
}

// ========================================
// 進捗更新（メイン処理）
// ========================================
let lastSectionChange = { oldIndex: null, newIndex: null };
function updateProgress() {
  const scrollY = window.scrollY;
  let activeUnitHeight = getUnitHeightForIndex(activeSectionIndex);
  let overshootTolerance =
    (SCROLL_BOUNDARY_MARGIN + 1) / Math.max(activeUnitHeight, 1);
  // アクティブセクション基準の進捗を算出
  const deltaY = scrollY - lastScrollY;
  const scrollingDown = deltaY >= 0;
  lastScrollDirection = scrollingDown ? 1 : -1;
  let rawProgress = (scrollY - activeSectionStartY) / activeUnitHeight; // 0〜1 を中心に上下に振れる

  // 方向に応じてセクション境界を跨いだら明示的に切り替え（ヒステリシス）
  if (scrollingDown) {
    while (rawProgress >= 1) {
      if (activeSectionIndex >= slideCount - 1) {
        rawProgress = 1;
        break;
      }
      activeSectionIndex += 1;
      syncActiveSectionOrigin();
      activeUnitHeight = getUnitHeightForIndex(activeSectionIndex);
      overshootTolerance =
        (SCROLL_BOUNDARY_MARGIN + 1) / Math.max(activeUnitHeight, 1);
      rawProgress = (scrollY - activeSectionStartY) / activeUnitHeight;
    }
  } else {
    while (rawProgress < -overshootTolerance) {
      if (activeSectionIndex <= 0) {
        rawProgress = 0;
        break;
      }
      activeSectionIndex -= 1;
      syncActiveSectionOrigin();
      activeUnitHeight = getUnitHeightForIndex(activeSectionIndex);
      overshootTolerance =
        (SCROLL_BOUNDARY_MARGIN + 1) / Math.max(activeUnitHeight, 1);
      rawProgress = (scrollY - activeSectionStartY) / activeUnitHeight;
    }
    if (rawProgress < 0) {
      rawProgress = 0;
    }
  }

  // Active section changed: only log if not immediately repeated
  if (activeSectionIndex !== currentIndex) {
    const oldIndex = currentIndex;
    const newIndex = activeSectionIndex;
    const oldSlide = slides[oldIndex] || {};
    const newSlide = slides[newIndex] || {};
    // Check for duplicate logs
    if (
      lastSectionChange.oldIndex === oldIndex &&
      lastSectionChange.newIndex === newIndex
    ) {
      // Prevent duplicate log and update from occurring
      return;
    }
    // Store last
    lastSectionChange.oldIndex = oldIndex;
    lastSectionChange.newIndex = newIndex;
    console.log(
      `[stage-gallery] Section changed: ${oldIndex} (${
        oldSlide.id || "?"
      }) -> ${newIndex} (${newSlide.id || "?"})`
    );
    currentIndex = activeSectionIndex;
    nextIndex =
      currentIndex === slideCount - 1 ? currentIndex : currentIndex + 1;
    refreshLayers();
  }

  // インデックスに変更があれば画像とインジケータを更新
  if (activeSectionIndex !== currentIndex) {
    // 画面が切り替わる時にログを出す
    const oldIndex = currentIndex;
    const newIndex = activeSectionIndex;
    const oldSlide = slides[oldIndex] || {};
    const newSlide = slides[newIndex] || {};
    console.log(
      `[stage-gallery] Section changed: ${oldIndex} (${
        oldSlide.id || "?"
      }) -> ${newIndex} (${newSlide.id || "?"})`
    );
    currentIndex = activeSectionIndex;
    nextIndex =
      currentIndex === slideCount - 1 ? currentIndex : currentIndex + 1;
    refreshLayers();
  }

  // 描画用に 0〜1 にクランプ
  const progressForRender = clamp(rawProgress, 0, 1);
  lastScrollY = scrollY;

  // フレーム描画
  renderFrame(progressForRender);
  updateNavigationDisabledStates();
  updateTailMode(scrollY);
  updateTailModeFromStageState(activeSectionIndex, progressForRender);
}

// ========================================
// ユーティリティ
// ========================================
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function quantize(value, step) {
  if (!step || step <= 0) return value;
  return Math.round(value / step) * step;
}

// ========================================
// カーブ境界用マスク生成
// ========================================
let maskCanvasCurrent, maskCanvasNext, maskCtxCurrent, maskCtxNext;
// マスクの計算結果をキャッシュして、フレーム毎の重い再計算を避ける
const maskCache = new Map();
let bandSeamPx = null;
function enforceMaskCacheLimit() {
  while (maskCache.size > MAX_MASK_CACHE_ENTRIES) {
    const oldestKey = maskCache.keys().next().value;
    if (oldestKey !== undefined) {
      maskCache.delete(oldestKey);
    } else {
      break;
    }
  }
}

function setupMaskCanvases() {
  maskCanvasCurrent = document.createElement("canvas");
  maskCanvasNext = document.createElement("canvas");
  maskCanvasCurrent.width = MASK_RESOLUTION;
  maskCanvasCurrent.height = MASK_RESOLUTION;
  maskCanvasNext.width = MASK_RESOLUTION;
  maskCanvasNext.height = MASK_RESOLUTION;
  maskCtxCurrent = maskCanvasCurrent.getContext("2d", {
    willReadFrequently: true,
  });
  maskCtxNext = maskCanvasNext.getContext("2d", {
    willReadFrequently: true,
  });

  // 画像レイヤーにマスクの表示パラメータを固定
  currentLayer.style.maskRepeat = "no-repeat";
  nextLayer.style.maskRepeat = "no-repeat";
  currentLayer.style.webkitMaskRepeat = "no-repeat";
  nextLayer.style.webkitMaskRepeat = "no-repeat";
  currentLayer.style.maskSize = "100% 100%";
  nextLayer.style.maskSize = "100% 100%";
  currentLayer.style.webkitMaskSize = "100% 100%";
  nextLayer.style.webkitMaskSize = "100% 100%";
  // Safariでアルファマスクとして扱う
  currentLayer.style.maskMode = "alpha";
  nextLayer.style.maskMode = "alpha";
}

// マスク画像を取得（キャッシュのみ。量子化は行わず連続で追従）
function getCurvedMasks(
  seamPercent,
  localProgress,
  featherPercent,
  overlapPercent
) {
  // 量子化してキー数を抑制し、生成頻度とキャッシュ増加を低減
  const qSeam = quantize(clamp(seamPercent, 0, 100), QUANT_STEP_SEAM);
  const qProg = quantize(clamp(localProgress, 0, 1), QUANT_STEP_PROGRESS);
  const qFeather = quantize(clamp(featherPercent, 0, 100), QUANT_STEP_FEATHER);
  const qOverlap = quantize(clamp(overlapPercent, 0, 50), QUANT_STEP_OVERLAP);

  const key = `${qSeam}|${qProg}|${qFeather}|${qOverlap}|${BOW_PERCENT}|${MASK_RESOLUTION}`;
  const cached = maskCache.get(key);
  if (cached) {
    // LRU: 参照されたものを末尾（新しい）に移動
    maskCache.delete(key);
    maskCache.set(key, cached);
    return cached;
  }
  const generated = drawCurvedMasks(qSeam, qProg, qFeather, qOverlap);
  maskCache.set(key, generated);
  enforceMaskCacheLimit();
  return generated;
}

function drawCurvedMasks(
  seamPercent,
  localProgress,
  featherPercent,
  overlapPercent
) {
  const w = MASK_RESOLUTION;
  const h = MASK_RESOLUTION;

  // キャンバス初期化
  maskCtxCurrent.clearRect(0, 0, w, h);
  maskCtxNext.clearRect(0, 0, w, h);

  const featherPx = (clamp(featherPercent, 0, 100) / 100) * h;
  const overlapPxMax = (clamp(overlapPercent, 0, 50) / 100) * h;
  const effectiveOverlapPx = overlapPxMax * clamp(localProgress, 0, 1);
  const baseSeamPx = (clamp(seamPercent, 0, 100) / 100) * h;
  const bowPercent = clamp(BOW_PERCENT, 0, 50);

  // ImageData を一括生成（性能重視）
  const dataCur = maskCtxCurrent.createImageData(w, h);
  const dataNext = maskCtxNext.createImageData(w, h);
  const bufCur = dataCur.data;
  const bufNext = dataNext.data;

  for (let x = 0; x < w; x++) {
    const u = w > 1 ? x / (w - 1) : 0.5; // 0〜1
    // カーブ方向反転：端で +bow、中央で 0（下向きカーブ）
    const localBowPercent = bowPercent * (4 * (u - 0.5) * (u - 0.5));
    const seamPx = (clamp(seamPercent + localBowPercent, 0, 100) / 100) * h;

    const curStart = clamp(seamPx + effectiveOverlapPx, 0, h);
    const curEnd = clamp(curStart + featherPx, 0, h);
    const nxtEnd = clamp(seamPx - effectiveOverlapPx, 0, h);
    const nxtStart = clamp(nxtEnd - featherPx, 0, h);

    for (let y = 0; y < h; y++) {
      let aCur;
      if (y <= curStart) {
        aCur = 255;
      } else if (y >= curEnd) {
        aCur = 0;
      } else {
        aCur = Math.round(
          255 * (1 - (y - curStart) / Math.max(1, curEnd - curStart))
        );
      }

      let aNext;
      if (y <= nxtStart) {
        aNext = 0;
      } else if (y >= nxtEnd) {
        aNext = 255;
      } else {
        aNext = Math.round(
          255 * ((y - nxtStart) / Math.max(1, nxtEnd - nxtStart))
        );
      }

      const idx = (y * w + x) * 4;
      // 白のアルファマスク
      bufCur[idx + 0] = 255;
      bufCur[idx + 1] = 255;
      bufCur[idx + 2] = 255;
      bufCur[idx + 3] = aCur;

      bufNext[idx + 0] = 255;
      bufNext[idx + 1] = 255;
      bufNext[idx + 2] = 255;
      bufNext[idx + 3] = aNext;
    }
  }

  maskCtxCurrent.putImageData(dataCur, 0, 0);
  maskCtxNext.putImageData(dataNext, 0, 0);

  // Data URL を返す（PNG）
  const curUrl = maskCanvasCurrent.toDataURL("image/png");
  const nxtUrl = maskCanvasNext.toDataURL("image/png");
  return { curUrl, nxtUrl };
}

// ========================================
// フレーム描画
// ========================================
function renderFrame(progress) {
  const currentSlideData = slides[currentIndex] || null;
  const upcomingSlideData = slides[nextIndex] || null;
  const rippleBoundaryActive = isRippleBoundary(
    currentSlideData,
    upcomingSlideData
  );
  const rippleDisplayActive = updateRipplePlaybackState(rippleBoundaryActive);
  setRippleBodyState(rippleDisplayActive);

  // 最終スライド（section03）では、グラデーション帯やマスク処理を行わず常時フル表示にする
  if (DISABLE_BRIDGE_SECTION03_04 && currentIndex >= slideCount - 1) {
    // マスク・クリップを解除してレイヤーをそのまま表示
    currentLayer.style.clipPath = "none";
    nextLayer.style.clipPath = "none";
    currentLayer.style.webkitClipPath = "none";
    nextLayer.style.webkitClipPath = "none";
    setLayerMask(currentLayer, MASK_FULLY_VISIBLE);
    setLayerMask(nextLayer, MASK_FULLY_VISIBLE);
    currentLayer.style.opacity = "1";
    nextLayer.style.opacity = "1";
    if (gradientBand) {
      gradientBand.style.opacity = "0";
      gradientBand.style.visibility = "hidden";
    }
    return;
  }

  // 装飾バンドはしきい値手前でフェードイン、終端手前でフェードアウトしてテレポートを不可視化
  const bandFadeInStart = Math.max(0, GRADIENT_START - BAND_FADE_RANGE);
  const bandFadeOutStart = Math.max(0, 1 - BAND_FADE_RANGE);
  let bandOpacity = 0;
  if (progress < bandFadeInStart) {
    bandOpacity = 0;
  } else if (progress < GRADIENT_START) {
    const tIn = clamp(
      (progress - bandFadeInStart) / Math.max(0.0001, BAND_FADE_RANGE),
      0,
      1
    );
    bandOpacity = easeInOutCubic(tIn);
  } else if (progress <= bandFadeOutStart) {
    bandOpacity = 1;
  } else {
    const tOut = clamp(
      (1 - progress) / Math.max(0.0001, 1 - bandFadeOutStart),
      0,
      1
    );
    bandOpacity = easeInOutCubic(tOut);
  }
  // しきい値未満：予備ブレンドで「急に出現」を防ぐ
  if (progress < GRADIENT_START) {
    // クリップは全域
    currentLayer.style.clipPath = "inset(0% 0% 0% 0%)";
    nextLayer.style.clipPath = "inset(0% 0% 0% 0%)";
    currentLayer.style.webkitClipPath = "inset(0% 0% 0% 0%)";
    nextLayer.style.webkitClipPath = "inset(0% 0% 0% 0%)";

    // しきい値直前 PRE_BLEND_RANGE の間だけ、下端でうっすらブレンドを開始
    const preStart = Math.max(0, GRADIENT_START - PRE_BLEND_RANGE);
    const preT = clamp(
      (progress - preStart) / Math.max(0.0001, PRE_BLEND_RANGE),
      0,
      1
    );

    if (preT > 0) {
      // 初動を滑らかにしつつ、下端から少しずつ持ち上げる
      const preBlendProgress = preT;
      const feather = clamp(FEATHER_PERCENT * preBlendProgress, 0, 100);
      const overlap = clamp(OVERLAP_PERCENT * preBlendProgress, 0, 50);
      const seamPre = 100 - PRE_SEAM_LIFT_PERCENT * preBlendProgress;
      const { curUrl, nxtUrl } = getCurvedMasks(
        seamPre,
        preBlendProgress,
        feather,
        overlap
      );
      currentLayer.style.maskImage = `url(${curUrl})`;
      nextLayer.style.maskImage = `url(${nxtUrl})`;
      currentLayer.style.webkitMaskImage = `url(${curUrl})`;
      nextLayer.style.webkitMaskImage = `url(${nxtUrl})`;
    } else {
      // マスク：現在のみ表示、次は非表示
      setLayerMask(currentLayer, MASK_FULLY_VISIBLE);
      setLayerMask(nextLayer, MASK_FULLY_HIDDEN);
    }

    // レイヤーは常に可視（マスクで制御）
    currentLayer.style.opacity = "1";
    nextLayer.style.opacity = "1";

    // バンド位置もシームに追従（preT=0 は 100%）
    const seamForBand = preT > 0 ? 100 - PRE_SEAM_LIFT_PERCENT * preT : 100;
    const seamPx = (seamForBand / 100) * viewportHeight;
    const smoothedPx = updateBandSeam(seamPx);
    gradientBand.style.setProperty("--seam-y-px", `${smoothedPx}px`);
    updateGradientBandVisibility(bandOpacity, rippleDisplayActive);
    return;
  }

  // しきい値以降のローカル進捗（0〜1）
  const localProgress = clamp(
    (progress - GRADIENT_START) / (1 - GRADIENT_START),
    0,
    1
  );
  // シーム（境界）位置（0% = 上端, 100% = 下端）
  // しきい値直前のシーム位置（pre区間の終端）に連続させる
  const seamStart = 100 - PRE_SEAM_LIFT_PERCENT;
  const seamPercent = seamStart * (1 - localProgress);

  // ぼかし幅（上下に等分）
  const feather = clamp(FEATHER_PERCENT, 0, 100);
  const overlap = clamp(OVERLAP_PERCENT, 0, 50);
  // カーブ境界のマスクを生成（白=表示、透明=非表示）
  const { curUrl, nxtUrl } = getCurvedMasks(
    seamPercent,
    localProgress,
    feather,
    overlap
  );

  // クリップは全面表示に戻し、マスクでブレンド
  currentLayer.style.clipPath = "inset(0% 0% 0% 0%)";
  nextLayer.style.clipPath = "inset(0% 0% 0% 0%)";
  currentLayer.style.webkitClipPath = "inset(0% 0% 0% 0%)";
  nextLayer.style.webkitClipPath = "inset(0% 0% 0% 0%)";

  currentLayer.style.maskImage = `url(${curUrl})`;
  nextLayer.style.maskImage = `url(${nxtUrl})`;
  currentLayer.style.webkitMaskImage = `url(${curUrl})`; // Safari
  nextLayer.style.webkitMaskImage = `url(${nxtUrl})`; // Safari

  // レイヤーは常に可視
  currentLayer.style.opacity = "1";
  nextLayer.style.opacity = "1";

  // グラデーション帯を境界の中央に配置（装飾）
  const seamPx = (seamPercent / 100) * viewportHeight;
  const smoothedPx = updateBandSeam(seamPx);
  gradientBand.style.setProperty("--seam-y-px", `${smoothedPx}px`);
  updateGradientBandVisibility(bandOpacity, rippleDisplayActive);
}

function isRippleBoundary(currentSlide, nextSlide) {
  if (!currentSlide || !nextSlide) {
    return false;
  }
  const currentId = currentSlide.id ? String(currentSlide.id) : "";
  const nextId = nextSlide.id ? String(nextSlide.id) : "";
  return (
    (currentId === RIPPLE_FROM_ID && nextId === RIPPLE_TO_ID) ||
    (currentId === RIPPLE_TO_ID && nextId === RIPPLE_FROM_ID)
  );
}

function updateRipplePlaybackState(eligible) {
  const stageRipple = window.stageRippleEffect || null;
  const hasRippleApi =
    stageRipple &&
    typeof stageRipple.isRipplePlaying === "function" &&
    typeof stageRipple.play === "function";
  let isPlaying = hasRippleApi ? stageRipple.isRipplePlaying() : false;

  if (!eligible || !hasRippleApi) {
    if (!eligible) {
      rippleLatchActive = false;
    }
    return isPlaying;
  }

  if (!rippleLatchActive) {
    const direction = lastScrollDirection >= 0 ? 1 : -1;
    const started = stageRipple.play(direction);
    if (started) {
      rippleLatchActive = true;
      isPlaying = true;
    } else {
      // テクスチャの読み込みなどで失敗した場合は次フレームで再試行
      rippleLatchActive = false;
    }
  }

  return isPlaying;
}

function setRippleBodyState(active) {
  if (rippleBodyState === active) {
    return;
  }
  rippleBodyState = active;
  if (document.body) {
    document.body.classList.toggle(RIPPLE_BODY_CLASS, rippleBodyState);
  }
}

function updateGradientBandVisibility(opacityValue, suppressed) {
  if (!gradientBand) {
    return;
  }
  if (suppressed) {
    gradientBand.style.opacity = "0";
    gradientBand.style.visibility = "hidden";
  } else {
    gradientBand.style.opacity = String(opacityValue);
    gradientBand.style.visibility = "";
  }
}

function setLayerMask(layer, maskValue) {
  if (!layer) {
    return;
  }
  layer.style.maskImage = maskValue;
  layer.style.webkitMaskImage = maskValue;
}

// ========================================
// リサイズ対応
// ========================================
function onResize() {
  viewportHeight = window.innerHeight;
  unitHeightPx = computeUnitHeight();
  updateScrollAreaHeight();
  bandSeamPx = null;
  syncActiveSectionOrigin();
  updateProgress();
  scrollToStageIndex(activeSectionIndex, 0);
}

// ========================================
// キーボード操作（任意）
// ========================================
function onKeyDown(e) {
  if (tailModeActive) {
    return;
  }
  const scrollAmount = viewportHeight;

  if (e.key === "ArrowDown" || e.key === " ") {
    e.preventDefault();
    scrollToStageIndex(activeSectionIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    scrollToStageIndex(activeSectionIndex - 1);
  }
}

function onWheel(event) {
  if (tailModeActive) {
    return;
  }
  if (event.ctrlKey) {
    return;
  }
  const deltaY = event.deltaY;
  if (Math.abs(deltaY) < 2) {
    return;
  }
  if (isSnapping || wheelLocked) {
    event.preventDefault();
    return;
  }
  const direction = deltaY > 0 ? 1 : -1;
  const handled = navigateDiscrete(direction);
  if (handled) {
    event.preventDefault();
  }
}

function navigateDiscrete(direction) {
  if (direction === 0) {
    return false;
  }
  const targetIndex = clamp(activeSectionIndex + direction, 0, slideCount - 1);
  if (targetIndex === activeSectionIndex) {
    return false;
  }
  return requestSnapToIndex(targetIndex);
}

function onTouchStart(event) {
  if (!event.touches || event.touches.length === 0) {
    return;
  }
  touchStartY = event.touches[0].clientY;
}

function onTouchMove(event) {
  if (tailModeActive) {
    return;
  }
  if (touchStartY === null) {
    return;
  }
  const currentY = event.touches[0].clientY;
  const delta = touchStartY - currentY;
  if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
    return;
  }
  if (isSnapping) {
    event.preventDefault();
    return;
  }
  const direction = delta > 0 ? 1 : -1;
  const handled = navigateDiscrete(direction);
  if (handled) {
    event.preventDefault();
    touchStartY = currentY;
  }
}

function onTouchEnd() {
  touchStartY = null;
}

// ========================================
// 起動
// ========================================
init();

function exposeStageGalleryAPI() {
  window.stageGallery = {
    getSlides: () => slides.slice(),
    getActiveIndex: () => activeSectionIndex,
    scrollToIndex: (index) => scrollToStageIndex(index),
    scrollToSection: (rawId) => {
      if (!rawId) return false;
      const normalized = String(rawId).replace(/^#/, "");
      if (!slideIdMap.has(normalized)) {
        return false;
      }
      return scrollToStageIndex(slideIdMap.get(normalized));
    },
  };
}

function updateBandSeam(targetPx) {
  if (!Number.isFinite(targetPx)) return 0;
  if (bandSeamPx === null) {
    bandSeamPx = targetPx;
    return bandSeamPx;
  }
  const smoothing = clamp(BAND_SMOOTHING, 0.05, 1);
  bandSeamPx += (targetPx - bandSeamPx) * smoothing;
  return bandSeamPx;
}

function getLastAnchorBoundary() {
  if (anchorElements.length > 0) {
    const lastAnchor = anchorElements[anchorElements.length - 1];
    if (lastAnchor) {
      return lastAnchor.offsetTop + lastAnchor.offsetHeight;
    }
  }
  if (scrollSpacer) {
    return scrollSpacer.offsetTop + scrollSpacer.offsetHeight;
  }
  return 0;
}

function isStageTailInView() {
  if (!stageTail) {
    return false;
  }
  const rect = stageTail.getBoundingClientRect();
  const threshold = Math.min(viewportHeight * 0.35, 280);
  return rect.top <= viewportHeight - threshold;
}

function setTailMode(active, options = {}) {
  const { skipOverlayUpdate = false } = options;
  if (!document.body) {
    tailModeActive = active;
    return;
  }
  if (active && isTailModeLockActive()) {
    active = false;
  }
  if (tailModeActive === active) {
    if (!skipOverlayUpdate) {
      updateTailOverlayState(undefined, lastTailProgressHint);
    }
    return;
  }
  tailModeActive = active;
  document.body.classList.toggle(STAGE_TAIL_CLASS, tailModeActive);
  if (!tailModeActive) {
    document.body.classList.remove("is-stage-bridging");
  } else if (tailOverlayActive) {
    document.body.classList.remove("is-stage-bridging");
  }
  if (galleryStageRoot) {
    galleryStageRoot.setAttribute(
      "aria-hidden",
      tailModeActive ? "true" : "false"
    );
  }
  if (!skipOverlayUpdate) {
    updateTailOverlayState(undefined, lastTailProgressHint);
  }
}

function setTailOverlayActive(active) {
  if (!document.body || tailOverlayActive === active) {
    tailOverlayActive = active;
    return;
  }
  const previous = tailOverlayActive;
  tailOverlayActive = active;
  document.body.classList.toggle(STAGE_TAIL_OVERLAY_CLASS, tailOverlayActive);
  if (tailOverlayActive) {
    tailModeReentryLock = null;
    setTailMode(true, { skipOverlayUpdate: true });
    alignStageTailToViewport();
  } else {
    tailModeReentryLock = Math.max(
      TAIL_OVERLAY_EXIT_THRESHOLD - 0.02,
      LAST_SLIDE_BRIDGE_START + 0.01
    );
    setTailMode(false, { skipOverlayUpdate: true });
    prepareTailBridgeReentry(lastTailProgressHint);
  }
}

function updateTailOverlayState(entry, progressHint) {
  let effectiveProgress = progressHint;
  if (
    typeof effectiveProgress !== "number" ||
    Number.isNaN(effectiveProgress)
  ) {
    effectiveProgress = lastTailProgressHint;
  } else {
    lastTailProgressHint = effectiveProgress;
  }
  const shouldOverlay = computeTailOverlayActivation(entry, effectiveProgress);
  setTailOverlayActive(shouldOverlay);
}

function isTailModeLockActive() {
  if (tailModeReentryLock === null) {
    return false;
  }
  if (
    typeof lastTailProgressHint === "number" &&
    !Number.isNaN(lastTailProgressHint) &&
    lastTailProgressHint <= tailModeReentryLock
  ) {
    tailModeReentryLock = null;
    return false;
  }
  return true;
}

function computeTailOverlayActivation(entry, progressHint) {
  if (!tailModeActive) {
    return false;
  }
  const resolvedProgress =
    typeof progressHint === "number" && !Number.isNaN(progressHint)
      ? progressHint
      : lastTailProgressHint;

  const sentinelRect =
    entry && entry.target === stageTailSentinel
      ? entry.boundingClientRect
      : stageTailSentinel
      ? stageTailSentinel.getBoundingClientRect()
      : null;
  const tailRect =
    stageTail && typeof stageTail.getBoundingClientRect === "function"
      ? stageTail.getBoundingClientRect()
      : null;

  const enterByProgress =
    typeof resolvedProgress === "number" &&
    !Number.isNaN(resolvedProgress) &&
    resolvedProgress >= TAIL_OVERLAY_ENTER_THRESHOLD;
  const enterBySentinel =
    sentinelRect && Number.isFinite(sentinelRect.top)
      ? sentinelRect.top <= 0
      : false;

  const exitByProgress =
    typeof resolvedProgress === "number" &&
    !Number.isNaN(resolvedProgress) &&
    resolvedProgress <= TAIL_OVERLAY_EXIT_THRESHOLD;
  let exitByPosition = false;
  if (tailRect && Number.isFinite(tailRect.top)) {
    const marginPx =
      viewportHeight *
      STAGE_TAIL_EXIT_MARGIN_RATIO *
      (tailOverlayActive ? 1 : 0.8);
    exitByPosition = tailRect.top >= -marginPx;
  }

  if (tailOverlayActive) {
    if (lastScrollDirection < 0 && (exitByPosition || exitByProgress)) {
      return false;
    }
    return true;
  }

  return enterByProgress || enterBySentinel;
}

function prepareTailBridgeReentry(progressHint) {
  if (slideCount === 0) {
    return;
  }
  const targetIndex = Math.max(slideCount - 1, 0);
  activeSectionIndex = targetIndex;
  currentIndex = targetIndex;
  nextIndex = targetIndex;
  const unitHeight = getUnitHeightForIndex(targetIndex);
  const baseProgress =
    typeof progressHint === "number" && !Number.isNaN(progressHint)
      ? progressHint
      : 0.98;
  const desiredProgress = clamp(
    baseProgress,
    LAST_SLIDE_BRIDGE_START + 0.02,
    0.995
  );
  activeSectionStartY = window.scrollY - unitHeight * desiredProgress;
  lastScrollY = window.scrollY;
  refreshLayers();
  setStageBridgeProgress(desiredProgress);
  lastTailProgressHint = desiredProgress;
}

function alignStageTailToViewport() {
  if (!stageTail) {
    return;
  }
  const rect = stageTail.getBoundingClientRect();
  if (!rect || !Number.isFinite(rect.top)) {
    return;
  }
  const offset = rect.top;
  if (Math.abs(offset) < 1) {
    return;
  }
  window.scrollTo({
    top: window.scrollY + offset,
    behavior: "auto",
  });
}

function updateTailMode(scrollPosition = window.scrollY || 0) {
  if (tailObserver) {
    // IntersectionObserver が担当
    return;
  }
  const boundaryFromAnchors = getLastAnchorBoundary();
  const boundaryFromTail = stageTail ? stageTail.offsetTop : 0;
  const stageBoundary = Math.max(boundaryFromAnchors, boundaryFromTail);
  const viewportBottom = scrollPosition + viewportHeight;
  const crossedBoundary =
    viewportBottom >= stageBoundary - 1 ||
    scrollPosition >= Math.max(stageBoundary - viewportHeight * 0.6, 0);
  const tailVisible = isStageTailInView();
  const sentinelPastTop =
    stageTailSentinel && stageTailSentinel.getBoundingClientRect
      ? stageTailSentinel.getBoundingClientRect().top <= 0
      : false;
  const nearLastSlide = activeSectionIndex >= slideCount - 1;
  setTailMode(
    tailVisible || crossedBoundary || sentinelPastTop || nearLastSlide
  );
  updateTailOverlayState();
}

function updateTailModeFromStageState(index, progress) {
  lastTailProgressHint = progress;
  if (slideCount === 0) {
    setTailMode(false);
    updateLastSlideBridge(0);
    updateTailOverlayState(undefined, progress);
    return;
  }
  if (
    tailOverlayActive &&
    progress < Math.max(TAIL_MODE_THRESHOLD * 0.85, LAST_SLIDE_BRIDGE_START)
  ) {
    updateTailOverlayState(undefined, progress);
  }
  if (index >= slideCount - 1) {
    const reachedTail = progress >= TAIL_MODE_THRESHOLD;
    setTailMode(reachedTail);
    updateLastSlideBridge(reachedTail ? 1 : progress);
    updateTailOverlayState(undefined, progress);
  } else {
    setTailMode(false);
    updateLastSlideBridge(0);
    updateTailOverlayState(undefined, progress);
  }
}

function setupTailObserver() {
  if (!SUPPORTS_INTERSECTION_OBSERVER || !stageTailSentinel) {
    return;
  }
  tailObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const rect = entry.boundingClientRect;
        const pastTop = rect ? rect.top <= 0 : false;
        const shouldTail = entry.isIntersecting || pastTop;
        setTailMode(shouldTail);
        updateTailOverlayState(entry, lastTailProgressHint);
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: [0.1, 1],
    }
  );
  tailObserver.observe(stageTailSentinel);
}

function updateLastSlideBridge(progress) {
  if (!LAST_SLIDE_ID) {
    setStageBridgeProgress(0);
    return;
  }
  const bridgeEnd = Math.max(
    TAIL_MODE_THRESHOLD,
    LAST_SLIDE_BRIDGE_START + 0.05
  );
  const normalized = clamp(
    (progress - LAST_SLIDE_BRIDGE_START) /
      Math.max(0.0001, bridgeEnd - LAST_SLIDE_BRIDGE_START),
    0,
    1
  );
  setStageBridgeProgress(tailOverlayActive ? 1 : normalized);
}

function prepareTailBridgeLayer() {
  if (!tailBridgeLayer) {
    return;
  }
  const finalSlide = slides[slideCount - 1] || null;
  const tailPrimarySection = stageTail
    ? stageTail.querySelector(".section04")
    : null;

  const panels = [];

  if (finalSlide && finalSlide.html) {
    const stagePanel = document.createElement("div");
    stagePanel.className = "stage-bridge-panel stage-bridge-panel--stage";
    stagePanel.innerHTML = finalSlide.html;
    stripIds(stagePanel);
    panels.push(stagePanel);
  }

  if (tailPrimarySection) {
    const tailPanel = document.createElement("div");
    tailPanel.className = "stage-bridge-panel stage-bridge-panel--tail";
    const clone = tailPrimarySection.cloneNode(true);
    stripIds(clone);
    clone.setAttribute("aria-hidden", "true");
    tailPanel.appendChild(clone);
    panels.push(tailPanel);
  }

  if (panels.length === 0) {
    tailBridgeLayer.innerHTML = "";
    return;
  }

  const scroller = document.createElement("div");
  scroller.className = "stage-bridge-scroller";
  scroller.setAttribute("aria-hidden", "true");
  scroller.style.setProperty(
    "--stage-bridge-panel-count",
    String(Math.max(panels.length, 1))
  );
  panels.forEach((panel) => scroller.appendChild(panel));

  tailBridgeLayer.innerHTML = "";
  tailBridgeLayer.appendChild(scroller);

  if (typeof window.activateDynamicComponents === "function") {
    window.activateDynamicComponents(scroller);
  }
}

function setStageBridgeProgress(portion) {
  if (!rootElement) {
    return;
  }
  if (DISABLE_BRIDGE_SECTION03_04) {
    // ブリッジ演出を全て無効化（常にステージ表示、ブリッジレイヤー非表示）
    rootElement.style.setProperty("--stage-bridge-tail", "0.0000");
    rootElement.style.setProperty("--stage-bridge-stage", "1.0000");
    if (document.body) {
      document.body.classList.remove("is-stage-bridging");
    }
    if (tailBridgeLayer) {
      tailBridgeLayer.setAttribute("data-bridge-active", "false");
    }
    return;
  }
  const value = clamp(portion, 0, 1);
  rootElement.style.setProperty("--stage-bridge-tail", value.toFixed(4));
  rootElement.style.setProperty("--stage-bridge-stage", (1 - value).toFixed(4));
  if (document.body) {
    const shouldBridge = value > 0 && !tailOverlayActive;
    document.body.classList.toggle("is-stage-bridging", shouldBridge);
  }
  if (tailBridgeLayer) {
    tailBridgeLayer.setAttribute(
      "data-bridge-active",
      value > 0 && !tailModeActive ? "true" : "false"
    );
  }
}

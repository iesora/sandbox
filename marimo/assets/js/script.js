// スクロール
$(window).on("load", function () {
  const speed = 500;
  const headerH = $(".l-header").height();
  const hash = window.location.hash;

  if (!hash == "" || !hash == undefined) {
    let target = $(hash);
    target = target.length ? target : $("[name=" + hash.slice(1) + "]");
    let position = target.offset().top - headerH;
    if (target.length) {
      $("html,body").stop().animate({ scrollTop: position }, "swing");
    }
  }

  $("[data-pagetop]").on("click", function (e) {
    $("html, body").animate({ scrollTop: 0 }, speed, "swing");
    e.preventDefault();
  });

  $("[data-scroll-link]").on("click", function (e) {
    const href = $(this).attr("href");
    const isHashLink = href && href.startsWith("#");

    if (
      isHashLink &&
      window.stageGallery &&
      typeof window.stageGallery.scrollToSection === "function"
    ) {
      const handled = window.stageGallery.scrollToSection(
        href.replace("#", "")
      );
      if (handled) {
        e.preventDefault();
        return;
      }
    }

    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    const target = $(href);
    if (!target.length) {
      return;
    }

    const position = target.offset().top - headerH;
    $("html, body").animate({ scrollTop: position }, speed, "swing");
    e.preventDefault();
  });

  // アニメーションの発火
  if ($(".js-animation").length) {
    scrollAnimation();
  }
  function scrollAnimation() {
    $(window).scroll(function () {
      $(".js-animation").each(function () {
        let position = $(this).offset().top,
          scroll = $(window).scrollTop(),
          windowHeight = $(window).height();
        if (scroll > position - windowHeight + 100) {
          $(this).addClass("is-show");
        }
      });
    });
  }
  $(window).trigger("scroll");

  // IE終了表示
  var url = $(location).attr("href");
  $(".for-ie-redirect").attr("href", "microsoft-edge:" + url);
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1) {
    $(".for-ie").show();
  }
  $(".js-ieClose").click(function () {
    $(".for-ie").hide();
  });
});

// MVの背景画像をランダムで表示し、ステージ再描画にも対応
(function () {
  const candidates = ["mv_img01", "mv_img02"];
  const state = {
    key: candidates[Math.floor(Math.random() * candidates.length)],
    currentMode: null,
    lastTarget: null,
  };

  function applyBackground(target) {
    if (!target) return;
    const isSp = window.innerWidth <= 768;
    const mode = isSp ? "sp" : "pc";

    if (state.currentMode === mode && state.lastTarget === target) {
      return;
    }

    const imagePath = isSp
      ? `assets/img/${state.key}_sp.jpg`
      : `assets/img/${state.key}.jpg`;

    target.style.backgroundImage = `url(${imagePath})`;
    state.currentMode = mode;
    state.lastTarget = target;
  }

  window.applyMvBackground = function (target) {
    state.currentMode = null;
    applyBackground(target);
  };

  document.addEventListener("DOMContentLoaded", function () {
    applyBackground(document.getElementById("mainv"));
    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        state.currentMode = null;
        applyBackground(document.getElementById("mainv"));
      }, 60);
    });
  });
})();

// モーダルビデオ
// スマホ用ハンバーガー
document.addEventListener("DOMContentLoaded", function () {
  const navbtn = document.querySelector(".l-header_btn");
  const navmenu = document.querySelector(".l-header_nav");

  if (navbtn && navmenu) {
    // 開閉ボタン処理
    navbtn.addEventListener("click", function () {
      navbtn.classList.toggle("is-active");
      navmenu.classList.toggle("is-open");
    });

    // navmenu内のリンククリック時にメニューを閉じる
    const navLinks = navmenu.querySelectorAll("a[data-scroll-link]");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navbtn.classList.remove("is-active");
        navmenu.classList.remove("is-open");
      });
    });
  }
});

(function () {
  function bindModalVideo(root) {
    if (!window.jQuery || !$.fn.modalVideo) {
      return;
    }
    const $context = root ? $(root) : $(document);
    const $targets = root ? $context.find(".js-modal-btn") : $(".js-modal-btn");
    $targets.each(function () {
      if (this.dataset.modalVideoBound === "true") {
        return;
      }
      $(this).modalVideo();
      this.dataset.modalVideoBound = "true";
    });
  }

  window.activateDynamicComponents = function (root) {
    bindModalVideo(root || document);
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.activateDynamicComponents(document);
  });
})();

// スマホから閲覧時に高さを100%に合わせる
function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVh();
// リサイズ時にも更新
window.addEventListener("resize", setVh);

const StageRippleStub = {
  onStageFrame() {},
  play() {
    return false;
  },
  getVisualProgress() {
    return null;
  },
  isPlaying() {
    return false;
  },
};

(function () {
  if (typeof window === "undefined") {
    return;
  }

  const HAS_WEBGL = !!window.WebGLRenderingContext;
  const HAS_THREE = typeof window.THREE !== "undefined";
  const RIPPLE_DURATION = 1200;
  const RIPPLE_BOUNDARY = { from: "section01", to: "section02" };
  const TEXTURE_SOURCES = {
    section01: {
      desktop: "./assets/img/section01_bg.jpg",
      mobile: "./assets/img/section01_bg_sp.jpg",
    },
    section02: {
      desktop: "./assets/img/section02_bg.jpg",
      mobile: "./assets/img/section02_bg_sp.jpg",
    },
  };

  function prefersReducedMotion() {
    if (typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function normalizeId(raw) {
    if (!raw) {
      return "";
    }
    return String(raw).replace(/^#/, "");
  }

  class StageRippleEffect {
    constructor() {
      this.canvas = document.getElementById("stageRippleCanvas");
      this.wrapper =
        document.getElementById("stageRippleLayer") ||
        document.querySelector(".stage-ripple");
      this.boundary = { ...RIPPLE_BOUNDARY };

      this.enabled =
        HAS_WEBGL &&
        HAS_THREE &&
        !prefersReducedMotion() &&
        !!this.canvas &&
        !!this.wrapper;

      if (!this.enabled) {
        return;
      }

      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.uniforms = {
        tDiffuse1: { value: null },
        tDiffuse2: { value: null },
        progress: { value: 0 },
        rippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
        warpIntensity: { value: 0.15 },
      };

      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        transparent: true,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
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
            vec2 dir = vUv - rippleCenter;
            float dist = length(dir);
            vec2 dirNorm = dist > 0.0 ? normalize(dir) : vec2(0.0);

            float wavePos = progress * 1.5;
            float waveDist = abs(dist - wavePos);
            float waveInfluence = smoothstep(0.3, 0.0, waveDist);
            float warpStrength =
              waveInfluence * warpIntensity * sin(progress * 3.14159);

            vec2 warpedUv = vUv + dirNorm * warpStrength;

            vec4 color1 = texture2D(tDiffuse1, warpedUv);
            vec4 color2 = texture2D(tDiffuse2, warpedUv);

            float transition = smoothstep(wavePos - 0.1, wavePos + 0.1, dist);
            gl_FragColor = mix(color2, color1, transition);
          }
        `,
      });

      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
      this.scene.add(this.mesh);

      this.loader = new THREE.TextureLoader();
      this.textureMap = new Map();
      this.visualProgress = null;
      this.isReady = false;
      this.isPlaying = false;
      this.transitionStart = null;
      this.transitionDuration = RIPPLE_DURATION;
      this.currentVariant = null;

      this.boundAnimate = this.animate.bind(this);
      this.resizeHandler = this.handleResize.bind(this);
      this.breakpoint = window.matchMedia("(max-width: 768px)");
      if (this.breakpoint) {
        if (typeof this.breakpoint.addEventListener === "function") {
          this.breakpoint.addEventListener(
            "change",
            this.handleBreakpointChange.bind(this)
          );
        } else if (typeof this.breakpoint.addListener === "function") {
          this.breakpoint.addListener(this.handleBreakpointChange.bind(this));
        }
        this.currentVariant = this.breakpoint.matches ? "mobile" : "desktop";
      } else {
        this.currentVariant = window.innerWidth <= 768 ? "mobile" : "desktop";
      }

      window.addEventListener("resize", this.resizeHandler);

      this.loadTexturesForVariant(this.currentVariant).finally(() => {
        this.boundAnimate();
      });
    }

    loadTexturesForVariant(variant) {
      if (!variant) {
        return Promise.resolve();
      }
      this.isReady = false;
      const entries = Object.entries(TEXTURE_SOURCES);
      const tasks = entries.map(([id, paths]) =>
        this.createTexturePromise(paths[variant]).then((texture) => ({
          id,
          texture,
        }))
      );
      return Promise.all(tasks)
        .then((results) => {
          this.textureMap.clear();
          results.forEach(({ id, texture }) => {
            this.textureMap.set(id, texture);
          });
          this.isReady = true;
        })
        .catch(() => {
          this.isReady = false;
          this.textureMap.clear();
          this.enabled = false;
          this.setActive(false);
        });
    }

    createTexturePromise(path) {
      return new Promise((resolve, reject) => {
        if (!path) {
          reject(new Error("Texture path missing"));
          return;
        }
        this.loader.load(
          path,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            if ("colorSpace" in texture && THREE.SRGBColorSpace) {
              texture.colorSpace = THREE.SRGBColorSpace;
            }
            resolve(texture);
          },
          undefined,
          (error) => reject(error || new Error("failed to load texture"))
        );
      });
    }

    handleResize() {
      if (!this.enabled || !this.renderer) {
        return;
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleBreakpointChange(event) {
      if (!this.enabled) {
        return;
      }
      const nextVariant = event && event.matches ? "mobile" : "desktop";
      if (nextVariant === this.currentVariant) {
        return;
      }
      this.currentVariant = nextVariant;
      this.loadTexturesForVariant(this.currentVariant);
    }

    setActive(active) {
      if (!this.wrapper) {
        return;
      }
      this.wrapper.classList.toggle("is-active", !!active);
    }

    getTextureForSlide(id) {
      if (!id) {
        return null;
      }
      return this.textureMap.get(id) || null;
    }

    playTransition(fromId, toId) {
      if (!this.isReady || this.isPlaying) {
        return false;
      }
      const fromTexture = this.getTextureForSlide(fromId);
      const toTexture = this.getTextureForSlide(toId);
      if (!fromTexture || !toTexture) {
        return false;
      }
      this.uniforms.tDiffuse1.value = fromTexture;
      this.uniforms.tDiffuse2.value = toTexture;
      this.transitionStart =
        typeof performance !== "undefined" && performance.now
          ? performance.now()
          : Date.now();
      this.isPlaying = true;
      this.visualProgress = 0;
      this.setActive(true);
      return true;
    }

    play(direction = 1) {
      const forward = direction >= 0;
      const fromId = forward ? this.boundary.from : this.boundary.to;
      const toId = forward ? this.boundary.to : this.boundary.from;
      return this.playTransition(fromId, toId);
    }

    animate() {
      if (!this.enabled) {
        return;
      }
      this.frameId = window.requestAnimationFrame(this.boundAnimate);
      if (!this.isReady) {
        return;
      }

      if (this.isPlaying && this.transitionStart !== null) {
        const now =
          typeof performance !== "undefined" && performance.now
            ? performance.now()
            : Date.now();
        const elapsed = (now - this.transitionStart) / this.transitionDuration;
        const clamped = clamp(elapsed, 0, 1);
        const eased = easeInOutCubic(clamped);
        this.uniforms.progress.value = eased;
        this.visualProgress = eased;
        if (elapsed >= 1) {
          this.isPlaying = false;
          this.visualProgress = null;
          this.transitionStart = null;
          this.uniforms.progress.value = 0;
          if (this.uniforms.tDiffuse2.value) {
            this.uniforms.tDiffuse1.value = this.uniforms.tDiffuse2.value;
          }
          this.setActive(false);
        }
      } else {
        this.visualProgress = null;
        this.uniforms.progress.value = 0;
      }

      this.renderer.render(this.scene, this.camera);
    }

    getVisualProgress() {
      if (!this.enabled) {
        return null;
      }
      return typeof this.visualProgress === "number"
        ? this.visualProgress
        : null;
    }

    isRipplePlaying() {
      return !!this.isPlaying;
    }
  }

  if (!HAS_WEBGL || !HAS_THREE || prefersReducedMotion()) {
    window.stageRippleEffect = StageRippleStub;
    return;
  }

  window.stageRippleEffect = new StageRippleEffect();
})();

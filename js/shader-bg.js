/* ═══════════════════════════════════════════════════════════════════════════
   SIKANI — Three.js Organic Shader Background (shader.se inspired)
   Flowing gold noise mesh with mouse interaction + scroll parallax
   Loaded on all pages for consistent awwwards-tier feel
   ═══════════════════════════════════════════════════════════════════════════ */

(function initShaderBackground() {
  if (typeof THREE === 'undefined') return;
  const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Create or find the container
  let container = document.getElementById('shaderBg');
  if (!container) {
    container = document.createElement('div');
    container.id = 'shaderBg';
    container.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity 1.5s ease;';
    document.body.prepend(container);
  }

  // ── Vertex Shader ──────────────────────────────────────────────────────
  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform float uScrollY;
    uniform vec2 uMouse;

    // Simplex-style noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;

      vec3 pos = position;

      // Mouse influence — ripple from cursor
      float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, distance(uv, uMouse));

      // Multi-octave noise displacement
      float noise1 = snoise(vec3(pos.x * 1.5, pos.y * 1.5, uTime * 0.15)) * 0.3;
      float noise2 = snoise(vec3(pos.x * 3.0, pos.y * 3.0, uTime * 0.25)) * 0.1;
      float noise3 = snoise(vec3(pos.x * 0.5 + uScrollY * 0.001, pos.y * 0.5, uTime * 0.08)) * 0.15;

      float elevation = noise1 + noise2 + noise3 + mouseInfluence * 0.15;
      pos.z += elevation;

      vElevation = elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // ── Fragment Shader ────────────────────────────────────────────────────
  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform float uOpacity;

    void main() {
      // Gold palette based on elevation
      vec3 colorLow  = vec3(0.04, 0.03, 0.01);   // near-black
      vec3 colorMid  = vec3(0.25, 0.18, 0.05);    // dark gold
      vec3 colorHigh = vec3(0.83, 0.69, 0.22);    // bright gold #D4AF37

      float t = smoothstep(-0.3, 0.4, vElevation);
      vec3 color = mix(colorLow, colorMid, t);
      color = mix(color, colorHigh, smoothstep(0.25, 0.5, vElevation));

      // Subtle shimmer
      float shimmer = sin(vUv.x * 40.0 + uTime * 2.0) * sin(vUv.y * 40.0 - uTime * 1.5) * 0.03;
      color += shimmer;

      // Edge fade (vignette)
      float vignette = smoothstep(0.0, 0.4, vUv.x) * smoothstep(1.0, 0.6, vUv.x)
                     * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

      gl_FragColor = vec4(color, vignette * uOpacity * 0.35);
    }
  `;

  // ── Three.js Setup ─────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 2.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
  container.appendChild(renderer.domElement);

  // ── Geometry — subdivided plane ────────────────────────────────────────
  const segments = isMobile ? 48 : 96;
  const geometry = new THREE.PlaneGeometry(4, 3, segments, segments);

  const uniforms = {
    uTime: { value: 0 },
    uScrollY: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uOpacity: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ── Mouse tracking (smooth spring) ─────────────────────────────────────
  const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

  document.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX / window.innerWidth;
    mouse.targetY = 1.0 - e.clientY / window.innerHeight;
  });

  // ── Scroll tracking ───────────────────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ── Resize ────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Render Loop ────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let isVisible = true;

  // Fade in
  setTimeout(() => { container.style.opacity = '1'; }, 300);

  function animate() {
    if (!isVisible) { requestAnimationFrame(animate); return; }

    const elapsed = clock.getElapsedTime();
    uniforms.uTime.value = elapsed;
    uniforms.uScrollY.value = scrollY;

    // Smooth mouse spring
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Fade in opacity over first 2 seconds
    uniforms.uOpacity.value = Math.min(elapsed * 0.5, 1.0);

    // Subtle camera sway with scroll
    camera.position.y = -scrollY * 0.0003;
    camera.rotation.x = scrollY * 0.00005;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // Visibility gating for performance
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  animate();
})();

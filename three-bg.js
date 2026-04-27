import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("three-canvas");

if (!canvas || prefersReducedMotion) {
  if (canvas) canvas.style.display = "none";
} else {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  const group = new THREE.Group();
  scene.add(group);

  const lightA = new THREE.PointLight(0x5f9bff, 1.2, 40);
  lightA.position.set(-6, 4, 8);
  scene.add(lightA);

  const lightB = new THREE.PointLight(0xff4d8d, 1.1, 40);
  lightB.position.set(6, -4, 8);
  scene.add(lightB);

  const amb = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(amb);

  const knotGeo = new THREE.TorusKnotGeometry(1.25, 0.42, 220, 18);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x9fb9ff,
    roughness: 0.35,
    metalness: 0.75,
    emissive: 0x0b1a3d,
    emissiveIntensity: 0.55,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  knot.position.set(2.6, 1.2, -1.2);
  group.add(knot);

  // Star/particle field
  const isSmallScreen = window.innerWidth < 900;
  const starCount = isSmallScreen ? 360 : 560;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    starPos[i3] = (Math.random() - 0.5) * 26;
    starPos[i3 + 1] = (Math.random() - 0.5) * 18;
    starPos[i3 + 2] = -Math.random() * 18;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    transparent: true,
    opacity: 0.55,
  });
  const stars = new THREE.Points(starGeo, starMat);
  group.add(stars);

  // Constellation lines (dynamic)
  const maxConnections = isSmallScreen ? 140 : 220;
  const linePos = new Float32Array(maxConnections * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x8ec5ff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // Slow drifting for stars to make the constellation feel alive
  const drift = new Float32Array(starCount * 2);
  for (let i = 0; i < starCount; i += 1) {
    drift[i * 2] = (Math.random() - 0.5) * 0.12;
    drift[i * 2 + 1] = (Math.random() - 0.5) * 0.12;
  }

  let targetX = 0;
  let targetY = 0;

  window.addEventListener(
    "mousemove",
    (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = nx * 0.35;
      targetY = -ny * 0.25;
    },
    { passive: true }
  );

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });

  const clock = new THREE.Clock();
  let frameTick = 0;
  function animate() {
    const t = clock.getElapsedTime();

    // Update star positions a bit (wrap around)
    const posAttr = starGeo.getAttribute("position");
    const a = posAttr.array;
    for (let i = 0; i < starCount; i += 1) {
      const i3 = i * 3;
      a[i3] += drift[i * 2] * 0.015;
      a[i3 + 1] += drift[i * 2 + 1] * 0.015;
      if (a[i3] > 13) a[i3] = -13;
      if (a[i3] < -13) a[i3] = 13;
      if (a[i3 + 1] > 9) a[i3 + 1] = -9;
      if (a[i3 + 1] < -9) a[i3 + 1] = 9;
    }
    posAttr.needsUpdate = true;

    // Build constellation connections every 2 frames for performance
    frameTick += 1;
    if (frameTick % 2 === 0) {
      const threshold = isSmallScreen ? 1.72 : 1.82;
      let c = 0;
      for (let i = 0; i < starCount && c < maxConnections; i += 1) {
        const i3 = i * 3;
        const ax = a[i3];
        const ay = a[i3 + 1];
        const az = a[i3 + 2];
        for (let j = i + 1; j < starCount && c < maxConnections; j += 1) {
          const j3 = j * 3;
          const bx = a[j3];
          const by = a[j3 + 1];
          const bz = a[j3 + 2];
          const dx = ax - bx;
          const dy = ay - by;
          const dz = az - bz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < threshold) {
            const k = c * 2 * 3;
            linePos[k] = ax;
            linePos[k + 1] = ay;
            linePos[k + 2] = az;
            linePos[k + 3] = bx;
            linePos[k + 4] = by;
            linePos[k + 5] = bz;
            c += 1;
          }
        }
      }
      lineGeo.setDrawRange(0, c * 2);
      lineGeo.attributes.position.needsUpdate = true;
    }

    group.rotation.y += 0.0018;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetY, 0.05);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, t * 0.08 + targetX, 0.03);

    knot.rotation.x = t * 0.25;
    knot.rotation.y = t * 0.33;
    knot.rotation.z = t * 0.18;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  // Keep colors in sync with theme toggle
  const observer = new MutationObserver(() => {
    const isLight = document.body.classList.contains("theme-light");
    starMat.opacity = isLight ? 0.28 : 0.55;
    lineMat.opacity = isLight ? 0.12 : 0.22;
    knotMat.emissiveIntensity = isLight ? 0.25 : 0.55;
    knotMat.color.setHex(isLight ? 0x2f6de0 : 0x9fb9ff);
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}


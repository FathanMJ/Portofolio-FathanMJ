import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("three-canvas");

if (!canvas || prefersReducedMotion) {
  if (canvas) canvas.style.display = "none";
} else {
  const isSmallScreen = window.innerWidth < 900;
  const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const quality = isSmallScreen || isCoarsePointer ? "low" : "high";

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: quality === "high",
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.35 : 1.05));
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

  const starCount = quality === "high" ? 240 : 140;
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

  const frontStarCount = quality === "high" ? 60 : 34;
  const frontGeo = new THREE.BufferGeometry();
  const frontPos = new Float32Array(frontStarCount * 3);
  const frontDrift = new Float32Array(frontStarCount * 2);
  for (let i = 0; i < frontStarCount; i += 1) {
    const i3 = i * 3;
    frontPos[i3] = (Math.random() - 0.5) * 20;
    frontPos[i3 + 1] = (Math.random() - 0.5) * 14;
    const rz = Math.random();
    const zPow = rz * rz * (0.5 + Math.random() * 0.5);
    frontPos[i3 + 2] = -0.65 - zPow * 4.2;
    frontDrift[i * 2] = (Math.random() - 0.5) * 0.16;
    frontDrift[i * 2 + 1] = (Math.random() - 0.5) * 0.16;
  }
  frontGeo.setAttribute("position", new THREE.BufferAttribute(frontPos, 3));
  const frontStarMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.072,
    transparent: true,
    opacity: 0.94,
    sizeAttenuation: true,
  });
  const frontStars = new THREE.Points(frontGeo, frontStarMat);
  group.add(frontStars);

  const maxFrontConnections = quality === "high" ? 55 : 28;
  const frontLinePos = new Float32Array(maxFrontConnections * 2 * 3);
  const frontLineGeo = new THREE.BufferGeometry();
  frontLineGeo.setAttribute("position", new THREE.BufferAttribute(frontLinePos, 3));
  frontLineGeo.setDrawRange(0, 0);
  const frontLineMat = new THREE.LineBasicMaterial({
    color: 0xb8d9ff,
    transparent: true,
    opacity: 0.52,
    blending: THREE.AdditiveBlending,
  });
  const frontLines = new THREE.LineSegments(frontLineGeo, frontLineMat);
  group.add(frontLines);

  const maxConnections = quality === "high" ? 90 : 40;
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

  const drift = new Float32Array(starCount * 2);
  for (let i = 0; i < starCount; i += 1) {
    drift[i * 2] = (Math.random() - 0.5) * (quality === "high" ? 0.12 : 0.09);
    drift[i * 2 + 1] = (Math.random() - 0.5) * (quality === "high" ? 0.12 : 0.09);
  }

  let targetX = 0;
  let targetY = 0;

  let lastMouseTs = 0;
  window.addEventListener(
    "mousemove",
    (e) => {
      const now = performance.now();
      if (now - lastMouseTs < 40) return;
      lastMouseTs = now;
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
  let rafId = 0;
  let isRunning = true;

  function setRunning(next) {
    if (isRunning === next) return;
    isRunning = next;
    if (isRunning) {
      clock.start();
      rafId = requestAnimationFrame(animate);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
    }
  }

  document.addEventListener("visibilitychange", () => {
    setRunning(!document.hidden);
  });

  function animate() {
    if (!isRunning) return;
    const t = clock.getElapsedTime();

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

    const fa = frontGeo.getAttribute("position");
    const fArr = fa.array;
    for (let i = 0; i < frontStarCount; i += 1) {
      const i3 = i * 3;
      fArr[i3] += frontDrift[i * 2] * 0.018;
      fArr[i3 + 1] += frontDrift[i * 2 + 1] * 0.018;
      if (fArr[i3] > 10) fArr[i3] = -10;
      if (fArr[i3] < -10) fArr[i3] = 10;
      if (fArr[i3 + 1] > 7) fArr[i3 + 1] = -7;
      if (fArr[i3 + 1] < -7) fArr[i3 + 1] = 7;
    }
    fa.needsUpdate = true;

    frameTick += 1;
    const stride = quality === "high" ? 5 : 8;
    if (frameTick % stride === 0) {
      const threshold = quality === "high" ? 1.7 : 1.62;
      const thresholdSq = threshold * threshold;
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
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < thresholdSq) {
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

      const threshFront = quality === "high" ? 2.05 : 1.9;
      const threshFrontSq = threshFront * threshFront;
      let cf = 0;
      for (let i = 0; i < frontStarCount && cf < maxFrontConnections; i += 1) {
        const i3 = i * 3;
        const fx = fArr[i3];
        const fy = fArr[i3 + 1];
        const fz = fArr[i3 + 2];
        for (let j = i + 1; j < frontStarCount && cf < maxFrontConnections; j += 1) {
          const j3 = j * 3;
          const dx = fArr[j3] - fx;
          const dy = fArr[j3 + 1] - fy;
          const dz = fArr[j3 + 2] - fz;
          const distFSq = dx * dx + dy * dy + dz * dz;
          if (distFSq < threshFrontSq) {
            const k = cf * 2 * 3;
            frontLinePos[k] = fx;
            frontLinePos[k + 1] = fy;
            frontLinePos[k + 2] = fz;
            frontLinePos[k + 3] = fArr[j3];
            frontLinePos[k + 4] = fArr[j3 + 1];
            frontLinePos[k + 5] = fArr[j3 + 2];
            cf += 1;
          }
        }
      }
      frontLineGeo.setDrawRange(0, cf * 2);
      frontLineGeo.attributes.position.needsUpdate = true;
    }

    group.rotation.y += quality === "high" ? 0.0014 : 0.001;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetY, 0.05);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, t * 0.08 + targetX, 0.03);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  const observer = new MutationObserver(() => {
    const isLight = document.body.classList.contains("theme-light");
    starMat.opacity = isLight ? 0.28 : 0.55;
    frontStarMat.opacity = isLight ? 0.45 : 0.94;
    lineMat.opacity = isLight ? 0.12 : 0.22;
    frontLineMat.opacity = isLight ? 0.28 : 0.52;
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}


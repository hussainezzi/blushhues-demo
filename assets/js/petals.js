/* Blush Hues — 3D petal field (three.js) */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("petals");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reduce) {
  const hero = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  /* soft petal texture, drawn once on a canvas */
  function petalTexture() {
    const s = 256;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d");
    ctx.translate(s / 2, s / 2);
    const g = ctx.createRadialGradient(0, -10, 10, 0, 0, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,246,243,0.98)");
    g.addColorStop(1, "rgba(255,235,230,0.85)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.bezierCurveTo(85, -95, 95, 10, 0, 105);
    ctx.bezierCurveTo(-95, 10, -85, -95, 0, -100);
    ctx.fill();
    // gentle centre crease
    ctx.strokeStyle = "rgba(224,170,165,0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -84);
    ctx.quadraticCurveTo(12, 10, 0, 90);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  const tex = petalTexture();
  const palette = [0xfff7f4, 0xfde9e4, 0xf9d9d3, 0xf3c9c2, 0xfffdfb];
  const isMobile = window.innerWidth < 760;
  const COUNT = isMobile ? 26 : 52;

  const petals = [];
  /* a gently curved petal — real shading instead of a flat card */
  const geo = new THREE.PlaneGeometry(0.7, 0.95, 10, 12);
  {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = x / 0.35;           // -1..1 across
      const v = y / 0.475;          // -1..1 along
      const cup = (1 - u * u) * 0.16;          // gentle cup
      const curl = Math.pow(Math.abs(v), 2) * 0.18 * Math.sign(v); // tip bend
      pos.setZ(i, cup - curl + Math.sin(u * Math.PI) * 0.03);
    }
    geo.computeVertexNormals();
  }

  for (let i = 0; i < COUNT; i++) {
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: palette[i % palette.length],
      transparent: true,
      opacity: i % 5 === 0 ? 0.95 : 0.55 + Math.random() * 0.3,
      roughness: 0.72,
      metalness: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 6 - 1
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData = {
      speed: 0.22 + Math.random() * 0.45,
      sway: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      scale: 0.55 + Math.random() * 0.85,
      tilt: Math.random() * Math.PI * 2,
    };
    mesh.scale.setScalar(mesh.userData.scale);
    scene.add(mesh);
    petals.push(mesh);
  }

  /* bokeh glow points */
  const glowGeo = new THREE.BufferGeometry();
  const glowCount = isMobile ? 26 : 54;
  const pos = new Float32Array(glowCount * 3);
  for (let i = 0; i < glowCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = -3 - Math.random() * 6;
  }
  glowGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  function glowTexture() {
    const s = 128;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,245,240,1)");
    g.addColorStop(0.35, "rgba(246,212,203,0.55)");
    g.addColorStop(1, "rgba(246,212,203,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }
  const glowMat = new THREE.PointsMaterial({
    size: 1.15,
    map: glowTexture(),
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Points(glowGeo, glowMat);
  scene.add(glow);

  scene.add(new THREE.AmbientLight(0xfff3ee, 1.25));
  const key = new THREE.DirectionalLight(0xfff0e8, 2.4);
  key.position.set(4, 6, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc9bd, 1.4);
  rim.position.set(-6, -3, 3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(0, -4, 6);
  scene.add(fill);

  /* sizing */
  let w = 0, h = 0;
  function resize() {
    const rect = hero.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* pointer parallax */
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let visible = true;
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
  });

  const clock = new THREE.Clock();
  let elapsed = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    camera.position.x = mx * 0.9;
    camera.position.y = -my * 0.6;
    camera.lookAt(0, 0, 0);

    for (const p of petals) {
      const d = p.userData;
      p.position.y -= d.speed * dt;
      p.position.x += Math.sin(elapsed * 0.6 + d.phase) * d.sway * dt * 0.35;
      p.rotation.z += d.spin * dt;
      p.rotation.x += d.spin * dt * 0.4;
      p.rotation.y = Math.sin(elapsed * 0.35 + d.tilt) * 0.9;
      if (p.position.y < -8) {
        p.position.y = 8;
        p.position.x = (Math.random() - 0.5) * 18;
      }
    }
    glow.rotation.z += dt * 0.02;
    renderer.render(scene, camera);
  }
  animate();
} else if (canvas) {
  canvas.style.display = "none";
}

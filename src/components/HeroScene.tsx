"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { onIntro } from "./Preloader";

const photoVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Grain duotone of the booth photo: pointer lens, beat breathing, RGB split.
const photoFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uBeat;
  uniform float uHover;
  uniform float uReveal;
  varying vec2 vUv;

  vec2 cover(vec2 uv) {
    float rs = uRes.x / uRes.y;
    float ri = uImg.x / uImg.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + vec2(0.5, 0.6);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 d = (vUv - uMouse) * aspect;
    float dist = length(d);
    float lens = smoothstep(0.42, 0.0, dist) * uHover;

    vec2 uv = vUv;
    uv += vec2(sin(uv.y * 9.0 + uTime * 0.6), cos(uv.x * 7.0 - uTime * 0.5)) * 0.0035;
    uv -= (d / max(dist, 1e-4)) * lens * 0.03 / aspect;

    vec2 c = cover(uv);
    c = (c - vec2(0.5, 0.6)) * (1.0 - 0.014 * uBeat - 0.06 * (1.0 - uReveal)) + vec2(0.5, 0.6);

    float shift = 0.0015 + 0.006 * uBeat + 0.012 * lens;
    vec3 col = vec3(
      texture2D(uTex, c + vec2(shift, 0.0)).r,
      texture2D(uTex, c).g,
      texture2D(uTex, c - vec2(shift, 0.0)).b
    );

    float l = dot(col, vec3(0.299, 0.587, 0.114));
    l = clamp(pow(l, 0.8) * 1.3, 0.0, 1.0);

    vec3 c0 = vec3(0.02, 0.03, 0.035);
    vec3 c1 = vec3(0.02, 0.17, 0.22);
    vec3 c2 = vec3(0.22, 0.74, 0.76);
    vec3 c3 = vec3(0.95, 0.93, 0.88);
    vec3 duo = mix(c0, c1, smoothstep(0.0, 0.22, l));
    duo = mix(duo, c2, smoothstep(0.2, 0.62, l));
    duo = mix(duo, c3, smoothstep(0.62, 1.0, l));

    duo += vec3(0.95, 0.76, 0.19) * lens * 0.35 * l;

    float n = hash(vUv * uRes + fract(uTime * 24.0) * 97.0);
    duo += (n - 0.5) * 0.11;

    float v = smoothstep(1.2, 0.3, length((vUv - 0.5) * vec2(1.15, 1.0)));
    duo *= mix(0.5, 1.0, v);
    duo = mix(duo, c0, smoothstep(0.32, 0.0, vUv.y) * 0.9);
    duo *= uReveal;

    gl_FragColor = vec4(duo, 1.0);
  }
`;

function triangleShape(side: number) {
  const h = (side * Math.sqrt(3)) / 2;
  const s = new THREE.Shape();
  s.moveTo(0, (2 * h) / 3);
  s.lineTo(side / 2, -h / 3);
  s.lineTo(-side / 2, -h / 3);
  s.closePath();
  return s;
}

function buildMark(env: THREE.Texture) {
  const group = new THREE.Group();

  const outer = triangleShape(2.6);
  const hole = triangleShape(2.6 - 0.62);
  outer.holes.push(new THREE.Path(hole.getPoints()));
  const frameGeo = new THREE.ExtrudeGeometry(outer, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.035,
    bevelSegments: 4,
    curveSegments: 1,
  });
  frameGeo.center();

  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xf3c331,
    metalness: 1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 0.55,
    iridescenceIOR: 1.5,
    envMap: env,
    envMapIntensity: 1.35,
  });
  const frame = new THREE.Mesh(frameGeo, gold);
  group.add(frame);

  // Eye: almond lens sitting in the lower half of the triangle.
  const eye = new THREE.Shape();
  const w = 0.62;
  const k = 0.42;
  eye.moveTo(-w, 0);
  eye.quadraticCurveTo(0, k, w, 0);
  eye.quadraticCurveTo(0, -k, -w, 0);
  const eyeGeo = new THREE.ExtrudeGeometry(eye, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.04,
    bevelSegments: 5,
    curveSegments: 24,
  });
  eyeGeo.center();
  const teal = new THREE.MeshPhysicalMaterial({
    color: 0x3ec6c9,
    metalness: 0.9,
    roughness: 0.22,
    clearcoat: 1,
    iridescence: 0.8,
    iridescenceIOR: 1.8,
    envMap: env,
    envMapIntensity: 1.2,
  });
  const eyeMesh = new THREE.Mesh(eyeGeo, teal);
  eyeMesh.position.set(0, -0.42, 0.04);
  group.add(eyeMesh);

  const pupilGeo = new THREE.SphereGeometry(0.13, 32, 16);
  const pupilMat = new THREE.MeshPhysicalMaterial({
    color: 0x050607,
    metalness: 0.2,
    roughness: 0.08,
    clearcoat: 1,
    envMap: env,
    envMapIntensity: 0.9,
  });
  const pupil = new THREE.Mesh(pupilGeo, pupilMat);
  pupil.scale.z = 0.55;
  pupil.position.set(0, -0.42, 0.16);
  group.add(pupil);

  return {
    group,
    pupil,
    dispose() {
      [frameGeo, eyeGeo, pupilGeo].forEach((g) => g.dispose());
      [gold, teal, pupilMat].forEach((m) => m.dispose());
    },
  };
}

// Shared, mutable tempo: the hero's tap-tempo button writes it, the frame loop reads it.
export type Tempo = { bpm: number; tapAt: number };

type Props = { image: string; tempo: React.RefObject<Tempo>; onReady?: () => void; onFail?: () => void };

export function HeroScene({ image, tempo, onReady, onFail }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      onFail?.();
      return;
    }

    const small = window.matchMedia("(max-width: 768px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 900ms ease";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 8);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envRT = pmrem.fromScene(room, 0.04);
    room.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });

    const uniforms = {
      uTex: { value: null as THREE.Texture | null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uTime: { value: 0 },
      uBeat: { value: 0 },
      uHover: { value: 0 },
      uReveal: { value: 0 },
    };
    const photoGeo = new THREE.PlaneGeometry(2, 2);
    const photoMat = new THREE.ShaderMaterial({
      vertexShader: photoVert,
      fragmentShader: photoFrag,
      uniforms,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const photo = new THREE.Mesh(photoGeo, photoMat);
    photo.frustumCulled = false;
    photo.renderOrder = -1;
    scene.add(photo);

    const mark = buildMark(envRT.texture);
    scene.add(mark.group);

    const rimTeal = new THREE.PointLight(0x3ec6c9, 18, 12);
    rimTeal.position.set(-3, 1.5, 3);
    const rimGold = new THREE.PointLight(0xf3c331, 14, 12);
    rimGold.position.set(3, -1, 3);
    scene.add(rimTeal, rimGold);

    const intro = { scale: 0.55, spin: -Math.PI * 1.2, reveal: 0 };
    let texture: THREE.Texture | null = null;
    let disposed = false;

    new THREE.TextureLoader().load(
      image,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        texture = tex;
        uniforms.uTex.value = tex;
        const img = tex.image as HTMLImageElement;
        uniforms.uImg.value.set(img.width, img.height);
        resize();
        renderer.render(scene, camera);
        canvas.style.opacity = "1";
        onReady?.();
      },
      undefined,
      () => onFail?.(),
    );

    // Pointer: store targets only, smooth inside the frame loop.
    const target = { x: 0.5, y: 0.55, hover: 0 };
    const nx = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      target.hover = e.pointerType === "mouse" ? 1 : 0.6;
    };
    const onLeave = () => {
      target.hover = 0;
      target.x = 0.5;
      target.y = 0.55;
    };
    const area = host.parentElement ?? host;
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    let markScale = 1;
    function resize() {
      const { clientWidth: w, clientHeight: h } = host!;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uRes.value.set(w, h);
      // Float the eye above the headline: smaller and higher on wide screens.
      const portrait = camera.aspect < 0.8;
      markScale = portrait ? Math.min(1, camera.aspect / 0.6) * 0.6 : Math.min(1, camera.aspect / 1.3) * 0.6;
      mark.group.position.y = portrait ? 1.1 : 1.3;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const beatDot = area.querySelector<HTMLElement>("[data-beat-dot]");
    const timer = new THREE.Timer();
    let phase = 0;
    let lastTap = tempo.current.tapAt;
    let raf = 0;
    let running = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      timer.update(now);
      const t = timer.getElapsed();
      // Advance the beat at the current tempo; a tap snaps the downbeat to "now".
      const { bpm, tapAt } = tempo.current;
      if (tapAt !== lastTap) {
        lastTap = tapAt;
        phase = 0;
      } else {
        phase = (phase + (timer.getDelta() * bpm) / 60) % 1;
      }
      const beat = Math.exp(-phase * 6);

      const m = uniforms.uMouse.value;
      m.x += (target.x - m.x) * 0.08;
      m.y += (target.y - m.y) * 0.08;
      uniforms.uHover.value += (target.hover - uniforms.uHover.value) * 0.05;
      uniforms.uTime.value = t;
      uniforms.uBeat.value = beat;
      uniforms.uReveal.value = intro.reveal;

      nx.x += ((m.x - 0.5) * 2 - nx.x) * 0.1;
      nx.y += ((m.y - 0.55) * 2 - nx.y) * 0.1;

      const g = mark.group;
      g.rotation.y = intro.spin + Math.sin(t * 0.4) * 0.22 + nx.x * 0.45;
      g.rotation.x = Math.sin(t * 0.3) * 0.06 - nx.y * 0.3;
      g.rotation.z = Math.sin(t * 0.25) * 0.03;
      g.position.x = nx.x * 0.12;
      const s = markScale * intro.scale * (1 + beat * 0.022);
      g.scale.setScalar(s);
      mark.pupil.position.x = nx.x * 0.3;
      mark.pupil.position.y = -0.42 + nx.y * 0.08;

      rimTeal.intensity = 14 + beat * 14;

      if (beatDot) beatDot.style.transform = `scale(${1 + beat * 0.9})`;

      renderer.render(scene, camera);
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !document.hidden) start();
      else stop();
    });
    io.observe(host);
    const onVis = () => (document.hidden || !inView ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      canvas.style.opacity = "0";
      onFail?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const offIntro = onIntro(() => {
      gsap.to(intro, { reveal: 1, duration: 1.6, ease: "power2.out" });
      gsap.to(intro, { scale: 1, spin: 0, duration: 2.2, ease: "expo.out" });
    });

    start();

    return () => {
      disposed = true;
      stop();
      offIntro();
      gsap.killTweensOf(intro);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      timer.dispose();
      mark.dispose();
      photoGeo.dispose();
      photoMat.dispose();
      texture?.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [image, tempo, onReady, onFail]);

  return <div ref={hostRef} className="absolute inset-0" />;
}

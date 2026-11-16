import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { GeoAnchor } from '../types/quiz';

export type GlobeMode = 'idle' | 'question' | 'synthesis' | 'receipt';

interface AtlasGlobeProps {
  mode: GlobeMode;
  focusGeo?: GeoAnchor;
  secondaryGeo?: GeoAnchor;
  visitedGeos?: GeoAnchor[];
  streakMilestoneTrigger?: number;
  heartLossTrigger?: number;
}

const GLOBE_RADIUS = 1.55;
const AXIAL_TILT_RAD = (23.4 * Math.PI) / 180;
const SLATE_WIRE = 0xffffff;
const INK_PIN = 0xffffff;
const GREEN_ACCENT = 0x39ff88;
const RED_ACCENT = 0xff4d6d;

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function createPinGroup(color: number, withRing: boolean): THREE.Group {
  const group = new THREE.Group();

  const dotGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const dotMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.78,
  });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  group.add(dot);

  if (withRing) {
    const ringGeo = new THREE.RingGeometry(0.075, 0.11, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);
  }

  return group;
}

function orientPinOnSurface(pin: THREE.Group, pos: THREE.Vector3): void {
  pin.position.copy(pos);
  const normal = pos.clone().normalize();
  pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
}

function createGreatCircleArc(a: GeoAnchor, b: GeoAnchor, radius: number): THREE.Line {
  const start = latLngToVec3(a.lat, a.lng, radius).normalize();
  const end = latLngToVec3(b.lat, b.lng, radius).normalize();
  const segments = 40;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const interp = new THREE.Vector3().lerpVectors(start, end, t).normalize();
    const arcLift = Math.sin(Math.PI * t) * 0.24;
    points.push(interp.multiplyScalar(radius + 0.03 + arcLift));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: GREEN_ACCENT,
    transparent: true,
    opacity: 0.65,
  });
  return new THREE.Line(geometry, material);
}

function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

export function AtlasGlobe({
  mode,
  focusGeo,
  secondaryGeo,
  visitedGeos = [],
  streakMilestoneTrigger = 0,
  heartLossTrigger = 0,
}: AtlasGlobeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    mode,
    focusGeo,
    secondaryGeo,
    visitedGeos,
    reducedMotion: false,
    slerpStartQuat: new THREE.Quaternion(),
    slerpTargetQuat: new THREE.Quaternion(),
    slerpProgress: 1,
    streakPulseRemaining: 0,
    heartJitterRemaining: 0,
    needsMarkerRebuild: true,
  });

  // Sync reactive props into mutable ref for the animation loop
  useEffect(() => {
    const s = stateRef.current;
    s.mode = mode;
    s.focusGeo = focusGeo;
    s.secondaryGeo = secondaryGeo;
    s.visitedGeos = visitedGeos;
    s.needsMarkerRebuild = true;

    if ((mode === 'question' || mode === 'synthesis') && focusGeo) {
      const targetVec = latLngToVec3(focusGeo.lat, focusGeo.lng, 1).normalize();
      const cameraFront = new THREE.Vector3(0, 0.14, 1).normalize();
      s.slerpTargetQuat.setFromUnitVectors(targetVec, cameraFront);
      s.slerpProgress = s.reducedMotion ? 1 : 0;
    }
  }, [mode, focusGeo, secondaryGeo, visitedGeos]);

  useEffect(() => {
    if (streakMilestoneTrigger > 0 && !stateRef.current.reducedMotion) {
      stateRef.current.streakPulseRemaining = 0.6;
    }
  }, [streakMilestoneTrigger]);

  useEffect(() => {
    if (heartLossTrigger > 0 && !stateRef.current.reducedMotion) {
      stateRef.current.heartJitterRemaining = 0.25;
    }
  }, [heartLossTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      motionQuery.removeEventListener('change', handleMotionChange);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      50,
    );
    camera.position.set(0, 0.15, 5.4);

    // Outer astrolabe carrier
    const astrolabeGroup = new THREE.Group();
    astrolabeGroup.position.set(0, 0.18, 0);
    scene.add(astrolabeGroup);

    // Single subtle equator ring (reacts to streak green pulse & heart-loss red jitter)
    const equatorGeo = new THREE.TorusGeometry(GLOBE_RADIUS + 0.42, 0.008, 8, 84);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: SLATE_WIRE,
      transparent: true,
      opacity: 0.22,
    });
    const equatorRing = new THREE.Mesh(equatorGeo, equatorMat);
    equatorRing.rotation.x = Math.PI / 2 - AXIAL_TILT_RAD;
    astrolabeGroup.add(equatorRing);

    // Rotating globe core
    const globeGroup = new THREE.Group();
    astrolabeGroup.add(globeGroup);

    const icoGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 2);
    const wireGeo = new THREE.WireframeGeometry(icoGeo);
    icoGeo.dispose();
    const wireMat = new THREE.LineBasicMaterial({
      color: SLATE_WIRE,
      transparent: true,
      opacity: 0.22,
    });
    const wireSphere = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(wireSphere);

    // Dynamic markers group (pins + Q7 great-circle arc)
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);

    const rebuildMarkers = () => {
      while (markersGroup.children.length > 0) {
        const child = markersGroup.children[0];
        markersGroup.remove(child);
        disposeObjectTree(child);
      }

      const s = stateRef.current;
      if (s.mode === 'question' && s.focusGeo) {
        const pin = createPinGroup(INK_PIN, true);
        orientPinOnSurface(pin, latLngToVec3(s.focusGeo.lat, s.focusGeo.lng, GLOBE_RADIUS + 0.02));
        markersGroup.add(pin);
      } else if (s.mode === 'synthesis' && s.focusGeo) {
        const pinA = createPinGroup(INK_PIN, true);
        orientPinOnSurface(pinA, latLngToVec3(s.focusGeo.lat, s.focusGeo.lng, GLOBE_RADIUS + 0.02));
        markersGroup.add(pinA);

        if (s.secondaryGeo) {
          const pinB = createPinGroup(GREEN_ACCENT, true);
          orientPinOnSurface(
            pinB,
            latLngToVec3(s.secondaryGeo.lat, s.secondaryGeo.lng, GLOBE_RADIUS + 0.02),
          );
          markersGroup.add(pinB);
          markersGroup.add(createGreatCircleArc(s.focusGeo, s.secondaryGeo, GLOBE_RADIUS));
        }
      } else if (s.mode === 'receipt' && s.visitedGeos.length > 0) {
        s.visitedGeos.forEach((geo, idx) => {
          const color = idx === s.visitedGeos.length - 1 ? GREEN_ACCENT : INK_PIN;
          const pin = createPinGroup(color, idx === s.visitedGeos.length - 1);
          orientPinOnSurface(pin, latLngToVec3(geo.lat, geo.lng, GLOBE_RADIUS + 0.02));
          markersGroup.add(pin);
        });
      }
      s.needsMarkerRebuild = false;
    };

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    let lastTime = performance.now();
    const baseRingColor = new THREE.Color(SLATE_WIRE);
    const greenColor = new THREE.Color(GREEN_ACCENT);
    const redColor = new THREE.Color(RED_ACCENT);

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const s = stateRef.current;
      if (s.needsMarkerRebuild) {
        rebuildMarkers();
      }

      if (s.reducedMotion) {
        if ((s.mode === 'question' || s.mode === 'synthesis') && s.focusGeo) {
          globeGroup.quaternion.copy(s.slerpTargetQuat);
        }
        equatorMat.color.copy(baseRingColor);
        equatorMat.opacity = 0.18;
        astrolabeGroup.position.x = 0;
      } else {
        if (s.mode === 'idle') {
          globeGroup.rotation.y += dt * 0.14;
          globeGroup.rotation.x = Math.sin(now * 0.0003) * 0.08;
        } else if (s.mode === 'receipt') {
          globeGroup.rotation.y += dt * 0.22;
        } else if (s.mode === 'question' || s.mode === 'synthesis') {
          if (s.slerpProgress === 0) {
            s.slerpStartQuat.copy(globeGroup.quaternion);
          }
          if (s.slerpProgress < 1) {
            s.slerpProgress = Math.min(1, s.slerpProgress + dt / 0.8);
            // Smooth cubic ease-out for 800ms damped SLERP
            const eased = 1 - Math.pow(1 - s.slerpProgress, 3);
            globeGroup.quaternion.slerpQuaternions(s.slerpStartQuat, s.slerpTargetQuat, eased);
          }
        }

        // Streak milestone 600ms green pulse along equator ring
        if (s.streakPulseRemaining > 0) {
          s.streakPulseRemaining = Math.max(0, s.streakPulseRemaining - dt);
          const p = Math.sin((s.streakPulseRemaining / 0.6) * Math.PI);
          equatorMat.color.copy(baseRingColor).lerp(greenColor, p);
          equatorMat.opacity = 0.22 + p * 0.45;
          equatorRing.scale.setScalar(1 + p * 0.035);
        } else {
          equatorMat.color.copy(baseRingColor);
          equatorMat.opacity = 0.22;
          equatorRing.scale.setScalar(1);
        }

        // Heart loss 250ms red jitter
        if (s.heartJitterRemaining > 0) {
          s.heartJitterRemaining = Math.max(0, s.heartJitterRemaining - dt);
          const intensity = s.heartJitterRemaining / 0.25;
          astrolabeGroup.position.x = Math.sin(now * 0.09) * 0.06 * intensity;
          equatorMat.color.copy(redColor);
          equatorMat.opacity = 0.22 + 0.4 * intensity;
        } else {
          astrolabeGroup.position.x = 0;
        }
      }

      renderer?.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      disposeObjectTree(scene);
      renderer?.dispose();
      if (renderer?.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 42%, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.88) 65%, rgba(0, 0, 0, 0.98) 100%)',
        }}
      />
    </>
  );
}

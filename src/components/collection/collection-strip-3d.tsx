"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useTransitionNav } from "@/components/transition/page-transition";

/* A floating product strip rendered in WebGL. The products drift sideways on a
 * gentle arc, bob, curve harder and tilt with scroll velocity, and pop on
 * hover. The <canvas> is set to mix-blend:multiply so the white photo grounds
 * blend into the paper page (the pieces float, no boxes) — exactly the look of
 * the CSS strip, but now physical. Click a piece to open it. */

const STRIP_H = 2.0; // world height the camera frames
const GAP = 0.55;

interface PlaneDef {
  tex: THREE.Texture;
  href?: string;
  w: number;
  baseX: number;
}

/* Shared drag state between the DOM pointer handlers (on the wrapper) and the
 * WebGL frame loop. `deltaX` is unconsumed pixels of drag; `vel` is the fling
 * momentum (world units/sec); `moved` marks a real drag so a tap-through click
 * doesn't accidentally open a product. */
interface DragState {
  active: boolean;
  startX: number;
  lastX: number;
  deltaX: number;
  vel: number;
  moved: boolean;
}

function Strip({
  images,
  hrefs,
  reverse,
  speed,
  drag,
}: {
  images: string[];
  hrefs: (string | undefined)[];
  reverse: boolean;
  speed: number;
  drag: React.MutableRefObject<DragState>;
}) {
  const textures = useLoader(THREE.TextureLoader, images);
  const router = useRouter();
  const nav = useTransitionNav();
  const meshes = React.useRef<(THREE.Mesh | null)[]>([]);
  const hovered = React.useRef<number | null>(null);
  const offset = React.useRef(0);
  const lastScroll = React.useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const vel = React.useRef(0);

  const { planes, total } = React.useMemo(() => {
    let x = 0;
    const out: PlaneDef[] = textures.map((t, i) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      const img = t.image as { width: number; height: number } | undefined;
      const aspect = img && img.height ? img.width / img.height : 1;
      const w = STRIP_H * 0.82 * aspect;
      const def: PlaneDef = { tex: t, href: hrefs[i], w, baseX: x + w / 2 };
      x += w + GAP;
      return def;
    });
    return { planes: out, total: x };
  }, [textures, hrefs]);

  // release GPU textures and evict the loader cache when the strip unmounts
  // (the canvas unmounts whenever it drifts far offscreen), and never leave a
  // stuck pointer cursor behind
  React.useEffect(() => {
    return () => {
      textures.forEach((t) => t.dispose());
      useLoader.clear(THREE.TextureLoader, images);
      document.body.style.cursor = "";
    };
  }, [textures, images]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    // scroll velocity → extra curve + tilt
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    const sv = y - lastScroll.current;
    lastScroll.current = y;
    vel.current += (Math.max(-60, Math.min(60, sv)) - vel.current) * 0.12;
    const v = vel.current;

    // manual drag (finger / mouse) moves the band; a fling carries momentum.
    const worldPerPx = state.size.width > 0 ? state.viewport.width / state.size.width : 0.008;
    if (drag.current.deltaX !== 0) {
      const move = drag.current.deltaX * worldPerPx;
      offset.current -= move;
      drag.current.vel = move / d;
      drag.current.deltaX = 0;
    }
    if (!drag.current.active) {
      offset.current += d * speed * (reverse ? -1 : 1); // steady auto-drift
      offset.current -= drag.current.vel * d; // fling momentum after release
      drag.current.vel *= Math.exp(-d * 3); // ease the fling out
      if (Math.abs(drag.current.vel) < 0.0015) drag.current.vel = 0;
    }
    const half = total / 2;
    const arc = 0.05 + Math.min(0.06, Math.abs(v) * 0.0016);

    for (let i = 0; i < planes.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      // wrap into a centred, looping band
      const px = ((planes[i].baseX - offset.current) % total + total) % total - half;
      m.position.x = px;
      m.position.z = -arc * px * px;
      m.position.y = Math.sin(performance.now() * 0.001 + i * 1.3) * 0.05;
      m.rotation.y = -px * 0.1;
      m.rotation.z = v * 0.0016;
      const target = hovered.current === i ? 1.13 : 1;
      const s = THREE.MathUtils.damp(m.scale.x, target, 8, d);
      m.scale.setScalar(s);
    }
  });

  const onClick = (href?: string) => {
    if (!href) return;
    if (nav) nav.navigate(href);
    else router.push(href);
  };

  return (
    <group>
      {planes.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          position={[p.baseX, 0, 0]}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            hovered.current = i;
            document.body.style.cursor = p.href ? "pointer" : "default";
          }}
          onPointerOut={() => {
            if (hovered.current === i) hovered.current = null;
            document.body.style.cursor = "";
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (drag.current.moved) return; // this was a drag, not a tap
            onClick(p.href);
          }}
        >
          <planeGeometry args={[p.w, STRIP_H * 0.82, 1, 1]} />
          <meshBasicMaterial map={p.tex} toneMapped={false} transparent />
        </mesh>
      ))}
    </group>
  );
}

export function CollectionStrip3D({
  images,
  hrefs,
  reverse = false,
  speed = 0.6,
}: {
  images: string[];
  hrefs: (string | undefined)[];
  reverse?: boolean;
  speed?: number;
}) {
  const [hydrated, setHydrated] = React.useState(false);
  const [near, setNear] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<DragState>({ active: false, startX: 0, lastX: 0, deltaX: 0, vel: 0, moved: false });

  // Drag to scroll the strip (finger on mobile, mouse on desktop). Listeners go
  // on window during the drag so it keeps tracking outside the canvas and the
  // WebGL raycaster still gets its own hover/click events (no pointer capture).
  const onPointerDown = (e: React.PointerEvent) => {
    const dr = drag.current;
    dr.active = true;
    dr.moved = false;
    dr.startX = e.clientX;
    dr.lastX = e.clientX;
    dr.vel = 0;
    const move = (ev: PointerEvent) => {
      if (!dr.active) return;
      dr.deltaX += ev.clientX - dr.lastX;
      dr.lastX = ev.clientX;
      if (Math.abs(ev.clientX - dr.startX) > 6) dr.moved = true;
    };
    const up = () => {
      dr.active = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  React.useEffect(() => setHydrated(true), []);
  // two rings around the viewport: `near` (600px) mounts/unmounts the whole
  // canvas so at most ~3 WebGL contexts exist at once; `visible` (200px) gates
  // the render loop. Unmount is delayed 300ms so scroll jitter doesn't thrash.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let unmountTimer = 0;
    const ioNear = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.clearTimeout(unmountTimer);
          setNear(true);
        } else {
          window.clearTimeout(unmountTimer);
          unmountTimer = window.setTimeout(() => setNear(false), 300);
        }
      },
      { rootMargin: "600px" },
    );
    const ioVisible = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    ioNear.observe(el);
    ioVisible.observe(el);
    return () => {
      window.clearTimeout(unmountTimer);
      ioNear.disconnect();
      ioVisible.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      className="h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
    >
      {hydrated && near && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          orthographic={false}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 5], fov: 26 }}
        >
          <React.Suspense fallback={null}>
            <Strip images={images} hrefs={hrefs} reverse={reverse} speed={speed} drag={drag} />
          </React.Suspense>
        </Canvas>
      )}
    </div>
  );
}

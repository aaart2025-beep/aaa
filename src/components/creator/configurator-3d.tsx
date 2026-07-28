"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html, useGLTF } from "@react-three/drei";
import { Tape, HandNote } from "@/components/paper/annotations";
import { baseOf, type Design } from "@/lib/creator/config";
import { shoeModelOf } from "@/lib/creator/shoes";
import { cn } from "@/lib/utils";
import { Shoe } from "./config-shoe";
import { Garment, REG } from "./config-garment";

/* Real-time WebGL configurator — in-house style, for every garment. Parts
 * recolour live from the design's zones, take a body pattern, are dressed in a
 * PBR fabric, branded with the movable/sizable AAA mark, and lit in a studio
 * you can orbit/zoom/spin. Cloth garments auto-normalise so each frames itself;
 * click a part to select its zone.
 *
 * One WebGL context for the whole session: garment switches swap the scene
 * graph while CameraRig reframes, and the render loop only runs while the
 * canvas is actually on screen. */

interface ControlsLike {
  target: THREE.Vector3;
  update: () => void;
}

function CameraRig({
  cam,
  controls,
}: {
  cam: { position: [number, number, number]; fov: number };
  controls: React.RefObject<ControlsLike | null>;
}) {
  const camera = useThree((s) => s.camera);
  React.useEffect(() => {
    camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      persp.fov = cam.fov;
      persp.updateProjectionMatrix();
    }
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
  }, [camera, cam, controls]);
  return null;
}

function Loader() {
  return (
    <Html center>
      <span className="font-script whitespace-nowrap text-[20px] text-ink/70">building in 3D…</span>
    </Html>
  );
}

const WARM_DELAY_MS = 3000; // fallback when requestIdleCallback is unavailable

export function Configurator3D({
  design,
  onSelectZone,
  onSelectPart,
  className,
}: {
  design: Design;
  onSelectZone: (z: number) => void;
  onSelectPart: (m: string) => void;
  className?: string;
}) {
  const def = baseOf(design.base);
  const isSneaker = design.base === "sneaker";
  const shoe = shoeModelOf(design.shoeModel);
  const cfg = REG[design.base] ?? REG.sneaker;
  const camera = isSneaker ? shoe.camera : cfg.camera;
  const dist = camera.position[2];
  const controlsRef = React.useRef<ControlsLike | null>(null);

  // render only while on screen and the tab is visible
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = React.useState(true);
  const [tabVisible, setTabVisible] = React.useState(true);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // load the active garment now; warm the rest when the browser is idle
  const activeUrl = isSneaker ? shoe.url : cfg.url;
  React.useEffect(() => {
    useGLTF.preload(activeUrl);
  }, [activeUrl]);
  React.useEffect(() => {
    const warm = () => {
      [REG.sneaker.url, REG.tee.url, REG.cap.url, REG.hoodie.url, shoeModelOf("jordan").url].forEach((u) =>
        useGLTF.preload(u),
      );
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 8000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, WARM_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative bg-paper p-3 shadow-paper sm:p-5">
      <Tape className="-left-3 -top-2.5 h-5 w-16 -rotate-[20deg]" />
      <Tape className="-right-3 -top-2.5 h-5 w-16 rotate-[20deg]" />

      <div
        ref={wrapRef}
        className={cn(
          "relative w-full overflow-hidden border border-ink/15 bg-gradient-to-b from-[#f5f0e4] to-[#e1d7c0]",
          className ?? "aspect-[4/3]",
        )}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={camera}
          frameloop={onScreen && tabVisible ? "always" : "never"}
        >
          <CameraRig cam={camera} controls={controlsRef} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 7, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />

          <React.Suspense fallback={<Loader />}>
            {isSneaker ? (
              <Shoe design={design} onSelectPart={onSelectPart} />
            ) : (
              <Garment base={design.base} design={design} onSelectZone={onSelectZone} />
            )}
            <Environment resolution={256}>
              <group rotation={[-Math.PI / 3, 0, 0]}>
                <Lightformer intensity={2.2} position={[0, 5, -9]} scale={[10, 10, 1]} />
                <Lightformer intensity={1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[18, 2, 1]} />
                <Lightformer intensity={1} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[18, 2, 1]} />
                <Lightformer intensity={1.1} position={[0, 1, 5]} rotation={[Math.PI / 2, 0, 0]} scale={[18, 3, 1]} color="#fff6e8" />
              </group>
            </Environment>
          </React.Suspense>

          <OrbitControls
            // @ts-expect-error drei's controls instance satisfies ControlsLike
            ref={controlsRef}
            makeDefault
            enablePan={false}
            minDistance={dist * 0.6}
            maxDistance={dist * 2.4}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Canvas>

        <span className="font-typewriter pointer-events-none absolute left-2 top-2 bg-paper/80 px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-ink/70">
          drag to rotate · scroll to zoom · click a part
        </span>
      </div>

      <p className="font-typewriter mt-2.5 flex items-baseline justify-between text-[9px] uppercase tracking-[0.18em] text-ink/70">
        <span>Live 3D · real-time</span>
        <span>your custom {def.label}</span>
      </p>
      <HandNote rot={-2} className="mt-1 self-end text-[14px]">
        spin it — it&apos;s the real thing
      </HandNote>
    </div>
  );
}

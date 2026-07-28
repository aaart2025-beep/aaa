"use client";

import * as React from "react";
import * as THREE from "three";
import { ContactShadows, Decal, useGLTF } from "@react-three/drei";
import type { BaseKey, Design } from "@/lib/creator/config";
import { TARGET, fabricPBR, useFabricNormal, useLogoTexture, usePatternTexture } from "./config-textures";
import { SurfaceLogo } from "./config-shoe";

/* Cloth garment renderers. Clones are disposed on unmount; the shared GLTF
 * cache is never mutated. */

interface LogoSpot {
  xRange: number;
  yMin: number;
  yMax: number;
  depth: number;
  w: number;
}
export interface GarmentCfg {
  url: string;
  camera: { position: [number, number, number]; fov: number };
  rotation: [number, number, number];
  /** Y-rotation (deg) baked in so the garment's front faces the camera (+Z) */
  spin?: number;
  /** non-skinned models bake transforms for a conforming decal; skinned models
   *  render via <primitive> (correct pose) with a near-surface logo plane */
  baked?: boolean;
  zoneOf: (mat: string) => number | null;
  logo?: LogoSpot;
  stripColorMap?: boolean;
}

const SNEAKER_MAT: Record<string, number> = { mesh: 0, caps: 1, band: 1, stripes: 2, patch: 2, laces: 3, sole: 4 };

export const REG: Record<string, GarmentCfg> = {
  sneaker: {
    url: "/models/shoe.glb",
    camera: { position: [2.0, 0.95, 2.4], fov: 30 },
    rotation: [0, 0, 0],
    zoneOf: (n) => (n in SNEAKER_MAT ? SNEAKER_MAT[n] : null),
  },
  tee: {
    url: "/models/tee.glb",
    camera: { position: [0, 0.15, 3.0], fov: 30 },
    rotation: [0, 0, 0],
    baked: false,
    zoneOf: (n) => (/sleeve/i.test(n) ? 1 : 0),
    stripColorMap: true,
  },
  cap: {
    url: "/models/cap.glb",
    camera: { position: [0, 0.35, 2.9], fov: 30 },
    rotation: [0, 0, 0],
    baked: false,
    zoneOf: (n) => (/blinn/i.test(n) ? 3 : 0),
    stripColorMap: true,
  },
  hoodie: {
    url: "/models/hoodie.glb",
    camera: { position: [0, 0.1, 3.0], fov: 30 },
    rotation: [0, 0, 0],
    baked: true,
    zoneOf: () => 0,
    stripColorMap: true,
  },
};

type TriShader = { uniforms: Record<string, { value: unknown }> };
type TriUserData = { triShader?: TriShader; patTex?: unknown; patScale?: number };

/** World-space triplanar pattern sampling, patched into a standard material.
 *  Shared by both garment paths so the shader string lives in one place. */
function applyTriplanar(mat: THREE.MeshStandardMaterial, patternTex: THREE.Texture, patScale: number): void {
  const ud = mat.userData as TriUserData;
  mat.color.set("#ffffff");
  mat.map = null;
  ud.patTex = patternTex;
  ud.patScale = patScale;
  if (ud.triShader) {
    ud.triShader.uniforms.uPattern.value = patternTex;
    ud.triShader.uniforms.uPatScale.value = patScale;
    return;
  }
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uPattern = { value: ud.patTex };
    shader.uniforms.uPatScale = { value: ud.patScale };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriNrm;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvTriPos = (modelMatrix * vec4(transformed, 1.0)).xyz;")
      .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvTriNrm = mat3(modelMatrix) * objectNormal;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uPattern;\nuniform float uPatScale;\nvarying vec3 vTriPos;\nvarying vec3 vTriNrm;")
      .replace(
        "#include <map_fragment>",
        "vec3 triB=abs(normalize(vTriNrm));triB/=(triB.x+triB.y+triB.z);vec3 triP=vTriPos*uPatScale;vec4 t0=texture2D(uPattern,fract(triP.zy));vec4 t1=texture2D(uPattern,fract(triP.xz));vec4 t2=texture2D(uPattern,fract(triP.xy));diffuseColor.rgb=(t0*triB.x+t1*triB.y+t2*triB.z).rgb;",
      );
    ud.triShader = shader as unknown as TriShader;
  };
  mat.needsUpdate = true;
}

/** Undo the triplanar patch when a zone goes back to a solid colour. */
function clearTriplanar(mat: THREE.MeshStandardMaterial): void {
  const ud = mat.userData as TriUserData;
  if (!ud.triShader) return;
  mat.onBeforeCompile = () => {};
  ud.triShader = undefined;
  mat.needsUpdate = true;
}

interface BakedItem {
  geom: THREE.BufferGeometry;
  mat: THREE.MeshStandardMaterial;
  name: string;
}

function BakedGarment({ base, design, onSelectZone }: { base: BaseKey; design: Design; onSelectZone: (z: number) => void }) {
  const cfg = REG[base];
  const { scene } = useGLTF(cfg.url);
  const c = design.zoneColors;
  const pbr = fabricPBR(design.fabric);
  const fabNrm = useFabricNormal(design.fabric);
  const logoTex = useLogoTexture(design.logo.color, design.logo.style === "embroidered");
  const patternTex = usePatternTexture(c[0] ?? "#ddd", design.pattern);

  // bake world transforms into geometry → explicit meshes + a conforming decal
  const baked = React.useMemo(() => {
    scene.updateWorldMatrix(true, true);
    const items: BakedItem[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geom = mesh.geometry.clone();
      geom.applyMatrix4(mesh.matrixWorld);
      geom.computeBoundingBox();
      const src = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
      const mat = src.clone();
      items.push({ geom, mat, name: mat.name ?? "" });
    });
    let box = new THREE.Box3();
    for (const it of items) if (it.geom.boundingBox) box.union(it.geom.boundingBox);
    // bake an orientation spin so the garment's front faces the camera (+Z)
    const spin = (cfg.spin ?? 0) * (Math.PI / 180);
    if (spin) {
      const c0 = box.getCenter(new THREE.Vector3());
      const rot = new THREE.Matrix4()
        .makeTranslation(c0.x, c0.y, c0.z)
        .multiply(new THREE.Matrix4().makeRotationY(spin))
        .multiply(new THREE.Matrix4().makeTranslation(-c0.x, -c0.y, -c0.z));
      box = new THREE.Box3();
      for (const it of items) {
        it.geom.applyMatrix4(rot);
        it.geom.computeBoundingBox();
        if (it.geom.boundingBox) box.union(it.geom.boundingBox);
      }
    }
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = TARGET / Math.max(size.x, size.y, size.z || 0.001);
    // body = largest mesh mapped to zone 0 (gets the logo decal)
    let body: BakedItem | null = null;
    let bestVol = -1;
    for (const it of items) {
      if (cfg.zoneOf(it.name) !== 0 || !it.geom.boundingBox) continue;
      const s = it.geom.boundingBox.getSize(new THREE.Vector3());
      const v = s.x * s.y * s.z;
      if (v > bestVol) {
        bestVol = v;
        body = it;
      }
    }
    return { items, center, size, scale, halfH: (size.y * scale) / 2, body: body ?? items[0] };
  }, [scene, cfg]);

  // baked geometries and materials are ours — release GPU buffers on swap/unmount
  React.useEffect(() => {
    const items = baked.items;
    return () => {
      items.forEach((it) => {
        it.geom.dispose();
        it.mat.dispose();
      });
    };
  }, [baked]);

  React.useLayoutEffect(() => {
    const patScale = 2.6 * Math.max(0.5, design.pattern.scale);
    for (const it of baked.items) {
      const mat = it.mat;
      const z = cfg.zoneOf(it.name);
      mat.roughness = pbr.r;
      mat.metalness = pbr.m;
      mat.envMapIntensity = pbr.e;
      if (z === 0 && patternTex) {
        applyTriplanar(mat, patternTex, patScale);
      } else {
        clearTriplanar(mat);
        if (cfg.stripColorMap && mat.map) mat.map = null;
        if (z != null) mat.color.set(c[z] ?? "#dddddd");
      }
    }
  }, [baked, c, pbr, cfg, patternTex, design.pattern.scale, fabNrm]);

  // conforming logo decal on the body, in baked (world) space.
  // ranges are wide so the mark can be placed almost anywhere on the front.
  const lx = baked.center.x + (design.logo.x - 0.5) * baked.size.x * 0.95;
  const ly = THREE.MathUtils.lerp(baked.center.y + baked.size.y * 0.48, baked.center.y - baked.size.y * 0.48, design.logo.y);
  const lz = baked.center.z + baked.size.z * 0.4;
  const lrot = (design.logo.rotation ?? 0) * (Math.PI / 180);
  const lw = baked.size.x * 0.3 * design.logo.scale;
  const lh = logoTex ? lw / logoTex.aspect : lw * 0.47;

  return (
    <>
      <group
        rotation={cfg.rotation}
        onPointerDown={(e) => {
          e.stopPropagation();
          const z = cfg.zoneOf(((e.object as THREE.Mesh).material as THREE.Material)?.name ?? "");
          if (z != null) onSelectZone(z);
        }}
      >
        <group scale={baked.scale} position={[-baked.center.x * baked.scale, -baked.center.y * baked.scale, -baked.center.z * baked.scale]}>
          {baked.items.map((it, i) => (
            <mesh key={i} geometry={it.geom} material={it.mat} castShadow receiveShadow>
              {it === baked.body && logoTex && (
                <Decal position={[lx, ly, lz]} rotation={[0, 0, lrot]} scale={[lw, lh, baked.size.z * 0.7]}>
                  <meshStandardMaterial map={logoTex.texture} transparent polygonOffset polygonOffsetFactor={-10} roughness={0.6} />
                </Decal>
              )}
            </mesh>
          ))}
        </group>
      </group>
      <ContactShadows position={[0, -baked.halfH - 0.02, 0]} opacity={0.45} scale={3} blur={2.6} far={2} />
    </>
  );
}

/** skinned/posed garments: render via <primitive> (correct pose) + near-surface logo plane */
function MeshGarment({ base, design, onSelectZone }: { base: BaseKey; design: Design; onSelectZone: (z: number) => void }) {
  const cfg = REG[base];
  const { scene } = useGLTF(cfg.url);
  const c = design.zoneColors;
  const pbr = fabricPBR(design.fabric);
  const fabNrm = useFabricNormal(design.fabric);
  const logoTex = useLogoTexture(design.logo.color, design.logo.style === "embroidered");
  const patternTex = usePatternTexture(c[0] ?? "#ddd", design.pattern);
  const modelRef = React.useRef<THREE.Group>(null);

  const model = React.useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map((x) => x.clone()) : mesh.material.clone();
      }
    });
    return m;
  }, [scene]);

  // geometry is shared with the GLTF cache — dispose only the cloned materials
  React.useEffect(() => {
    return () => {
      model.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => (m as THREE.Material).dispose());
      });
    };
  }, [model]);

  const fit = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = TARGET / Math.max(size.x, size.y, size.z || 0.001);
    return { center, size, scale, dispW: size.x * scale, dispH: size.y * scale, frontZ: (size.z * scale) / 2, halfH: (size.y * scale) / 2 };
  }, [model]);

  React.useLayoutEffect(() => {
    const patScale = 2.6 * Math.max(0.5, design.pattern.scale);
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[];
      for (const mat of mats) {
        const z = cfg.zoneOf(mat.name ?? "");
        mat.roughness = pbr.r;
        mat.metalness = pbr.m;
        mat.envMapIntensity = pbr.e;
        if (fabNrm && mat.normalMap !== fabNrm.tex) {
          mat.normalMap = fabNrm.tex;
          mat.normalScale.set(fabNrm.scale, fabNrm.scale);
          mat.needsUpdate = true;
        }
        if (z === 0 && patternTex) {
          applyTriplanar(mat, patternTex, patScale);
        } else {
          clearTriplanar(mat);
          if (cfg.stripColorMap && mat.map) mat.map = null;
          if (z != null) mat.color.set(c[z] ?? "#dddddd");
        }
      }
    });
  }, [model, c, pbr, cfg, patternTex, design.pattern.scale, fabNrm]);

  // near-surface logo plane (wide reach + small min); sits just off the front
  const lw = fit.dispW * 0.3 * design.logo.scale;
  const lh = logoTex ? lw / logoTex.aspect : lw * 0.47;
  const lx = (design.logo.x - 0.5) * fit.dispW * 0.92;
  const ly = THREE.MathUtils.lerp(fit.dispH * 0.46, -fit.dispH * 0.46, design.logo.y);
  const lrot = (design.logo.rotation ?? 0) * (Math.PI / 180);

  return (
    <>
      <group
        rotation={cfg.rotation}
        onPointerDown={(e) => {
          e.stopPropagation();
          const z = cfg.zoneOf(((e.object as THREE.Mesh).material as THREE.Material)?.name ?? "");
          if (z != null) onSelectZone(z);
        }}
      >
        <group ref={modelRef} scale={fit.scale} position={[-fit.center.x * fit.scale, -fit.center.y * fit.scale, -fit.center.z * fit.scale]}>
          <primitive object={model} />
        </group>
        {logoTex && (
          <SurfaceLogo target={modelRef} lx={lx} ly={ly} lrot={lrot} w={lw} h={lh} tex={logoTex.texture} />
        )}
      </group>
      <ContactShadows position={[0, -fit.halfH - 0.02, 0]} opacity={0.45} scale={3} blur={2.6} far={2} />
    </>
  );
}

export function Garment(props: { base: BaseKey; design: Design; onSelectZone: (z: number) => void }) {
  return REG[props.base]?.baked ? <BakedGarment {...props} /> : <MeshGarment {...props} />;
}

"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Decal, useGLTF } from "@react-three/drei";
import type { Design } from "@/lib/creator/config";
import { shoeColorOf, shoeModelOf, type ShoeModel } from "@/lib/creator/shoes";
import { TARGET, fabricPBR, useFabricNormal, useLogoTexture } from "./config-textures";

/* Shoe renderers for the configurator. All materials are cloned — the shared
 * drei GLTF cache is never mutated, so designs don't bleed between visits and
 * every clone is disposed on unmount. */

/* A logo plane that sits ON the fabric. It raycasts from the front toward the
 * actual surface at (lx,ly) and lays the plane flat against it, following the
 * surface normal — so the mark never floats above curved garments/shoes.
 * Recomputes for a few frames whenever the placement or model changes (orbiting
 * doesn't need a recompute — the logo is attached in the model's own space). */
export function SurfaceLogo({
  target,
  lx,
  ly,
  lrot,
  w,
  h,
  tex,
}: {
  target: React.RefObject<THREE.Object3D | null>;
  lx: number;
  ly: number;
  lrot: number;
  w: number;
  h: number;
  tex: THREE.Texture;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const ray = React.useRef(new THREE.Raycaster());
  const ttl = React.useRef(0);
  React.useEffect(() => {
    ttl.current = 8; // recompute for a few frames after any change
  }, [lx, ly, w, h, lrot, tex, target]);

  useFrame(() => {
    if (ttl.current <= 0) return;
    ttl.current--;
    const mesh = meshRef.current;
    const tgt = target.current;
    const parent = mesh?.parent;
    if (!mesh || !tgt || !parent) return;
    parent.updateWorldMatrix(true, false);
    tgt.updateWorldMatrix(true, true);
    const originWorld = new THREE.Vector3(lx, ly, 1000).applyMatrix4(parent.matrixWorld);
    const dirWorld = new THREE.Vector3(0, 0, -1).transformDirection(parent.matrixWorld).normalize();
    ray.current.set(originWorld, dirWorld);
    const hits = ray.current.intersectObject(tgt, true);
    if (!hits.length) return;
    const hit = hits[0];
    const pLocal = parent.worldToLocal(hit.point.clone());
    let nLocal = new THREE.Vector3(0, 0, 1);
    if (hit.face) {
      const nWorld = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
      if (nWorld.dot(dirWorld) > 0) nWorld.negate(); // keep it on the camera-facing side
      const invParent = parent.matrixWorld.clone().invert();
      nLocal = nWorld.transformDirection(invParent).normalize();
    }
    mesh.position.copy(pLocal).addScaledVector(nLocal, 0.004);
    const qAlign = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nLocal);
    const qTwist = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), lrot);
    mesh.quaternion.copy(qAlign.multiply(qTwist));
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} roughness={0.6} />
    </mesh>
  );
}

interface NamedPart {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  name: string;
}

/** named-part shoe (clean hierarchy) — explicit meshes + conforming decal */
function NamedShoe({ model, design, onSelectPart }: { model: ShoeModel; design: Design; onSelectPart: (m: string) => void }) {
  const { nodes } = useGLTF(model.url) as unknown as { nodes: Record<string, THREE.Object3D> };
  const pbr = fabricPBR(design.fabric);
  const fabNrm = useFabricNormal(design.fabric);
  const logoTex = useLogoTexture(design.logo.color, design.logo.style === "embroidered");

  // clone every material once per model — never touch the shared GLTF cache
  const parts = React.useMemo<NamedPart[]>(() => {
    const meshes = Object.values(nodes).filter((n) => (n as THREE.Mesh).isMesh) as THREE.Mesh[];
    return meshes.map((mesh) => {
      const src = mesh.material as THREE.MeshStandardMaterial;
      const mat = src.clone();
      return { mesh, mat, name: src.name ?? "" };
    });
  }, [nodes]);

  React.useEffect(() => {
    return () => {
      parts.forEach((p) => p.mat.dispose());
    };
  }, [parts]);

  React.useLayoutEffect(() => {
    for (const p of parts) {
      const col = shoeColorOf(model, p.name, design.shoeColors);
      if (col) p.mat.color.set(col);
      p.mat.roughness = p.name === "sole" ? 0.7 : pbr.r;
      p.mat.metalness = pbr.m;
      p.mat.envMapIntensity = pbr.e;
      if (fabNrm && p.mat.normalMap !== fabNrm.tex) {
        p.mat.normalMap = fabNrm.tex;
        p.mat.normalScale.set(fabNrm.scale, fabNrm.scale);
      }
      p.mat.needsUpdate = true;
    }
  }, [parts, model, design.shoeColors, pbr, fabNrm]);

  const lx = (design.logo.x - 0.5) * 1.7;
  const ly = (0.6 - design.logo.y) * 1.2;
  const s = design.logo.scale;
  const rot = (design.logo.rotation ?? 0) * (Math.PI / 180);
  const lw = model.decal.w * 1.8 * s;
  const lh = logoTex ? lw / logoTex.aspect : lw * 0.47;

  return (
    <>
      <group
        dispose={null}
        onPointerDown={(e) => {
          e.stopPropagation();
          const name = ((e.object as THREE.Mesh).material as THREE.Material)?.name;
          if (name) onSelectPart(name);
        }}
      >
        {parts.map((p) => {
          const isFace = p.name === model.decalMat;
          return (
            <mesh key={p.mesh.uuid} geometry={p.mesh.geometry} material={p.mat} castShadow receiveShadow>
              {isFace && logoTex && (
                <Decal position={[lx, ly, model.decal.depth]} rotation={[0, 0, rot]} scale={[lw, lh, 1]}>
                  <meshStandardMaterial map={logoTex.texture} transparent polygonOffset polygonOffsetFactor={-10} roughness={0.55} />
                </Decal>
              )}
            </mesh>
          );
        })}
      </group>
      <ContactShadows position={[0, model.shadowY, 0]} opacity={0.5} scale={4} blur={2.6} far={2} />
    </>
  );
}

/** generic shoe (nested/large model) — normalised primitive + flat logo plane */
function GenericShoe({ model, design, onSelectPart }: { model: ShoeModel; design: Design; onSelectPart: (m: string) => void }) {
  const { scene } = useGLTF(model.url);
  const pbr = fabricPBR(design.fabric);
  const fabNrm = useFabricNormal(design.fabric);
  const logoTex = useLogoTexture(design.logo.color, design.logo.style === "embroidered");
  const shoeRef = React.useRef<THREE.Group>(null);

  const obj = React.useMemo(() => {
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
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => (m as THREE.Material).dispose());
      });
    };
  }, [obj]);

  const fit = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = TARGET / Math.max(size.x, size.y, size.z || 0.001);
    return { center, scale, halfH: (size.y * scale) / 2, frontZ: (size.z * scale) / 2 };
  }, [obj]);

  React.useLayoutEffect(() => {
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[];
      for (const mat of mats) {
        const col = shoeColorOf(model, mat.name ?? "", design.shoeColors);
        if (col) mat.color.set(col);
        mat.map = null;
        mat.roughness = pbr.r;
        mat.metalness = pbr.m;
        mat.envMapIntensity = pbr.e;
        if (fabNrm && mat.normalMap !== fabNrm.tex) {
          mat.normalMap = fabNrm.tex;
          mat.normalScale.set(fabNrm.scale, fabNrm.scale);
        }
        mat.needsUpdate = true;
      }
    });
  }, [obj, model, design.shoeColors, pbr, fabNrm]);

  const lw = model.decal.w * 0.8 * design.logo.scale;
  const lx = (design.logo.x - 0.5) * 1.1;
  const ly = THREE.MathUtils.lerp(fit.halfH * 0.7, -fit.halfH * 0.5, design.logo.y);
  const lrot = (design.logo.rotation ?? 0) * (Math.PI / 180);

  return (
    <>
      <group
        onPointerDown={(e) => {
          e.stopPropagation();
          const name = ((e.object as THREE.Mesh).material as THREE.Material)?.name;
          if (name) onSelectPart(name);
        }}
      >
        <group ref={shoeRef} scale={fit.scale} position={[-fit.center.x * fit.scale, -fit.center.y * fit.scale, -fit.center.z * fit.scale]}>
          <primitive object={obj} />
        </group>
        {logoTex && (
          <SurfaceLogo target={shoeRef} lx={lx} ly={ly} lrot={lrot} w={lw} h={lw / logoTex.aspect} tex={logoTex.texture} />
        )}
      </group>
      <ContactShadows position={[0, -fit.halfH - 0.02, 0]} opacity={0.45} scale={3} blur={2.6} far={2} />
    </>
  );
}

export function Shoe({ design, onSelectPart }: { design: Design; onSelectPart: (m: string) => void }) {
  const model = shoeModelOf(design.shoeModel);
  return model.named ? (
    <NamedShoe model={model} design={design} onSelectPart={onSelectPart} />
  ) : (
    <GenericShoe model={model} design={design} onSelectPart={onSelectPart} />
  );
}

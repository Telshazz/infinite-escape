'use client';

// ---------------------------------------------------------------------------
// Pointer-lock FPS controller on a Rapier capsule.
// Units are feet: eye height 5.6', walk 8 ft/s, sprint 13 ft/s.
// Also owns the camera during anchor FOCUS mode (eases toward the anchor's
// interaction face) and applies completion camera-shake.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGame } from '@/lib/store';
import { EYE_HEIGHT } from '@/lib/facility';

const WALK = 8;
const SPRINT = 13;
const CROUCH = 4.5;
const CROUCH_EYE = 3.9;
const CAPSULE_HALF = 1.4; // cylinder half-height
const CAPSULE_R = 0.95;
const CENTER_Y = CAPSULE_HALF + CAPSULE_R; // capsule center above floor

export default function Player() {
  const body = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();

  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(Math.PI);
  const pitch = useRef(0);
  const crouched = useRef(false);
  const shakeEnergy = useRef(0);
  const lastShake = useRef(0);
  const focusLerp = useRef(0); // 0 = FPS, 1 = fully at anchor viewpoint

  const spawnSignal = useGame((s) => s.spawnSignal);
  const spawnPoint = useGame((s) => s.spawnPoint);
  const spawnYaw = useGame((s) => s.spawnYaw);

  // ---- input listeners ----
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyC' || e.code === 'ControlLeft')
        crouched.current = !crouched.current;
    };
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      yaw.current -= e.movementX * 0.0022;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - e.movementY * 0.0022,
        -1.45,
        1.45
      );
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', move);
    };
  }, [gl]);

  // ---- pointer lock lifecycle -> paused state ----
  useEffect(() => {
    const el = gl.domElement;
    const tryLock = () => {
      const s = useGame.getState();
      if (s.view !== 'room' || s.focusedAnchorId || s.transition.active) return;
      el.requestPointerLock();
    };
    const onLockChange = () => {
      const locked = document.pointerLockElement === el;
      const s = useGame.getState();
      if (locked) {
        s.setPaused(false);
      } else if (!s.focusedAnchorId && !s.transition.active && s.view === 'room') {
        s.setPaused(true);
      }
      keys.current = {};
    };
    el.addEventListener('click', tryLock);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      el.removeEventListener('click', tryLock);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl]);

  // ---- exit pointer lock when an anchor takes focus ----
  const focusedAnchorId = useGame((s) => s.focusedAnchorId);
  useEffect(() => {
    if (focusedAnchorId && document.pointerLockElement) {
      document.exitPointerLock();
    } else if (!focusedAnchorId) {
      const s = useGame.getState();
      if (s.view === 'room' && !s.paused && !s.transition.active) {
        // returning from a panel: re-lock (must be within a user gesture —
        // panel close buttons call this synchronously). Swallow the
        // rejection: outside a gesture the pause overlay takes over.
        try {
          const p = gl.domElement.requestPointerLock() as unknown;
          if (p instanceof Promise) p.catch(() => undefined);
        } catch {
          /* pause overlay handles it */
        }
      }
    }
  }, [focusedAnchorId, gl]);

  // ---- teleport on spawn signal (room swap / theme regen) ----
  useEffect(() => {
    if (!body.current) return;
    body.current.setTranslation(
      { x: spawnPoint[0], y: CENTER_Y + 0.1, z: spawnPoint[2] },
      true
    );
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    yaw.current = spawnYaw;
    pitch.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawnSignal]);

  const focusTarget = useRef({
    pos: new THREE.Vector3(),
    look: new THREE.Vector3(),
  });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = useGame.getState();
    if (!body.current) return;

    const focused = s.focusedAnchorId ? s.spec?.anchors[s.focusedAnchorId] : null;
    const canMove =
      !focused && !s.paused && !s.transition.active && s.view === 'room' &&
      document.pointerLockElement === gl.domElement;

    // safety net: if anything ever punches the capsule out of the room,
    // put the player back at the spawn point instead of falling forever
    const tr = body.current.translation();
    if (tr.y < -4 || tr.y > 30) {
      body.current.setTranslation(
        { x: s.spawnPoint[0], y: CENTER_Y + 0.1, z: s.spawnPoint[2] },
        true
      );
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // ---- movement ----
    const vel = body.current.linvel();
    if (canMove) {
      const k = keys.current;
      const f = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0);
      const r = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
      const speed = crouched.current
        ? CROUCH
        : k.ShiftLeft || k.ShiftRight
          ? SPRINT
          : WALK;
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      // forward = (-sin, 0, -cos); right = (-cos, 0, sin)
      let vx = (-sin * f - cos * r) * speed;
      let vz = (-cos * f + sin * r) * speed;
      if (f !== 0 && r !== 0) {
        vx *= Math.SQRT1_2 / 1; // normalize diagonal
        vz *= Math.SQRT1_2 / 1;
      }
      body.current.setLinvel({ x: vx, y: vel.y, z: vz }, true);
    } else {
      body.current.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
    }

    // ---- camera ----
    const t = body.current.translation();
    const eye = crouched.current ? CROUCH_EYE : EYE_HEIGHT;
    const fpsPos = new THREE.Vector3(t.x, t.y - CENTER_Y + eye, t.z);

    // focus easing — snap when converged so the in-world panel is rock-solid
    const targetLerp = focused ? 1 : 0;
    focusLerp.current = THREE.MathUtils.damp(
      focusLerp.current,
      targetLerp,
      6,
      dt
    );
    if (Math.abs(focusLerp.current - targetLerp) < 0.015)
      focusLerp.current = targetLerp;

    if (focused) {
      const facing = new THREE.Vector3(
        focused.facing?.[0] ?? 0,
        0,
        focused.facing?.[2] ?? 1
      ).normalize();
      const center = new THREE.Vector3(
        focused.position[0],
        focused.prop.kind === 'panel'
          ? focused.position[1]
          : Math.min(focused.size[1] * 0.75, EYE_HEIGHT - 0.8),
        focused.position[2]
      );
      const dist = Math.max(focused.size[0], focused.size[2]) * 0.6 + 3.2;
      focusTarget.current.pos
        .copy(center)
        .addScaledVector(facing, dist)
        .setY(Math.max(center.y + 0.6, 4.4));
      focusTarget.current.look.copy(center);
    }

    const l = focusLerp.current;
    if (l > 0.001) {
      camera.position.lerpVectors(fpsPos, focusTarget.current.pos, l);
      const q0 = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
      );
      const m = new THREE.Matrix4().lookAt(
        focusTarget.current.pos,
        focusTarget.current.look,
        new THREE.Vector3(0, 1, 0)
      );
      const q1 = new THREE.Quaternion().setFromRotationMatrix(m);
      camera.quaternion.slerpQuaternions(q0, q1, l);
    } else {
      camera.position.copy(fpsPos);
      camera.quaternion.setFromEuler(
        new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
      );
    }

    // ---- completion shake ----
    if (lastShake.current !== s.shakeSignal) {
      lastShake.current = s.shakeSignal;
      shakeEnergy.current = 1;
    }
    if (shakeEnergy.current > 0.001) {
      const e = shakeEnergy.current * (s.spec?.effectIntensity ?? 0.5);
      camera.position.x += (Math.random() - 0.5) * 0.2 * e;
      camera.position.y += (Math.random() - 0.5) * 0.14 * e;
      shakeEnergy.current = Math.max(0, shakeEnergy.current - dt * 2.0);
    }
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      ccd
      mass={70}
      position={[spawnPoint[0], CENTER_Y + 0.1, spawnPoint[2]]}
      enabledRotations={[false, false, false]}
      friction={0.2}
      linearDamping={0.4}
    >
      <CapsuleCollider args={[CAPSULE_HALF, CAPSULE_R]} />
    </RigidBody>
  );
}

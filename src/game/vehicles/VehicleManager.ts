import * as THREE from 'three';
import { VehicleData, VehicleType } from '../types';
import { audioEngine } from '../audio/AudioEngine';

export interface VehicleInstance {
  data: VehicleData;
  mesh: THREE.Group;
  bodyMesh: THREE.Mesh;
  wheels: THREE.Mesh[];
  lightLeft: THREE.Mesh;
  lightRight: THREE.Mesh;
}

export class VehicleManager {
  public scene: THREE.Scene;
  public vehicles: VehicleInstance[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnInitialVehicles();
  }

  private spawnInitialVehicles() {
    const presets: { type: VehicleType; name: string; pos: [number, number, number]; color: number }[] = [
      { type: 'sports', name: 'Hyperion GT', pos: [15, 0.5, 20], color: 0x00f3ff },
      { type: 'muscle', name: 'Viper V8', pos: [-25, 0.5, 45], color: 0xef4444 },
      { type: 'suv', name: 'Titan 4x4', pos: [40, 0.5, -30], color: 0x10b981 },
      { type: 'sedan', name: 'Apex Sedan', pos: [-50, 0.5, -60], color: 0x3b82f6 },
      { type: 'motorcycle', name: 'Phantom R1', pos: [5, 0.5, -15], color: 0x8b5cf6 },
      { type: 'pickup', name: 'Bull Pickup', pos: [80, 0.5, 100], color: 0xd97706 },
    ];

    presets.forEach((p, idx) => {
      this.createVehicle(p.type, p.name, new THREE.Vector3(...p.pos), p.color, `veh_${idx}`);
    });
  }

  public createVehicle(
    type: VehicleType,
    name: string,
    position: THREE.Vector3,
    color: number,
    id: string
  ): VehicleInstance {
    const group = new THREE.Group();

    // Body dimensions based on type
    let w = 2.0, h = 1.2, d = 4.2;
    if (type === 'suv' || type === 'pickup') { w = 2.2; h = 1.6; d = 4.8; }
    if (type === 'motorcycle') { w = 0.8; h = 1.1; d = 2.2; }

    // Car Body Mesh
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.8,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = h / 2 + 0.3;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Car Cabin / Windshield
    if (type !== 'motorcycle') {
      const cabinGeo = new THREE.BoxGeometry(w * 0.85, h * 0.7, d * 0.45);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, h * 1.05 + 0.3, -d * 0.05);
      group.add(cabin);
    }

    // Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    const wheelOffsets = type === 'motorcycle'
      ? [[0, 0.4, d * 0.4], [0, 0.4, -d * 0.4]]
      : [
          [-w / 2 - 0.1, 0.4, d * 0.35],
          [w / 2 + 0.1, 0.4, d * 0.35],
          [-w / 2 - 0.1, 0.4, -d * 0.35],
          [w / 2 + 0.1, 0.4, -d * 0.35],
        ];

    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
      wheels.push(wheel);
    });

    // Headlights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lightLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), lightMat);
    lightLeft.position.set(-w * 0.35, h * 0.5 + 0.3, d / 2 + 0.05);
    group.add(lightLeft);

    const lightRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), lightMat);
    lightRight.position.set(w * 0.35, h * 0.5 + 0.3, d / 2 + 0.05);
    group.add(lightRight);

    group.position.copy(position);
    this.scene.add(group);

    const data: VehicleData = {
      id,
      name,
      type,
      topSpeed: type === 'sports' ? 38 : type === 'muscle' ? 34 : 26,
      acceleration: type === 'sports' ? 22 : 16,
      handling: type === 'motorcycle' ? 3.5 : 2.5,
      price: 15000,
      color: `#${color.toString(16)}`,
      health: 100,
      maxHealth: 100,
      position: { x: position.x, y: position.y, z: position.z },
      rotation: 0,
      speed: 0,
      isOccupied: false,
    };

    const instance: VehicleInstance = { data, mesh: group, bodyMesh, wheels, lightLeft, lightRight };
    this.vehicles.push(instance);
    return instance;
  }

  public getNearestVehicle(pos: THREE.Vector3, maxDist = 5.0): VehicleInstance | null {
    let nearest: VehicleInstance | null = null;
    let minDist = maxDist;

    for (const v of this.vehicles) {
      const dist = pos.distanceTo(v.mesh.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = v;
      }
    }
    return nearest;
  }

  public updateVehiclePhysics(
    veh: VehicleInstance,
    delta: number,
    keys: Record<string, boolean>,
    colliders: THREE.Box3[]
  ) {
    let accel = 0;
    let steer = 0;

    if (keys['KeyW'] || keys['ArrowUp']) accel += 1;
    if (keys['KeyS'] || keys['ArrowDown']) accel -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) steer += 1;
    if (keys['KeyD'] || keys['ArrowRight']) steer -= 1;

    // Speed calculation
    if (accel > 0) {
      veh.data.speed = Math.min(veh.data.topSpeed, veh.data.speed + veh.data.acceleration * delta);
    } else if (accel < 0) {
      veh.data.speed = Math.max(-veh.data.topSpeed * 0.4, veh.data.speed - veh.data.acceleration * delta * 1.2);
    } else {
      // Friction slowdown
      veh.data.speed *= 0.96;
      if (Math.abs(veh.data.speed) < 0.1) veh.data.speed = 0;
    }

    // Steering
    if (veh.data.speed !== 0) {
      const dir = veh.data.speed > 0 ? 1 : -1;
      veh.data.rotation += steer * veh.data.handling * delta * dir;
      veh.mesh.rotation.y = veh.data.rotation;
    }

    // Forward displacement
    const dx = Math.sin(veh.data.rotation) * veh.data.speed * delta;
    const dz = Math.cos(veh.data.rotation) * veh.data.speed * delta;

    veh.mesh.position.x += dx;
    veh.mesh.position.z += dz;

    // Update vehicle position data
    veh.data.position = {
      x: veh.mesh.position.x,
      y: veh.mesh.position.y,
      z: veh.mesh.position.z,
    };

    // Audio engine pitch
    audioEngine.updateEnginePitch(Math.abs(veh.data.speed) / veh.data.topSpeed);
  }
}

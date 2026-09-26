import * as THREE from 'three';
import { audioEngine } from '../audio/AudioEngine';

export interface PoliceCar {
  id: string;
  mesh: THREE.Group;
  lightRed: THREE.Mesh;
  lightBlue: THREE.Mesh;
  position: THREE.Vector3;
  speed: number;
  rotation: number;
}

export class PoliceSystem {
  public scene: THREE.Scene;
  public policeCars: PoliceCar[] = [];
  private escapeTimer = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(delta: number, playerPos: THREE.Vector3, wantedLevel: number, onWantedChange: (level: number) => void) {
    if (wantedLevel <= 0) {
      this.despawnAllPolice();
      audioEngine.updateSiren(0);
      return;
    }

    audioEngine.updateSiren(wantedLevel);

    // Maintain police car count according to wanted level
    const targetCars = wantedLevel * 2;
    if (this.policeCars.length < targetCars) {
      this.spawnPoliceCar(playerPos);
    }

    let nearestDist = 9999;

    // Update Police Cars Pursuit AI
    for (const p of this.policeCars) {
      const dist = p.position.distanceTo(playerPos);
      if (dist < nearestDist) nearestDist = dist;

      // Chase direction towards player
      const chaseDir = playerPos.clone().sub(p.position).normalize();
      p.rotation = Math.atan2(chaseDir.x, chaseDir.z);
      p.mesh.rotation.y = p.rotation;

      const speed = 24 + wantedLevel * 3;
      p.position.add(chaseDir.multiplyScalar(speed * delta));
      p.mesh.position.copy(p.position);

      // Flash Siren Lights
      const time = Date.now() * 0.01;
      (p.lightRed.material as THREE.MeshBasicMaterial).color.setHex(Math.sin(time) > 0 ? 0xff0000 : 0x220000);
      (p.lightBlue.material as THREE.MeshBasicMaterial).color.setHex(Math.sin(time) <= 0 ? 0x0000ff : 0x000022);
    }

    // Escape Mechanism: If player stays > 100m away for 12 seconds, lower wanted level!
    if (nearestDist > 90) {
      this.escapeTimer += delta;
      if (this.escapeTimer >= 10) {
        onWantedChange(Math.max(0, wantedLevel - 1));
        this.escapeTimer = 0;
      }
    } else {
      this.escapeTimer = 0;
    }
  }

  private spawnPoliceCar(playerPos: THREE.Vector3) {
    const group = new THREE.Group();

    // Black & White Police Cruiser Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.2, 4.4), bodyMat);
    body.position.y = 0.8;
    group.add(body);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 2.2), roofMat);
    roof.position.set(0, 1.5, -0.2);
    group.add(roof);

    // Red & Blue Siren Bar
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const lightRed = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.2), redMat);
    lightRed.position.set(-0.5, 1.95, -0.2);
    group.add(lightRed);

    const blueMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const lightBlue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.2), blueMat);
    lightBlue.position.set(0.5, 1.95, -0.2);
    group.add(lightBlue);

    // Spawn 120m away from player in random angle
    const angle = Math.random() * Math.PI * 2;
    const spawnPos = new THREE.Vector3(
      playerPos.x + Math.sin(angle) * 120,
      0.5,
      playerPos.z + Math.cos(angle) * 120
    );

    group.position.copy(spawnPos);
    this.scene.add(group);

    this.policeCars.push({
      id: `police_${Date.now()}_${Math.random()}`,
      mesh: group,
      lightRed,
      lightBlue,
      position: spawnPos,
      speed: 26,
      rotation: 0,
    });
  }

  private despawnAllPolice() {
    for (const p of this.policeCars) {
      this.scene.remove(p.mesh);
    }
    this.policeCars = [];
  }
}

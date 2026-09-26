import * as THREE from 'three';

export interface NPCInstance {
  id: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  targetPos: THREE.Vector3;
  speed: number;
  isPanicked: boolean;
  type: 'CIVILIAN' | 'HOSTILE';
  health: number;
}

export class NPCManager {
  public scene: THREE.Scene;
  public npcs: NPCInstance[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnNPCs(30);
  }

  public spawnNPCs(count: number) {
    const shirtColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Body
      const bodyMat = new THREE.MeshStandardMaterial({
        color: shirtColors[i % shirtColors.length],
        roughness: 0.5,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.4), bodyMat);
      body.position.y = 0.95;
      group.add(body);

      // Head
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), headMat);
      head.position.y = 1.7;
      group.add(head);

      // Initial Spawn position in city streets
      const x = (Math.random() - 0.5) * 600;
      const z = (Math.random() - 0.5) * 600;
      group.position.set(x, 0, z);

      this.scene.add(group);

      this.npcs.push({
        id: `npc_${i}`,
        mesh: group,
        position: new THREE.Vector3(x, 0, z),
        targetPos: new THREE.Vector3(x + (Math.random() - 0.5) * 100, 0, z + (Math.random() - 0.5) * 100),
        speed: 2.5 + Math.random() * 1.5,
        isPanicked: false,
        type: i % 7 === 0 ? 'HOSTILE' : 'CIVILIAN',
        health: 50,
      });
    }
  }

  public updateNPCs(delta: number, playerPos: THREE.Vector3, wantedLevel: number) {
    for (const npc of this.npcs) {
      const distToPlayer = npc.position.distanceTo(playerPos);

      // Trigger panic if player is close with high wanted level
      if (wantedLevel >= 2 && distToPlayer < 25) {
        npc.isPanicked = true;
      }

      if (npc.isPanicked) {
        // Flee away from player
        const fleeDir = npc.position.clone().sub(playerPos).normalize();
        npc.position.add(fleeDir.multiplyScalar(npc.speed * 1.8 * delta));
        npc.mesh.rotation.y = Math.atan2(fleeDir.x, fleeDir.z);
      } else {
        // Normal wander AI
        const distToTarget = npc.position.distanceTo(npc.targetPos);
        if (distToTarget < 2.0) {
          npc.targetPos.set(
            npc.position.x + (Math.random() - 0.5) * 120,
            0,
            npc.position.z + (Math.random() - 0.5) * 120
          );
        }

        const walkDir = npc.targetPos.clone().sub(npc.position).normalize();
        npc.position.add(walkDir.multiplyScalar(npc.speed * delta));
        npc.mesh.rotation.y = Math.atan2(walkDir.x, walkDir.z);
      }

      npc.mesh.position.copy(npc.position);
    }
  }
}

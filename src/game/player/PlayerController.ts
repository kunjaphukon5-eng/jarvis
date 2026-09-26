import * as THREE from 'three';
import { PlayerStats } from '../types';
import { audioEngine } from '../audio/AudioEngine';

export class PlayerController {
  public mesh: THREE.Group;
  public camera: THREE.PerspectiveCamera;
  public position = new THREE.Vector3(0, 1, 0);
  public velocity = new THREE.Vector3();
  public rotation = 0; // angle in radians

  // Orbit Camera State
  public cameraPitch = 0.25; // pitch up/down
  public cameraYaw = 0; // horizontal angle
  public cameraDistance = 8.5;

  // Key states
  public keys: Record<string, boolean> = {};

  // Stats
  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    money: 2500,
    wantedLevel: 0,
    isDriving: false,
    activeVehicleId: null,
    position: { x: 0, y: 1, z: 0 },
    rotation: 0,
  };

  private isGrounded = true;
  private isCrouching = false;
  private isAttacking = false;
  private animTime = 0;

  private headMesh!: THREE.Mesh;
  private bodyMesh!: THREE.Mesh;
  private leftLeg!: THREE.Mesh;
  private rightLeg!: THREE.Mesh;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.mesh = new THREE.Group();
    this.createCharacterMesh();
    scene.add(this.mesh);

    this.bindInputs();
  }

  private createCharacterMesh() {
    // Character Torso
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = 1.0;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // Cyber Head Mask
    const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    this.headMesh = new THREE.Mesh(headGeo, headMat);
    this.headMesh.position.y = 1.8;
    this.mesh.add(this.headMesh);

    // Glowing cyber visor
    const visorGeo = new THREE.BoxGeometry(0.4, 0.12, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.82, 0.25);
    this.mesh.add(visor);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.25, 0.4, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.25, 0.4, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);
  }

  private bindInputs() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyC') {
        this.isCrouching = !this.isCrouching;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse drag for camera orbit
    let isMouseDown = false;
    let prevX = 0;
    let prevY = 0;

    window.addEventListener('mousedown', (e) => {
      if (e.target instanceof HTMLCanvasElement) {
        isMouseDown = true;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      this.cameraYaw -= dx * 0.005;
      this.cameraPitch = Math.max(-0.2, Math.min(1.2, this.cameraPitch + dy * 0.005));
    });
  }

  public update(delta: number, colliders: THREE.Box3[]) {
    if (this.stats.isDriving) return;

    // Movement Direction calculation relative to camera Yaw
    let moveForward = 0;
    let moveSide = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveSide -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveSide += 1;

    const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && this.stats.stamina > 5;
    const isMoving = moveForward !== 0 || moveSide !== 0;

    // Stamina recovery / consumption
    if (isSprinting && isMoving) {
      this.stats.stamina = Math.max(0, this.stats.stamina - delta * 25);
    } else {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + delta * 15);
    }

    let speed = isSprinting ? 12 : this.isCrouching ? 4 : 7;

    if (isMoving) {
      const angle = Math.atan2(moveSide, moveForward) + this.cameraYaw;
      this.rotation = angle;
      this.mesh.rotation.y = angle;

      const dx = Math.sin(angle) * speed * delta;
      const dz = Math.cos(angle) * speed * delta;

      // Simple collision check against building boxes
      const nextPos = this.position.clone().add(new THREE.Vector3(dx, 0, dz));
      let collided = false;

      const playerBox = new THREE.Box3().setFromCenterAndSize(
        nextPos,
        new THREE.Vector3(0.8, 1.8, 0.8)
      );

      for (const box of colliders) {
        if (box.intersectsBox(playerBox)) {
          collided = true;
          break;
        }
      }

      if (!collided) {
        this.position.x += dx;
        this.position.z += dz;
      }

      // Leg animation
      this.animTime += delta * speed * 1.5;
      this.leftLeg.rotation.x = Math.sin(this.animTime) * 0.6;
      this.rightLeg.rotation.x = -Math.sin(this.animTime) * 0.6;

      if (Math.random() < 0.05) audioEngine.playFootstep();
    } else {
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
    }

    // Jump
    if (this.keys['Space'] && this.isGrounded) {
      this.velocity.y = 8;
      this.isGrounded = false;
    }

    // Gravity
    if (!this.isGrounded) {
      this.velocity.y -= 22 * delta;
      this.position.y += this.velocity.y * delta;

      if (this.position.y <= 1.0) {
        this.position.y = 1.0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    this.mesh.position.copy(this.position);
    this.stats.position = { x: this.position.x, y: this.position.y, z: this.position.z };
    this.stats.rotation = this.rotation;

    // Update Orbit Camera Position
    const camDist = this.cameraDistance;
    const camX = this.position.x - Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * camDist;
    const camY = this.position.y + Math.sin(this.cameraPitch) * camDist + 1.5;
    const camZ = this.position.z - Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * camDist;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(this.position.x, this.position.y + 1.2, this.position.z);
  }
}

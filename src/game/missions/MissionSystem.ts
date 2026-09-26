import { Mission } from '../types';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_first_run',
    title: 'First Run',
    description: 'Retrieve the confidential data drive from Downtown Safehouse and deliver it to Industrial Garage.',
    reward: 5000,
    startLocation: { x: 0, y: 1, z: 0, name: 'Downtown Safehouse' },
    waypointLocation: { x: 360, y: 1, z: 120, name: 'Industrial Garage' },
    targetTimeLimit: 120,
    status: 'AVAILABLE',
    objectiveText: 'Drive to Industrial Garage waypoint before time runs out!',
  },
  {
    id: 'm2_harbor_escape',
    title: 'Harbor Escape',
    description: 'Infiltrate Neon Harbor Docks and evade a 2-Star Police pursuit.',
    reward: 8500,
    startLocation: { x: 250, y: 1, z: 400, name: 'Neon Harbor Docks' },
    waypointLocation: { x: -120, y: 1, z: -240, name: 'Police HQ Escape Zone' },
    requiredWantedLevel: 2,
    status: 'LOCKED',
    objectiveText: 'Lose the Police pursuit and reach the escape zone!',
  },
  {
    id: 'm3_midnight_delivery',
    title: 'Midnight Delivery',
    description: 'High-speed delivery: Transport the Hyperion GT to Neon Central Hospital.',
    reward: 12000,
    startLocation: { x: 15, y: 1, z: 20, name: 'Hyperion GT Depot' },
    waypointLocation: { x: 240, y: 1, z: -120, name: 'Neon Central Hospital' },
    targetTimeLimit: 90,
    status: 'LOCKED',
    objectiveText: 'Deliver the Hyperion GT safely to Neon Hospital!',
  },
  {
    id: 'm4_downtown_chase',
    title: 'Downtown Chase',
    description: 'Intercept rival syndicate near Police HQ and return to Downtown Safehouse.',
    reward: 15000,
    startLocation: { x: -120, y: 1, z: -240, name: 'Police HQ District' },
    waypointLocation: { x: 0, y: 1, z: 0, name: 'Downtown Safehouse' },
    status: 'LOCKED',
    objectiveText: 'Outmaneuver opponents and return to the Downtown Safehouse!',
  },
  {
    id: 'm5_final_getaway',
    title: 'Final Getaway',
    description: 'Ultimate heist: Infiltrate Neon City Airport runway and escape the city!',
    reward: 25000,
    startLocation: { x: -420, y: 1, z: 350, name: 'Neon City Airport' },
    waypointLocation: { x: 0, y: 1, z: 0, name: 'City Center Victory Tower' },
    status: 'LOCKED',
    objectiveText: 'Reach the Airport Runway for final escape!',
  },
];

export class MissionManager {
  public missions: Mission[] = [...INITIAL_MISSIONS];
  public activeMission: Mission | null = null;
  public timer = 0;

  public startMission(id: string): boolean {
    const target = this.missions.find((m) => m.id === id);
    if (!target || target.status === 'LOCKED') return false;

    this.activeMission = { ...target, status: 'IN_PROGRESS' };
    this.timer = target.targetTimeLimit || 0;
    return true;
  }

  public updateMission(delta: number, playerPos: { x: number; y: number; z: number }): 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' {
    if (!this.activeMission) return 'IN_PROGRESS';

    // Timer countdown
    if (this.activeMission.targetTimeLimit) {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.activeMission.status = 'FAILED';
        return 'FAILED';
      }
    }

    // Distance to Waypoint
    const wp = this.activeMission.waypointLocation;
    const dx = playerPos.x - wp.x;
    const dz = playerPos.z - wp.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 15) {
      this.activeMission.status = 'COMPLETED';
      this.unlockNextMission(this.activeMission.id);
      return 'COMPLETED';
    }

    return 'IN_PROGRESS';
  }

  private unlockNextMission(completedId: string) {
    const idx = this.missions.findIndex((m) => m.id === completedId);
    if (idx !== -1) {
      this.missions[idx].status = 'COMPLETED';
      if (idx + 1 < this.missions.length) {
        this.missions[idx + 1].status = 'AVAILABLE';
      }
    }
  }
}

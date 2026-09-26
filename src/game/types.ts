export type GameMode = 'LANDING' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  money: number;
  wantedLevel: number; // 0 to 5
  isDriving: boolean;
  activeVehicleId: string | null;
  position: { x: number; y: number; z: number };
  rotation: number;
}

export type VehicleType = 'sports' | 'muscle' | 'suv' | 'sedan' | 'motorcycle' | 'pickup';

export interface VehicleData {
  id: string;
  name: string;
  type: VehicleType;
  topSpeed: number;
  acceleration: number;
  handling: number;
  price: number;
  color: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  speed: number;
  isOccupied: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  startLocation: { x: number; y: number; z: number; name: string };
  waypointLocation: { x: number; y: number; z: number; name: string };
  targetTimeLimit?: number; // seconds
  requiredWantedLevel?: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  objectiveText: string;
}

export interface SaveData {
  version: number;
  savedAt: number;
  player: {
    health: number;
    money: number;
    wantedLevel: number;
    position: { x: number; y: number; z: number };
  };
  completedMissionIds: string[];
  ownedVehicleIds: string[];
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH';
}

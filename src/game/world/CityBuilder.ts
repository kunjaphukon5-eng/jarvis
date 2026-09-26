import * as THREE from 'three';

export interface Landmark {
  id: string;
  name: string;
  type: 'SAFEHOUSE' | 'GARAGE' | 'SHOP' | 'POLICE' | 'HOSPITAL' | 'AIRPORT' | 'HARBOR';
  position: THREE.Vector3;
  color: number;
}

export class CityBuilder {
  public scene: THREE.Scene;
  public landmarks: Landmark[] = [];
  public colliderBoxes: THREE.Box3[] = [];
  public roadGridSize = 1200;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildCity(quality: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM') {
    this.buildTerrainAndRoads();
    this.buildDowntownDistrict(quality);
    this.buildResidentialDistrict(quality);
    this.buildIndustrialDistrict(quality);
    this.buildAirportDistrict(quality);
    this.buildHarborAndBeach(quality);
    this.buildStreetProps(quality);
    this.registerLandmarks();
  }

  private buildTerrainAndRoads() {
    // Main Ground Plane
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090c15,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Road Network Grid Lines
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e2b,
      roughness: 0.6,
    });

    const numRoads = 9;
    const spacing = 120;
    const roadWidth = 18;

    for (let i = -numRoads / 2; i <= numRoads / 2; i++) {
      const offset = i * spacing;

      // X Axis Main Avenues
      const roadXGeo = new THREE.PlaneGeometry(1200, roadWidth);
      const roadX = new THREE.Mesh(roadXGeo, roadMat);
      roadX.rotation.x = -Math.PI / 2;
      roadX.position.set(0, 0.05, offset);
      roadX.receiveShadow = true;
      this.scene.add(roadX);

      // Z Axis Main Streets
      const roadZGeo = new THREE.PlaneGeometry(roadWidth, 1200);
      const roadZ = new THREE.Mesh(roadZGeo, roadMat);
      roadZ.rotation.x = -Math.PI / 2;
      roadZ.position.set(offset, 0.05, 0);
      roadZ.receiveShadow = true;
      this.scene.add(roadZ);
    }
  }

  private buildDowntownDistrict(quality: string) {
    // Downtown Skyscrapers Block
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x121a2d,
      roughness: 0.2,
      metalness: 0.8,
    });
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const neonMagentaMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

    const numSkyscrapers = quality === 'LOW' ? 25 : quality === 'MEDIUM' ? 45 : 70;

    for (let i = 0; i < numSkyscrapers; i++) {
      const width = 25 + Math.random() * 25;
      const depth = 25 + Math.random() * 25;
      const height = 40 + Math.random() * 90;

      // Position in central downtown zone [-250, 250]
      const x = (Math.random() - 0.5) * 450;
      const z = (Math.random() - 0.5) * 450;

      // Avoid blocking central road intersections
      if (Math.abs(x % 120) < 20 || Math.abs(z % 120) < 20) continue;

      const building = new THREE.Mesh(buildingGeo, glassMat);
      building.scale.set(width, height, depth);
      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Add to collision bounding boxes
      const box = new THREE.Box3().setFromObject(building);
      this.colliderBoxes.push(box);

      // Add Glowing Neon Trim Header on top
      const trimGeo = new THREE.BoxGeometry(width + 0.5, 1.5, depth + 0.5);
      const trimMat = i % 2 === 0 ? neonCyanMat : neonMagentaMat;
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(x, height, z);
      this.scene.add(trim);
    }
  }

  private buildResidentialDistrict(quality: string) {
    // Residential North District [Z: -450 to -200]
    const houseMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.7,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      roughness: 0.5,
    });

    for (let x = -400; x <= 400; x += 90) {
      for (let z = -520; z <= -260; z += 90) {
        if (Math.abs(x % 120) < 20 || Math.abs(z % 120) < 20) continue;

        const house = new THREE.Mesh(new THREE.BoxGeometry(24, 12, 20), houseMat);
        house.position.set(x, 6, z);
        house.castShadow = true;
        this.scene.add(house);
        this.colliderBoxes.push(new THREE.Box3().setFromObject(house));

        const roof = new THREE.Mesh(new THREE.ConeGeometry(18, 8, 4), roofMat);
        roof.position.set(x, 16, z);
        roof.rotation.y = Math.PI / 4;
        this.scene.add(roof);
      }
    }
  }

  private buildIndustrialDistrict(quality: string) {
    // Industrial Zone East District [X: 250 to 550]
    const warehouseMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.6,
      roughness: 0.4,
    });
    const containerColors = [0xd97706, 0x2563eb, 0xd97706, 0x059669];

    for (let i = 0; i < 15; i++) {
      const x = 280 + Math.random() * 240;
      const z = (Math.random() - 0.5) * 500;

      const w = new THREE.Mesh(new THREE.BoxGeometry(40, 18, 50), warehouseMat);
      w.position.set(x, 9, z);
      w.castShadow = true;
      this.scene.add(w);
      this.colliderBoxes.push(new THREE.Box3().setFromObject(w));

      // Shipping Containers
      const cMat = new THREE.MeshStandardMaterial({ color: containerColors[i % 4] });
      const container = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 26), cMat);
      container.position.set(x + 30, 3, z + 15);
      this.scene.add(container);
      this.colliderBoxes.push(new THREE.Box3().setFromObject(container));
    }
  }

  private buildAirportDistrict(quality: string) {
    // Airport West Runway [X: -550 to -300, Z: 200 to 500]
    const runwayGeo = new THREE.PlaneGeometry(120, 450);
    const runwayMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(-420, 0.1, 350);
    this.scene.add(runway);

    // Control Tower
    const towerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 12, 45, 12),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    );
    towerBase.position.set(-520, 22.5, 200);
    this.scene.add(towerBase);
    this.colliderBoxes.push(new THREE.Box3().setFromObject(towerBase));

    const towerCab = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 10, 10, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: false })
    );
    towerCab.position.set(-520, 48, 200);
    this.scene.add(towerCab);
  }

  private buildHarborAndBeach(quality: string) {
    // Water Ocean Plane [South East: Z > 400]
    const oceanGeo = new THREE.PlaneGeometry(700, 700);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(250, -0.5, 450);
    this.scene.add(ocean);

    // Pier Deck
    const pierGeo = new THREE.BoxGeometry(20, 4, 220);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(250, 2, 420);
    this.scene.add(pier);
    this.colliderBoxes.push(new THREE.Box3().setFromObject(pier));
  }

  private buildStreetProps(quality: string) {
    if (quality === 'LOW') return;

    // Add Street Lamps
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

    for (let x = -360; x <= 360; x += 120) {
      for (let z = -360; z <= 360; z += 120) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 10), poleMat);
        pole.position.set(x + 10, 5, z + 10);
        this.scene.add(pole);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), lampMat);
        bulb.position.set(x + 10, 10, z + 10);
        this.scene.add(bulb);
      }
    }
  }

  private registerLandmarks() {
    this.landmarks = [
      {
        id: 'safehouse_downtown',
        name: 'Downtown Safehouse',
        type: 'SAFEHOUSE',
        position: new THREE.Vector3(0, 1, 0),
        color: 0x10b981,
      },
      {
        id: 'garage_industrial',
        name: 'Industrial Garage',
        type: 'GARAGE',
        position: new THREE.Vector3(360, 1, 120),
        color: 0xf59e0b,
      },
      {
        id: 'police_hq',
        name: 'Police Station HQ',
        type: 'POLICE',
        position: new THREE.Vector3(-120, 1, -240),
        color: 0x3b82f6,
      },
      {
        id: 'neon_hospital',
        name: 'Neon Central Hospital',
        type: 'HOSPITAL',
        position: new THREE.Vector3(240, 1, -120),
        color: 0xef4444,
      },
      {
        id: 'harbor_dock',
        name: 'Neon Harbor Docks',
        type: 'HARBOR',
        position: new THREE.Vector3(250, 1, 400),
        color: 0x06b6d4,
      },
      {
        id: 'neon_airport',
        name: 'Neon City Airport',
        type: 'AIRPORT',
        position: new THREE.Vector3(-420, 1, 350),
        color: 0x8b5cf6,
      },
    ];
  }
}

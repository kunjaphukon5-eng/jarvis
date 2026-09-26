'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GameMode, SaveData } from './types';
import { CityBuilder } from './world/CityBuilder';
import { PlayerController } from './player/PlayerController';
import { VehicleManager, VehicleInstance } from './vehicles/VehicleManager';
import { NPCManager } from './npc/NPCManager';
import { PoliceSystem } from './police/PoliceSystem';
import { MissionManager } from './missions/MissionSystem';
import { HUD } from './ui/HUD';
import { GameMenu } from './ui/GameMenu';
import { MobileControls } from './ui/MobileControls';
import { LandingPage } from './ui/LandingPage';
import { audioEngine } from './audio/AudioEngine';

interface NeonCityGameProps {
  onSwitchToJarvis?: () => void;
}

export const NeonCityGame: React.FC<NeonCityGameProps> = ({ onSwitchToJarvis }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<GameMode>('LANDING');

  // Game Systems State
  const [stats, setStats] = useState({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    money: 2500,
    wantedLevel: 0,
    isDriving: false,
    activeVehicleId: null as string | null,
    position: { x: 0, y: 1, z: 0 },
    rotation: 0,
  });

  const [activeVehicle, setActiveVehicle] = useState<VehicleInstance | null>(null);
  const [nearestVehName, setNearestVehName] = useState<string | null>(null);
  const [graphicsQuality, setGraphicsQuality] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isMuted, setIsMuted] = useState(false);
  const [fps, setFps] = useState(60);

  // Engine System Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cityRef = useRef<CityBuilder | null>(null);
  const playerRef = useRef<PlayerController | null>(null);
  const vehicleMgrRef = useRef<VehicleManager | null>(null);
  const npcMgrRef = useRef<NPCManager | null>(null);
  const policeSysRef = useRef<PoliceSystem | null>(null);
  const missionMgrRef = useRef<MissionManager | null>(null);

  const activeVehicleRef = useRef<VehicleInstance | null>(null);
  const modeRef = useRef<GameMode>(mode);
  modeRef.current = mode;

  // Initialize 3D WebGL Canvas
  useEffect(() => {
    if (!containerRef.current || mode !== 'PLAYING') return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a14);
    scene.fog = new THREE.FogExp2(0x070a14, 0.002);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 12);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = graphicsQuality !== 'LOW';
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    dirLight.position.set(200, 300, 100);
    dirLight.castShadow = graphicsQuality !== 'LOW';
    scene.add(dirLight);

    // Initialize City & Systems
    const city = new CityBuilder(scene);
    city.buildCity(graphicsQuality);
    cityRef.current = city;

    const player = new PlayerController(scene, camera);
    playerRef.current = player;

    const vehicleMgr = new VehicleManager(scene);
    vehicleMgrRef.current = vehicleMgr;

    const npcMgr = new NPCManager(scene);
    npcMgrRef.current = npcMgr;

    const policeSys = new PoliceSystem(scene);
    policeSysRef.current = policeSys;

    const missionMgr = new MissionManager();
    missionMgrRef.current = missionMgr;

    // Window Resize Handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keydown toggle Pause Menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        // Toggle Vehicle Enter / Exit
        handleToggleVehicle();
      }
      if (e.code === 'Escape') {
        setMode((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Main Game Loop
    let clock = new THREE.Clock();
    let animId: number;
    let frameCount = 0;
    let lastFpsCheck = Date.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);

      frameCount++;
      if (Date.now() - lastFpsCheck > 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsCheck = Date.now();
      }

      if (modeRef.current === 'PLAYING') {
        const curVehicle = activeVehicleRef.current;

        if (curVehicle) {
          // Driving Physics
          vehicleMgr.updateVehiclePhysics(curVehicle, delta, player.keys, city.colliderBoxes);
          player.position.copy(curVehicle.mesh.position);
          player.mesh.position.copy(curVehicle.mesh.position);

          // Chase Camera behind Vehicle
          const camDist = 12;
          const camX = curVehicle.mesh.position.x - Math.sin(curVehicle.data.rotation) * camDist;
          const camY = curVehicle.mesh.position.y + 4.5;
          const camZ = curVehicle.mesh.position.z - Math.cos(curVehicle.data.rotation) * camDist;
          camera.position.set(camX, camY, camZ);
          camera.lookAt(curVehicle.mesh.position.x, curVehicle.mesh.position.y + 1.5, curVehicle.mesh.position.z);
        } else {
          // Foot Player Physics
          player.update(delta, city.colliderBoxes);

          // Nearest vehicle distance check
          const nearVeh = vehicleMgr.getNearestVehicle(player.position, 6.0);
          setNearestVehName(nearVeh ? nearVeh.data.name : null);
        }

        // Update NPCs
        npcMgr.updateNPCs(delta, player.position, player.stats.wantedLevel);

        // Update Police System
        policeSys.update(delta, player.position, player.stats.wantedLevel, (newLevel) => {
          player.stats.wantedLevel = newLevel;
        });

        // Update Active Mission
        if (missionMgr.activeMission) {
          const status = missionMgr.updateMission(delta, player.position);
          if (status === 'COMPLETED') {
            player.stats.money += missionMgr.activeMission.reward;
            alert(`Mission Completed! Reward: +$${missionMgr.activeMission.reward.toLocaleString()}`);
            missionMgr.activeMission = null;
          }
        }

        // Sync Stats to React State
        setStats({ ...player.stats });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      audioEngine.stopEngine();
    };
  }, [mode, graphicsQuality]);

  // Toggle Enter / Exit Vehicle
  const handleToggleVehicle = () => {
    const player = playerRef.current;
    const vehicleMgr = vehicleMgrRef.current;
    if (!player || !vehicleMgr) return;

    if (player.stats.isDriving && activeVehicleRef.current) {
      // Exit Vehicle
      const veh = activeVehicleRef.current;
      veh.data.isOccupied = false;
      activeVehicleRef.current = null;
      setActiveVehicle(null);

      player.stats.isDriving = false;
      player.stats.activeVehicleId = null;
      player.position.set(veh.mesh.position.x + 2.5, 1.0, veh.mesh.position.z);
      player.mesh.visible = true;

      audioEngine.stopEngine();
    } else {
      // Enter Nearest Vehicle
      const nearVeh = vehicleMgr.getNearestVehicle(player.position, 6.0);
      if (nearVeh) {
        nearVeh.data.isOccupied = true;
        activeVehicleRef.current = nearVeh;
        setActiveVehicle(nearVeh);

        player.stats.isDriving = true;
        player.stats.activeVehicleId = nearVeh.data.id;
        player.mesh.visible = false;

        audioEngine.startEngine();
      }
    }
  };

  // Virtual Key Press from Mobile Controls
  const handleVirtualKey = (key: string, pressed: boolean) => {
    if (playerRef.current) {
      playerRef.current.keys[key] = pressed;
    }
  };

  // Save Game
  const handleSaveGame = () => {
    const saveData: SaveData = {
      version: 1,
      savedAt: Date.now(),
      player: {
        health: stats.health,
        money: stats.money,
        wantedLevel: stats.wantedLevel,
        position: stats.position,
      },
      completedMissionIds: missionMgrRef.current
        ? missionMgrRef.current.missions.filter((m) => m.status === 'COMPLETED').map((m) => m.id)
        : [],
      ownedVehicleIds: ['veh_0'],
      graphicsQuality,
    };
    localStorage.setItem('neon_city_save_v1', JSON.stringify(saveData));
    alert('Game progress saved successfully!');
  };

  // Load Game
  const handleLoadGame = () => {
    const raw = localStorage.getItem('neon_city_save_v1');
    if (raw) {
      try {
        const parsed: SaveData = JSON.parse(raw);
        if (playerRef.current) {
          playerRef.current.stats.health = parsed.player.health;
          playerRef.current.stats.money = parsed.player.money;
          playerRef.current.stats.wantedLevel = parsed.player.wantedLevel;
          playerRef.current.position.set(parsed.player.position.x, 1, parsed.player.position.z);
        }
        alert('Game loaded successfully!');
      } catch {
        alert('Failed to parse saved game data.');
      }
    }
  };

  if (mode === 'LANDING') {
    return (
      <LandingPage
        onPlayNow={() => setMode('PLAYING')}
        onSwitchToJarvis={onSwitchToJarvis || (() => {})}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Modern Game HUD Overlay */}
      <HUD
        stats={stats}
        vehicle={activeVehicle ? activeVehicle.data : null}
        nearestVehicleName={nearestVehName}
        objectiveText={missionMgrRef.current?.activeMission?.objectiveText || null}
        policePositions={policeSysRef.current?.policeCars.map((p) => p.position) || []}
        vehiclePositions={vehicleMgrRef.current?.vehicles.map((v) => v.mesh.position) || []}
        waypointPos={missionMgrRef.current?.activeMission?.waypointLocation || null}
        fps={fps}
      />

      {/* Mobile Touch Overlay */}
      <MobileControls onVirtualKey={handleVirtualKey} isDriving={stats.isDriving} />

      {/* Game Pause Menu */}
      <GameMenu
        isOpen={mode === 'PAUSED'}
        onClose={() => setMode('PLAYING')}
        missions={missionMgrRef.current?.missions || []}
        onStartMission={(id) => {
          missionMgrRef.current?.startMission(id);
        }}
        vehicles={vehicleMgrRef.current?.vehicles.map((v) => v.data) || []}
        playerMoney={stats.money}
        onBuyVehicle={(id, price) => {
          if (stats.money >= price && playerRef.current) {
            playerRef.current.stats.money -= price;
            alert('Vehicle purchased successfully!');
          }
        }}
        graphicsQuality={graphicsQuality}
        onChangeGraphics={(q) => setGraphicsQuality(q)}
        isMuted={isMuted}
        onToggleMute={() => {
          setIsMuted(!isMuted);
          audioEngine.setMuted(!isMuted);
        }}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
        onExitToLanding={() => setMode('LANDING')}
      />
    </div>
  );
};

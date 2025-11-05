import {
  type UserLocation,
  type InsertUserLocation,
  type UserAlert,
  type InsertUserAlert,
  type PredictionCache,
  type InsertPredictionCache,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUserLocations(userId: string): Promise<UserLocation[]>;
  createUserLocation(location: InsertUserLocation): Promise<UserLocation>;
  deleteUserLocation(id: string): Promise<void>;
  
  getUserAlerts(userId: string): Promise<UserAlert[]>;
  createUserAlert(alert: InsertUserAlert): Promise<UserAlert>;
  updateUserAlert(id: string, enabled: boolean): Promise<void>;
  deleteUserAlert(id: string): Promise<void>;
  
  getPredictionCache(lat: number, lon: number, date: string): Promise<PredictionCache | undefined>;
  createPredictionCache(cache: InsertPredictionCache): Promise<PredictionCache>;
}

export class MemStorage implements IStorage {
  private userLocations: Map<string, UserLocation>;
  private userAlerts: Map<string, UserAlert>;
  private predictionCaches: Map<string, PredictionCache>;

  constructor() {
    this.userLocations = new Map();
    this.userAlerts = new Map();
    this.predictionCaches = new Map();
  }

  async getUserLocations(userId: string): Promise<UserLocation[]> {
    return Array.from(this.userLocations.values()).filter(
      (loc) => loc.userId === userId
    );
  }

  async createUserLocation(location: InsertUserLocation): Promise<UserLocation> {
    const id = randomUUID();
    const newLocation: UserLocation = {
      ...location,
      id,
      createdAt: new Date(),
    };
    this.userLocations.set(id, newLocation);
    return newLocation;
  }

  async deleteUserLocation(id: string): Promise<void> {
    this.userLocations.delete(id);
    Array.from(this.userAlerts.values())
      .filter((alert) => alert.locationId === id)
      .forEach((alert) => this.userAlerts.delete(alert.id));
  }

  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    return Array.from(this.userAlerts.values()).filter(
      (alert) => alert.userId === userId
    );
  }

  async createUserAlert(alert: InsertUserAlert): Promise<UserAlert> {
    const id = randomUUID();
    const newAlert: UserAlert = {
      ...alert,
      id,
      enabled: alert.enabled ?? true,
      createdAt: new Date(),
    };
    this.userAlerts.set(id, newAlert);
    return newAlert;
  }

  async updateUserAlert(id: string, enabled: boolean): Promise<void> {
    const alert = this.userAlerts.get(id);
    if (alert) {
      this.userAlerts.set(id, { ...alert, enabled });
    }
  }

  async deleteUserAlert(id: string): Promise<void> {
    this.userAlerts.delete(id);
  }

  async getPredictionCache(
    lat: number,
    lon: number,
    date: string
  ): Promise<PredictionCache | undefined> {
    const key = `${lat},${lon},${date}`;
    return this.predictionCaches.get(key);
  }

  async createPredictionCache(cache: InsertPredictionCache): Promise<PredictionCache> {
    const id = randomUUID();
    const newCache: PredictionCache = {
      ...cache,
      id,
      createdAt: new Date(),
    };
    const key = `${cache.latitude},${cache.longitude},${cache.forecastDate}`;
    this.predictionCaches.set(key, newCache);
    return newCache;
  }
}

export const storage = new MemStorage();

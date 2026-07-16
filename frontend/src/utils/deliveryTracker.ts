import { doc, updateDoc, GeoPoint } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Technician delivery tracking helper.
 * Uses high-accuracy GPS watchPosition, but throttles updates to once every 15 seconds
 * to control database write costs and prevent listener churn on the map screens.
 */
export class DeliveryTracker {
  private orderId: string;
  private watchId: number | null = null;
  private lastWriteTime = 0;
  private throttleIntervalMs = 15000; // 15 seconds throttle

  constructor(orderId: string) {
    this.orderId = orderId;
  }

  public startTracking(): void {
    if (!navigator.geolocation) {
      console.warn("Geolocation API is not supported by this browser.");
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationUpdate(position),
      (error) => console.error("[GPS Tracker] Error obtaining coordinates:", error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  private async handleLocationUpdate(position: GeolocationPosition): Promise<void> {
    const now = Date.now();
    const timeElapsed = now - this.lastWriteTime;

    // Enforce 15-second write throttling
    if (timeElapsed >= this.throttleIntervalMs) {
      this.lastWriteTime = now;
      const { latitude, longitude } = position.coords;

      try {
        const orderRef = doc(db, "orders", this.orderId);
        await updateDoc(orderRef, {
          "deliveryInfo.currentLocation": new GeoPoint(latitude, longitude),
          "deliveryInfo.lastLocationUpdate": new Date().toISOString(),
        });
        console.log(`[GPS Tracker] Location synced: (${latitude}, ${longitude})`);
      } catch (err) {
        console.error("[GPS Tracker] Failed to sync location writes:", err);
      }
    }
  }

  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

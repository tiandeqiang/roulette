export interface PrizeTier {
  value: number;
  label: string;
  probability: number;
  color: string;
  textColor: string;
}

export interface SpinResult {
  id: string;
  timestamp: number;
  prizeValue: number;
  prizeLabel: string;
}

export interface BusinessStats {
  totalSpins: number;
  totalPayout: number;
  averagePayout: number;
  actualRTP: number; // Return to Player percentage based on history
}

export interface WheelConfig {
  rotationDuration: number; // in seconds
  minSpins: number; // minimum full rotations
}
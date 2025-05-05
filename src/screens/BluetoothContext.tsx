import React, { createContext, useState, useContext, ReactNode } from 'react';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

// Define Bluetooth Context Type
interface BluetoothContextType {
  connectedDevice: BluetoothDevice | null;
  setConnectedDevice: (device: BluetoothDevice | null) => void;
}

// Create Context with Default Values
const BluetoothContext = createContext<BluetoothContextType>({
  connectedDevice: null,
  setConnectedDevice: () => {},
});

// Create Provider Component
export const BluetoothProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);

  return (
    <BluetoothContext.Provider value={{ connectedDevice, setConnectedDevice }}>
      {children}
    </BluetoothContext.Provider>
  );
};

// Custom Hook to Use Context
export const useBluetooth = () => useContext(BluetoothContext);

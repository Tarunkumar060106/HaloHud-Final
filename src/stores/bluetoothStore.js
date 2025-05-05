import React, { createContext, useState, useEffect } from 'react';

// Create a context for Bluetooth
export const BluetoothContext = createContext({
  connectedDevice: null,
  setConnectedDevice: (device) => {},
});

// Create a provider component
export const BluetoothProvider = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState(null);

  // Debugging: Log connectedDevice whenever it changes
  useEffect(() => {
    console.log('Connected Device (Context):', connectedDevice);
  }, [connectedDevice]);

  return (
    <BluetoothContext.Provider value={{ connectedDevice, setConnectedDevice }}>
      {children}
    </BluetoothContext.Provider>
  );
};
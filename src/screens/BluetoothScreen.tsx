import React, { useState, useEffect } from 'react';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  PermissionsAndroid, 
  Platform, 
  ActivityIndicator, 
  Switch, 
  StyleSheet, 
  TextInput 
} from 'react-native';
import { useBluetooth } from '../screens/BluetoothContext'; // Import the context

export default function BluetoothScreen() {
  const { connectedDevice, setConnectedDevice } = useBluetooth(); // Use global state
  const [isBluetoothOn, setIsBluetoothOn] = useState<boolean>(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [message, setMessage] = useState<string>(''); // State for the message input

  useEffect(() => {
    checkBluetoothState();
    requestPermissions();
  
    // Only send time once after connection
    if (connectedDevice) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      sendTimeToDevice(formattedTime); // Send the time to the device when connected
    }

    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-GB', { hour12: false });
      setCurrentTime(formattedTime);
    };
  
    updateTime(); // Call immediately
    const interval = setInterval(updateTime, 1000); // Update every second
  
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [connectedDevice]); // Runs only when connectedDevice state changes

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } catch (error) {
        console.error('Permission request failed:', error);
      }
    }
  };

  const checkBluetoothState = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setIsBluetoothOn(enabled);
    } catch (error) {
      console.error('Failed to check Bluetooth state:', error);
    }
  };

  const toggleBluetooth = async () => {
    try {
      if (isBluetoothOn) {
        Alert.alert('Bluetooth', 'Please turn off Bluetooth manually.');
      } else {
        const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
        setIsBluetoothOn(enabled);
      }
    } catch (error) {
      console.error('Error toggling Bluetooth:', error);
    }
  };

  const discoverDevices = async () => {
    setLoading(true);
    try {
      const pairedDevices = await RNBluetoothClassic.getBondedDevices();
      setDevices(pairedDevices);
    } catch (error) {
      console.error('Failed to discover devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    if (connectedDevice) {
      await disconnectDevice();
    }

    try {
      const connected = await device.connect();
      if (connected) {
        setConnectedDevice(device); // Store in global state
        Alert.alert('Success', `Connected to ${device.name}`);
        sendTimeToDevice(); // Send time immediately after connection
      } else {
        Alert.alert('Failed', `Could not connect to ${device.name}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', `Failed to connect: ${error}`);
    }
  };

  const disconnectDevice = async () => {
    if (!connectedDevice) return;

    try {
      await connectedDevice.disconnect();
      setConnectedDevice(null);
      Alert.alert('Disconnected', 'Bluetooth device disconnected');
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const sendTimeToDevice = async (time?: string) => {
    try {
      if (connectedDevice) {
        const now = new Date();
        let formattedTime = time || now.toLocaleTimeString('en-GB', { hour12: false });
  
        // Ensure time is in HH:MM:SS format
        const timeParts = formattedTime.split(':');
        if (timeParts.length !== 3) {
          console.error('Invalid time format:', formattedTime);
          Alert.alert('Error', 'Time format is incorrect.');
          return;
        }
  
        console.log(`Sending Time: ${formattedTime}`);
  
        // Send time to Bluetooth device
        await connectedDevice.write(`${formattedTime}\n`);
        console.log(`Sent Time: ${formattedTime} to Bluetooth`);
  
        // Optionally, read response
        const receivedData = await connectedDevice.read();
        const receivedString = receivedData ? receivedData.toString() : '';
  
        console.log('Received Data:', receivedString);
      } else {
        console.log('No Bluetooth device connected');
      }
    } catch (error) {
      console.error('Error sending time:', error);
      Alert.alert('Error', `Failed to send time: ${error}`);
    }
  };
      
  const sendMessageToDevice = async () => {
    try {
      if (connectedDevice && message.trim()) {
        await connectedDevice.write(`${message}\n`);
        console.log(`Sent Message: ${message} to Bluetooth`);
        setMessage(''); // Clear message input after sending
      } else {
        console.log('No message or Bluetooth device connected');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bluetooth Devices</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Bluetooth is {isBluetoothOn ? 'On' : 'Off'}</Text>
        <Switch value={isBluetoothOn} onValueChange={toggleBluetooth} />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={discoverDevices}>
          <Text style={styles.buttonText}>Discover Devices</Text>
        </TouchableOpacity>
        {connectedDevice && (
          <>
            <TouchableOpacity style={styles.disconnectButton} onPress={disconnectDevice}>
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendButton} onPress={() => sendTimeToDevice()}>
              <Text style={styles.buttonText}>Send Time</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deviceItem} onPress={() => connectToDevice(item)}>
              <Text style={styles.deviceText}>{item.name || 'Unknown Device'}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {connectedDevice && (
        <Text style={styles.connectedText}>Connected to: {connectedDevice.name}</Text>
      )}

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>Current Time: {currentTime}</Text>
      </View>

      {/* Message Sender Input */}
      <View style={styles.messageContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessageToDevice}>
          <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchText: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deviceText: {
    fontSize: 16,
  },
  connectedText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  timeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  messageInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Button,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import GetLocation from 'react-native-get-location';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { useBluetooth } from '../screens/BluetoothContext';

interface LocationError {
  code: string;
  message: string;
}

interface Step {
  html_instructions: string;
  distance: { text: string };
  maneuver?: string;
}

const MapScreen = () => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [directionsText, setDirectionsText] = useState('');
  const [showDirections, setShowDirections] = useState(false);
  const [destination, setDestination] = useState('');
  const [simulationActive, setSimulationActive] = useState(false);

  const { connectedDevice } = useBluetooth();
  const mapRef = useRef<MapView>(null);
  
  useEffect(() => {
    console.log('Connected Device:', connectedDevice);
  }, [connectedDevice]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchLocation();
        } else {
          setError('PERMISSION_DENIED');
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setError('PERMISSION_DENIED');
        setLoading(false);
      }
    } else {
      fetchLocation();
    }
  };

  const fetchLocation = async () => {
    setLoading(true);
    setLocation(null);
    setError(null);

    try {
      const newLocation = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        rationale: {
          title: 'Location permission',
          message: 'The app needs permission to get your location.',
          buttonPositive: 'Ok',
        },
      });
      setLocation(newLocation);
    } catch (ex) {
      if (typeof ex === 'object' && ex !== null && 'code' in ex) {
        const error = ex as LocationError;
        console.warn(error.code, error.message);
        setError(error.code);
      } else {
        console.warn(ex);
        setError('UNKNOWN_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDirections = async (destination: string) => {
    if (!location) {
      Alert.alert('Error', 'Unable to fetch current location.');
      return;
    }

    const apiKey = 'AIzaSyA8iDQ3UdQlSIu6YaaRKANB8kU8NVItXuk';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${destination}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const coordinates = polyline.decode(points).map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }));
        setRouteCoordinates(coordinates);

        const steps = data.routes[0].legs[0].steps;
        const directions = steps.map((step: Step) => {
          const direction = getDirectionFromManeuver(step.maneuver);
          const distance = step.distance.text;
          const instruction = step.html_instructions.replace(/<[^>]+>/g, '');
          return `${direction} (${distance}): ${instruction}`;
        });
        setDirectionsText(directions.join('\n'));
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const getDirectionFromManeuver = (maneuver?: string) => {
    if (!maneuver) return 'Straight';
    switch (maneuver) {
      case 'turn-left':
        return 'Left';
      case 'turn-right':
        return 'Right';
      case 'turn-sharp-left':
        return 'Sharp Left';
      case 'turn-sharp-right':
        return 'Sharp Right';
      case 'uturn-left':
      case 'uturn-right':
        return 'U-turn';
      case 'straight':
        return 'Straight';
      default:
        return 'Continue';
    }
  };

  const sendDirections = async () => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No Bluetooth device connected.');
      return;
    }
  
    try {
      const isConnected = await connectedDevice.isConnected();
      if (!isConnected) {
        Alert.alert('Error', 'Bluetooth device is not connected.');
        return;
      }
  
      // Split the directions into an array (one per line)
      const directionsArray = directionsText.split('\n');
  
      // Loop through the array and send each direction one by one
      for (let direction of directionsArray) {
        await connectedDevice.write(direction + '\n'); // Send each line
        console.log('Sent:', direction);
      }
  
      Alert.alert('Success', 'Navigation data sent to device!');
    } catch (error) {
      console.error('Error sending directions:', error);
      Alert.alert('Error', 'Failed to send directions.');
    }
  };

  const handleFetchDirections = () => {
    if (!destination) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }
    fetchDirections(destination);
  };

  const startSimulation = () => {
    setSimulationActive(true);
    const mockDirections = [
      'Turn left in 200 meters.',
      'Continue straight for 1 kilometer.',
      'Turn right in 500 meters.',
      'You have reached your destination.',
    ];
    

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockDirections.length) {
        setDirectionsText(mockDirections[index]);
        index++;
      } else {
        clearInterval(interval);
        setSimulationActive(false);
      }
    }, 5000);
  };
  

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'Left':
      case 'Sharp Left':
        return <Text style={styles.icon}>←</Text>; // Left arrow icon
      case 'Right':
      case 'Sharp Right':
        return <Text style={styles.icon}>→</Text>; // Right arrow icon
      case 'U-turn':
        return <Text style={styles.icon}>↩️</Text>; // U-turn icon
      case 'Straight':
        return <Text style={styles.icon}>⬆️</Text>; // Up arrow icon
      default:
        return <Text style={styles.icon}>↗️</Text>; // Default arrow for others
    }
  };

  const recenterMap = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          } : {
            latitude: 25.2677, // Default location
            longitude: 82.9913,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {location && <Marker coordinate={location} title="Your Location" />}
          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="blue" />
          )}
        </MapView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableOpacity style={styles.button} onPress={handleFetchDirections}>
          <Text style={styles.buttonText}>Fetch Directions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setShowDirections(!showDirections)}>
          <Text style={styles.buttonText}>{showDirections ? 'Hide Directions' : 'Show Directions'}</Text>
        </TouchableOpacity>
        {connectedDevice && (
          <TouchableOpacity
            style={styles.button}
            onPress={simulationActive ? () => setSimulationActive(false) : startSimulation}
          >
            <Text style={styles.buttonText}>{simulationActive ? 'Stop Simulation' : 'Start Simulation'}</Text>
          </TouchableOpacity>
        )}

      <TouchableOpacity style={styles.button} onPress={recenterMap}>
        <Text style={styles.buttonText}>Recenter</Text>
      </TouchableOpacity>
      </View>

      {showDirections && (
        <ScrollView style={styles.directionsContainer}>
          {directionsText.split('\n').map((direction, index) => {
            const [maneuver, distance] = direction.split(':');
            const icon = getManeuverIcon(maneuver.trim());

            return (
              <View style={styles.directionStep} key={index}>
                <View style={styles.directionIconContainer}>
                  {icon}
                </View>
                <View style={styles.directionTextContainer}>
                  <Text style={styles.directionText}>{maneuver}</Text>
                  <Text style={styles.directionDistance}>{distance}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.sendButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={sendDirections}>
          <Text style={styles.buttonText}>Send Directions to Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slight transparency
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slight transparency
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  directionsContainer: {
    position: 'absolute',
    bottom: 250,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slight transparency
    padding: 15,
    borderRadius: 10,
    maxHeight: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  directionsText: {
    fontSize: 16,
    color: 'black',
  },
  sendButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slight transparency
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  icon: {
    color: '#fff',
    fontSize: 18,
  },
  directionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  directionIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#3498db',
    borderRadius: 15,
    padding: 5,
  },
  directionTextContainer: {
    flex: 1,
  },
  directionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  directionDistance: {
    fontSize: 14,
    color: '#555',
  },
});

export default MapScreen;

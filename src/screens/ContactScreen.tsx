import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { pickContact } from 'react-native-contact-pick';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBluetooth } from '../screens/BluetoothContext';

interface Contact {
  fullName: string;
  phoneNumbers: { type: string; number: string }[] | null;
}

const ContactScreen: React.FC = () => {
  const { connectedDevice } = useBluetooth(); // Get Bluetooth device state
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadContacts();
    requestPermissions();
  }, []);

  // 🟢 Load contacts from AsyncStorage
  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('contacts');
      if (savedContacts) setContacts(JSON.parse(savedContacts));
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // 🟢 Request Android permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      ]);
    }
  };

  // 🟢 Send caller name via Bluetooth (you can modify this to use a custom Bluetooth module for sending data)
  const sendCallerID = async (callerName: string) => {
    try {
      if (connectedDevice) {
        await connectedDevice.write(`Incoming Call: ${callerName}\n`);
        console.log(`Sent Caller Name: ${callerName} to Bluetooth`);
      } else {
        console.log('No Bluetooth device connected');
      }
    } catch (error) {
      console.error('Error sending caller ID:', error);
    }
  };

  // 🟢 Pick a contact & save it
  const pickNewContact = async () => {
    try {
      const res = await pickContact();
      if (res) {
        const updatedContacts = [...contacts, res];
        setContacts(updatedContacts);
        await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
      }
    } catch (error) {
      console.error('Error picking contact:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickNewContact}>
        <Text style={styles.buttonText}>Pick a Contact</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.contactList}>
        {contacts.length > 0 ? (
          contacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <Text style={styles.contactName}>{contact.fullName}</Text>
              {contact.phoneNumbers && <Text style={styles.contactInfo}>Phone: {contact.phoneNumbers[0].number}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.noContactsText}>No contacts selected yet</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f7f7f7' },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  contactList: { paddingBottom: 20 },
  contactCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  contactName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  contactInfo: { fontSize: 14, color: '#555' },
  noContactsText: { textAlign: 'center', fontSize: 16, color: '#888' },
});

export default ContactScreen;

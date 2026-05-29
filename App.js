import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';
import { loadInitialState, saveState } from './src/services/storageService';

const mqtt = new MQTTService();

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadInitialState().then((saved) => {
      setTemp(saved.temp);
      setHum(saved.hum);
      setIsLightOn(saved.isLightOn);
      setLastUpdated(saved.lastUpdated);
      setLoaded(true);
    });
  }, [])

  useEffect(() => {
    if (loaded) {
      saveState({ temp, hum, isLightOn });
    }
  }, [temp, hum, isLightOn])

  const mqttConfig = {
    host: process.env.EXPO_PUBLIC_MQTT_HOST,
    port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
    path: process.env.EXPO_PUBLIC_MQTT_PATH || '/mqtt',
    user: process.env.EXPO_PUBLIC_MQTT_USER,
    pass: process.env.EXPO_PUBLIC_MQTT_PASS,
    clientId: 'RN_App_' + Math.random(),
  };

  useEffect(() => {
    startConnection();
  }, [])

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if (topic === 'casa/temp') setTemp(parseFloat(message));
        if (topic === 'casa/umid') setHum(parseFloat(message));
        if (topic === 'casa/luz') setIsLightOn(message === "1");
        setLastUpdated(Date.now());
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/umid');
        mqtt.subscribe('casa/luz');
      },
      (err) => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
  }

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>

      <LightControl isLightOn={isLightOn} onToggle={toggleLight}/>
      <Gauges temp={temp} hum={hum} lastUpdated={lastUpdated}/>

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center'
  },
  center: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20
  },
});
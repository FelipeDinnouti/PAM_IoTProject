import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, AppState } from 'react-native';
import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';
import TemperatureChart from './src/components/TemperatureChart';
import HumidityChart from './src/components/HumidityChart';
import LightTimeline from './src/components/LightTimeline';
import { loadInitialState, saveState } from './src/services/storageService';
import { fetchHistory } from './src/services/apiService';

const mqtt = new MQTTService();
const POLL_INTERVAL = 30000;

const mqttConfig = {
  host: process.env.EXPO_PUBLIC_MQTT_HOST,
  port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT) || 8884,
  path: process.env.EXPO_PUBLIC_MQTT_PATH || '/mqtt',
  user: process.env.EXPO_PUBLIC_MQTT_USER,
  pass: process.env.EXPO_PUBLIC_MQTT_PASS,
  clientId: 'RN_App_' + Math.random(),
};
const configValid = !!(mqttConfig.host && mqttConfig.user && mqttConfig.pass);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tempHistory, setTempHistory] = useState([]);
  const [humHistory, setHumHistory] = useState([]);
  const [lightHistory, setLightHistory] = useState([]);
  const [isForeground, setIsForeground] = useState(true);

  const pollRef = useRef(null);

  useEffect(() => {
    loadInitialState().then((saved) => {
      setTemp(saved.temp);
      setHum(saved.hum);
      setIsLightOn(saved.isLightOn);
      setLastUpdated(saved.lastUpdated);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      saveState({ temp, hum, isLightOn });
    }
  }, [temp, hum, isLightOn]);

  useEffect(() => {
    if (!configValid) {
      setShowError(true);
      return;
    }
    startConnection();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      mqtt.disconnect();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setIsForeground(nextAppState === 'active');
    });
    return () => subscription.remove();
  }, []);

  const startConnection = () => {
    if (!configValid) {
      setShowError(true);
      return;
    }
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

  const pollHistory = useCallback(async () => {
    const [tempData, humData, lightData] = await Promise.all([
      fetchHistory('temp', 50),
      fetchHistory('umid', 50),
      fetchHistory('luz', 100),
    ]);
    if (tempData.length) setTempHistory(tempData);
    if (humData.length) setHumHistory(humData);
    if (lightData.length) setLightHistory(lightData);
  }, []);

  useEffect(() => {
    if (!isConnected || !isForeground) return;
    pollHistory();
    pollRef.current = setInterval(pollHistory, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isConnected, isForeground, pollHistory]);

  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    setIsLightOn(!isLightOn);
    mqtt.publish('casa/luz', newState);
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>

      <LightControl isLightOn={isLightOn} onToggle={toggleLight} />
      <Gauges temp={temp} hum={hum} lastUpdated={lastUpdated} />
      <TemperatureChart data={tempHistory} />
      <HumidityChart data={humHistory} />
      <LightTimeline data={lightHistory} />

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 20,
  },
});

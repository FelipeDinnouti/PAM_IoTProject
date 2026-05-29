import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

function timeAgo(timestamp, now = Date.now()) {
  if (!timestamp) return null;
  const seconds = Math.floor((now - timestamp) / 1000);
  if (seconds < 60) return 'Agora mesmo';
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return 'Há 1 min';
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Há 1 h';
  return `Há ${hours} h`;
}

export default function Gauges({ temp, hum, lastUpdated }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

    return (
        <>
        <View style={styles.row}>
            <View style={styles.gaugeBox}>
                <CircularProgress
                    value={temp}
                    radius={60}
                    title={'°C'}
                    titleColor={'#fff'}
                    activeStrokeColor={'#e74c3c'}
                    inActiveStrokeColor={'#2c3e50'}
                    textColor={'#fff'}
                />
                <Text style={styles.label}>Temperatura</Text>
            </View>

            <View style={styles.gaugeBox}>
                <CircularProgress
                    value={hum}
                    radius={60}
                    title={'%'}
                    titleColor={'#fff'}
                    activeStrokeColor={'#3498db'}
                    inActiveStrokeColor={'#2c3e50'}
                    textColor={'#fff'}
                />
                <Text style={styles.label}>Umidade</Text>
            </View>
        </View>
        {lastUpdated && (
            <Text style={styles.lastUpdate}>{timeAgo(lastUpdated, now)}</Text>
        )}
        </>
    );
}

const styles = StyleSheet.create({
    row: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    gaugeBox: {
        backgroundColor: '#1e1e1e',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        width: '48%',
    },
    label: {
        color: '#AAA',
        marginTop: 10, 
        fontSize: 14
    },
    lastUpdate: {
        color: '#666',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
    },
});
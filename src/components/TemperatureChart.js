import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TemperatureChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Temperatura</Text>
        <Text style={styles.empty}>Aguardando dados do servidor...</Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const labels = data.map(d => formatTime(d.timestamp));
  const step = Math.max(1, Math.floor(labels.length / 5));
  const displayLabels = labels.map((l, i) => (i % step === 0 ? l : ''));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Temperatura</Text>
      <LineChart
        data={{
          labels: displayLabels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 32}
        height={200}
        yAxisSuffix="°C"
        chartConfig={{
          backgroundColor: '#1e1e1e',
          backgroundGradientFrom: '#1e1e1e',
          backgroundGradientTo: '#1e1e1e',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
          labelColor: () => '#aaa',
          propsForDots: { r: '3', strokeWidth: '1', stroke: '#e74c3c' },
          propsForBackgroundLines: { stroke: '#333' },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  title: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    padding: 40,
    fontSize: 14,
  },
});

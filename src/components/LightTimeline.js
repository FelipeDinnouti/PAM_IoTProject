import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const TIMELINE_WIDTH = Dimensions.get('window').width - 72;

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function LightTimeline({ data }) {
  const segments = useMemo(() => {
    if (!data || data.length < 2) return [];

    const result = [];
    let currentValue = data[0].value;
    let startTs = data[0].timestamp;

    for (let i = 1; i < data.length; i++) {
      const { value, timestamp } = data[i];
      if (value !== currentValue) {
        result.push({ value: currentValue, startTs, endTs: data[i - 1].timestamp });
        currentValue = value;
        startTs = timestamp;
      }
    }
    result.push({ value: currentValue, startTs, endTs: data[data.length - 1].timestamp });

    return result;
  }, [data]);

  if (!data || data.length < 2) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Luz — Timeline</Text>
        <Text style={styles.empty}>Aguardando dados do servidor...</Text>
      </View>
    );
  }

  const firstTs = data[0].timestamp;
  const lastTs = data[data.length - 1].timestamp;
  const duration = lastTs - firstTs;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Luz — Timeline</Text>
      <Svg width={TIMELINE_WIDTH} height={40}>
        {segments.map((seg, i) => {
          const x = duration > 0 ? ((seg.startTs - firstTs) / duration) * TIMELINE_WIDTH : 0;
          const w = duration > 0
            ? Math.max(2, ((seg.endTs - seg.startTs) / duration) * TIMELINE_WIDTH)
            : TIMELINE_WIDTH;
          return (
            <Rect
              key={i}
              x={x}
              y={8}
              width={w}
              height={24}
              rx={4}
              ry={4}
              fill={seg.value === 1 ? '#F1C40F' : '#333'}
            />
          );
        })}
      </Svg>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>{formatTime(firstTs)}</Text>
        <Text style={styles.timeLabel}>agora</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F1C40F' }]} />
          <Text style={styles.legendText}>Ligada</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#333' }]} />
          <Text style={styles.legendText}>Desligada</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
    width: '100%',
  },
  title: {
    color: '#F1C40F',
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeLabel: {
    color: '#666',
    fontSize: 11,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#aaa',
    fontSize: 12,
  },
});

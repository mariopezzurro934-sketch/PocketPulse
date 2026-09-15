import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.55;

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [peakCount, setPeakCount] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const lastPeak = useRef(0);

  useEffect(() => {
    let subscription;

    if (isActive) {
      Accelerometer.setUpdateInterval(80);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        // Magnitude of acceleration vector (remove gravity roughly)
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        // Normalize around 1g ≈ 1.0
        const motion = Math.max(0, magnitude - 0.95);
        const value = Math.min(1, motion * 2.2);
        setIntensity(value);

        // Peak detection for haptic + counter
        const now = Date.now();
        if (value > 0.35 && now - lastPeak.current > 280) {
          lastPeak.current = now;
          setPeakCount(c => c + 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Smooth pulse animation
        Animated.spring(scale, {
          toValue: 1 + value * 0.45,
          useNativeDriver: true,
          friction: 6,
          tension: 120
        }).start();
      });
    } else {
      scale.setValue(1);
      setIntensity(0);
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isActive]);

  const toggle = () => {
    if (!isActive) {
      setPeakCount(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsActive(!isActive);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Pocket Pulse</Text>
        <Text style={styles.subtitle}>Il battito del tuo telefono</Text>
      </View>

      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale }],
              backgroundColor: isActive
                ? `rgba(99, 102, 241, ${0.25 + intensity * 0.55})`
                : 'rgba(99, 102, 241, 0.15)'
            }
          ]}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.heart}>♥</Text>
            <Text style={styles.intensityText}>
              {isActive ? Math.round(intensity * 100) : '--'}
            </Text>
            <Text style={styles.unit}>intensità</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statLabel}>Picchi rilevati</Text>
        <Text style={styles.statValue}>{peakCount}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={toggle}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {isActive ? 'Ferma' : 'Avvia Pulse'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Muovi o scuoti leggermente il telefono\nper vedere il battito reagire in tempo reale.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24
  },
  header: {
    alignItems: 'center',
    marginTop: 12
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e2e8f0',
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)'
  },
  innerCircle: {
    width: CIRCLE_SIZE * 0.72,
    height: CIRCLE_SIZE * 0.72,
    borderRadius: (CIRCLE_SIZE * 0.72) / 2,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heart: {
    fontSize: 32,
    color: '#818cf8',
    marginBottom: 4
  },
  intensityText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#e2e8f0'
  },
  unit: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  stats: {
    alignItems: 'center',
    marginBottom: 16
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#c7d2fe',
    marginTop: 2
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12
  },
  buttonActive: {
    backgroundColor: '#4f46e5'
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600'
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 18
  }
});

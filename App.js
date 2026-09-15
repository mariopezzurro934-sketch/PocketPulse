import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.52;
const STORAGE_KEY = '@pocket_pulse_sessions';

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [peakCount, setPeakCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);

  const scale = useRef(new Animated.Value(1)).current;
  const lastPeak = useRef(0);

  // Carica le sessioni salvate all'avvio
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSessions(JSON.parse(raw));
      }
    } catch (e) {
      console.log('Errore caricamento sessioni', e);
    }
  };

  const saveSession = async (newSession) => {
    try {
      const updated = [newSession, ...sessions].slice(0, 50); // max 50 sessioni
      setSessions(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log('Errore salvataggio sessione', e);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Cancella cronologia',
      'Vuoi eliminare tutte le sessioni salvate?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            setSessions([]);
            await AsyncStorage.removeItem(STORAGE_KEY);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  useEffect(() => {
    let subscription;

    if (isActive) {
      Accelerometer.setUpdateInterval(80);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const motion = Math.max(0, magnitude - 0.95);
        const value = Math.min(1, motion * 2.2);
        setIntensity(value);

        const now = Date.now();
        if (value > 0.35 && now - lastPeak.current > 280) {
          lastPeak.current = now;
          setPeakCount(c => c + 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

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

  const toggle = async () => {
    if (!isActive) {
      // Avvia nuova sessione
      setPeakCount(0);
      setSessionStart(Date.now());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsActive(true);
    } else {
      // Ferma e salva
      const end = Date.now();
      const durationSec = Math.round((end - (sessionStart || end)) / 1000);

      if (durationSec > 2 || peakCount > 0) {
        const newSession = {
          id: end.toString(),
          date: new Date(end).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          duration: durationSec,
          peaks: peakCount
        };
        await saveSession(newSession);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsActive(false);
      setSessionStart(null);
    }
  };

  const formatDuration = (sec) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // ========== CRONOLOGIA ==========
  if (showHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Cronologia</Text>
          <Text style={styles.subtitle}>{sessions.length} sessioni salvate</Text>
        </View>

        <ScrollView style={styles.historyList} contentContainerStyle={{ paddingBottom: 20 }}>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>Nessuna sessione ancora.\nAvvia un Pulse per iniziare.</Text>
          ) : (
            sessions.map((s) => (
              <View key={s.id} style={styles.sessionCard}>
                <View>
                  <Text style={styles.sessionDate}>{s.date}</Text>
                  <Text style={styles.sessionMeta}>
                    Durata: {formatDuration(s.duration)}
                  </Text>
                </View>
                <View style={styles.peakBadge}>
                  <Text style={styles.peakBadgeText}>{s.peaks}</Text>
                  <Text style={styles.peakBadgeLabel}>picchi</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.historyButtons}>
          {sessions.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Text style={styles.clearButtonText}>Cancella tutto</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.buttonText}>Torna al Pulse</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========== SCHERMATA PRINCIPALE ==========
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
          {isActive ? 'Ferma e Salva' : 'Avvia Pulse'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyLink}
        onPress={() => setShowHistory(true)}
      >
        <Text style={styles.historyLinkText}>
          Cronologia ({sessions.length})
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
    paddingVertical: 20
  },
  header: {
    alignItems: 'center',
    marginTop: 8
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e2e8f0',
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 3
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
    fontSize: 30,
    color: '#818cf8',
    marginBottom: 2
  },
  intensityText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#e2e8f0'
  },
  unit: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  stats: {
    alignItems: 'center',
    marginBottom: 12
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8'
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#c7d2fe',
    marginTop: 1
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 44,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 8
  },
  buttonActive: {
    backgroundColor: '#4f46e5'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  historyLink: {
    paddingVertical: 8
  },
  historyLinkText: {
    color: '#818cf8',
    fontSize: 14
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 28,
    lineHeight: 17,
    marginBottom: 4
  },
  // History styles
  historyList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 12
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    lineHeight: 22
  },
  sessionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  sessionDate: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600'
  },
  sessionMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 3
  },
  peakBadge: {
    backgroundColor: '#312e81',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center'
  },
  peakBadgeText: {
    color: '#c7d2fe',
    fontSize: 18,
    fontWeight: '700'
  },
  peakBadgeLabel: {
    color: '#a5b4fc',
    fontSize: 10
  },
  historyButtons: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10
  },
  clearButton: {
    paddingVertical: 10
  },
  clearButtonText: {
    color: '#f87171',
    fontSize: 14
  }
});

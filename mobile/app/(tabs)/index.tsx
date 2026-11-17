import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';

export default function DashboardScreen() {
  const { beneficiarioData } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    pendientes: 0,
    enProceso: 0,
    entregados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (beneficiarioData) {
      fetchStats();
    }
  }, [beneficiarioData]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/beneficiario-movil/${beneficiarioData?.codigoBeneficiario}`
      );
      const data = await response.json();

      if (data.success && data.data?.solicitudesAyuda) {
        const solicitudes = data.data.solicitudesAyuda;
        setStats({
          pendientes: solicitudes.filter((s: any) => s.estado === 'PENDIENTE').length,
          enProceso: solicitudes.filter((s: any) => s.estado === 'EN_PROCESO').length,
          entregados: solicitudes.filter((s: any) => s.estado === 'ENTREGADO').length,
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const pacienteNombre = beneficiarioData?.paciente?.nombreCompletoNino || 'Beneficiario';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6347']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Bienvenido</Text>
          <Text style={styles.userName}>{pacienteNombre}</Text>
          <Text style={styles.userCode}>{beneficiarioData?.codigoBeneficiario}</Text>
        </View>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={40} color="#FF6347" />
        </View>
      </View>

      {/* Quick Stats */}
      {!loading && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="hourglass-outline" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="sync-outline" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{stats.entregados}</Text>
            <Text style={styles.statLabel}>Entregados</Text>
          </View>
        </View>
      )}

      {/* Main Navigation Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.navigationCard, { backgroundColor: '#FF6347' }]}
          onPress={() => router.push('/historial')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="list-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Historial de Ayudas</Text>
          <Text style={styles.cardDescription}>
            Consulta todas tus solicitudes de ayuda
          </Text>
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navigationCard, { backgroundColor: '#2196F3' }]}
          onPress={() => router.push('/notificaciones')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="notifications-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Notificaciones</Text>
          <Text style={styles.cardDescription}>
            Revisa las actualizaciones importantes
          </Text>
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navigationCard, { backgroundColor: '#4CAF50' }]}
          onPress={() => router.push('/perfil')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name="person-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Mi Perfil</Text>
          <Text style={styles.cardDescription}>
            Información personal y médica
          </Text>
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={32} color="#FF6347" />
          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>¿Necesitas Ayuda?</Text>
            <Text style={styles.helpDescription}>
              Contacta a tu trabajador social asignado para cualquier consulta
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userCode: {
    fontSize: 14,
    color: '#FF6347',
    fontWeight: '600',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  navigationCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  helpSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6347',
  },
  helpText: {
    flex: 1,
    marginLeft: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

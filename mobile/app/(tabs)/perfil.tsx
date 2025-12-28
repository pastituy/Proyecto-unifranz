import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';

export default function PerfilScreen() {
  const { userData, beneficiarioData, logout } = useUser();
  const router = useRouter();
  const [beneficiarioCompleto, setBeneficiarioCompleto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (beneficiarioData) {
      fetchBeneficiarioCompleto();
    }
  }, [beneficiarioData]);

  const fetchBeneficiarioCompleto = async () => {
    try {
      const response = await fetch(
        `${API_URL}/beneficiario-movil/${beneficiarioData?.codigoBeneficiario}`
      );
      const data = await response.json();

      if (data.success) {
        setBeneficiarioCompleto(data.data);
      }
    } catch (error) {
      console.error('Error al cargar beneficiario:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBeneficiarioCompleto();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle" size={64} color="#FF6347" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  const paciente = beneficiarioCompleto?.pacienteRegistro;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6347']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>{paciente?.nombreCompletoNino}</Text>
          <Text style={styles.headerSubtitle}>
            {beneficiarioData?.codigoBeneficiario}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.statusText}>
              {beneficiarioCompleto?.estadoBeneficiario}
            </Text>
          </View>
        </View>
      </View>

      {/* Información del Paciente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medical-outline" size={24} color="#FF6347" />
          <Text style={styles.sectionTitle}>Información del Paciente</Text>
        </View>

        <InfoRow icon="person-outline" label="Nombre Completo" value={paciente?.nombreCompletoNino} />
        <InfoRow icon="calendar-outline" label="Edad" value={`${paciente?.edad} años`} />
        <InfoRow icon="pulse-outline" label="Diagnóstico" value={paciente?.diagnostico} />

        {beneficiarioCompleto?.nombreMedicoTratante && (
          <>
            <InfoRow icon="medkit-outline" label="Médico Tratante" value={beneficiarioCompleto.nombreMedicoTratante} />
            <InfoRow icon="school-outline" label="Especialidad" value={beneficiarioCompleto.especialidadMedico} />
            <InfoRow icon="business-outline" label="Institución Médica" value={beneficiarioCompleto.institucionMedica} />
          </>
        )}

        {beneficiarioCompleto?.faseTratamiento && (
          <InfoRow icon="stats-chart-outline" label="Fase de Tratamiento" value={beneficiarioCompleto.faseTratamiento} />
        )}
      </View>

      {/* Información del Tutor */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={24} color="#FF6347" />
          <Text style={styles.sectionTitle}>Información del Tutor</Text>
        </View>

        <InfoRow icon="person-outline" label="Nombre Completo" value={paciente?.nombreCompletoTutor} />
        <InfoRow icon="card-outline" label="CI" value={paciente?.ciTutor} />
        <InfoRow icon="heart-outline" label="Parentesco" value={paciente?.parentesco} />
        <InfoRow icon="call-outline" label="Teléfono" value={paciente?.telefonoTutor} />
        <InfoRow icon="location-outline" label="Dirección" value={paciente?.direccion} />
        {paciente?.emailTutor && (
          <InfoRow icon="mail-outline" label="Email" value={paciente.emailTutor} />
        )}
      </View>

      {/* Trabajador Social Asignado */}
      {beneficiarioCompleto?.asignadoA && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={24} color="#FF6347" />
            <Text style={styles.sectionTitle}>Trabajador Social Asignado</Text>
          </View>

          <InfoRow icon="person-outline" label="Nombre" value={beneficiarioCompleto.asignadoA.nombre} />
          <InfoRow icon="mail-outline" label="Email" value={beneficiarioCompleto.asignadoA.email} />
          <InfoRow icon="call-outline" label="Teléfono" value={beneficiarioCompleto.asignadoA.telefono} />
        </View>
      )}

      {/* Información de Registro */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={24} color="#FF6347" />
          <Text style={styles.sectionTitle}>Información de Registro</Text>
        </View>

        <InfoRow
          icon="calendar-outline"
          label="Fecha de Nacimiento"
          value={new Date(paciente?.fechaNacimiento).toLocaleDateString('es-ES')}
        />
        <InfoRow
          icon="checkmark-circle-outline"
          label="Fecha de Aceptación"
          value={new Date(beneficiarioCompleto?.fechaAceptacion).toLocaleDateString('es-ES')}
        />
        <InfoRow icon="fitness-outline" label="Estado del Beneficiario" value={beneficiarioCompleto?.estadoBeneficiario} />
        <InfoRow icon="heart-circle-outline" label="Estado Médico" value={beneficiarioCompleto?.estadoMedico} />
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButtonFull} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#F44336" />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const InfoRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon} size={18} color="#999" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FF6347',
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6347',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  logoutButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 10,
  },
});

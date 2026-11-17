import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';

const { width } = Dimensions.get('window');

const ESTADO_CONFIG: any = {
  PENDIENTE: {
    label: 'Pendiente',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: 'hourglass-outline',
    description: 'En espera de revisión',
  },
  RECEPCIONADO: {
    label: 'En Proceso',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    icon: 'sync-outline',
    description: 'Procesando su solicitud',
  },
  ENTREGADO: {
    label: 'Entregado',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    icon: 'checkmark-done-circle-outline',
    description: 'Listo para recoger',
  },
  RECHAZADO: {
    label: 'Rechazado',
    color: '#F44336',
    bgColor: '#FFEBEE',
    icon: 'close-circle-outline',
    description: 'No aprobado',
  },
};

const TIPO_AYUDA_CONFIG: any = {
  MEDICAMENTOS: {
    label: 'Medicamentos',
    icon: 'medical-outline',
    color: '#E91E63'
  },
  QUIMIOTERAPIA: {
    label: 'Quimioterapia',
    icon: 'flask-outline',
    color: '#9C27B0'
  },
  ANALISIS_EXAMENES: {
    label: 'Análisis/Exámenes',
    icon: 'newspaper-outline',
    color: '#3F51B5'
  },
  OTRO: {
    label: 'Otros',
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#607D8B'
  },
};

export default function HistorialScreen() {
  const { beneficiarioData } = useUser();
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('TODAS');

  useEffect(() => {
    if (beneficiarioData) {
      fetchSolicitudes();
    }
  }, [beneficiarioData]);

  const fetchSolicitudes = async () => {
    try {
      const response = await fetch(
        `${API_URL}/beneficiario-solicitudes/${beneficiarioData?.id}`
      );
      const data = await response.json();

      if (data.success) {
        setSolicitudes(data.data);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const solicitudesFiltradas =
    selectedFilter === 'TODAS'
      ? solicitudes
      : solicitudes.filter((s) => s.estado === selectedFilter);

  const handleOpenPDF = (filename: string) => {
    const url = `${API_URL}/uploads/${filename}`;
    Linking.openURL(url);
  };

  const getEstadisticas = () => {
    return {
      pendientes: solicitudes.filter(s => s.estado === 'PENDIENTE').length,
      proceso: solicitudes.filter(s => s.estado === 'RECEPCIONADO').length,
      entregados: solicitudes.filter(s => s.estado === 'ENTREGADO').length,
    };
  };

  const stats = getEstadisticas();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="medical" size={48} color="#FF6347" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header mejorado con gradiente */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Mis Solicitudes</Text>
            <Text style={styles.headerSubtitle}>
              Historial de Ayudas Recibidas
            </Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalNumber}>{solicitudes.length}</Text>
          </View>
        </View>

        {/* Mini estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <View style={[styles.miniStatDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.miniStatText}>{stats.pendientes} Pendientes</Text>
          </View>
          <View style={styles.miniStat}>
            <View style={[styles.miniStatDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.miniStatText}>{stats.proceso} En proceso</Text>
          </View>
          <View style={styles.miniStat}>
            <View style={[styles.miniStatDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.miniStatText}>{stats.entregados} Listos</Text>
          </View>
        </View>
      </View>

      {/* Filtros mejorados */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {['TODAS', 'PENDIENTE', 'RECEPCIONADO', 'ENTREGADO'].map((filter) => {
            const config = filter !== 'TODAS' ? ESTADO_CONFIG[filter] : null;
            const count = filter === 'TODAS'
              ? solicitudes.length
              : solicitudes.filter(s => s.estado === filter).length;

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                {config && (
                  <Ionicons
                    name={config.icon}
                    size={16}
                    color={selectedFilter === filter ? '#fff' : config.color}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filter === 'TODAS' ? 'Todas' : config.label}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.filterBadge,
                    selectedFilter === filter && styles.filterBadgeActive
                  ]}>
                    <Text style={[
                      styles.filterBadgeText,
                      selectedFilter === filter && styles.filterBadgeTextActive
                    ]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de Solicitudes */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6347']} />
        }
      >
        {solicitudesFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-text-outline" size={64} color="#DDD" />
            </View>
            <Text style={styles.emptyTitle}>
              No hay solicitudes
              {selectedFilter !== 'TODAS' ? ' en este estado' : ''}
            </Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'TODAS'
                ? 'Tus solicitudes de ayuda aparecerán aquí'
                : 'No tienes solicitudes con este estado'}
            </Text>
          </View>
        ) : (
          solicitudesFiltradas.map((solicitud, index) => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              onOpenPDF={handleOpenPDF}
              index={index}
            />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const SolicitudCard = ({
  solicitud,
  onOpenPDF,
  index,
}: {
  solicitud: any;
  onOpenPDF: (filename: string) => void;
  index: number;
}) => {
  const estadoConfig = ESTADO_CONFIG[solicitud.estado];
  const tipoConfig = TIPO_AYUDA_CONFIG[solicitud.tipoAyuda];

  return (
    <View style={[styles.card, { opacity: 1, marginTop: index === 0 ? 0 : 12 }]}>
      {/* Header de la tarjeta con diseño mejorado */}
      <View style={[styles.cardHeader, { backgroundColor: estadoConfig.bgColor }]}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.cardIconContainer, { backgroundColor: estadoConfig.color }]}>
            <Ionicons name={estadoConfig.icon} size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.cardCode}>{solicitud.codigoSolicitud}</Text>
            <Text style={[styles.cardEstadoText, { color: estadoConfig.color }]}>
              {estadoConfig.description}
            </Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: estadoConfig.color }]}>
          <Text style={styles.statusPillText}>{estadoConfig.label}</Text>
        </View>
      </View>

      {/* Cuerpo de la tarjeta */}
      <View style={styles.cardBody}>
        {/* Tipo de Ayuda destacado */}
        <View style={styles.tipoAyudaBox}>
          <View style={[styles.tipoIconContainer, { backgroundColor: `${tipoConfig.color}15` }]}>
            <Ionicons name={tipoConfig.icon} size={24} color={tipoConfig.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipoLabel}>Tipo de Ayuda</Text>
            <Text style={[styles.tipoValue, { color: tipoConfig.color }]}>
              {tipoConfig.label}
            </Text>
          </View>
        </View>

        {/* Información en grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#999" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>
                {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name={solicitud.prioridad === 'URGENTE' ? 'alert-circle' : 'information-circle'}
              size={16}
              color={solicitud.prioridad === 'URGENTE' ? '#F44336' : '#999'}
            />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.infoLabel}>Prioridad</Text>
              <Text style={[
                styles.infoValue,
                solicitud.prioridad === 'URGENTE' && { color: '#F44336', fontWeight: 'bold' }
              ]}>
                {solicitud.prioridad}
              </Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        {solicitud.detalleSolicitud && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>
              {solicitud.detalleSolicitud}
            </Text>
          </View>
        )}

        {/* Información del Trabajador Social */}
        {solicitud.solicitadoPor && (
          <View style={styles.personCard}>
            <Ionicons name="person-circle-outline" size={24} color="#667eea" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.personLabel}>Solicitado por</Text>
              <Text style={styles.personName}>{solicitud.solicitadoPor.nombre}</Text>
              {solicitud.solicitadoPor.telefono && (
                <Text style={styles.personContact}>
                  📞 {solicitud.solicitadoPor.telefono}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Alertas según estado */}
        {solicitud.estado === 'RECEPCIONADO' && (
          <View style={styles.alertCard}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="sync" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Procesando Solicitud</Text>
              <Text style={styles.alertDescription}>
                Tu solicitud está siendo procesada por nuestro equipo
              </Text>
              {solicitud.instruccionesEntrega && (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsText}>
                    {solicitud.instruccionesEntrega}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {solicitud.estado === 'ENTREGADO' && (
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <Ionicons name="checkmark-done-circle" size={28} color="#4CAF50" />
              <Text style={styles.successTitle}>¡Ayuda Lista!</Text>
            </View>
            <Text style={styles.successText}>
              Puedes pasar a recoger tu ayuda
            </Text>
            {solicitud.costoReal && (
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Monto de la ayuda</Text>
                <Text style={styles.amountValue}>
                  Bs. {Number(solicitud.costoReal).toFixed(2)}
                </Text>
              </View>
            )}
            {solicitud.fechaEntrega && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.dateText}>
                  Entregado: {new Date(solicitud.fechaEntrega).toLocaleDateString('es-ES')}
                </Text>
              </View>
            )}
            {solicitud.instruccionesEntrega && (
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Instrucciones de retiro:</Text>
                <Text style={styles.instructionsDetail}>
                  {solicitud.instruccionesEntrega}
                </Text>
              </View>
            )}
          </View>
        )}

        {solicitud.estado === 'RECHAZADO' && solicitud.motivoRechazo && (
          <View style={styles.errorCard}>
            <Ionicons name="close-circle" size={24} color="#F44336" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.errorTitle}>Solicitud No Aprobada</Text>
              <Text style={styles.errorText}>
                {solicitud.motivoRechazo}
              </Text>
            </View>
          </View>
        )}

        {/* Botón PDF */}
        {solicitud.recetaPdf && (
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={() => onOpenPDF(solicitud.recetaPdf)}
            activeOpacity={0.8}
          >
            <View style={styles.pdfButtonContent}>
              <View style={styles.pdfIconCircle}>
                <Ionicons name="document-text" size={20} color="#FF6347" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pdfButtonTitle}>Ver Documento</Text>
                <Text style={styles.pdfButtonSubtitle}>Receta o documento adjunto</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
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
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  miniStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },
  filtersWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardEstadoText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  tipoAyudaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tipoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  tipoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  personLabel: {
    fontSize: 11,
    color: '#667eea',
    marginBottom: 2,
  },
  personName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  personContact: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 2,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  instructionsBox: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 12,
  },
  amountCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 12,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  instructionsDetail: {
    fontSize: 13,
    color: '#2E7D32',
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#C62828',
    lineHeight: 18,
  },
  pdfButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  pdfIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pdfButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pdfButtonSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

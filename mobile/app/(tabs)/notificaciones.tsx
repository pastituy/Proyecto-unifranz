import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '@/config/api';

export default function NotificacionesScreen() {
  const { userData } = useUser();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchNotificaciones();
    }
  }, [userData]);

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch(
        `${API_URL}/beneficiario-notificaciones/${userData?.id}`
      );
      const data = await response.json();

      if (data.success) {
        setNotificaciones(data.data.notificaciones);
        setNoLeidas(data.data.noLeidas);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificaciones();
  };

  const marcarComoLeida = async (notificacionId: number) => {
    try {
      await fetch(`${API_URL}/marcar-notificacion-leida/${notificacionId}`, {
        method: 'PUT',
      });
      fetchNotificaciones(); // Recargar después de marcar
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const renderNotificacion = ({ item }: { item: any }) => {
    const prioridad = item.prioridad || 'normal';
    const prioridadColor =
      prioridad === 'alta'
        ? '#F44336'
        : prioridad === 'urgente'
        ? '#E91E63'
        : '#2196F3';

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.leida && styles.notificationCardUnread,
        ]}
        onPress={() => !item.leida && marcarComoLeida(item.id)}
      >
        <View style={styles.notificationHeader}>
          <View style={[styles.priorityDot, { backgroundColor: prioridadColor }]} />
          <View style={styles.notificationHeaderText}>
            <Text style={styles.notificationTitle}>{item.titulo}</Text>
            <Text style={styles.notificationDate}>
              {new Date(item.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {!item.leida && (
            <View style={styles.unreadBadge}>
              <Ionicons name="ellipse" size={12} color="#FF6347" />
            </View>
          )}
        </View>

        <Text style={styles.notificationMessage}>{item.mensaje}</Text>

        {item.tipo && (
          <View style={styles.typeContainer}>
            <Ionicons
              name={getIconForType(item.tipo)}
              size={16}
              color={prioridadColor}
            />
            <Text style={[styles.typeText, { color: prioridadColor }]}>
              {getTipoLabel(item.tipo)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="notifications" size={28} color="#fff" />
          {noLeidas > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{noLeidas}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
          </Text>
        </View>
      </View>

      {/* Lista de Notificaciones */}
      {notificaciones.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={80} color="#ddd" />
          <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
          <Text style={styles.emptySubtitle}>
            Cuando recibas notificaciones importantes aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          renderItem={renderNotificacion}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const getIconForType = (tipo: string): any => {
  const icons: any = {
    beneficiario_aceptado: 'checkmark-circle',
    solicitud_recepcionada: 'checkmark-done',
    ayuda_entregada: 'gift',
    solicitud_rechazada: 'close-circle',
  };
  return icons[tipo] || 'information-circle';
};

const getTipoLabel = (tipo: string): string => {
  const labels: any = {
    beneficiario_aceptado: 'Caso Aceptado',
    solicitud_recepcionada: 'Solicitud Recepcionada',
    ayuda_entregada: 'Ayuda Entregada',
    solicitud_rechazada: 'Solicitud Rechazada',
  };
  return labels[tipo] || tipo;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF6347',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: '#FF6347',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#FFF8F5',
    borderLeftColor: '#FF6347',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 8,
  },
  notificationHeaderText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6347',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Ocultar la barra de pestañas
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarButton: () => null, // Ocultar botón de la tab
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Notificaciones',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}

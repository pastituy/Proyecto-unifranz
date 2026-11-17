# 📱 Mobile App - Setup Guide

Aplicación móvil de Fundación OncoFeliz construida con **React Native** y **Expo**.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd mobile
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
API_URL=http://localhost:3000
# Agrega otras variables según sea necesario
```

### 3. Iniciar el servidor de desarrollo

```bash
npm start
# o
npx expo start
```

## 📋 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo de Expo
- `npm run android` - Inicia en emulador Android
- `npm run ios` - Inicia en simulador iOS (solo macOS)
- `npm run web` - Inicia versión web

## 🔧 Estructura del Proyecto

```
mobile/
├── app/              # Pantallas y navegación (Expo Router)
├── assets/           # Imágenes, fuentes, etc.
├── config/           # Configuraciones de la app
├── context/          # Contextos de React
├── .env.example      # Variables de entorno de ejemplo
├── .gitignore        # Archivos ignorados por Git
└── package.json      # Dependencias del proyecto
```

## ⚠️ Importante

- **NO** subir el archivo `.env` a Git
- **NO** subir credenciales o API keys
- **NO** subir `node_modules/`
- **NO** subir archivos `.keystore` o certificados

## 🔐 Archivos Sensibles

Los siguientes archivos están en `.gitignore` y **NUNCA** deben subirse:

- `.env` - Variables de entorno
- `*.keystore` / `*.jks` - Keystores de Android
- `google-services.json` - Configuración de Firebase
- `GoogleService-Info.plist` - Configuración de Firebase iOS
- `node_modules/` - Dependencias npm

## 📱 Build de Producción

### Android

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

## 🐛 Troubleshooting

### Error: Cannot find module

```bash
rm -rf node_modules
npm install
```

### Cache de Expo

```bash
npx expo start -c
```

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

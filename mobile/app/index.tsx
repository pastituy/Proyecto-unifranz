import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useUser } from "@/context/userContext";
import { useRouter } from "expo-router";
import { API_URL } from "@/config/api";

const Login = () => {
  const { login } = useUser();
  const router = useRouter();
  const [codigoBeneficiario, setCodigoBeneficiario] = useState("");
  const [ci, setCi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!codigoBeneficiario.trim() || !ci.trim()) {
      Alert.alert("Error", "Por favor complete todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mobile-beneficiario-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigoBeneficiario: codigoBeneficiario.toUpperCase(),
          ci
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.mensaje || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      if (data.success) {
        login(data.data, data.token);
        // Navegar a la pantalla principal (tabs)
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", data.mensaje || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Hubo un problema al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Fundación <Text style={styles.accent}>OncoFeliz</Text>
        </Text>
        <Text style={styles.subtitle}>Acceso para Beneficiarios</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Código de Beneficiario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: B001"
          autoCapitalize="characters"
          value={codigoBeneficiario}
          onChangeText={setCodigoBeneficiario}
          editable={!loading}
        />

        <Text style={styles.label}>CI del Tutor</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su CI"
          keyboardType="numeric"
          value={ci}
          onChangeText={setCi}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Si no tienes tu código de beneficiario, contacta con la fundación.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7f6",
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  accent: {
    color: "#FF6347",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    width: "100%",
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#FF6347",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#FFB8A8",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    color: "#1976D2",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});

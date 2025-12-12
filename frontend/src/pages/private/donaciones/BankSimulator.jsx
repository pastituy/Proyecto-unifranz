import React, { useState } from "react";
import styled from "styled-components";
import QrScanner from "qr-scanner";

const BankSimulator = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Procesar QR escaneado
  const processQRData = async (qrDataString) => {
    try {
      const qrData = JSON.parse(qrDataString);

      // Validar que sea un QR de donación válido
      if (qrData.type !== 'donation' || !qrData.transactionId || !qrData.amount) {
        setError("Código QR inválido. No es una transacción de donación.");
        return;
      }

      setScannedData(qrData);
      setProcessing(true);
      setError("");

      // Simular tiempo de procesamiento bancario (2-4 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // Simular 90% de éxito, 10% de fallo
      const success = Math.random() > 0.1;

      if (success) {
        // Notificar al sistema principal del pago exitoso
        await notifyPaymentSuccess(qrData);
        setResult({
          success: true,
          message: "Pago procesado exitosamente",
          transactionId: qrData.transactionId
        });
      } else {
        setResult({
          success: false,
          message: "Pago rechazado por fondos insuficientes",
          transactionId: qrData.transactionId
        });
      }

      setProcessing(false);
    } catch (err) {
      setError("Error al procesar el código QR: " + err.message);
      setProcessing(false);
    }
  };

  // Notificar al sistema principal (esto se comunicaría con el backend en producción)
  const notifyPaymentSuccess = async (qrData) => {
    // En un sistema real, esto enviaría una notificación al backend
    // Por ahora, usaremos localStorage para comunicación entre páginas
    const paymentConfirmation = {
      transactionId: qrData.transactionId,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      amount: qrData.amount,
      currency: qrData.currency
    };

    localStorage.setItem(`payment_${qrData.transactionId}`, JSON.stringify(paymentConfirmation));

    // Disparar evento personalizado para que la página de donaciones lo escuche
    window.dispatchEvent(new CustomEvent('paymentConfirmed', {
      detail: paymentConfirmation
    }));
  };

  // Manejar archivo de imagen QR cargado
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setScanning(true);

    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      await processQRData(result.data);
    } catch (err) {
      setError("No se pudo leer el código QR de la imagen. Asegúrate de que sea un QR válido.");
    } finally {
      setScanning(false);
    }
  };

  // Manejar captura de cámara
  const handleCameraCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setScanning(true);

    try {
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      await processQRData(result.data);
    } catch (err) {
      setError("No se pudo leer el código QR. Intenta nuevamente.");
    } finally {
      setScanning(false);
    }
  };

  // Reiniciar simulador
  const reset = () => {
    setScanning(false);
    setScannedData(null);
    setProcessing(false);
    setResult(null);
    setError("");
  };

  return (
    <Container>
      <BankHeader>
        <BankLogo>🏦</BankLogo>
        <BankName>Banco Simulado</BankName>
        <BankSubtitle>Simulador de Pagos QR</BankSubtitle>
      </BankHeader>

      <Content>
        {!scannedData && !processing && !result && (
          <ScanSection>
            <ScanTitle>Escanea un Código QR para Pagar</ScanTitle>
            <ScanDescription>
              Selecciona una imagen del código QR o toma una foto con tu cámara
            </ScanDescription>

            <ButtonGroup>
              <FileInputLabel htmlFor="file-upload">
                📁 Cargar Imagen QR
              </FileInputLabel>
              <FileInput
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />

              <FileInputLabel htmlFor="camera-capture">
                📷 Tomar Foto
              </FileInputLabel>
              <FileInput
                id="camera-capture"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
              />
            </ButtonGroup>

            {scanning && (
              <LoadingContainer>
                <Spinner />
                <LoadingText>Leyendo código QR...</LoadingText>
              </LoadingContainer>
            )}

            {error && (
              <ErrorBox>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorText>{error}</ErrorText>
                <RetryButton onClick={reset}>Intentar Nuevamente</RetryButton>
              </ErrorBox>
            )}

            <InfoBox>
              <strong>💡 Cómo usar este simulador:</strong>
              <ol>
                <li>Ve a la página de donaciones</li>
                <li>Genera un código QR de pago</li>
                <li>Toma una captura de pantalla del QR</li>
                <li>Vuelve aquí y carga esa imagen</li>
                <li>El sistema procesará el pago automáticamente</li>
              </ol>
            </InfoBox>
          </ScanSection>
        )}

        {processing && (
          <ProcessingSection>
            <ProcessingSpinner />
            <ProcessingTitle>Procesando Pago...</ProcessingTitle>
            <ProcessingDetails>
              <DetailRow>
                <DetailLabel>Monto:</DetailLabel>
                <DetailValue>{scannedData?.amount} {scannedData?.currency}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Beneficiario:</DetailLabel>
                <DetailValue>{scannedData?.beneficiary}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Donante:</DetailLabel>
                <DetailValue>{scannedData?.donorName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>ID Transacción:</DetailLabel>
                <DetailValue style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                  {scannedData?.transactionId}
                </DetailValue>
              </DetailRow>
            </ProcessingDetails>
            <ProcessingSubtext>Verificando con el banco...</ProcessingSubtext>
          </ProcessingSection>
        )}

        {result && (
          <ResultSection success={result.success}>
            {result.success ? (
              <>
                <ResultIcon>✓</ResultIcon>
                <ResultTitle>¡Pago Exitoso!</ResultTitle>
                <ResultMessage>
                  Tu pago de <strong>{scannedData?.amount} {scannedData?.currency}</strong> ha sido procesado correctamente.
                </ResultMessage>
                <ResultDetails>
                  <DetailRow>
                    <DetailLabel>Beneficiario:</DetailLabel>
                    <DetailValue>{scannedData?.beneficiary}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Donante:</DetailLabel>
                    <DetailValue>{scannedData?.donorName}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>ID Transacción:</DetailLabel>
                    <DetailValue style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                      {result.transactionId}
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Fecha:</DetailLabel>
                    <DetailValue>{new Date().toLocaleString('es-ES')}</DetailValue>
                  </DetailRow>
                </ResultDetails>
                <SuccessNote>
                  ✅ La página de donaciones se actualizará automáticamente
                </SuccessNote>
              </>
            ) : (
              <>
                <ResultIconFail>✕</ResultIconFail>
                <ResultTitleFail>Pago Rechazado</ResultTitleFail>
                <ResultMessage>
                  {result.message}
                </ResultMessage>
                <ResultDetails>
                  <DetailRow>
                    <DetailLabel>ID Transacción:</DetailLabel>
                    <DetailValue style={{ fontSize: '11px', wordBreak: 'break-all' }}>
                      {result.transactionId}
                    </DetailValue>
                  </DetailRow>
                </ResultDetails>
              </>
            )}
            <ButtonGroup style={{ marginTop: '20px' }}>
              <RetryButton onClick={reset}>Realizar Otro Pago</RetryButton>
            </ButtonGroup>
          </ResultSection>
        )}
      </Content>

      <Footer>
        <FooterText>🧪 Simulador de Banco - Solo para Testing</FooterText>
        <FooterNote>Este simulador permite probar el flujo de pagos QR sin un banco real</FooterNote>
      </Footer>
    </Container>
  );
};

export default BankSimulator;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  flex-direction: column;
`;

const BankHeader = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const BankLogo = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
`;

const BankName = styled.h1`
  color: white;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
`;

const BankSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 5px 0 0 0;
  font-size: 14px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ScanSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ScanTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
  text-align: center;
`;

const ScanDescription = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 14px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 15px;
  color: #666;
  font-size: 14px;
`;

const ErrorBox = styled.div`
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
`;

const ErrorIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const ErrorText = styled.p`
  color: #c62828;
  margin: 0 0 15px 0;
  font-size: 14px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #5568d3;
  }
`;

const InfoBox = styled.div`
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 16px;
  border-radius: 6px;
  margin-top: 20px;

  strong {
    display: block;
    margin-bottom: 10px;
    color: #2e7d32;
  }

  ol {
    margin: 0;
    padding-left: 20px;
    color: #555;
    font-size: 13px;
    line-height: 1.6;
  }

  li {
    margin-bottom: 5px;
  }
`;

const ProcessingSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ProcessingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #333;
`;

const ProcessingDetails = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #555;
  font-size: 13px;
`;

const DetailValue = styled.span`
  color: #333;
  font-size: 13px;
  text-align: right;
`;

const ProcessingSubtext = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const ResultSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ResultIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  margin: 0 auto 20px auto;
  animation: scaleIn 0.5s ease;

  @keyframes scaleIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const ResultIconFail = styled(ResultIcon)`
  background: #f44336;
`;

const ResultTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 26px;
  color: #4caf50;
  font-weight: 700;
`;

const ResultTitleFail = styled(ResultTitle)`
  color: #f44336;
`;

const ResultMessage = styled.p`
  color: #555;
  font-size: 15px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ResultDetails = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: left;
`;

const SuccessNote = styled.div`
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  color: #2e7d32;
  font-size: 13px;
  text-align: left;
`;

const Footer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FooterText = styled.p`
  color: white;
  margin: 0 0 5px 0;
  font-weight: 600;
  font-size: 14px;
`;

const FooterNote = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 12px;
`;

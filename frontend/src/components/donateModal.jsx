import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheck, FaCreditCard, FaQrcode, FaPaypal, FaMoneyBillWave, FaDownload } from 'react-icons/fa';
import QRCode from 'qrcode';

const DonateModal = ({ isOpen, onClose, selectedAmount }) => {
  const [formData, setFormData] = useState({
    nombreDonante: '',
    email: '',
    cantidad: selectedAmount || '',
    metodoPago: 'qr', // Siempre QR por defecto
    descripcion: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el flujo QR
  const [qrStep, setQrStep] = useState('form'); // form, qr, processing, success, error
  const [qrImage, setQrImage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [errorDetails, setErrorDetails] = useState({ title: '', message: '', technical: '' });

  // Solo QR disponible
  const metodosDisponibles = [
    { id: 'qr', nombre: 'Pago con QR', icon: <FaQrcode /> }
  ];

  const cantidadesSugeridas = ['100', '200', '500', '1000'];

  // Listener para confirmaciones de pago desde el simulador
  useEffect(() => {
    const handlePaymentConfirmed = (event) => {
      const confirmation = event.detail;
      if (confirmation.transactionId === transactionId && qrStep === 'qr') {
        console.log('[DonateModal] Pago confirmado desde banco simulador:', confirmation);
        setQrStep('processing');
        setTimeout(() => {
          setQrStep('success');
        }, 1500);
      }
    };

    window.addEventListener('paymentConfirmed', handlePaymentConfirmed);
    return () => window.removeEventListener('paymentConfirmed', handlePaymentConfirmed);
  }, [transactionId, qrStep]);

  // Limpiar intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      if (window.paymentCheckInterval) {
        clearInterval(window.paymentCheckInterval);
        window.paymentCheckInterval = null;
      }
    };
  }, []);

  // Generar código QR usando la API del BNB
  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails({ title: '', message: '', technical: '' });

      // Llamar al backend para generar QR con el BNB
      const response = await fetch('http://localhost:3000/api/bnb/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formData.cantidad,
          donor: formData.nombreDonante,
          email: formData.email,
          description: formData.descripcion || 'Donación general'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Error del servidor o del BNB
        setErrorDetails({
          title: 'Error al Generar Código QR',
          message: result.message || 'No se pudo generar el código QR. Por favor, intente nuevamente.',
          technical: `Código de error: ${response.status} | ${result.error || 'Error desconocido'}`
        });
        setQrStep('error');
        return;
      }

      // El BNB devuelve la imagen en base64
      const qrDataUrl = `data:image/png;base64,${result.data.qrImage}`;

      setQrImage(qrDataUrl);
      setTransactionId(result.data.transactionId);

      // Guardar qrId del BNB para verificar el estado después
      window.bnbQrId = result.data.qrId;

      setQrStep('qr');

      // Iniciar verificación periódica del estado del pago
      startPaymentStatusCheck(result.data.qrId);
    } catch (err) {
      console.error('Error generando QR:', err);
      setErrorDetails({
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor de pagos. Verifique su conexión a internet e intente nuevamente.',
        technical: `Error técnico: ${err.message}`
      });
      setQrStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Verificar estado del pago periódicamente
  const startPaymentStatusCheck = (qrId) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/bnb/check-status/${qrId}`);
        const result = await response.json();

        if (result.success && result.data.paid) {
          // Pago confirmado por el BNB
          clearInterval(intervalId);
          setQrStep('processing');

          // Registrar automáticamente la donación
          await autoRegisterDonation();
        }
      } catch (err) {
        console.error('Error verificando estado del pago:', err);
      }
    }, 3000); // Verificar cada 3 segundos

    // Limpiar el intervalo después de 30 minutos (tiempo de expiración del QR)
    setTimeout(() => clearInterval(intervalId), 30 * 60 * 1000);

    // Guardar el ID del intervalo para poder limpiarlo después
    window.paymentCheckInterval = intervalId;
  };

  // Registrar donación automáticamente cuando el pago se confirma
  const autoRegisterDonation = async () => {
    try {
      const donationData = {
        nombreDonante: formData.nombreDonante,
        email: formData.email,
        cantidad: formData.cantidad.toString(),
        metodoPago: 'QR',
        descripcion: formData.descripcion || `Donación QR - ${transactionId} - Banco Nacional de Bolivia`
      };

      // Registrar en la base de datos
      const response = await fetch('http://localhost:3000/donaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar la donación en el sistema');
      }

      const result = await response.json();

      // Enviar email de notificación
      await sendDonationEmail(donationData, result.data);

      // Mostrar confirmación de éxito
      setTimeout(() => {
        setQrStep('success');
      }, 1500);

    } catch (err) {
      console.error('Error al registrar donación:', err);
      setErrorDetails({
        title: 'Error al Registrar la Donación',
        message: 'El pago fue confirmado por el banco, pero hubo un problema al registrar la donación en nuestro sistema. Por favor, contacte a soporte con su ID de transacción.',
        technical: `ID de transacción: ${transactionId} | Error: ${err.message}`
      });
      setQrStep('error');
    }
  };

  // Enviar email de notificación
  const sendDonationEmail = async (donationData, registeredDonation) => {
    try {
      await fetch('http://localhost:3000/api/donaciones/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donation: donationData,
          registeredId: registeredDonation?.id
        }),
      });
    } catch (err) {
      console.error('Error enviando email:', err);
      // No bloqueamos el flujo si falla el email
    }
  };

  // Descargar código QR
  const downloadQR = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `QR-Donacion-${transactionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si el método es QR, generar QR en lugar de enviar directamente
    if (formData.metodoPago === 'qr') {
      await generateQR();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/donaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la donación');
      }

      setSubmitted(true);
      setFormData({
        nombreDonante: '',
        email: '',
        cantidad: '',
        metodoPago: '',
        descripcion: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar y registrar donación con QR
  const confirmQRDonation = async () => {
    setLoading(true);
    setError(null);

    try {
      const donationData = {
        nombreDonante: formData.nombreDonante,
        cantidad: formData.cantidad,
        metodoPago: 'qr',
        descripcion: formData.descripcion || `Donación QR - ${transactionId}`,
        transactionId: transactionId
      };

      const response = await fetch('http://localhost:3000/donaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        throw new Error('Error al registrar la donación');
      }

      setSubmitted(true);
      setFormData({
        nombreDonante: '',
        email: '',
        cantidad: '',
        metodoPago: '',
        descripcion: ''
      });
      setQrStep('form');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simular pago exitoso (para testing en dev mode)
  const simulateSuccess = async () => {
    setQrStep('processing');
    // Llamar al endpoint de simulación del backend
    try {
      await fetch(`http://localhost:3000/api/bnb/simulate-payment/${window.bnbQrId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      });
    } catch (err) {
      console.error('Error simulando pago:', err);
    }
  };

  // Simular pago fallido (para testing en dev mode)
  const simulateFailure = async () => {
    setErrorDetails({
      title: 'Transacción Rechazada',
      message: 'El banco rechazó la transacción. Esto puede deberse a fondos insuficientes, límite de transacción excedido, o problemas con su cuenta bancaria.',
      technical: `ID de transacción: ${transactionId} | Código de error: BANK_REJECTED | Motivo: Fondos insuficientes`
    });
    setQrStep('error');
  };

  // Cancelar y volver al formulario
  const cancelQR = () => {
    // Limpiar el intervalo de verificación de pago
    if (window.paymentCheckInterval) {
      clearInterval(window.paymentCheckInterval);
      window.paymentCheckInterval = null;
    }

    setQrStep('form');
    setQrImage('');
    setTransactionId('');
  };
  
  const resetForm = () => {
    // Limpiar el intervalo de verificación de pago si existe
    if (window.paymentCheckInterval) {
      clearInterval(window.paymentCheckInterval);
      window.paymentCheckInterval = null;
    }

    // Resetear todos los estados
    setSubmitted(false);
    setQrStep('form');
    setQrImage('');
    setTransactionId('');
    setError(null);
    setLoading(false);

    // Resetear el formulario
    setFormData({
      nombreDonante: '',
      email: '',
      cantidad: '',
      metodoPago: 'qr',
      descripcion: ''
    });

    // Cerrar el modal
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={resetForm}>
          <FaTimes />
        </CloseButton>
        
        {submitted ? (
          <SuccessContainer>
            <SuccessIcon>
              <FaCheck />
            </SuccessIcon>
            <SuccessTitle>¡Gracias por tu donación!</SuccessTitle>
            <SuccessMessage>
              Tu generosidad nos ayuda a seguir apoyando a niños con cáncer y sus familias.
            </SuccessMessage>
            <CloseSuccessButton onClick={resetForm}>Cerrar</CloseSuccessButton>
          </SuccessContainer>
        ) : qrStep === 'qr' ? (
          <>
            <ModalHeader>
              <ModalTitle>Escanea el Código QR</ModalTitle>
              <ModalSubtitle>
                Usa tu aplicación bancaria para completar el pago
              </ModalSubtitle>
            </ModalHeader>

            <QRDisplayContainer>
              <QRCodeImage src={qrImage} alt="Código QR de pago" />

              <DownloadQRButton onClick={downloadQR}>
                <FaDownload /> Descargar Código QR
              </DownloadQRButton>

              <QRInstructions>
                <strong>Pasos para completar tu donación:</strong>
                <ol>
                  <li>Abre tu aplicación bancaria</li>
                  <li>Escanea este código QR</li>
                  <li>Confirma el pago en tu banco</li>
                  <li>Espera la confirmación automática</li>
                </ol>
              </QRInstructions>

              <BankSimulatorLink
                href="/banco-simulador"
                target="_blank"
                rel="noopener noreferrer"
              >
                📱 Abrir Simulador de Banco →
              </BankSimulatorLink>

              <TestingPanel>
                <TestingTitle>🧪 Modo de Pruebas</TestingTitle>
                <TestingButtons>
                  <TestButton success onClick={simulateSuccess}>
                    ✅ Simular Pago Exitoso
                  </TestButton>
                  <TestButton onClick={simulateFailure}>
                    ❌ Simular Pago Fallido
                  </TestButton>
                </TestingButtons>
              </TestingPanel>

              <CancelQRButton onClick={cancelQR}>
                Cancelar y volver
              </CancelQRButton>
            </QRDisplayContainer>
          </>
        ) : qrStep === 'processing' ? (
          <ProcessingContainer>
            <ProcessingSpinner />
            <ProcessingTitle>Procesando pago...</ProcessingTitle>
            <ProcessingMessage>
              Estamos confirmando tu pago y registrando tu donación. Esto puede tomar unos segundos.
            </ProcessingMessage>
          </ProcessingContainer>
        ) : qrStep === 'success' ? (
          <SuccessContainer>
            <SuccessIcon>
              <FaCheck />
            </SuccessIcon>
            <SuccessTitle>¡Pago realizado!</SuccessTitle>
            <SuccessMessage>
              Tu donación ha sido registrada exitosamente. ¡Muchas gracias por tu generosidad!
            </SuccessMessage>
            <SuccessDetails>
              <DetailRow>
                <DetailLabel>ID de Transacción:</DetailLabel>
                <DetailValue>{transactionId}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Monto:</DetailLabel>
                <DetailValue>{formData.cantidad} Bs</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Donante:</DetailLabel>
                <DetailValue>{formData.nombreDonante}</DetailValue>
              </DetailRow>
            </SuccessDetails>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <CloseSuccessButton onClick={resetForm}>Cerrar</CloseSuccessButton>
          </SuccessContainer>
        ) : qrStep === 'error' ? (
          <ErrorContainer>
            <ErrorIcon>❌</ErrorIcon>
            <ErrorTitle>{errorDetails.title || 'Error en la Transacción'}</ErrorTitle>
            <ErrorText>
              {errorDetails.message || 'Ocurrió un error al procesar la donación. Por favor, intente nuevamente.'}
            </ErrorText>
            {errorDetails.technical && (
              <ErrorTechnicalDetails>
                <strong>Detalles técnicos:</strong>
                <p>{errorDetails.technical}</p>
              </ErrorTechnicalDetails>
            )}
            <RetryButton onClick={() => {
              setQrStep('form');
              setErrorDetails({ title: '', message: '', technical: '' });
              setQrImage('');
              setTransactionId('');
            }}>
              Intentar Nuevamente
            </RetryButton>
            <CancelErrorButton onClick={resetForm}>
              Cancelar y Cerrar
            </CancelErrorButton>
          </ErrorContainer>
        ) : (
          <>
            <ModalHeader>
              <ModalTitle>Haz tu donación</ModalTitle>
              <ModalSubtitle>
                Tu apoyo transforma vidas. Juntos podemos hacer la diferencia.
              </ModalSubtitle>
            </ModalHeader>

            <DonateForm onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="nombreDonante">Nombre</Label>
                <Input
                  type="text"
                  id="nombreDonante"
                  name="nombreDonante"
                  value={formData.nombreDonante}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Selecciona o ingresa una cantidad (BS)</Label>
                <AmountButtonsContainer>
                  {cantidadesSugeridas.map(cantidad => (
                    <AmountButton
                      key={cantidad}
                      type="button"
                      isSelected={formData.cantidad === cantidad}
                      onClick={() => setFormData(prev => ({ ...prev, cantidad }))}
                    >
                      {cantidad} Bs
                    </AmountButton>
                  ))}
                  <CustomAmountInput
                    type="number"
                    name="cantidad"
                    value={!cantidadesSugeridas.includes(formData.cantidad) ? formData.cantidad : ''}
                    onChange={handleChange}
                    placeholder="Otra cantidad"
                    min="1"
                  />
                </AmountButtonsContainer>
              </FormGroup>
              
              <FormGroup>
                <Label>Método de Pago</Label>
                <PaymentMethodsContainer>
                  {metodosDisponibles.map(metodo => (
                    <PaymentMethodButton
                      key={metodo.id}
                      type="button"
                      isSelected={formData.metodoPago === metodo.id}
                      onClick={() => setFormData(prev => ({ ...prev, metodoPago: metodo.id }))}
                    >
                      <PaymentIcon>{metodo.icon}</PaymentIcon>
                      <span>{metodo.nombre}</span>
                    </PaymentMethodButton>
                  ))}
                </PaymentMethodsContainer>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="descripcion">Mensaje (opcional)</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Deja un mensaje de apoyo o indica el propósito de tu donación"
                  rows="3"
                />
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <SubmitButton
                type="submit"
                disabled={loading || !formData.nombreDonante || !formData.email || !formData.cantidad || !formData.metodoPago}
              >
                {loading ? 'Procesando...' : (formData.metodoPago === 'qr' ? 'Generar Código QR' : 'Completar Donación')}
              </SubmitButton>
              
              <SecurityNote>
                <strong>Donación segura:</strong> Toda la información proporcionada está protegida y encriptada.
              </SecurityNote>
            </DonateForm>
          </>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 650px;
  position: relative;
  overflow-y: auto;
  max-height: 90vh;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const ModalHeader = styled.div`
  padding: 30px 30px 20px;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
`;

const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const ModalSubtitle = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
`;

const DonateForm = styled.form`
  padding: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #ff6347;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #ff6347;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const AmountButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  
  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AmountButton = styled.button`
  padding: 12px;
  border: 1px solid ${props => props.isSelected ? '#ff6347' : '#ddd'};
  background-color: ${props => props.isSelected ? '#fff4f2' : 'white'};
  color: ${props => props.isSelected ? '#ff6347' : '#333'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#fff4f2' : '#f9f9f9'};
  }
`;

const CustomAmountInput = styled.input`
  grid-column: span 4;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  
  @media (max-width: 500px) {
    grid-column: span 2;
  }
  
  &:focus {
    outline: none;
    border-color: #ff6347;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const PaymentMethodsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const PaymentMethodButton = styled.button`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${props => props.isSelected ? '#ff6347' : '#ddd'};
  background-color: ${props => props.isSelected ? '#fff4f2' : 'white'};
  color: ${props => props.isSelected ? '#ff6347' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#fff4f2' : '#f9f9f9'};
  }
`;

const PaymentIcon = styled.span`
  font-size: 20px;
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const QRCodeContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const QRCodeImage = styled.img`
  width: 250px;
  height: 250px;
  margin-bottom: 20px;
  border: 2px solid #eaeaea;
  border-radius: 8px;
  padding: 10px;
  background-color: white;
`;

const QRInstructions = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  width: 100%;
  text-align: left;

  strong {
    display: block;
    margin-bottom: 10px;
    color: #333;
  }

  ol {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${props => props.disabled ? '#cccccc' : '#ff6347'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#ff5233'};
  }
`;

const SecurityNote = styled.p`
  font-size: 12px;
  color: #777;
  text-align: center;
  margin-top: 16px;
`;

const ErrorMessage = styled.div`
  background-color: #ffeaea;
  color: #d32f2f;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SuccessContainer = styled.div`
  padding: 40px 30px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 70px;
  height: 70px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
`;

const SuccessMessage = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 25px;
`;

const CloseSuccessButton = styled.button`
  padding: 12px 30px;
  background-color: #ff6347;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff5233;
  }
`;

const SuccessDetails = styled.div`
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

// Estilos para el flujo QR
const QRDisplayContainer = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DownloadQRButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const BankSimulatorLink = styled.a`
  display: inline-block;
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
`;

const TestingPanel = styled.div`
  width: 100%;
  background-color: #fff9e6;
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const TestingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #d97706;
  margin-bottom: 12px;
  text-align: center;
`;

const TestingButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const TestButton = styled.button`
  padding: 10px;
  border: 1px solid ${props => props.success ? '#4caf50' : '#f44336'};
  background-color: ${props => props.success ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.success ? '#2e7d32' : '#c62828'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CancelQRButton = styled.button`
  width: 100%;
  padding: 12px 20px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #eaeaea;
  }
`;

const ProcessingContainer = styled.div`
  padding: 60px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ProcessingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6347;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const ProcessingMessage = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.5;
`;

const ConfirmationContainer = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ConfirmationDetails = styled.div`
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 600;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${props => props.disabled ? '#cccccc' : '#4caf50'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.3s;
  margin-bottom: 12px;

  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#45a049'};
  }
`;

const ErrorContainer = styled.div`
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #d32f2f;
  margin-bottom: 10px;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const RetryButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #ff6347;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 12px;

  &:hover {
    background-color: #ff5233;
  }
`;

const CancelErrorButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: transparent;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #999;
  }
`;

const ErrorTechnicalDetails = styled.div`
  width: 100%;
  background-color: #fff9e6;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  padding: 12px 16px;
  margin: 16px 0;
  text-align: left;
  font-size: 12px;
  color: #666;

  strong {
    color: #d97706;
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
  }

  p {
    margin: 0;
    line-height: 1.5;
    font-family: 'Courier New', monospace;
    word-break: break-word;
  }
`;

export default DonateModal;
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IoCloseOutline } from "react-icons/io5";
import Table from "../../../components/ui/table";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import ExportButtons from "../../../components/ui/ExportButtons";
import QRCode from "qrcode";

// Configurar plugins de dayjs
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

const Donaciones = () => {
  const [donaciones, setDonaciones] = useState([]);
  const [donacionesFiltradas, setDonacionesFiltradas] = useState([]);
  const [totalMes, setTotalMes] = useState(0);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState({});

  // Estados para filtros de tiempo
  const [filtroTiempo, setFiltroTiempo] = useState('mes'); // dia, semana, mes, ano, personalizado
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Estados para el flujo de pago
  const [paymentStep, setPaymentStep] = useState('amount'); // amount, qr, processing, success, error
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentTimer, setPaymentTimer] = useState(null);

  const [form, setForm] = useState({
    nombreDonante: "",
    cantidad: "",
    metodoPago: "QR",
    fecha: new Date().toISOString().split('T')[0],
    numeroTransaccion: "",
    banco: "Banco Simulado"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const getData = async () => {
    try {
      const response = await fetch("http://localhost:3000/donaciones");
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.mensaje || "Error al obtener donaciones");
        return;
      }

      setDonaciones(data.data);
      setDonacionesFiltradas(data.data);

      // Calcular total del mes
      const mesActual = new Date().getMonth();
      const total = data.data.reduce((acc, don) => {
        const fecha = new Date(don.fecha);
        const cantidad = parseFloat(don.cantidad);
        return fecha.getMonth() === mesActual ? acc + cantidad : acc;
      }, 0);

      setTotalMes(total);
      setTotalFiltrado(total);
    } catch (error) {
      toast.error("Hubo un problema al obtener las donaciones");
    }
  };

  // Función para aplicar filtros de tiempo
  const aplicarFiltro = () => {
    let donacionesFiltradas = [...donaciones];
    const hoy = dayjs();

    switch (filtroTiempo) {
      case 'dia':
        donacionesFiltradas = donaciones.filter(don =>
          dayjs(don.fecha).isSame(hoy, 'day')
        );
        break;

      case 'semana':
        donacionesFiltradas = donaciones.filter(don =>
          dayjs(don.fecha).isSame(hoy, 'week')
        );
        break;

      case 'mes':
        donacionesFiltradas = donaciones.filter(don =>
          dayjs(don.fecha).isSame(hoy, 'month')
        );
        break;

      case 'ano':
        donacionesFiltradas = donaciones.filter(don =>
          dayjs(don.fecha).isSame(hoy, 'year')
        );
        break;

      case 'personalizado':
        if (fechaInicio && fechaFin) {
          donacionesFiltradas = donaciones.filter(don => {
            const fecha = dayjs(don.fecha);
            return fecha.isAfter(dayjs(fechaInicio).subtract(1, 'day')) &&
                   fecha.isBefore(dayjs(fechaFin).add(1, 'day'));
          });
        }
        break;

      default:
        donacionesFiltradas = donaciones;
    }

    // Calcular total de donaciones filtradas
    const total = donacionesFiltradas.reduce((acc, don) =>
      acc + parseFloat(don.cantidad), 0
    );

    setDonacionesFiltradas(donacionesFiltradas);
    setTotalFiltrado(total);
  };

  useEffect(() => {
    getData();
  }, []);

  // Aplicar filtro cuando cambian los valores
  useEffect(() => {
    aplicarFiltro();
  }, [filtroTiempo, fechaInicio, fechaFin, donaciones]);

  useEffect(() => {
    // Escuchar confirmaciones de pago desde el simulador bancario
    const handlePaymentConfirmed = (event) => {
      const confirmation = event.detail;

      // Verificar si esta transacción coincide con la actual
      if (confirmation.transactionId === transactionId && paymentStep === 'qr') {
        console.log('[Donaciones] Pago confirmado desde banco simulador:', confirmation);

        // Cambiar a estado de procesamiento y luego a éxito
        setPaymentStep('processing');

        setTimeout(() => {
          setPaymentStep('success');
          toast.success('¡Pago confirmado desde tu banco!');
        }, 1500);
      }
    };

    // Suscribirse al evento
    window.addEventListener('paymentConfirmed', handlePaymentConfirmed);

    // Limpiar al desmontar
    return () => {
      window.removeEventListener('paymentConfirmed', handlePaymentConfirmed);
    };
  }, [transactionId, paymentStep]);

  const resetForm = () => {
    setForm({
      nombreDonante: "",
      cantidad: "",
      metodoPago: "QR",
      fecha: new Date().toISOString().split('T')[0],
      numeroTransaccion: "",
      banco: "Banco Nacional de Bolivia"
    });
    setItem({});
    setPaymentStep('amount');
    setQrData(null);
    setQrImage('');
    setTransactionId('');
    if (paymentTimer) {
      clearTimeout(paymentTimer);
      setPaymentTimer(null);
    }
    // Limpiar el intervalo de verificación de pago
    if (window.paymentCheckInterval) {
      clearInterval(window.paymentCheckInterval);
      window.paymentCheckInterval = null;
    }
  };

  const openModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const editarDonacion = (data) => {
    setForm({
      nombreDonante: data.nombreDonante || "",
      cantidad: data.cantidad || "",
      metodoPago: data.metodoPago || "QR",
      fecha: data.fecha ? dayjs(data.fecha).format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
      numeroTransaccion: data.numeroTransaccion || "",
      banco: data.banco || "Banco Simulado"
    });
    setItem(data);
    setIsEditing(true);
    setShowModal(true);
  };

  const eliminarDonacion = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta donación?")) return;

    try {
      const response = await fetch(`http://localhost:3000/donaciones/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Error al eliminar donación");
        return;
      }
      getData();
      toast.success("Donación eliminada con éxito");
    } catch (error) {
      toast.error("Hubo un problema al eliminar la donación");
    }
  };

  // Generar QR usando la API del BNB
  const generateQR = async () => {
    if (!form.nombreDonante || !form.cantidad) {
      toast.error("Por favor complete nombre y cantidad");
      return;
    }

    const cantidad = parseFloat(form.cantidad);
    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      toast.loading("Generando código QR con el BNB...");

      // Llamar al backend para generar QR con el BNB
      const response = await fetch('http://localhost:3000/api/bnb/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cantidad,
          donor: form.nombreDonante,
          description: `Donación de ${form.nombreDonante}`
        }),
      });

      const result = await response.json();
      toast.dismiss();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al generar código QR');
      }

      // El BNB devuelve la imagen en base64
      const qrImageUrl = `data:image/png;base64,${result.data.qrImage}`;

      // Datos del QR para mostrar en la interfaz
      const qrPayload = {
        transactionId: result.data.transactionId,
        qrId: result.data.qrId,
        amount: cantidad,
        currency: 'BOB',
        beneficiary: 'Fundación OncoFeliz',
        donorName: form.nombreDonante,
        timestamp: new Date().toISOString(),
        bank: 'Banco Nacional de Bolivia',
        type: 'donation',
        expirationDate: result.data.expirationDate
      };

      setQrData(qrPayload);
      setQrImage(qrImageUrl);
      setTransactionId(result.data.transactionId);

      // Guardar qrId del BNB para verificar el estado después
      window.bnbQrId = result.data.qrId;

      setPaymentStep('qr');
      toast.success("Código QR generado exitosamente");

      // Iniciar verificación periódica del estado del pago
      startPaymentStatusCheck(result.data.qrId);
    } catch (error) {
      toast.dismiss();
      toast.error("Error al generar código QR: " + error.message);
      console.error(error);
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
          setPaymentStep('processing');
          setTimeout(() => {
            setPaymentStep('success');
            toast.success('¡Pago confirmado por el BNB!');
          }, 1500);
        } else if (result.data.status === 'expired') {
          // QR expirado
          clearInterval(intervalId);
          toast.error('El código QR ha expirado');
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

  // Simular proceso de verificación de pago
  const simulatePaymentProcessing = () => {
    setPaymentStep('processing');

    // Simular tiempo de procesamiento (3-5 segundos)
    const processingTime = 3000 + Math.random() * 2000;

    const timer = setTimeout(() => {
      // Por defecto, simular que el pago es exitoso
      // En un sistema real, aquí se consultaría la API del banco
      const paymentSuccessful = true; // Cambiar a false para simular fallo

      if (paymentSuccessful) {
        setPaymentStep('success');
      } else {
        setPaymentStep('error');
      }
    }, processingTime);

    setPaymentTimer(timer);
  };

  // Simular pago exitoso (botón para testing)
  const simulateSuccessfulPayment = () => {
    toast.success("Simulando pago exitoso...");
    simulatePaymentProcessing();
  };

  // Simular pago fallido (botón para testing)
  const simulateFailedPayment = () => {
    setPaymentStep('processing');

    const timer = setTimeout(() => {
      setPaymentStep('error');
      toast.error("Pago rechazado por el banco");
    }, 2000);

    setPaymentTimer(timer);
  };

  // Confirmar y registrar donación después de pago exitoso
  const confirmDonation = async () => {
    const finalForm = {
      ...form,
      numeroTransaccion: transactionId,
      banco: qrData.bank,
      metodoPago: "QR"
    };

    try {
      const response = await fetch("http://localhost:3000/donaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Error al registrar donación");
        return;
      }

      getData();
      closeModal();
      toast.success("¡Donación registrada exitosamente! Gracias por su aporte.");
    } catch (error) {
      toast.error("Hubo un problema al registrar la donación");
    }
  };

  // Reintentar pago
  const retryPayment = () => {
    setPaymentStep('qr');
  };

  // Descargar código QR como imagen
  const downloadQR = () => {
    if (!qrImage) return;

    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `QR-Donacion-${transactionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Código QR descargado');
  };

  const columns = [
    { header: "Nombre del Donante", acceso: "nombreDonante" },
    { header: "Cantidad (Bs)", acceso: "cantidad" },
    { header: "Método de Pago", acceso: "metodoPago" },
    { header: "Nro. Transacción", acceso: "numeroTransaccion" },
    { header: "Banco", acceso: "banco" },
    {
      header: "Fecha",
      acceso: "fecha",
      render: (row) => dayjs(row.fecha).format("DD/MM/YYYY"),
    },
  ];

  const getTituloTotal = () => {
    switch (filtroTiempo) {
      case 'dia': return 'Total Donado Hoy';
      case 'semana': return 'Total Donado esta Semana';
      case 'mes': return 'Total Donado este Mes';
      case 'ano': return 'Total Donado este Año';
      case 'personalizado': return 'Total Donado (Personalizado)';
      default: return 'Total Donado';
    }
  };

  return (
    <Container>
      <TopSection>
        <TotalBox>
          <h3>{getTituloTotal()}</h3>
          <Total>{totalFiltrado.toFixed(2)} Bs</Total>
        </TotalBox>
        <Actions>
          <LoginButton onClick={openModal}>💳 Nueva Donación QR</LoginButton>
          <ExportButtons
            data={donacionesFiltradas}
            columns={columns}
            fileName={`donaciones-${filtroTiempo}`}
            title={`Reporte de Donaciones - ${getTituloTotal()}`}
            sheetName="Donaciones"
          />
        </Actions>
      </TopSection>

      {/* Panel de Filtros */}
      <FilterPanel>
        <FilterTitle>🔍 Filtrar Donaciones por Periodo</FilterTitle>
        <FilterContainer>
          <FilterButtonGroup>
            <FilterButton
              $active={filtroTiempo === 'dia'}
              onClick={() => setFiltroTiempo('dia')}
            >
              Hoy
            </FilterButton>
            <FilterButton
              $active={filtroTiempo === 'semana'}
              onClick={() => setFiltroTiempo('semana')}
            >
              Esta Semana
            </FilterButton>
            <FilterButton
              $active={filtroTiempo === 'mes'}
              onClick={() => setFiltroTiempo('mes')}
            >
              Este Mes
            </FilterButton>
            <FilterButton
              $active={filtroTiempo === 'ano'}
              onClick={() => setFiltroTiempo('ano')}
            >
              Este Año
            </FilterButton>
            <FilterButton
              $active={filtroTiempo === 'personalizado'}
              onClick={() => setFiltroTiempo('personalizado')}
            >
              Personalizado
            </FilterButton>
          </FilterButtonGroup>

          {filtroTiempo === 'personalizado' && (
            <DateRangeContainer>
              <DateInput>
                <label>Desde:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </DateInput>
              <DateInput>
                <label>Hasta:</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </DateInput>
            </DateRangeContainer>
          )}

          <FilterStats>
            <span>📊 Mostrando: <strong>{donacionesFiltradas.length}</strong> donaciones</span>
            <span>💰 Total: <strong>Bs. {totalFiltrado.toFixed(2)}</strong></span>
          </FilterStats>
        </FilterContainer>
      </FilterPanel>

      <Table
        columns={columns}
        data={donacionesFiltradas}
        onEdit={editarDonacion}
        onDelete={eliminarDonacion}
      />

      {showModal && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <h2>
                {isEditing
                  ? "Editar Donación"
                  : paymentStep === 'amount'
                    ? "Nueva Donación con QR"
                    : paymentStep === 'qr'
                      ? "Escanea el Código QR"
                      : paymentStep === 'processing'
                        ? "Procesando Pago..."
                        : paymentStep === 'success'
                          ? "¡Pago Exitoso!"
                          : "Error en el Pago"
                }
              </h2>
              <CloseButton onClick={closeModal}>
                <IoCloseOutline size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalContent>
              {/* PASO 1: Ingresar datos y monto */}
              {paymentStep === 'amount' && !isEditing && (
                <Form onSubmit={(e) => { e.preventDefault(); generateQR(); }}>
                  <FormGroup>
                    <Label>Nombre del Donante *</Label>
                    <Input
                      type="text"
                      name="nombreDonante"
                      value={form.nombreDonante}
                      onChange={handleInputChange}
                      placeholder="Nombre completo del donante"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Monto a Donar (Bs) *</Label>
                    <Input
                      type="number"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="1"
                      required
                    />
                  </FormGroup>

                  <InfoBox style={{ background: '#e8f5e9', borderLeftColor: '#4caf50' }}>
                    <strong>🔒 Pasarela de Pago Segura</strong><br />
                    Se generará un código QR único para esta transacción.
                  </InfoBox>

                  <ButtonGroup>
                    <CancelButton type="button" onClick={closeModal}>
                      Cancelar
                    </CancelButton>
                    <SubmitButton type="submit">
                      Generar QR
                    </SubmitButton>
                  </ButtonGroup>
                </Form>
              )}

              {/* PASO 2: Mostrar QR */}
              {paymentStep === 'qr' && (
                <QRContainer>
                  <QRBox>
                    {qrImage && <QRImage src={qrImage} alt="Código QR de pago" />}
                  </QRBox>

                  <DownloadQRButton onClick={downloadQR}>
                    📥 Descargar Código QR
                  </DownloadQRButton>

                  <PaymentDetails>
                    <DetailRow>
                      <DetailLabel>Monto:</DetailLabel>
                      <DetailValue>{parseFloat(form.cantidad).toFixed(2)} Bs</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Donante:</DetailLabel>
                      <DetailValue>{form.nombreDonante}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>ID Transacción:</DetailLabel>
                      <DetailValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {transactionId}
                      </DetailValue>
                    </DetailRow>
                  </PaymentDetails>

                  <InfoBox style={{ background: '#fff3e0', borderLeftColor: '#ff9800' }}>
                    <strong>📱 Instrucciones para pago real:</strong><br />
                    1. Abre tu app bancaria<br />
                    2. Escanea este código QR<br />
                    3. Confirma el pago en tu app<br />
                    4. Espera la confirmación<br />
                    <br />
                    <strong>🧪 O prueba con el simulador:</strong><br />
                    <a
                      href="/banco-simulador"
                      target="_blank"
                      style={{
                        color: '#ff9800',
                        fontWeight: 'bold',
                        textDecoration: 'underline'
                      }}
                    >
                      Abrir Simulador de Banco →
                    </a>
                  </InfoBox>

                  <SimulationBox>
                    <SimulationTitle>🧪 Panel de Simulación (Solo Testing)</SimulationTitle>
                    <SimulationButtons>
                      <SimulateSuccessButton onClick={simulateSuccessfulPayment}>
                        ✅ Simular Pago Exitoso
                      </SimulateSuccessButton>
                      <SimulateFailButton onClick={simulateFailedPayment}>
                        ❌ Simular Pago Fallido
                      </SimulateFailButton>
                    </SimulationButtons>
                    <SimulationNote>
                      En producción, estos botones no existirán. El sistema verificará automáticamente con el banco.
                    </SimulationNote>
                  </SimulationBox>

                  <ButtonGroup>
                    <CancelButton type="button" onClick={closeModal}>
                      Cancelar Pago
                    </CancelButton>
                  </ButtonGroup>
                </QRContainer>
              )}

              {/* PASO 3: Procesando */}
              {paymentStep === 'processing' && (
                <ProcessingContainer>
                  <Spinner />
                  <ProcessingText>Verificando pago con el banco...</ProcessingText>
                  <ProcessingSubtext>Por favor espere, no cierre esta ventana</ProcessingSubtext>
                </ProcessingContainer>
              )}

              {/* PASO 4: Éxito */}
              {paymentStep === 'success' && (
                <SuccessContainer>
                  <SuccessIcon>✓</SuccessIcon>
                  <SuccessTitle>¡Pago Verificado!</SuccessTitle>
                  <SuccessMessage>
                    El pago de <strong>{parseFloat(form.cantidad).toFixed(2)} Bs</strong> ha sido confirmado exitosamente.
                  </SuccessMessage>

                  <PaymentDetails style={{ marginTop: '20px' }}>
                    <DetailRow>
                      <DetailLabel>ID Transacción:</DetailLabel>
                      <DetailValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {transactionId}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Donante:</DetailLabel>
                      <DetailValue>{form.nombreDonante}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Monto:</DetailLabel>
                      <DetailValue>{parseFloat(form.cantidad).toFixed(2)} Bs</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Fecha:</DetailLabel>
                      <DetailValue>{dayjs().format('DD/MM/YYYY HH:mm')}</DetailValue>
                    </DetailRow>
                  </PaymentDetails>

                  <ButtonGroup style={{ marginTop: '30px' }}>
                    <SubmitButton onClick={confirmDonation} style={{ width: '100%' }}>
                      Confirmar y Registrar Donación
                    </SubmitButton>
                  </ButtonGroup>
                </SuccessContainer>
              )}

              {/* PASO 5: Error */}
              {paymentStep === 'error' && (
                <ErrorContainer>
                  <ErrorIcon>✕</ErrorIcon>
                  <ErrorTitle>Pago No Confirmado</ErrorTitle>
                  <ErrorMessage>
                    No se pudo verificar el pago. Esto puede deberse a:<br />
                    • Fondos insuficientes<br />
                    • Tiempo de espera excedido<br />
                    • Error de conexión con el banco<br />
                    • Pago cancelado por el usuario
                  </ErrorMessage>

                  <InfoBox style={{ background: '#ffebee', borderLeftColor: '#f44336', marginTop: '20px' }}>
                    <strong>ID de Transacción Fallida:</strong><br />
                    {transactionId}
                  </InfoBox>

                  <ButtonGroup style={{ marginTop: '20px' }}>
                    <CancelButton type="button" onClick={closeModal}>
                      Cerrar
                    </CancelButton>
                    <SubmitButton onClick={retryPayment}>
                      Reintentar Pago
                    </SubmitButton>
                  </ButtonGroup>
                </ErrorContainer>
              )}

              {/* Formulario de edición (modo tradicional) */}
              {isEditing && (
                <Form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await fetch(`http://localhost:3000/donaciones/${item.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form),
                    });
                    const result = await response.json();
                    if (!response.ok) {
                      toast.error(result.error || "Error al actualizar donación");
                      return;
                    }
                    getData();
                    closeModal();
                    toast.success("Donación actualizada con éxito");
                  } catch (error) {
                    toast.error("Hubo un problema al actualizar la donación");
                  }
                }}>
                  <FormGroup>
                    <Label>Nombre del Donante</Label>
                    <Input
                      type="text"
                      name="nombreDonante"
                      value={form.nombreDonante}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Cantidad (Bs)</Label>
                    <Input
                      type="number"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Banco</Label>
                    <Input
                      type="text"
                      name="banco"
                      value={form.banco}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Número de Transacción</Label>
                    <Input
                      type="text"
                      name="numeroTransaccion"
                      value={form.numeroTransaccion}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <ButtonGroup>
                    <CancelButton type="button" onClick={closeModal}>
                      Cancelar
                    </CancelButton>
                    <SubmitButton type="submit">
                      Actualizar
                    </SubmitButton>
                  </ButtonGroup>
                </Form>
              )}
            </ModalContent>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Donaciones;

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const TotalBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  color: white;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.9;
  }
`;

const Total = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LoginButton = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => props.theme?.colors?.primary || "#FF6347"};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const InfoBox = styled.div`
  background-color: #f0f8ff;
  border-left: 4px solid #2196F3;
  padding: 14px;
  margin-bottom: 18px;
  border-radius: 6px;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 2px solid #ddd;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
    border-color: #bbb;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

// QR Payment Styles
const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QRBox = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const QRImage = styled.img`
  width: 280px;
  height: 280px;
  display: block;
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
  margin-bottom: 16px;
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

  &:active {
    transform: translateY(0);
  }
`;

const PaymentDetails = styled.div`
  width: 100%;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
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
  font-size: 14px;
`;

const DetailValue = styled.span`
  color: #333;
  font-size: 14px;
  text-align: right;
`;

const SimulationBox = styled.div`
  background: #fff9e6;
  border: 2px dashed #ffa726;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
`;

const SimulationTitle = styled.div`
  font-weight: 600;
  color: #e65100;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SimulationButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SimulateSuccessButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;

  &:hover {
    background: #45a049;
    transform: scale(1.02);
  }
`;

const SimulateFailButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;

  &:hover {
    background: #da190b;
    transform: scale(1.02);
  }
`;

const SimulationNote = styled.div`
  font-size: 11px;
  color: #666;
  font-style: italic;
  margin-top: 8px;
  line-height: 1.4;
`;

// Processing
const ProcessingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const ProcessingSubtext = styled.div`
  font-size: 14px;
  color: #666;
`;

// Success
const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  animation: scaleIn 0.5s ease;

  @keyframes scaleIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const SuccessTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 12px;
`;

const SuccessMessage = styled.div`
  font-size: 15px;
  color: #555;
  text-align: center;
  line-height: 1.5;
`;

// Error
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #f44336;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  animation: shake 0.5s ease;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;

const ErrorTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #f44336;
  margin-bottom: 12px;
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  color: #555;
  text-align: center;
  line-height: 1.8;
`;

// Estilos para Filtros
const FilterPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FilterTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? '#ff6347' : '#e0e0e0'};
  background: ${props => props.$active ? '#ff6347' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff6347;
    background: ${props => props.$active ? '#ff6347' : '#fff5f3'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 99, 71, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const DateInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #555;
  }

  input[type="date"] {
    padding: 10px 14px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #ff6347;
      box-shadow: 0 0 0 3px rgba(255, 99, 71, 0.1);
    }
  }
`;

const FilterStats = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #fef7f5 0%, #fff9f7 100%);
  border-radius: 8px;
  border-left: 4px solid #ff6347;

  span {
    font-size: 14px;
    color: #666;

    strong {
      color: #ff6347;
      font-weight: 600;
    }
  }
`;

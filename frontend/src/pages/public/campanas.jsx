import React, { useEffect, useState } from "react";
import {
  CampaignsSectionContainer,
  SectionTitle,
  CampaignsGrid,
  CampaignCard,
  CampaignImage,
  CampaignContent,
  CampaignTitle,
  CampaignDescription,
  CampaignProgress,
  ProgressBar,
  ProgressFill,
  ProgressStats,
  ProgressAmount,
  CampaignButton,
  TitleAccent,
  SectionHeader,
} from "../../styles/styleCampa";
import DonateModal from "../../components/donateModal";

const Campanas = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const campañasPorPagina = 3;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDonateModal = () => {
    setIsModalOpen(true);
  };

  const closeDonateModal = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    const fetchCampanas = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/campana");

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Verifica si es un array directamente o si tiene una propiedad data
        const campañasData = Array.isArray(data) ? data : data.data || [];

        if (campañasData.length > 0) {
          const campañasProcesadas = campañasData
            .map((campaña) => {
              // Corrección para "previstro" - verificar si existe o si es "previsto"
              const previsto =
                campaña.previstro !== undefined
                  ? campaña.previstro
                  : campaña.previsto !== undefined
                  ? campaña.previsto
                  : 0;

              // Procesar fecha correctamente solo para mostrarla, sin filtrar
              let fechaCampaña;
              try {
                if (campaña.fecha) {
                  const partes = campaña.fecha.split("-");
                  if (partes.length === 3) {
                    const año = parseInt(partes[0]);
                    let mes = parseInt(partes[1]) - 1; // Los meses en JS son 0-11
                    let día = parseInt(partes[2]);

                    // Si el mes es mayor que 12, probablemente sea DD-MM invertido
                    if (mes >= 12) {
                      mes = parseInt(partes[2]) - 1;
                      día = parseInt(partes[1]);
                    }

                    fechaCampaña = new Date(año, mes, día, 12, 0, 0);
                  } else {
                    fechaCampaña = new Date(campaña.fecha);
                  }
                } else {
                  // Si no hay fecha, usar fecha actual
                  fechaCampaña = new Date();
                }
              } catch (e) {
                fechaCampaña = new Date();
              }

              return {
                ...campaña,
                fechaProcesada: fechaCampaña,
                previsto: previsto,
              };
            })
            // No filtrar por fecha ni por recaudación, solo tomar las primeras 3
            .slice(0, 3);

          setCampaigns(campañasProcesadas);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        setError(
          "No se pudieron cargar las campañas. Intente de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampanas();
  }, []);

  useEffect(() => {
    // Ya no necesitamos el carrusel automático porque siempre mostraremos las mismas 3 campañas
    // Este efecto se puede eliminar o dejarlo vacío
  }, []);

  // La lógica de paginación ya no es necesaria si siempre mostramos solo 3
  // Utilizamos directamente los datos almacenados en campaigns
  const campañasAMostrar = campaigns;

  const calculateProgress = (raised, goal) => {
    const raisedNum = Number(raised || 0);
    const goalNum = Number(goal || 1); // Prevenir división por cero
    return Math.min((raisedNum / goalNum) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (fecha) => {
    try {
      const date = fecha instanceof Date ? fecha : new Date(fecha);
      return date.toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  if (loading) {
    return (
      <CampaignsSectionContainer>
        <SectionHeader>
          <SectionTitle>Cargando campañas...</SectionTitle>
        </SectionHeader>
      </CampaignsSectionContainer>
    );
  }

  if (error) {
    return (
      <CampaignsSectionContainer>
        <SectionHeader>
          <SectionTitle>Error</SectionTitle>
          <p>{error}</p>
        </SectionHeader>
      </CampaignsSectionContainer>
    );
  }

  if (campaigns.length === 0) {
    return (
      <CampaignsSectionContainer>
        <SectionHeader>
          <SectionTitle>
            Nuestras <TitleAccent>Campañas</TitleAccent>
          </SectionTitle>
        </SectionHeader>
        <p>No hay campañas activas en este momento.</p>
      </CampaignsSectionContainer>
    );
  }

  return (
    <CampaignsSectionContainer>
      <SectionHeader>
        <SectionTitle>
          Nuestras <TitleAccent>Campañas</TitleAccent>
        </SectionTitle>
      </SectionHeader>
      <CampaignsGrid>
        {campañasAMostrar.map((campaign) => (
          <CampaignCard key={campaign.id}>
            <CampaignImage>
              <img
                src={
                  campaign.multimedia ||
                  campaign.img ||
                  "/placeholder-image.jpg"
                }
                alt={campaign.titulo}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </CampaignImage>
            <CampaignContent>
              <CampaignTitle>{campaign.titulo}</CampaignTitle>
              <CampaignDescription>{campaign.descripcion}</CampaignDescription>
              <p>
                <strong>Fecha:</strong>{" "}
                {formatDate(campaign.fechaProcesada || campaign.fecha)}
              </p>
              <CampaignProgress>
                <ProgressBar>
                  <ProgressFill
                    width={calculateProgress(
                      campaign.recaudado,
                      campaign.previstro !== undefined
                        ? campaign.previstro
                        : campaign.previsto
                    )}
                  />
                </ProgressBar>
                <ProgressStats>
                  <ProgressAmount>
                    Recaudado: {formatCurrency(campaign.recaudado)}
                  </ProgressAmount>
                  <ProgressAmount>
                    Meta:{" "}
                    {formatCurrency(
                      campaign.previstro !== undefined
                        ? campaign.previstro
                        : campaign.previsto
                    )}
                  </ProgressAmount>
                </ProgressStats>
              </CampaignProgress>
              <CampaignButton onClick={openDonateModal}>Donar Ahora</CampaignButton>
            </CampaignContent>
          </CampaignCard>
        ))}
      </CampaignsGrid>
      <DonateModal isOpen={isModalOpen} onClose={closeDonateModal} />
    </CampaignsSectionContainer>
  );
};

export default Campanas;

import React, { useEffect, useState } from "react";
import {
  EventsSectionContainer,
  SectionTitle,
  EventsGrid,
  EventCard,
  EventDate,
  EventMonth,
  EventDay,
  EventContent,
  EventTitle,
  EventLocation,
  EventTime,
  TitleAccent,
  SectionHeader,
  IconContainer,
} from "../../styles/styleEvento";

const Eventos = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventosPorPagina = 3;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/evento");

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);

        if (data && Array.isArray(data)) {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          const eventosFiltrados = data
            .map((event) => {
              let fechaCorrecta;
              try {
                const partes = event.fecha.split("-");
                if (partes.length === 3) {
                  const año = parseInt(partes[0]);
                  let mes = parseInt(partes[1]) - 1;
                  let día = parseInt(partes[2]);

                  if (mes >= 12) {
                    mes = parseInt(partes[2]) - 1;
                    día = parseInt(partes[1]);
                  }

                  fechaCorrecta = new Date(año, mes, día, 12, 0, 0);
                } else {
                  fechaCorrecta = new Date(event.fecha);
                }

                if (isNaN(fechaCorrecta.getTime())) {
                  console.warn(
                    `Fecha inválida para evento ${event.id}: ${event.fecha}`
                  );
                  const fechaAlternativa = new Date();
                  fechaAlternativa.setDate(fechaAlternativa.getDate() + 1);
                  fechaCorrecta = fechaAlternativa;
                }
              } catch (e) {
                console.error(`Error al procesar fecha ${event.fecha}:`, e);
                const fechaAlternativa = new Date();
                fechaAlternativa.setDate(fechaAlternativa.getDate() + 1);
                fechaCorrecta = fechaAlternativa;
              }

              const opcionesMes = { month: "short" };
              return {
                id: event.id,
                title: event.titulo,
                description: event.descripcion,
                date: fechaCorrecta,
                day: String(fechaCorrecta.getDate()).padStart(2, "0"),
                month: fechaCorrecta
                  .toLocaleDateString("es-ES", opcionesMes)
                  .toUpperCase(),
                time: event.hora || "08:00 AM - 17:00 PM",
                location: event.ubicacion || "Ubicación no especificada",
              };
            })
            .filter((event) => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate >= hoy;
            })
            .sort((a, b) => a.date - b.date);

          console.log("Eventos filtrados:", eventosFiltrados);
          setEvents(eventosFiltrados);
        } else if (data && data.data) {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          const eventosFiltrados = data.data
            .map((event) => {
              let fechaCorrecta;
              try {
                const partes = event.fecha.split("-");
                if (partes.length === 3) {
                  const año = parseInt(partes[0]);
                  let mes = parseInt(partes[1]) - 1;
                  let día = parseInt(partes[2]);

                  if (mes >= 12) {
                    mes = parseInt(partes[2]) - 1;
                    día = parseInt(partes[1]);
                  }

                  fechaCorrecta = new Date(año, mes, día, 12, 0, 0);
                } else {
                  fechaCorrecta = new Date(event.fecha);
                }

                if (isNaN(fechaCorrecta.getTime())) {
                  const fechaAlternativa = new Date();
                  fechaAlternativa.setDate(fechaAlternativa.getDate() + 1);
                  fechaCorrecta = fechaAlternativa;
                }
              } catch (e) {
                const fechaAlternativa = new Date();
                fechaAlternativa.setDate(fechaAlternativa.getDate() + 1);
                fechaCorrecta = fechaAlternativa;
              }

              const opcionesMes = { month: "short" };
              return {
                id: event.id,
                title: event.titulo,
                description: event.descripcion,
                date: fechaCorrecta,
                day: String(fechaCorrecta.getDate()).padStart(2, "0"),
                month: fechaCorrecta
                  .toLocaleDateString("es-ES", opcionesMes)
                  .toUpperCase(),
                time: event.hora || "08:00 AM - 17:00 PM",
                location: event.ubicacion || "Ubicación no especificada",
              };
            })
            .filter((event) => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate >= hoy;
            })
            .sort((a, b) => a.date - b.date);

          setEvents(eventosFiltrados);
        } else {
          console.warn("Formato de datos no reconocido:", data);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error al obtener eventos:", error);
        setError(
          "No se pudieron cargar los eventos. Intenta de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const startIndex = page * eventosPorPagina;
  const eventosMostrados = events.slice(
    startIndex,
    startIndex + eventosPorPagina
  );
  const hayMas = startIndex + eventosPorPagina < events.length;
  const hayAnterior = page > 0;

  const handleNextPage = () => {
    if (hayMas) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (hayAnterior) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  if (loading) {
    return (
      <EventsSectionContainer>
        <SectionHeader>
          <SectionTitle>Cargando eventos...</SectionTitle>
        </SectionHeader>
      </EventsSectionContainer>
    );
  }

  if (error) {
    return (
      <EventsSectionContainer>
        <SectionHeader>
          <SectionTitle>Error</SectionTitle>
          <p>{error}</p>
        </SectionHeader>
      </EventsSectionContainer>
    );
  }

  if (events.length === 0) {
    return (
      <EventsSectionContainer>
        <SectionHeader>
          <SectionTitle>
            Próximos <TitleAccent>Eventos</TitleAccent>
          </SectionTitle>
        </SectionHeader>
        <p>No hay eventos próximos programados.</p>
      </EventsSectionContainer>
    );
  }

  return (
    <EventsSectionContainer>
      <SectionHeader>
        <SectionTitle>
          Próximos <TitleAccent>Eventos</TitleAccent>
        </SectionTitle>
      </SectionHeader>

      <EventsGrid>
        {eventosMostrados.map((event) => (
          <EventCard key={event.id}>
            <EventDate>
              <EventMonth>{event.month}</EventMonth>
              <EventDay>{event.day}</EventDay>
            </EventDate>
            <EventContent>
              <EventTitle>{event.title}</EventTitle>
              <EventTime>
                <IconContainer>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </IconContainer>
                {event.time}
              </EventTime>
              <EventLocation>
                <IconContainer>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </IconContainer>
                {event.location}
              </EventLocation>
            </EventContent>
          </EventCard>
        ))}
      </EventsGrid>

      {(hayMas || hayAnterior) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1.5rem",
            padding: "0 1rem",
          }}
        >
          <button
            onClick={handlePrevPage}
            disabled={!hayAnterior}
            style={{
              background: "none",
              border: "none",
              cursor: hayAnterior ? "pointer" : "default",
              opacity: hayAnterior ? 1 : 0.5,
            }}
          >
            ⬅️ Anterior
          </button>
          <span>
            Página {page + 1} de {Math.ceil(events.length / eventosPorPagina)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hayMas}
            style={{
              background: "none",
              border: "none",
              cursor: hayMas ? "pointer" : "default",
              opacity: hayMas ? 1 : 0.5,
            }}
          >
            Siguiente ➡️
          </button>
        </div>
      )}
    </EventsSectionContainer>
  );
};

export default Eventos;

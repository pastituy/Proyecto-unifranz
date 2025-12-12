import { useEffect, useState } from "react";
import styled from "styled-components";
import { IoSend } from "react-icons/io5";
import toast from "react-hot-toast";
import BlogPreview from "./components/blogPreview";

const API_KEY =
  "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";

const CancerNewsChat = () => {
  const [question, setQuestion] = useState("");
  const [responses, setResponses] = useState(() => {
    const saved = localStorage.getItem("cancer-chat");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("cancer-chat", JSON.stringify(responses));
  }, [responses]);

  const crearRecurso = async (tipo, data) => {
    const url =
      tipo === "evento"
        ? "http://localhost:3000/evento"
        : "http://localhost:3000/campana";

    console.log("Enviando POST a:", url);
    console.log("Datos enviados:", data);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`No se pudo crear el ${tipo}`);
      toast.success(
        `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} creado correctamente`
      );
    } catch (error) {
      console.error("Error al crear recurso:", error);
      toast.error(`Error al crear ${tipo}`);
    }
  };

  const publicarEnFacebook = async (data) => {
    const url = "http://localhost:3000/api/facebook/publish";

    console.log("Enviando POST a Facebook:", url);
    console.log("Datos de publicación:", data);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("No se pudo publicar en Facebook");

      const result = await res.json();
      toast.success("¡Publicación enviada a Facebook exitosamente!");
      return result;
    } catch (error) {
      console.error("Error al publicar en Facebook:", error);
      toast.error("Error al publicar en Facebook");
      throw error;
    }
  };

  const programarPublicacionFacebook = async (data) => {
    const url = "http://localhost:3000/api/facebook/schedule";

    console.log("Programando publicación en Facebook:", url);
    console.log("Datos de publicación programada:", data);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("No se pudo programar la publicación");

      const result = await res.json();
      toast.success("¡Publicación programada exitosamente!");
      return result;
    } catch (error) {
      console.error("Error al programar publicación:", error);
      toast.error("Error al programar publicación en Facebook");
      throw error;
    }
  };

 const handleSend = async () => {
  if (!question.trim()) return;
  setLoading(true);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
      },
      body: JSON.stringify({
        model: "openai/chatgpt-4o-latest",
        max_tokens: 1000, // 👈 Limitar respuesta para evitar error de créditos
        messages: [
          {
            role: "system",
            content: `Eres un asistente útil que responde preguntas sobre el cáncer en los niños. Puedes crear eventos, campañas y publicaciones de Facebook (inmediatas o programadas).

Si el usuario dice 'crea un evento' o 'crea una campaña', responde solo con un objeto JSON válido:

EVENTO:
{
  "titulo": "",
  "descripcion": "",
  "fecha": "",
  "ubicacion": ""
}

CAMPAÑA:
{
  "titulo": "",
  "descripcion": "",
  "multimedia": "",
  "fecha": "",
  "recaudado": 0,
  "previstro": 0
}

PUBLICACIÓN FACEBOOK INMEDIATA:
Si el usuario menciona "publica en facebook", "post en facebook", "comparte en facebook" o similar SIN mencionar fecha/hora de programación, responde SOLO con:
{
  "type": "facebook_post",
  "title": "título opcional",
  "message": "mensaje principal de la publicación",
  "imageUrl": "URL de imagen si se proporciona",
  "link": "URL del enlace si se proporciona"
}

PUBLICACIÓN FACEBOOK PROGRAMADA:
Si el usuario menciona "programa", "programar", "agendar", "schedule" junto con Facebook, o indica una fecha/hora específica para publicar, responde SOLO con:
{
  "type": "facebook_scheduled_post",
  "title": "título opcional",
  "message": "mensaje principal de la publicación",
  "imageUrl": "URL de imagen si se proporciona",
  "link": "URL del enlace si se proporciona",
  "scheduleDate": "fecha y hora en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)"
}

IMPORTANTE para fechas programadas:
- Si el usuario dice "mañana a las 3pm", calcula la fecha basándote en la fecha actual
- La fecha actual es: ${new Date().toISOString()}
- Convierte expresiones como "en 2 horas", "mañana", "el viernes" a formato ISO
- Si no se especifica hora, usa las 12:00 del mediodía

Extrae la información del mensaje del usuario para completar los campos.`,
          },
          { role: "user", content: question },
        ],
      }),
    });

    const data = await res.json();
    if (!data.choices) {
      toast.error("No se obtuvo respuesta del modelo.");
      return;
    }

    const botMessage = data.choices[0].message.content.trim();

    let parsed;
    let tipo = "";

    try {
      parsed = JSON.parse(botMessage);
      if (parsed.type === "facebook_post") {
        await publicarEnFacebook({
          title: parsed.title || "",
          message: parsed.message || "",
          imageUrl: parsed.imageUrl || "",
          link: parsed.link || "",
        });
        tipo = "publicación de Facebook";

        setResponses((prev) => [
          ...prev,
          {
            user: question,
            results: [
              `✅ La publicación ha sido enviada a Facebook exitosamente!\n\n📝 Mensaje: ${
                parsed.message
              }\n${parsed.imageUrl ? `🖼️ Imagen: ${parsed.imageUrl}\n` : ""}${
                parsed.link ? `🔗 Enlace: ${parsed.link}` : ""
              }`,
            ],
          },
        ]);
      } else if (parsed.type === "facebook_scheduled_post") {
        const scheduleDate = new Date(parsed.scheduleDate);
        const fechaFormateada = scheduleDate.toLocaleString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        await programarPublicacionFacebook({
          title: parsed.title || "",
          message: parsed.message || "",
          imageUrl: parsed.imageUrl || "",
          link: parsed.link || "",
          scheduleDate: parsed.scheduleDate,
        });
        tipo = "publicación programada de Facebook";

        setResponses((prev) => [
          ...prev,
          {
            user: question,
            results: [
              `✅ ¡Publicación programada exitosamente!\n\n📅 Fecha: ${fechaFormateada}\n📝 Mensaje: ${
                parsed.message
              }\n${parsed.imageUrl ? `🖼️ Imagen: ${parsed.imageUrl}\n` : ""}${
                parsed.link ? `🔗 Enlace: ${parsed.link}` : ""
              }`,
            ],
          },
        ]);
      } else if (parsed.ubicacion) {
        await crearRecurso("evento", parsed);
        tipo = "evento";
        setResponses((prev) => [
          ...prev,
          {
            user: question,
            results: [`✅ El evento ha sido creado correctamente.`],
          },
        ]);
      } else if (
        typeof parsed.recaudado === "number" &&
        typeof parsed.previstro === "number"
      ) {
        await crearRecurso("campana", parsed);
        tipo = "campaña";
        setResponses((prev) => [
          ...prev,
          {
            user: question,
            results: [
              `✅ La campaña ha sido creada correctamente. Agregue la imagen por el formulario.`,
            ],
          },
        ]);
      }
    } catch (e) {
      console.error("Error al parsear JSON:", e);
      setResponses((prev) => [
        ...prev,
        {
          user: question,
          results: [botMessage],
        },
      ]);
    }

    setQuestion("");
  } catch (error) {
    console.error(error);
    toast.error("Error al obtener la respuesta.");
  } finally {
    setLoading(false);
  }
};


  return (
    <Container>
      <Header>
        <Title>Asistente de Cáncer Infantil</Title>
        <Subtitle>Sistema de gestión y consultas médicas</Subtitle>
        <CardTitle>Funcionalidades</CardTitle>
        <FeatureList>
          <FeatureItem>
            <FeatureIcon>📚</FeatureIcon>
            <FeatureText>Consultas médicas</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>📅</FeatureIcon>
            <FeatureText>Eventos médicos</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureText>Campañas de salud</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureText>Redes sociales</FeatureText>
          </FeatureItem>
        </FeatureList>
      </Header>

      <Sidebar></Sidebar>

      <ChatContainer>
        <ChatBox>
          {responses.map((entry, idx) => (
            <ChatEntry key={idx}>
              <UserMessage>
                <MessageHeader>
                  <Avatar>👤</Avatar>
                  <MessageLabel>Usuario</MessageLabel>
                </MessageHeader>
                <MessageContent>{entry.user}</MessageContent>
              </UserMessage>

              <BotMessage>
                <MessageHeader>
                  <Avatar>🤖</Avatar>
                  <MessageLabel>Asistente</MessageLabel>
                </MessageHeader>
                <BotResponse>
                  {entry.results.map((text, i) => {
                    let parsed;
                    try {
                      parsed = JSON.parse(text);
                    } catch (_) {}

                    return (
                      <MessageContent key={i}>
                        {parsed && parsed.titulo && parsed.contenidos ? (
                          <BlogPreview blog={parsed} />
                        ) : (
                          <ResponseText>{text}</ResponseText>
                        )}
                      </MessageContent>
                    );
                  })}
                </BotResponse>
              </BotMessage>
            </ChatEntry>
          ))}
          {loading && (
            <LoadingMessage>
              <MessageHeader>
                <Avatar>🤖</Avatar>
                <MessageLabel>Asistente</MessageLabel>
              </MessageHeader>
              <LoadingText>Procesando su solicitud...</LoadingText>
            </LoadingMessage>
          )}
        </ChatBox>
      </ChatContainer>

      <ExamplesSection>
        <SectionTitle>Comandos</SectionTitle>
        <ExamplesGrid>
          <ExampleCard
            onClick={() =>
              setQuestion(
                "publica en facebook: ¡Nuevo artículo sobre prevención del cáncer infantil!"
              )
            }
          >
            <ExampleIcon>📱</ExampleIcon>
            <ExampleTitle>Post simple</ExampleTitle>
          </ExampleCard>

          <ExampleCard
            onClick={() =>
              setQuestion(
                "publica en facebook: Infografía sobre síntomas https://imagen.com/infografia.jpg https://miweb.com/articulo"
              )
            }
          >
            <ExampleIcon>🖼️</ExampleIcon>
            <ExampleTitle>Con media</ExampleTitle>
          </ExampleCard>

          <ExampleCard
            onClick={() =>
              setQuestion(
                "programa una publicación en facebook para mañana a las 10am: ¡Únete a nuestra campaña de donación!"
              )
            }
          >
            <ExampleIcon>⏰</ExampleIcon>
            <ExampleTitle>Programar post</ExampleTitle>
          </ExampleCard>

          <ExampleCard onClick={() => setQuestion("crea un evento")}>
            <ExampleIcon>📅</ExampleIcon>
            <ExampleTitle>Crear evento</ExampleTitle>
          </ExampleCard>

          <ExampleCard onClick={() => setQuestion("crea una campaña")}>
            <ExampleIcon>🎯</ExampleIcon>
            <ExampleTitle>Nueva campaña</ExampleTitle>
          </ExampleCard>
        </ExamplesGrid>
      </ExamplesSection>

      <InputSection>
        <InputContainer>
          <InputField
            type="text"
            placeholder="Escriba su consulta o comando..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <SendButton onClick={handleSend} disabled={loading}>
            <IoSend size={18} />
          </SendButton>
        </InputContainer>
      </InputSection>
    </Container>
  );
};

export default CancerNewsChat;

// Styled Components
const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, sans-serif;
  background-color: #fafafa;
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  grid-template-areas:
    "header header header"
    "sidebar chat examples"
    "input input input";
  overflow: hidden;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
  font-weight: 400;
`;

const WelcomeCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FeatureIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

const FeatureText = styled.span`
  font-size: 13px;
  color: #333;
  font-weight: 400;
`;

const ChatContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const ChatBox = styled.div`
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
`;

const ChatEntry = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Avatar = styled.span`
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UserMessage = styled.div`
  margin-bottom: 16px;
`;

const BotMessage = styled.div``;

const MessageContent = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  margin-left: 32px;
`;

const BotResponse = styled.div`
  margin-left: 32px;
`;

const ResponseText = styled.pre`
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #ff6347;
`;

const LoadingMessage = styled.div`
  margin-bottom: 24px;
`;

const LoadingText = styled.div`
  font-size: 15px;
  color: #666;
  font-style: italic;
  margin-left: 32px;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const InputContainer = styled.div`
  display: flex;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  overflow: hidden;

  &:focus-within {
    border-color: #ff6347;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }
`;

const InputField = styled.input`
  flex: 1;
  border: none;
  padding: 14px 16px;
  font-size: 15px;
  outline: none;
  background: transparent;

  &::placeholder {
    color: #8c959f;
  }
`;

const SendButton = styled.button`
  background-color: #ff6347;
  border: none;
  padding: 14px 18px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
  }
`;

const ExamplesSection = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
`;

const ExamplesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ExampleCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #ff6347;
    transform: translateX(2px);
  }
`;

const ExampleIcon = styled.div`
  font-size: 16px;
  margin-bottom: 4px;
`;

const ExampleTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const Sidebar = styled.div`
  grid-area: sidebar;
  background: white;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
  background: transparent;
`;

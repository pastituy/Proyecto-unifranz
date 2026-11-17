import React, { useState, useRef, useEffect } from 'react';

// Estilos
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f5f5f5',
  },
  mainChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#fff',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#1877F2',
    color: 'white',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '600',
  },
  headerSubtitle: {
    margin: '5px 0 0 0',
    fontSize: '0.85rem',
    opacity: 0.9,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#f8f9fa',
  },
  messageWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    color: '#333',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1877F2',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  optionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
    alignSelf: 'flex-start',
  },
  optionButton: {
    padding: '10px 18px',
    border: '2px solid #1877F2',
    borderRadius: '20px',
    backgroundColor: 'white',
    color: '#1877F2',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  inputContainer: {
    padding: '15px 20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    fontFamily: 'inherit',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#1877F2',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  quickActions: {
    width: '220px',
    backgroundColor: '#fff',
    borderLeft: '1px solid #e0e0e0',
    padding: '20px',
    overflowY: 'auto',
  },
  quickActionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px',
  },
  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'all 0.2s',
    fontSize: '13px',
    color: '#333',
    textAlign: 'left',
  },
  scheduledList: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },
  scheduledItem: {
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '12px',
    borderLeft: '3px solid #1877F2',
  },
  previewCard: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '10px',
    maxWidth: '320px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  previewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1877F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  previewImage: {
    width: '100%',
    borderRadius: '8px',
    marginTop: '10px',
    maxHeight: '200px',
    objectFit: 'cover',
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
    padding: '8px 0',
  },
  botAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1877F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    marginBottom: '4px',
  },
};

// Estados del flujo conversacional
const FLOW_STEPS = {
  INITIAL: 'initial',
  SELECT_PLATFORM: 'select_platform',
  SELECT_TYPE: 'select_type',
  SELECT_CONTENT_MODE: 'select_content_mode',
  ENTER_AI_PROMPT: 'enter_ai_prompt',
  GENERATING_AI: 'generating_ai',
  ENTER_MESSAGE: 'enter_message',
  ENTER_IMAGE: 'enter_image',
  ENTER_VIDEO: 'enter_video',
  ENTER_LINK: 'enter_link',
  ENTER_SCHEDULE: 'enter_schedule',
  CONFIRM: 'confirm',
  PUBLISHING: 'publishing',
  DONE: 'done',
};

// Configuración de plataformas
const PLATFORMS = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    supportsScheduling: true,
    supportsAutoPublish: true,
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    supportsScheduling: false,
    supportsAutoPublish: false, // Requiere publicación manual
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000',
    supportsScheduling: true,
    supportsAutoPublish: true,
    maxLength: 280, // Límite de caracteres para Twitter
  },
};


const Redes = () => {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(FLOW_STEPS.INITIAL);
  const [inputValue, setInputValue] = useState('');
  const [postData, setPostData] = useState({
    platform: '',
    type: '',
    message: '',
    imageUrl: '',
    videoUrl: '',
    link: '',
    scheduleDate: '',
  });
  const [pendingTikTokPosts, setPendingTikTokPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const messagesEndRef = useRef(null);

  // Función para generar contenido con IA
  const generateAIContent = async (prompt, platform = 'facebook') => {
    setIsGeneratingAI(true);
    addBotMessage('🤖 Generando contenido con IA...');

    const platformPrompts = {
      facebook: `Eres un experto en marketing de redes sociales para la Fundación OncoFeliz, una organización que apoya a niños con cáncer en Cochabamba, Bolivia.

Tu tarea es crear publicaciones para Facebook que sean:
- Emotivas pero profesionales
- Claras y concisas (máximo 280 caracteres idealmente)
- Con llamados a la acción cuando sea apropiado
- Usando emojis de forma moderada y apropiada

Responde SOLO con el texto de la publicación, sin explicaciones adicionales.
No uses comillas al inicio ni al final del mensaje.`,
      tiktok: `Eres un experto en marketing de TikTok para la Fundación OncoFeliz, una organización que apoya a niños con cáncer en Cochabamba, Bolivia.

Tu tarea es crear descripciones/captions para TikTok que sean:
- Cortas y llamativas (máximo 150 caracteres)
- Con hashtags relevantes al final (#OncoFeliz #Bolivia #CancerInfantil #Donaciones)
- Lenguaje juvenil pero respetuoso
- Emojis estratégicos para captar atención
- Con gancho emocional

Responde SOLO con el texto del caption, sin explicaciones adicionales.
Incluye 3-5 hashtags relevantes al final.
No uses comillas al inicio ni al final del mensaje.`,
      twitter: `Eres un experto en marketing de Twitter/X para la Fundación OncoFeliz, una organización que apoya a niños con cáncer en Cochabamba, Bolivia.

Tu tarea es crear tweets que sean:
- MÁXIMO 280 caracteres (CRÍTICO - debe caber en un tweet)
- Concisos, impactantes y directos
- Con 2-3 hashtags relevantes (#OncoFeliz #CancerInfantil #Bolivia)
- Emotivos pero profesionales
- Con llamado a la acción cuando sea apropiado
- Uso moderado de emojis (1-2 máximo)

IMPORTANTE: El texto DEBE ser menor a 280 caracteres contando hashtags y espacios.

Responde SOLO con el texto del tweet, sin explicaciones adicionales.
No uses comillas al inicio ni al final del mensaje.`
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/api/ai/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content: platformPrompts[platform] || platformPrompts.facebook
            },
            {
              role: "user",
              content: prompt
            }
          ],
        }),
      });

      const result = await response.json();

      if (result.success) {
        const generatedMessage = result.data.choices[0].message.content.trim();
        return generatedMessage;
      } else {
        throw new Error(result.error || "No se pudo generar el contenido");
      }
    } catch (error) {
      console.error("Error generando contenido:", error);
      throw error;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
    // Cargar publicaciones programadas del backend
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/facebook/scheduled');
      const result = await response.json();
      if (result.success && result.posts) {
        const pendingPosts = result.posts
          .filter(post => post.status === 'pending')
          .map(post => ({
            ...post,
            type: 'scheduled',
            scheduleDate: post.scheduledTime,
          }));
        setScheduledPosts(pendingPosts);
        return pendingPosts; // Retornar las publicaciones cargadas
      }
      return [];
    } catch (error) {
      console.error('Error cargando publicaciones programadas:', error);
      return [];
    }
  };

  const addBotMessage = (text, options = null, preview = null) => {
    setMessages(prev => [...prev, {
      type: 'bot',
      text,
      options,
      preview,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  const startConversation = () => {
    setTimeout(() => {
      addBotMessage(
        '¡Hola! Soy tu asistente para publicaciones en redes sociales.\n\n¿En qué plataforma quieres publicar?',
        [
          { label: 'Facebook', value: 'facebook', icon: '📘' },
          { label: 'TikTok', value: 'tiktok', icon: '🎵' },
          { label: 'X (Twitter)', value: 'twitter', icon: '𝕏' },
        ]
      );
      setCurrentStep(FLOW_STEPS.SELECT_PLATFORM);
    }, 500);
  };

  const handleOptionClick = (option) => {
    addUserMessage(option.icon ? `${option.icon} ${option.label}` : option.label);

    switch (currentStep) {
      case FLOW_STEPS.SELECT_PLATFORM:
        setPostData(prev => ({ ...prev, platform: option.value }));
        const platform = PLATFORMS[option.value];

        if (option.value === 'tiktok') {
          // TikTok: solo preparar contenido (no auto-publish)
          setTimeout(() => {
            addBotMessage(
              `${platform.icon} ¡Vamos a preparar tu contenido para TikTok!\n\n⚠️ Nota: TikTok requiere publicación manual. Te prepararé el contenido y podrás copiarlo fácilmente.\n\n¿Cómo quieres crear el contenido?`,
              [
                { label: 'Escribir manualmente', value: 'manual', icon: '✍️' },
                { label: 'Generar con IA', value: 'ai', icon: '🤖' },
              ]
            );
            setPostData(prev => ({ ...prev, type: 'manual_publish' }));
            setCurrentStep(FLOW_STEPS.SELECT_CONTENT_MODE);
          }, 500);
        } else {
          // Facebook y Twitter: opciones completas
          setTimeout(() => {
            addBotMessage(
              `${platform.icon} ¡Perfecto! ¿Qué te gustaría hacer en ${platform.name}?`,
              [
                { label: 'Publicar ahora', value: 'immediate', icon: '🚀' },
                { label: 'Programar publicación', value: 'scheduled', icon: '⏰' },
                { label: 'Ver programadas', value: 'view_scheduled', icon: '📋' },
              ]
            );
            setCurrentStep(FLOW_STEPS.SELECT_TYPE);
          }, 500);
        }
        break;

      case FLOW_STEPS.SELECT_TYPE:
        if (option.value === 'view_scheduled') {
          showScheduledPosts();
          return;
        }
        setPostData(prev => ({ ...prev, type: option.value }));
        setTimeout(() => {
          const typeText = option.value === 'immediate'
            ? '¡Perfecto! Vamos a crear tu publicación.\n\n'
            : '¡Genial! Programaremos tu publicación.\n\n';
          addBotMessage(
            typeText + '¿Cómo quieres crear el contenido?',
            [
              { label: 'Escribir manualmente', value: 'manual', icon: '✍️' },
              { label: 'Generar con IA', value: 'ai', icon: '🤖' },
            ]
          );
          setCurrentStep(FLOW_STEPS.SELECT_CONTENT_MODE);
        }, 500);
        break;

      case FLOW_STEPS.SELECT_CONTENT_MODE:
        if (option.value === 'manual') {
          setTimeout(() => {
            const stepNum = postData.type === 'scheduled' ? '1 de 4' : '1 de 3';
            addBotMessage(`Paso ${stepNum}:\n¿Cuál es el mensaje que quieres publicar?`);
            setCurrentStep(FLOW_STEPS.ENTER_MESSAGE);
          }, 500);
        } else if (option.value === 'ai') {
          setTimeout(() => {
            addBotMessage(
              '🤖 ¡Excelente! Voy a ayudarte a crear el contenido.\n\nDescríbeme brevemente de qué quieres que trate la publicación.\n\nEjemplos:\n• "Invitación a donar para medicamentos"\n• "Agradecer a los voluntarios"\n• "Anunciar evento de recaudación"\n• "Compartir historia de éxito"'
            );
            setCurrentStep(FLOW_STEPS.ENTER_AI_PROMPT);
          }, 500);
        }
        break;

      case FLOW_STEPS.ENTER_AI_PROMPT:
        // Manejar opciones después de generar contenido
        if (option.value === 'accept_ai') {
          setTimeout(() => {
            const stepNum = postData.type === 'scheduled' ? '2 de 4' : '2 de 3';
            addBotMessage(
              `¡Perfecto!\n\nPaso ${stepNum}:\n¿Quieres agregar una imagen?\nIngresa la URL de la imagen:`,
              [{ label: 'Omitir imagen', value: 'skip', icon: '➡️' }]
            );
            setCurrentStep(FLOW_STEPS.ENTER_IMAGE);
          }, 500);
        } else if (option.value === 'regenerate_ai') {
          setTimeout(() => {
            addBotMessage('Dame una nueva descripción para generar otro contenido:');
          }, 500);
        } else if (option.value === 'edit_ai') {
          setTimeout(() => {
            addBotMessage('Escribe el mensaje como quieras que quede:');
            setCurrentStep(FLOW_STEPS.ENTER_MESSAGE);
          }, 500);
        }
        break;

      case FLOW_STEPS.ENTER_IMAGE:
        if (option.value === 'skip') {
          handleImageSkip();
        }
        break;

      case FLOW_STEPS.ENTER_LINK:
        if (option.value === 'skip') {
          handleLinkSkip();
        }
        break;

      case FLOW_STEPS.CONFIRM:
        if (option.value === 'confirm') {
          publishPost();
        } else if (option.value === 'cancel') {
          resetConversation();
        } else if (option.value === 'edit') {
          setTimeout(() => {
            addBotMessage('¿Qué deseas modificar?', [
              { label: 'Mensaje', value: 'edit_message', icon: '📝' },
              { label: 'Imagen', value: 'edit_image', icon: '🖼️' },
              { label: 'Enlace', value: 'edit_link', icon: '🔗' },
              ...(postData.type === 'scheduled' ? [{ label: 'Fecha/Hora', value: 'edit_date', icon: '📅' }] : []),
            ]);
          }, 500);
        } else if (option.value === 'edit_message') {
          setTimeout(() => {
            addBotMessage('Escribe el nuevo mensaje:');
            setCurrentStep(FLOW_STEPS.ENTER_MESSAGE);
          }, 500);
        } else if (option.value === 'edit_image') {
          setTimeout(() => {
            addBotMessage('Ingresa la nueva URL de imagen:', [{ label: 'Sin imagen', value: 'clear_image', icon: '🚫' }]);
            setCurrentStep(FLOW_STEPS.ENTER_IMAGE);
          }, 500);
        } else if (option.value === 'clear_image') {
          setPostData(prev => ({ ...prev, imageUrl: '' }));
          showConfirmation();
        } else if (option.value === 'edit_link') {
          setTimeout(() => {
            addBotMessage('Ingresa el nuevo enlace:', [{ label: 'Sin enlace', value: 'clear_link', icon: '🚫' }]);
            setCurrentStep(FLOW_STEPS.ENTER_LINK);
          }, 500);
        } else if (option.value === 'clear_link') {
          setPostData(prev => ({ ...prev, link: '' }));
          showConfirmation();
        } else if (option.value === 'edit_date') {
          setTimeout(() => {
            addBotMessage('Ingresa la nueva fecha y hora:\nFormato: DD/MM/YYYY HH:MM');
            setCurrentStep(FLOW_STEPS.ENTER_SCHEDULE);
          }, 500);
        }
        break;

      case FLOW_STEPS.DONE:
        if (option.value === 'new') {
          resetConversation();
        } else if (option.value === 'copy_caption') {
          // Copiar caption al portapapeles
          navigator.clipboard.writeText(postData.message).then(() => {
            addBotMessage('✅ ¡Caption copiado al portapapeles!\n\nAhora puedes pegarlo en TikTok.', [
              { label: 'Nueva publicación', value: 'new', icon: '🆕' },
            ]);
          }).catch(() => {
            addBotMessage('❌ No se pudo copiar. Selecciona y copia el texto manualmente.', [
              { label: 'Nueva publicación', value: 'new', icon: '🆕' },
            ]);
          });
        }
        break;

      default:
        break;
    }
  };

  const handleImageSkip = () => {
    setTimeout(() => {
      const stepNum = postData.type === 'scheduled' ? '3 de 4' : '3 de 3';
      addBotMessage(
        `Paso ${stepNum}:\n¿Quieres agregar un enlace a tu publicación?`,
        [{ label: 'Omitir enlace', value: 'skip', icon: '➡️' }]
      );
      setCurrentStep(FLOW_STEPS.ENTER_LINK);
    }, 500);
  };

  const handleLinkSkip = () => {
    if (postData.type === 'scheduled') {
      setTimeout(() => {
        addBotMessage(
          'Paso 4 de 4:\n¿Cuándo quieres que se publique?\n\nFormato: DD/MM/YYYY HH:MM\nEjemplo: 25/11/2025 14:30'
        );
        setCurrentStep(FLOW_STEPS.ENTER_SCHEDULE);
      }, 500);
    } else {
      showConfirmation();
    }
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;

    const value = inputValue.trim();
    addUserMessage(value);
    setInputValue('');

    switch (currentStep) {
      case FLOW_STEPS.ENTER_AI_PROMPT:
        // Generar contenido con IA
        try {
          const generatedContent = await generateAIContent(value, postData.platform);
          setPostData(prev => ({ ...prev, message: generatedContent }));

          setTimeout(() => {
            addBotMessage(
              `✨ He generado este contenido para ti:\n\n"${generatedContent}"\n\n¿Qué te parece?`,
              [
                { label: 'Usar este texto', value: 'accept_ai', icon: '✅' },
                { label: 'Regenerar', value: 'regenerate_ai', icon: '🔄' },
                { label: 'Editar manualmente', value: 'edit_ai', icon: '✏️' },
              ]
            );
          }, 500);
        } catch (error) {
          addBotMessage(
            '❌ Hubo un error al generar el contenido. Por favor, intenta de nuevo o escribe el mensaje manualmente.',
            [
              { label: 'Intentar de nuevo', value: 'regenerate_ai', icon: '🔄' },
              { label: 'Escribir manualmente', value: 'edit_ai', icon: '✏️' },
            ]
          );
        }
        break;

      case FLOW_STEPS.ENTER_MESSAGE:
        setPostData(prev => ({ ...prev, message: value }));
        setTimeout(() => {
          const stepNum = postData.type === 'scheduled' ? '2 de 4' : '2 de 3';
          addBotMessage(
            `¡Excelente!\n\nPaso ${stepNum}:\n¿Quieres agregar una imagen?\nIngresa la URL de la imagen:`,
            [{ label: 'Omitir imagen', value: 'skip', icon: '➡️' }]
          );
          setCurrentStep(FLOW_STEPS.ENTER_IMAGE);
        }, 500);
        break;

      case FLOW_STEPS.ENTER_IMAGE:
        if (isValidUrl(value)) {
          setPostData(prev => ({ ...prev, imageUrl: value }));
          setTimeout(() => {
            const stepNum = postData.type === 'scheduled' ? '3 de 4' : '3 de 3';
            addBotMessage(
              `¡Imagen agregada!\n\nPaso ${stepNum}:\n¿Quieres agregar un enlace?`,
              [{ label: 'Omitir enlace', value: 'skip', icon: '➡️' }]
            );
            setCurrentStep(FLOW_STEPS.ENTER_LINK);
          }, 500);
        } else {
          addBotMessage('Por favor ingresa una URL válida (debe comenzar con http:// o https://)');
        }
        break;

      case FLOW_STEPS.ENTER_LINK:
        if (isValidUrl(value)) {
          setPostData(prev => ({ ...prev, link: value }));
          if (postData.type === 'scheduled') {
            setTimeout(() => {
              addBotMessage(
                'Paso 4 de 4:\n¿Cuándo quieres que se publique?\n\nFormato: DD/MM/YYYY HH:MM\nEjemplo: 25/11/2025 14:30'
              );
              setCurrentStep(FLOW_STEPS.ENTER_SCHEDULE);
            }, 500);
          } else {
            showConfirmation();
          }
        } else {
          addBotMessage('Por favor ingresa una URL válida (debe comenzar con http:// o https://)');
        }
        break;

      case FLOW_STEPS.ENTER_SCHEDULE:
        const parsedDate = parseDateTime(value);
        if (parsedDate) {
          setPostData(prev => ({ ...prev, scheduleDate: parsedDate }));
          showConfirmation(parsedDate);
        } else {
          addBotMessage('Formato de fecha inválido.\n\nUsa: DD/MM/YYYY HH:MM\nEjemplo: 25/11/2025 14:30\n\nLa fecha debe ser futura.');
        }
        break;

      default:
        break;
    }
  };

  const showConfirmation = (scheduleDate = null) => {
    const finalData = { ...postData };
    if (scheduleDate) {
      finalData.scheduleDate = scheduleDate;
    }

    setTimeout(() => {
      addBotMessage(
        '¡Todo listo! Revisa tu publicación:',
        [
          { label: 'Confirmar y publicar', value: 'confirm', icon: '✅' },
          { label: 'Editar', value: 'edit', icon: '✏️' },
          { label: 'Cancelar', value: 'cancel', icon: '❌' },
        ],
        finalData
      );
      setCurrentStep(FLOW_STEPS.CONFIRM);
    }, 500);
  };

  const publishPost = async () => {
    setIsLoading(true);
    setCurrentStep(FLOW_STEPS.PUBLISHING);

    // TikTok: Preparar contenido para publicación manual y enviar email
    if (postData.platform === 'tiktok') {
      addBotMessage('📋 Preparando tu contenido para TikTok...');

      let emailSent = false;
      try {
        // Guardar en backend y enviar email
        const response = await fetch('http://localhost:3000/api/tiktok/prepare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: postData.message,
            imageUrl: postData.imageUrl,
            createdAt: new Date().toISOString(),
          }),
        });

        const data = await response.json();
        emailSent = data.emailSent || false;

        if (emailSent) {
          addBotMessage('📧 ¡Email enviado! Revisa tu correo para ver el contenido.');
        }
      } catch (e) {
        console.log('No se pudo guardar en backend:', e);
      }

      setTimeout(() => {
        const copyContent = `📱 **Tu contenido está listo para TikTok:**\n\n` +
          `📝 **Caption:**\n${postData.message}\n\n` +
          (postData.imageUrl ? `🖼️ **Imagen:** ${postData.imageUrl}\n\n` : '') +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          (emailSent ? `✅ **Email enviado** - El contenido completo ha sido enviado a tu correo\n\n` : '') +
          `📲 **Pasos para publicar:**\n` +
          `1. Abre TikTok en tu celular\n` +
          `2. Toca el botón "+" para crear\n` +
          `3. Selecciona tu imagen/video\n` +
          `4. Copia y pega el caption ${emailSent ? '(desde aquí o desde el email)' : 'de arriba'}\n` +
          `5. ¡Publica! 🎉`;

        addBotMessage(
          copyContent,
          [
            { label: 'Copiar Caption', value: 'copy_caption', icon: '📋' },
            { label: 'Nueva publicación', value: 'new', icon: '🆕' },
          ]
        );
        setCurrentStep(FLOW_STEPS.DONE);
      }, emailSent ? 1500 : 1000);

      setIsLoading(false);
      return;
    }

    // Facebook y Twitter: Publicación automática
    const platformName = postData.platform === 'twitter' ? 'X (Twitter)' : 'Facebook';
    const platformEndpoint = postData.platform === 'twitter' ? 'twitter' : 'facebook';

    addBotMessage(`Enviando tu publicación a ${platformName}...`);

    try {
      const endpoint = postData.type === 'scheduled'
        ? `http://localhost:3000/api/${platformEndpoint}/schedule`
        : `http://localhost:3000/api/${platformEndpoint}/publish`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: postData.message,
          photo: postData.imageUrl,
          link: postData.link,
          scheduleDate: postData.scheduleDate,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (postData.type === 'scheduled') {
          // Recargar lista de publicaciones programadas desde el backend
          loadScheduledPosts();
        }

        setTimeout(() => {
          const successMessage = postData.type === 'scheduled'
            ? '✅ ¡Publicación programada exitosamente!\n\nTu post se publicará automáticamente en la fecha indicada.'
            : `✅ ¡Publicación realizada exitosamente en ${platformName}!`;

          addBotMessage(
            successMessage,
            [{ label: 'Nueva publicación', value: 'new', icon: '🆕' }]
          );
          setCurrentStep(FLOW_STEPS.DONE);
        }, 1000);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      setTimeout(() => {
        addBotMessage(
          `❌ Error: ${error.message}\n\n¿Qué deseas hacer?`,
          [
            { label: 'Reintentar', value: 'confirm', icon: '🔄' },
            { label: 'Nueva publicación', value: 'new', icon: '🆕' },
          ]
        );
        setCurrentStep(FLOW_STEPS.CONFIRM);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const showScheduledPosts = async () => {
    // Recargar publicaciones programadas del backend antes de mostrarlas
    addBotMessage('📋 Cargando publicaciones programadas...');

    try {
      const loadedPosts = await loadScheduledPosts();

      // Usar las publicaciones que acabamos de cargar directamente
      setTimeout(() => {
        if (loadedPosts.length === 0) {
          addBotMessage(
            'No tienes publicaciones programadas.\n\n¿Qué te gustaría hacer?',
            [
              { label: 'Publicar ahora', value: 'immediate', icon: '🚀' },
              { label: 'Programar publicación', value: 'scheduled', icon: '⏰' },
            ]
          );
        } else {
          const listText = loadedPosts.map((post, i) =>
            `${i + 1}. "${post.message.substring(0, 30)}..."\n   📅 ${formatScheduleDate(post.scheduleDate)}`
          ).join('\n\n');

          addBotMessage(
            `📋 Publicaciones programadas (${loadedPosts.length}):\n\n${listText}`,
            [
              { label: 'Publicar ahora', value: 'immediate', icon: '🚀' },
              { label: 'Programar otra', value: 'scheduled', icon: '⏰' },
            ]
          );
          setCurrentStep(FLOW_STEPS.SELECT_TYPE);
        }
      }, 500);
    } catch (error) {
      setTimeout(() => {
        addBotMessage(
          '❌ Error al cargar publicaciones programadas.\n\n¿Qué te gustaría hacer?',
          [
            { label: 'Publicar ahora', value: 'immediate', icon: '🚀' },
            { label: 'Programar publicación', value: 'scheduled', icon: '⏰' },
          ]
        );
      }, 500);
    }
  };

  const resetConversation = () => {
    setPostData({
      platform: '',
      type: '',
      message: '',
      imageUrl: '',
      videoUrl: '',
      link: '',
      scheduleDate: '',
    });
    setTimeout(() => {
      addBotMessage(
        '¿En qué plataforma quieres publicar?',
        [
          { label: 'Facebook', value: 'facebook', icon: '📘' },
          { label: 'TikTok', value: 'tiktok', icon: '🎵' },
          { label: 'X (Twitter)', value: 'twitter', icon: '𝕏' },
        ]
      );
      setCurrentStep(FLOW_STEPS.SELECT_PLATFORM);
    }, 500);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
      return false;
    }
  };

  const parseDateTime = (input) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
    const match = input.match(regex);

    if (match) {
      const [, day, month, year, hour, minute] = match;
      const date = new Date(year, month - 1, day, hour, minute);

      if (date > new Date()) {
        return date.toISOString();
      }
    }
    return null;
  };

  const formatScheduleDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleQuickAction = (action) => {
    // Si es "ver programadas", ejecutar directamente sin restricciones
    if (action === 'view') {
      addUserMessage('📋 Ver programadas');
      showScheduledPosts();
      return;
    }

    if (currentStep !== FLOW_STEPS.SELECT_TYPE && currentStep !== FLOW_STEPS.DONE && currentStep !== FLOW_STEPS.INITIAL && currentStep !== FLOW_STEPS.SELECT_CONTENT_MODE) {
      addUserMessage('Cancelar acción actual');
      resetConversation();
      return;
    }

    const optionMap = {
      'immediate': { label: 'Publicar ahora', value: 'immediate', icon: '🚀' },
      'scheduled': { label: 'Programar publicación', value: 'scheduled', icon: '⏰' },
      'view': { label: 'Ver programadas', value: 'view_scheduled', icon: '📋' },
      'ai_immediate': { label: 'Con IA (ahora)', value: 'ai_immediate', icon: '🤖' },
    };

    if (action === 'ai_immediate') {
      // Iniciar flujo de publicación inmediata con IA
      setPostData(prev => ({ ...prev, type: 'immediate' }));
      addUserMessage('🤖 Generar con IA');
      setTimeout(() => {
        addBotMessage(
          '🤖 ¡Excelente! Voy a ayudarte a crear el contenido.\n\nDescríbeme brevemente de qué quieres que trate la publicación.\n\nEjemplos:\n• "Invitación a donar para medicamentos"\n• "Agradecer a los voluntarios"\n• "Anunciar evento de recaudación"\n• "Compartir historia de éxito"'
        );
        setCurrentStep(FLOW_STEPS.ENTER_AI_PROMPT);
      }, 500);
      return;
    }

    if (optionMap[action]) {
      handleOptionClick(optionMap[action]);
    }
  };

  const renderPreview = (preview) => {
    if (!preview) return null;

    return (
      <div style={styles.previewCard}>
        <div style={styles.previewHeader}>
          <div style={styles.previewAvatar}>F</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Fundación OncoFeliz</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {preview.type === 'scheduled'
                ? `📅 ${formatScheduleDate(preview.scheduleDate)}`
                : '🕐 Ahora'}
            </div>
          </div>
        </div>
        <p style={{ margin: '10px 0', fontSize: '14px', lineHeight: '1.4' }}>{preview.message}</p>
        {preview.imageUrl && (
          <img
            src={preview.imageUrl}
            alt="Preview"
            style={styles.previewImage}
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        {preview.link && (
          <div style={{
            padding: '10px',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px',
            marginTop: '10px',
            fontSize: '12px',
            color: '#1877F2',
            wordBreak: 'break-all'
          }}>
            🔗 {preview.link}
          </div>
        )}
      </div>
    );
  };

  const LoadingIndicator = () => (
    <div style={{ ...styles.message, ...styles.botMessage, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={styles.loadingDots}>
        <span style={{ animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0s' }}>●</span>
        <span style={{ animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.2s' }}>●</span>
        <span style={{ animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.4s' }}>●</span>
      </div>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { opacity: 0.3; }
            40% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Chat Principal */}
      <div style={styles.mainChat}>
        {/* Header */}
        <div style={{
          ...styles.header,
          backgroundColor: postData.platform ? PLATFORMS[postData.platform]?.color || '#1877F2' : '#1877F2'
        }}>
          <h1 style={styles.headerTitle}>
            {postData.platform ? `${PLATFORMS[postData.platform]?.icon} Gestor de ${PLATFORMS[postData.platform]?.name}` : '📱 Gestor de Redes Sociales'}
          </h1>
          <p style={styles.headerSubtitle}>
            {postData.platform === 'tiktok'
              ? 'Prepara contenido para publicar manualmente'
              : 'Publica y programa contenido de forma conversacional'}
          </p>
        </div>

        {/* Mensajes */}
        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <div key={index} style={styles.messageWrapper}>
              {msg.type === 'bot' && (
                <div style={styles.botAvatar}>🤖</div>
              )}
              <div style={{
                ...styles.message,
                ...(msg.type === 'bot' ? styles.botMessage : styles.userMessage)
              }}>
                {msg.text}
              </div>
              {msg.preview && renderPreview(msg.preview)}
              {msg.options && (
                <div style={styles.optionsContainer}>
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      style={styles.optionButton}
                      onClick={() => handleOptionClick(opt)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1877F2';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#1877F2';
                      }}
                    >
                      {opt.icon && `${opt.icon} `}{opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(isLoading || isGeneratingAI) && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <textarea
            style={styles.textInput}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              currentStep === FLOW_STEPS.ENTER_MESSAGE ? 'Escribe tu mensaje para Facebook...' :
              currentStep === FLOW_STEPS.ENTER_IMAGE ? 'Pega la URL de la imagen...' :
              currentStep === FLOW_STEPS.ENTER_LINK ? 'Pega el enlace...' :
              currentStep === FLOW_STEPS.ENTER_SCHEDULE ? 'DD/MM/YYYY HH:MM (ej: 25/11/2025 14:30)' :
              'Selecciona una opción arriba...'
            }
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleInputSubmit();
              }
            }}
            rows={1}
            onFocus={(e) => e.target.style.borderColor = '#1877F2'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <button
            style={{
              ...styles.sendButton,
              backgroundColor: inputValue.trim() ? '#1877F2' : '#ccc',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            }}
            onClick={handleInputSubmit}
            disabled={!inputValue.trim()}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Panel de Acciones Rápidas */}
      <div style={styles.quickActions}>
        <div style={styles.quickActionsTitle}>Plataformas</div>

        <button
          style={{
            ...styles.quickActionButton,
            borderColor: '#1877F2',
            backgroundColor: postData.platform === 'facebook' ? '#e7f3ff' : 'white',
          }}
          onClick={() => {
            resetConversation();
            setTimeout(() => handleOptionClick({ label: 'Facebook', value: 'facebook', icon: '📘' }), 600);
          }}
        >
          📘 Facebook
        </button>

        <button
          style={{
            ...styles.quickActionButton,
            borderColor: '#000',
            backgroundColor: postData.platform === 'tiktok' ? '#f0f0f0' : 'white',
          }}
          onClick={() => {
            resetConversation();
            setTimeout(() => handleOptionClick({ label: 'TikTok', value: 'tiktok', icon: '🎵' }), 600);
          }}
        >
          🎵 TikTok
        </button>

        <button
          style={{
            ...styles.quickActionButton,
            borderColor: '#000000',
            backgroundColor: postData.platform === 'twitter' ? '#f0f0f0' : 'white',
          }}
          onClick={() => {
            resetConversation();
            setTimeout(() => handleOptionClick({ label: 'X (Twitter)', value: 'twitter', icon: '𝕏' }), 600);
          }}
        >
          𝕏 X (Twitter)
        </button>

        <div style={{ ...styles.quickActionsTitle, marginTop: '20px' }}>Acciones</div>

        <button
          style={{
            ...styles.quickActionButton,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
          }}
          onClick={() => handleQuickAction('ai_immediate')}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.9';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'scale(1)';
          }}
        >
          🤖 Generar con IA
        </button>

        <button
          style={styles.quickActionButton}
          onClick={() => handleQuickAction('view')}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#1877F2';
            e.target.style.backgroundColor = '#f0f7ff';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.backgroundColor = 'white';
          }}
        >
          📋 Ver Programadas
        </button>

        {/* Lista de publicaciones programadas */}
        {scheduledPosts.length > 0 && (
          <div style={styles.scheduledList}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: '#333' }}>
              📅 Próximas publicaciones ({scheduledPosts.length})
            </div>
            {scheduledPosts.slice(0, 3).map((post, i) => (
              <div key={i} style={styles.scheduledItem}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  {post.message.substring(0, 25)}...
                </div>
                <div style={{ color: '#666' }}>
                  {formatScheduleDate(post.scheduleDate)}
                </div>
              </div>
            ))}
            {scheduledPosts.length > 3 && (
              <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                +{scheduledPosts.length - 3} más
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Redes;

import { useCallback, useEffect, useState } from "react";
import { useUser } from "../context/userContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Abre el PDF de un informe psicológico.
 * El archivo está protegido (requiere sesión), así que se descarga con el token
 * y se muestra como blob en el PdfViewer. La URL temporal se libera al cerrar.
 */
export const useInformePsicologico = (onError) => {
  const { authFetch } = useUser();
  const [pdfViewer, setPdfViewer] = useState(null); // { url, title }

  const cerrarInforme = useCallback(() => {
    setPdfViewer((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  // Liberar la URL si el componente se desmonta con el visor abierto
  useEffect(() => () => pdfViewer?.url && URL.revokeObjectURL(pdfViewer.url), [pdfViewer]);

  const abrirInforme = useCallback(
    async (derivacion, nombreNino) => {
      try {
        const res = await authFetch(
          `${API_URL}/api/psicologia/derivaciones/${derivacion.id}/informe`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.mensaje || "No se pudo abrir el informe");
        }
        const blob = await res.blob();
        setPdfViewer({
          url: URL.createObjectURL(blob),
          title: `Informe Psicológico - ${nombreNino}`,
        });
      } catch (err) {
        onError?.(err.message);
      }
    },
    [authFetch, onError]
  );

  return { pdfViewer, abrirInforme, cerrarInforme };
};

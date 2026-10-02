# Qué es MINEVA

MINEVA significa **Minería de Datos y Evaluación de Variables para Regresión Aplicada**.

Es un proyecto académico que recorre el ciclo completo de un modelo siguiendo la metodología CRISP-DM, no solo la fase de entrenamiento:

1. Llegan tres tablas (dólar, glucosa, energía).
2. Se revisan y se dejan listas para modelar (limpieza, detección de anomalías).
3. Se ajusta una regresión lineal múltiple en cada una.
4. El modelo se guarda en un archivo serializado con pickle.
5. Una API lo carga y responde predicciones.
6. Cada predicción **puede** quedar anotada en PostgreSQL (historial y analíticas); si no hay base, la API igual devuelve el número predicho.

La regresión lineal es el modelo que pide el taller. No se cambia por un modelo más complejo en la API, porque el objetivo es explicar una recta y servirla igual que se entrenó.

## Las tres preguntas

| Escenario | Se predice | A partir de |
|---|---|---|
| Dólar | precio del dólar | día, inflación, tasa de interés |
| Glucosa | glucosa en sangre (mg/dL) | edad, IMC, horas de actividad |
| Energía | consumo (kWh) | temperatura, hora, día de la semana |

## Métricas reportadas

Además de las solicitadas (MSE y R²), cada modelo incluye error absoluto medio (MAE) y error porcentual absoluto medio (MAPE) para mayor contexto en la evaluación del desempeño.

## Dónde vive cada cosa

| Carpeta | Qué es |
|---|---|
| `data/raw/` | Los CSV tal como llegaron |
| `data/processed/` | Las mismas filas, con nombres y marcas de anomalía |
| `src/mineva/` | El código que limpia y entrena |
| `models/` | Los tres modelos ya entrenados (`.pkl`) |
| `backend/` | La API que predice |
| `frontend/` | Interfaz web (Next.js): formularios, resultados y gráficas |
| `report/` | Informe, resumen de tratamiento (`data_treatment.md`) y figuras PNG |
| `docs/` | Esta explicación |

El siguiente texto es [cómo se limpian los datos](02-limpieza-de-datos.md).

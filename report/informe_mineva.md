# Informe: Minería de Datos y Regresión Lineal Múltiple — MINEVA

**Minería, Inferencia, Evaluación y Visualización Aplicada**

---

## 1. Introducción

Este informe documenta el desarrollo completo de tres modelos de **regresión lineal múltiple** aplicados a contextos diferentes, siguiendo la metodología **CRISP-DM** (Cross-Industry Standard Process for Data Mining). El proyecto MINEVA integra:

1. Limpieza y preprocesamiento de datos
2. Entrenamiento de modelos con scikit-learn
3. Evaluación del desempeño mediante MSE, RMSE, MAE, MAPE y R²
4. Interpretación de coeficientes (originales y estandarizados)
5. Detección de multicolinealidad (VIF) y puntos influyentes (distancia de Cook)
6. Exportación de modelos entrenados (`.pkl` mediante pickle/joblib)
7. API REST (FastAPI) y aplicación web (Next.js) para predicciones en vivo

**Ejercicios abordados:**
- **Ejercicio 1:** Predicción del precio del dólar (500 registros)
- **Ejercicio 2:** Predicción de niveles de glucosa en sangre (2000 registros)
- **Ejercicio 3:** Predicción del consumo de energía eléctrica (10 000 registros)

---

## 2. Metodología CRISP-DM aplicada

### 2.1 Fase 1: Comprensión del negocio
Cada ejercicio tiene una variable objetivo cuantitativa que se desea predecir a partir de variables independientes conocidas. El objetivo no es solo obtener una predicción, sino **interpretar** cómo cada variable empuja o tira de la variable respuesta.

### 2.2 Fase 2: Comprensión de los datos
Se analizaron los tres conjuntos de datos originales en `data/raw/` para detectar:
- Valores faltantes
- Duplicados exactos
- Errores de captura (valores físicamente imposibles, ej. edad negativa, temperatura 300 °C)
- Distribución univariante y bivariante

### 2.3 Fase 3: Preparación de los datos
El pipeline de limpieza en `src/mineva/treatment.py` sigue reglas estrictas:
- Solo se elimina una fila si el valor es **físicamente imposible** (error de captura).
- Los outliers detectados por el método **IQR** (rango intercuartílico) se **marcan** pero **nunca se eliminan automáticamente**.
- Para el ejercicio de energía se aplica **codificación cíclica** (seno/coseno) a la hora (`hour_sin`, `hour_cos`), de modo que la hora 24 sea vecina de la hora 1 y no una distancia numérica grande.
- Se chequea **multicolinealidad** mediante el **Factor de Inflación de la Varianza (VIF)** antes del entrenamiento.
- Se realiza un split **hold-out del 25 %** con semilla fija (`random_state=7`) para reproducibilidad.

### 2.4 Fase 4: Modelado
Modelo base: **Regresión Lineal Múltiple por mínimos cuadrados ordinarios (OLS)** implementada como un `Pipeline` de scikit-learn:
1. `StandardScaler()` — estandariza variables (media 0, desviación 1)
2. `LinearRegression()` — ajuste OLS

La estandarización permite comparar coeficientes estandarizados directamente para valorar **importancia de variables**. Como comprobación de robustez se ajusta también un modelo **HuberRegressor** que reduce el peso de las colas sin eliminar registros.

### 2.5 Fase 5: Evaluación
Métricas reportadas en test (25 %):
- **R²** — coeficiente de determinación (proporción de varianza explicada)
- **MSE** — error cuadrático medio
- **RMSE** — raíz del MSE (misma unidad que la variable objetivo)
- **MAE** — error absoluto medio
- **MAPE** — error porcentual absoluto medio

Además:
- **Distancia de Cook** — identifica puntos que mueven significativamente la recta ajustada (umbral: 4/n)
- **Sensibilidad sin IQR** — entrenamiento alternativo excluyendo filas marcadas por IQR; si las métricas no cambian mucho, el modelo es robusto.

### 2.6 Fase 6: Despliegue
- Exportación del `Pipeline` + métricas + coeficientes en un diccionario serializado con **pickle** (`pickle.HIGHEST_PROTOCOL`).
- **FastAPI** expone `/api/v1/predict/{scenario}` y `/api/v1/catalog/`.
- **Next.js** ofrece formulario por ejercicio, predicción en vivo, visualización de coeficientes y figuras de dispersión.

---

## 3. Ejercicio 1 — Predicción del precio del dólar

### Datos
Fuente: `data/raw/dolar_data.csv` → 500 filas, 4 columnas.

| Variable original | Variable procesada | Descripción |
|---|---|---|
| Dia | `day` | Día consecutivo (1 a 500) |
| Inflacion | `inflation_rate` | Tasa de inflación diaria |
| Tasa_interes | `interest_rate` | Tasa de interés diaria |
| Precio_Dolar | `dollar_price` | **Objetivo**: precio del dólar |

### Limpieza
- Filas sucias: 500
- Filas tratadas: 500
- Filas eliminadas: 0 (0 errores de captura, 0 duplicados)
- Flags IQR conservados: inflación (4), tasa de interés (7)

### Coeficientes del modelo publicado

| Variable | Coeficiente (unidad original) | Coeficiente estandarizado |
|---|---:|---:|
| day | 4.9966 | 720.4680 |
| inflation_rate | -28.4457 | -0.1391 |
| interest_rate | -5.8818 | -2.8444 |
| intercept | 3990.6291 | 5200.3484 |

### Interpretación
1. **Día (day):** El coeficiente positivo de **4.9966** indica que, manteniendo fijas inflación y tasa de interés, el precio del dólar **aumenta ~5 unidades por cada día que pasa**. Es la variable **más influyente con diferencia** (coeficiente estandarizado ~720.5), lo que revela una fuerte tendencia temporal.
2. **Inflación (inflation_rate):** Un aumento de 1 unidad en la tasa de inflación **disminuye** el precio dólar en ~28.4 unidades. Su importancia estandarizada (-0.14) es muy baja en este ajuste.
3. **Tasa de interés (interest_rate):** Efecto negativo moderado: cada punto de interés baja el dólar en ~5.88 unidades. Es la segunda variable en importancia (-2.84).

### Desempeño

| Configuración | R² | MSE | RMSE | MAE | MAPE |
|---|---:|---:|---:|---:|---:|
| Publicado (todas las filas) | **0.9958** | 2216.07 | 47.08 | 36.29 | 0.70 % |
| Sin IQR | 0.9951 | 2820.32 | 53.11 | 41.04 | 0.80 % |
| Huber (robusto) | 0.9958 | 2198.42 | 46.89 | 36.14 | 0.70 % |

El R² **0.9958** es extremadamente alto: casi el 99.6 % de la variabilidad del precio del dólar es explicada por estas tres variables. 20 de 375 puntos (5.3 %) superan el umbral de Cook (0.0107), máximo 0.0455.

### Visualizaciones
- `report/figures/dollar_day_vs_dollar_price.png` — relación lineal fuerte y positiva (tendencia)
- `report/figures/dollar_inflation_rate_vs_dollar_price.png` — dispersión negativa moderada
- `report/figures/dollar_interest_rate_vs_dollar_price.png` — dispersión débil
- `report/figures/dollar_correlation.png` — mapa de calor de correlación

---

## 4. Ejercicio 2 — Predicción de niveles de glucosa

### Datos
Fuente: `data/raw/glucosa_data.csv` → 2000 filas, 4 columnas.

| Variable original | Variable procesada | Descripción |
|---|---|---|
| Edad | `age` | Edad del paciente (años) |
| IMC | `bmi` | Índice de masa corporal |
| Actividad_Fisica | `physical_activity_hours` | Horas semanales de ejercicio |
| Nivel_Glucosa | `glucose_level` | **Objetivo**: glucosa en mg/dL |

### Limpieza
- Filas sucias: 2000
- Filas tratadas: 2000
- Filas eliminadas: 0
- Flags IQR conservados: IMC (16), glucosa (3)

### Coeficientes del modelo publicado

| Variable | Coeficiente (unidad original) | Coeficiente estandarizado |
|---|---:|---:|
| age | 1.2328 | 21.4870 |
| bmi | 0.8257 | 3.2748 |
| physical_activity_hours | -2.0899 | -6.1314 |
| intercept | 68.3279 | 139.6226 |

### Interpretación e importancia
1. **Edad (age):** Cada año adicional incrementa la glucosa en **1.23 mg/dL**, ceteris paribus. Es la variable **más influyente** (coef. estandarizado 21.49).
2. **IMC (bmi):** A mayor índice de masa corporal, mayor glucosa: +0.83 mg/dL por punto de IMC. Importancia moderada.
3. **Actividad física (physical_activity_hours):** Cada hora semanal de ejercicio **reduce** la glucosa en ~2.09 mg/dL. Es la segunda variable en importancia estandarizada (-6.13), confirmando el efecto protector del deporte.

**Variable con mayor impacto:** la **Edad**, tanto en magnitud cruda (~1.23 mg/dL por año) como en importancia estandarizada.

### Desempeño

| Configuración | R² | MSE | RMSE | MAE | MAPE |
|---|---:|---:|---:|---:|---:|
| Publicado | **0.6850** | 243.69 | 15.61 | 12.30 | 9.51 % |
| Sin IQR | 0.6556 | 238.33 | 15.44 | 12.17 | 9.22 % |
| Huber (robusto) | 0.6857 | 243.16 | 15.59 | 12.28 | 9.49 % |

R² de **0.6850** indica que el modelo explica **68.5 %** de la varianza de la glucosa — ajuste moderado, típico en datos clínicos donde influyen factores genéticos y dietéticos no medidos.

### Visualizaciones
- `report/figures/glucose_age_vs_glucose_level.png` — pendiente positiva clara
- `report/figures/glucose_bmi_vs_glucose_level.png` — correlación positiva suave
- `report/figures/glucose_physical_activity_hours_vs_glucose_level.png` — pendiente negativa protectora
- `report/figures/glucose_correlation.png` — matriz de correlación

---

## 5. Ejercicio 3 — Predicción del consumo de energía

### Datos
Fuente: `data/raw/energia_data.csv` → 10 000 filas, 4 columnas.

| Variable original | Variable procesada | Descripción |
|---|---|---|
| Temperatura | `temperature` | Temperatura en °C |
| Hora | `hour_sin`, `hour_cos` | Codificación cíclica seno/coseno |
| Dia_Semana | `day_of_week` | 1=Lunes … 7=Domingo |
| Consumo_Energia | `energy_consumption` | **Objetivo**: kWh consumidos |

### Transformación clave: codificación cíclica de la hora
La hora del día es una variable **cíclica**: la hora 24 debe estar cerca de la 1. Una codificación lineal trataría 24 y 1 como muy distantes. Por eso se transforma `hour ∈ [1, 24]` en dos componentes:
```
hour_sin = sin(2π · (hour - 1)/24)
hour_cos = cos(2π · (hour - 1)/24)
```
Así el modelo "ve" un círculo. La misma transformación se aplica en tiempo de inferencia.

### Limpieza
- Filas sucias: 10 000
- Filas tratadas: 10 000
- Filas eliminadas: 0
- Flags IQR conservados: temperatura (90), consumo (66)

### Coeficientes del modelo publicado

| Variable | Coeficiente (unidad original) | Coeficiente estandarizado |
|---|---:|---:|
| temperature | 9.8694 | 49.4855 |
| hour_sin | -37.9442 | -26.8638 |
| hour_cos | -4.3196 | -3.0506 |
| day_of_week | -2.9433 | -5.8953 |
| intercept | 166.0264 | 400.6091 |

### Interpretación e impacto
1. **Temperatura (temperature):** +9.87 kWh por cada grado centígrado. Es la variable **más influyente** (estandarizado 49.49), reflejando probablemente aire acondicionado en días calurosos.
2. **Hora (componentes sin/cos):** El componente seno dominante (coef. -37.94) capta picos/valores de consumo a lo largo del día; el patrón cíclico completo necesita ambas componentes interpretarse geométricamente.
3. **Día de semana:** -2.94 kWh por incremento de día (Lunes→Domingo), sugiriendo **menor** consumo el fin de semana en escenarios residenciales/oficina.

**Variable de mayor impacto:** la **Temperatura**, tanto en magnitud directa como en coeficiente estandarizado.

### Desempeño

| Configuración | R² | RMSE | MSE | MAE | MAPE |
|---|---:|---:|---:|---:|---:|
| Publicado | **0.7838** | 29.70 | 881.92 | 23.46 | 6.11 % |
| Sin IQR | 0.7725 | 29.49 | 869.51 | 23.23 | 5.94 % |
| Huber (robusto) | 0.7836 | 29.71 | 882.80 | 23.45 | 6.11 % |

R² **0.7838** es un ajuste **bueno**. El RMSE de ~29.7 kWh es aceptable frente a un rango de consumo típico. Huber coincide con OLS, lo que confirma estabilidad ante colas.

### Visualizaciones
- `report/figures/energy_temperature_vs_energy_consumption.png` — relación fuerte y positiva
- `report/figures/energy_hour_vs_energy_consumption.png` — patrón ondulado (efecto de la hora)
- `report/figures/energy_day_of_week_vs_energy_consumption.png` — discreta caída hacia fin de semana
- `report/figures/energy_correlation.png` — mapa de calor

---

## 6. Exportación e importación del modelo

### Formato
Cada modelo se exporta como un único diccionario Python serializado con **pickle**:
```python
{
  "pipeline": Pipeline(StandardScaler → LinearRegression),
  "feature_names": [...],
  "target": "dollar_price",
  "metrics": {"r2": ..., "mse": ..., "rmse": ..., "mae": ..., "mape": ...},
  "coefficients": [... coef. original + estandarizado ...],
  "scenario": "dollar",
  "fit_excludes_anomalies": False,
}
```

### Archivos resultantes
- `models/dollar_model.pkl`
- `models/glucose_model.pkl`
- `models/energy_model.pkl`
- `models/training_metrics.json` (resumen agregado)

### Código de exportación
Implementado en `src/mineva/modeling.py`:
```python
import pickle

def export_model(artifact, scenario):
    path = MODEL_ARTIFACTS[scenario]
    with open(path, "wb") as f:
        pickle.dump(artifact, f, protocol=pickle.HIGHEST_PROTOCOL)

def load_model(path):
    with open(path, "rb") as f:
        return pickle.load(f)
```

### Alternativa: joblib
Para pipelines muy grandes se recomienda `joblib`, equivalente en este caso:
```python
import joblib
joblib.dump(artifact, path)
artifact = joblib.load(path)
```

El entrenamiento completo se ejecuta con:
```bash
python scripts/train_models.py
```

---

## 7. Interfaz web para predicciones

### Arquitectura
- **Backend** — FastAPI en `backend/app/`
  - `POST /api/v1/predict/{scenario}` → predicción + métricas
  - `GET  /api/v1/catalog/` → coeficientes y desempeño publicados
  - Historial opcional en PostgreSQL (Alembic + SQLAlchemy)
- **Frontend** — Next.js 15 en `frontend/`
  - Selector de ejercicio (Dólar / Glucosa / Energía)
  - Formulario con validación por rango de entrenamiento
  - Tarjeta de resultado: predicción, margen ±RMSE, chips de R²/MSE/RMSE/MAE/MAPE
  - Tarjeta de interpretación: coeficientes en unidades originales
  - Hoja de historial y figuras embebidas desde `report/figures/`

### Flujo de uso
1. El usuario abre la UI y selecciona **Dólar**, **Glucosa** o **Energía**.
2. Completa los campos (ej. Día, Inflación, Tasa_interes).
3. Pulsa **Calcular**: el frontend envía un POST a la API.
4. El backend carga el `.pkl` correspondiente, aplica `encode_hour` si es energía, llama a `pipeline.predict(...)` y devuelve la predicción junto con las métricas de desempeño guardadas.
5. La UI muestra el valor predicho, un rango visual ±RMSE, insignia de calidad del ajuste (R²) y alertas si el usuario introduce valores fuera del rango de entrenamiento (extrapolación).

### Ejecución local
```bash
# Backend (Docker incluye Postgres)
docker compose up --build

# Frontend (terminal separada)
cd frontend && pnpm install && pnpm dev
```

Visitar http://localhost:3000.

---

## 8. Conclusiones generales

1. **Tres contextos, tres calidades de ajuste muy distintas.**
   - Dólar: R² ≈ 0.9958 (predicción muy precisa, tendencia temporal dominante, MAPE <1 %).
   - Energía: R² ≈ 0.7838 (buen ajuste, temperatura es el motor principal).
   - Glucosa: R² ≈ 0.6850 (modelo moderado, variables conductuales/clínicas limitadas, MAPE ~9.5 %).
2. **La codificación cíclica de la hora en energía fue esencial:** sin ella `hour` trata 24 y 1 como extremos opuestos y el ajuste empeora.
3. **Importancia de variables por coeficiente estandarizado** (regla general rápida, confirmada por los tres casos):
   - Dólar: día ≫ tasa de interés > inflación
   - Glucosa: edad ≫ actividad física > IMC
   - Energía: temperatura ≫ hora (seno) > día semana > hora (cos)
4. **Robustez:** Las diferencias entre el modelo publicado, la variante sin IQR y Huber son pequeñas en los tres ejercicios, por lo que los resultados **no dependen de decisiones arbitrarias sobre outliers**.
5. **MAE y MAPE complementan:** Para dólar el error porcentual es ínfimo (0.70 %); para glucosa y energía, el MAE de ~12 y ~23 respectivamente ayuda a calibrar la confianza clínica/técnica.
6. **Pipeline reproducible:** Semilla fija (`random_state=7`), split fijo (25 %) y artefactos serializados garantizan que la API y la UI devuelvan siempre los mismos resultados para la misma entrada.
7. **CRISP-DM cerrado:** El proyecto no se detiene en la celda de un notebook: los modelos exportados se consumen desde una API documentada y una interfaz gráfica usable por personal no técnico, completando así la fase de despliegue.

---

## 9. Archivos y entregables

| Entregable | Ruta |
|---|---|
| Código ML: tratamiento, features, modelado, visualización | [src/mineva/](file:///C:/Users/Julian/Documents/modelos-de-regresion/modelos-regresion/src/mineva) |
| Script de entrenamiento y exportación | [scripts/train_models.py](file:///C:/Users/Julian/Documents/modelos-de-regresion/modelos-regresion/scripts/train_models.py) |
| Datos brutos (3 CSVs) | `data/raw/*.csv` |
| Datos tratados (3 CSVs) | `data/processed/*.csv` |
| Modelos exportados (3 `.pkl` + métricas JSON) | `models/` tras ejecutar `train_models.py` |
| 12 figuras del informe (dispersión + correlación) | `report/figures/` |
| API FastAPI | [backend/app/main.py](file:///C:/Users/Julian/Documents/modelos-de-regresion/modelos-regresion/backend/app/main.py) |
| Interfaz web Next.js | [frontend/src/](file:///C:/Users/Julian/Documents/modelos-de-regresion/modelos-regresion/frontend/src) |
| Notebooks análisis por ejercicio | `notebooks/01_dollar_analysis.ipynb` … `03_energy_analysis.ipynb` |
| Tratamiento y métricas | [report/data_treatment.md](file:///C:/Users/Julian/Documents/modelos-de-regresion/modelos-regresion/report/data_treatment.md) |
| Informe completo | [report/informe_mineva.md](file:///C:/Users/Julian/Documents/modelos-de-regresion/modelos-regresion/report/informe_mineva.md) |

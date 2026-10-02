# Tratamiento de datos

La data sucia está en `data/raw/`. La data tratada está en `data/processed/`.
Solo se elimina un registro si el valor es físicamente imposible.
El IQR marca colas para revisarlas. No autoriza a sacarlas del ajuste.
El modelo publicado es la regresión lineal con todas las filas válidas.
La distancia de Cook dice qué filas sí mueven la recta. Huber es la comprobación robusta: baja el peso de la cola sin borrarla.
Métricas adicionales reportadas: MAE (error absoluto medio) y MAPE (error porcentual absoluto medio).

## dollar

- Fuente sucia: `data\raw\dolar_data.csv`
- Filas sucias: 500
- Filas tratadas: 500
- Filas eliminadas: 0
- Duplicados exactos: 0
- Errores de captura: 0
- Categorías conservadas: {'normal': 490, 'real_extreme': 10}
- Flags IQR (conservados): {'day': 0, 'inflation_rate': 4, 'interest_rate': 7, 'dollar_price': 0}
- Modelo publicado (todas las filas válidas): R²=0.9958, MSE=2216.07, RMSE=47.08, MAE=36.29, MAPE=0.0070
- Sensibilidad sin filas marcadas por IQR: R²=0.9951, MSE=2820.32, RMSE=53.11, MAE=41.04, MAPE=0.0080
- Huber (mismo split, pesos menores en la cola): R²=0.9958, MSE=2198.42, RMSE=46.89, MAE=36.14, MAPE=0.0070
- Cook's distance > 0.0107 en entrenamiento: 20 de 375 (máximo 0.0455)

| Variable | Coeficiente (unidad original) | Coeficiente estandarizado |
|---|---:|---:|
| day | 4.9966 | 720.4680 |
| inflation_rate | -28.4457 | -0.1391 |
| interest_rate | -5.8818 | -2.8444 |
| intercept | 3990.6291 | 5200.3484 |

## glucose

- Fuente sucia: `data\raw\glucosa_data.csv`
- Filas sucias: 2000
- Filas tratadas: 2000
- Filas eliminadas: 0
- Duplicados exactos: 0
- Errores de captura: 0
- Categorías conservadas: {'normal': 1981, 'rare_legitimate': 16, 'real_extreme': 3}
- Flags IQR (conservados): {'age': 0, 'bmi': 16, 'physical_activity_hours': 0, 'glucose_level': 3}
- Modelo publicado (todas las filas válidas): R²=0.6850, MSE=243.69, RMSE=15.61, MAE=12.30, MAPE=0.0951
- Sensibilidad sin filas marcadas por IQR: R²=0.6556, MSE=238.33, RMSE=15.44, MAE=12.17, MAPE=0.0922
- Huber (mismo split, pesos menores en la cola): R²=0.6857, MSE=243.16, RMSE=15.59, MAE=12.28, MAPE=0.0949
- Cook's distance > 0.0027 en entrenamiento: 83 de 1500 (máximo 0.0142)

| Variable | Coeficiente (unidad original) | Coeficiente estandarizado |
|---|---:|---:|
| age | 1.2328 | 21.4870 |
| bmi | 0.8257 | 3.2748 |
| physical_activity_hours | -2.0899 | -6.1314 |
| intercept | 68.3279 | 139.6226 |

## energy

- Fuente sucia: `data\raw\energia_data.csv`
- Filas sucias: 10000
- Filas tratadas: 10000
- Filas eliminadas: 0
- Duplicados exactos: 0
- Errores de captura: 0
- Categorías conservadas: {'normal': 9867, 'real_extreme': 133}
- Flags IQR (conservados): {'temperature': 90, 'hour': 0, 'day_of_week': 0, 'energy_consumption': 66}
- Modelo publicado (todas las filas válidas): R²=0.7838, MSE=881.92, RMSE=29.70, MAE=23.46, MAPE=0.0611
- Sensibilidad sin filas marcadas por IQR: R²=0.7725, MSE=869.51, RMSE=29.49, MAE=23.23, MAPE=0.0594
- Huber (mismo split, pesos menores en la cola): R²=0.7836, MSE=882.80, RMSE=29.71, MAE=23.45, MAPE=0.0611
- Cook's distance > 0.0005 en entrenamiento: 398 de 7500 (máximo 0.0045)

| Variable | Coeficiente (unidad original) | Coeficiente estandarizado |
|---|---:|---:|
| temperature | 9.8694 | 49.4855 |
| hour_sin | -37.9442 | -26.8638 |
| hour_cos | -4.3196 | -3.0506 |
| day_of_week | -2.9433 | -5.8953 |
| intercept | 166.0264 | 400.6091 |


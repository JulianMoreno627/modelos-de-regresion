# MINEVA

**Minería de Datos y Evaluación de Variables para Regresión Aplicada**

Regresión lineal en múltiples dominios: entrenamiento CRISP-DM, artefactos `.pkl`, API de inferencia con **FastAPI** e interfaz web **Next.js** para los tres ejercicios.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.141-teal)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61dafb)

## Estructura

```
├── backend/app/       # FastAPI (v1 predict + metadata)
├── frontend/          # Next.js 15 (App Router): formularios, resultados, figuras
├── src/mineva/        # Pipeline de ML (carga, limpieza, entrenamiento, exportación)
├── notebooks/         # 01–03 análisis por dominio
├── models/            # Pipelines serializados (.pkl)
├── data/raw/          # CSVs originales
├── data/processed/    # Datos tratados
├── report/figures/    # Gráficas de dispersión y correlación usadas por la UI
├── docs/              # Guía de uso para nuevos usuarios
├── tests/
└── scripts/train_models.py
```

## Modelos (hold-out 25 %)

| Modelo | R² | MSE | RMSE | MAE | MAPE |
|--------|-----|-----|------|-----|-----|
| Dólar | 0.9958 | 2216.07 | 47.08 | 36.29 | 0.70 % |
| Glucosa | 0.6850 | 243.69 | 15.61 | 12.30 | 9.51 % |
| Energía | 0.7838 | 881.92 | 29.70 | 23.46 | 6.11 % |

Guía desde cero: [docs/00-empezar-aqui.md](docs/00-empezar-aqui.md) · índice en [docs/](docs/README.md).

**Clonar y ejecutar:** este repositorio incluye los datasets (`data/raw/`, `data/processed/`), archivos `.pkl` entrenados en `models/`, y PNGs del informe en `report/figures/`. No necesitas descargas externas ni `train_models.py` para usar la API o la UI de Next.js — solo si deseas reentrenar o modificar el pipeline.

## Configuración local

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt   # instala dependencias + editable `mineva` desde src/

python scripts/train_models.py        # reentrenamiento opcional
alembic upgrade head                  # tablas en Postgres
uvicorn backend.app.main:app --reload --port 8000
```

**Docker (clon nuevo):** Postgres + API en un solo comando — no requiere Python/Postgres local.

```bash
cp .env.example .env
docker compose up --build
```

Si ya tienes Postgres en `:5432`, inicia solo la API: `docker compose up api --build --no-deps` y apunta `MINEVA_DATABASE_URL` a `host.docker.internal` (ver `.env.example` y [docs/05-postgres-y-docker.md](docs/05-postgres-y-docker.md)).

Documentación de la API: http://localhost:8000/docs

**Stack completo en desarrollo:** Docker solo empaqueta **Postgres + API** (`docker-compose.yml`). La UI Next.js corre en tu máquina con pnpm (abajo): apunta `NEXT_PUBLIC_API_URL` a `http://localhost:8000` (valor por defecto en `frontend/.env.example`). Las figuras del informe las sirve el propio frontend desde `report/figures/`.

## Interfaz web (Next.js)

**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4. La app vive en `frontend/` y se comunica con la API mediante `NEXT_PUBLIC_API_URL` (ver `frontend/.env.example`).

**Requisitos:** Node 20+ recomendado, API en el puerto 8000 (Docker Compose o uvicorn local).

```bash
cd frontend
cp .env.example .env.local
corepack enable          # una vez por máquina (Node 16.13+)
pnpm install
pnpm dev
```

Abre http://localhost:3000.

| Script | Comando |
|--------|---------|
| Servidor dev | `pnpm dev` |
| Build producción | `pnpm build` && `pnpm start` |
| Lint | `pnpm lint` |

**npm** también funciona (`npm install` / `npm run dev`) mediante `package-lock.json`; prefiere **pnpm** (`pnpm-lock.yaml`) cuando sea posible. Después de modificar `package.json`, actualiza ambos lockfiles para que permanezcan alineados.

Para cada ejercicio puedes ingresar los datos, ver la predicción con R², MSE, RMSE y MAE, leer cómo cada coeficiente mueve el resultado, y abrir las figuras de dispersión y correlación desde `report/figures/`. Tokens de diseño y paleta: [frontend/DESIGN.md](frontend/DESIGN.md) · notas de instalación: [frontend/README.md](frontend/README.md).

## Tests y CI

```bash
pytest -q
ruff check backend tests src scripts
```

GitHub Actions ejecuta ruff y pytest. Docker usa el archivo más ligero `requirements.txt`.

## Docker

```bash
docker build -t mineva-api -f backend/Dockerfile .
docker run --rm -p 8000:8000 mineva-api
```

## Licencia

MIT — [LICENSE](LICENSE)

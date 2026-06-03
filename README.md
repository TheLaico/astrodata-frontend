# Astro Data Lab Frontend

SPA en React para demostrar el flujo principal del proyecto:

- Login basico local.
- Dashboard de estado y estadisticas del backend.
- Administracion CRUD de objetos celestes.
- Visualizacion astronomica de objetos con Aladin Lite.
- Mapa universo de pantalla completa para exploracion libre.
- Consulta controlada a MongoDB.
- Consulta IA conectada al endpoint RAG.

## Credenciales demo

- Usuario: `LAICO`
- Contrasena: `809809`

## Configuracion

Copia `.env.example` a `.env` si necesitas cambiar la URL del backend:

```bash
VITE_API_URL=http://127.0.0.1:8000/api
```

## Comandos

```bash
npm install
npm run dev
npm run build
```

El backend debe estar levantado para consumir datos reales. Si no responde, la interfaz muestra el error en cada modulo.

La vista de detalle de objetos usa Aladin Lite desde el CDN oficial para centrar el cielo por coordenadas RA/Dec. El mapa base usa el HiPS DSS2 color de ESA (`https://skies.esac.esa.int/DSSColor`) para evitar errores CORS de mirrors externos. Si un objeto no tiene coordenadas validas, intenta resolverlo por nombre usando los servicios astronomicos integrados por Aladin Lite.

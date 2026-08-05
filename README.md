# PsicoEval

Aplicación React + Vite para una plataforma de valoración psicológica. Incluye autenticación local, roles de paciente y psicólogo, selección de tests y una interfaz de administración para psicólogos.

## Características

- Registro e inicio de sesión local
- Roles separados:
  - Paciente: selecciona tests y accede a su dashboard
  - Psicólogo: administra pacientes y revisa resultados
- Navbar con logo personalizado
- Estilos azules y naranjas coherentes con la identidad visual
- Construcción optimizada para producción con Vite

## Estructura del proyecto

- `app.jsx` - componente raíz y control de flujo entre login, registro y dashboards
- `login.jsx` - formulario de inicio de sesión
- `register.jsx` - formulario de registro para paciente / psicólogo
- `src/components/Navbar.jsx` - barra de navegación principal
- `src/components/PsychologistSection.jsx` - panel para psicólogos
- `src/components/TestSelector.jsx` - selección de tests para pacientes
- `authService.js` - lógica de persistencia en `localStorage`
- `theme.js` - temas y carga de fuentes
- `src/styles.css` - estilos globales
- `public/logo.svg` - logo usado en el navbar

## Requisitos

- Node.js 18+ recomendado
- npm

## Instalación

1. Abre la carpeta del proyecto:
   ```bash
   cd d:\PsicoEval
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```

## Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Luego abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Esto genera la carpeta `dist` para desplegar.

## Previsualizar producción localmente

```bash
npm run preview
```

## Despliegue en Vercel

1. Sube el proyecto a GitHub, GitLab o Bitbucket.
2. Crea una cuenta en https://vercel.com.
3. Importa el repositorio desde Vercel.
4. Configura el build:
   - Comando de build: `npm run build`
   - Directorio de salida: `dist`
5. Despliega.

### Opción CLI

```bash
npm install -g vercel
vercel login
vercel
```

Responde las preguntas usando la carpeta actual y los valores de build/output mencionados arriba.

## Despliegue del backend en Render

1. Crea un servicio de tipo `Web Service` en https://render.com.
2. Selecciona el repositorio que contiene este proyecto.
3. Configura el servicio de Node:
   - Build command: `npm run build:render`
   - Start command: `npm run start:server`
   - Port: deja el puerto por defecto de Render o usa `4000`.
4. En el servicio de Render, agrega la variable de entorno `NODE_ENV=production`.
5. Después de desplegar, copia la URL pública del backend, por ejemplo `https://mi-backend.onrender.com`.
6. En el frontend, configura la variable de entorno `VITE_API_BASE_URL` con esa URL.

### Conectar el frontend con el backend de Render

- Para localmente, crea un archivo `.env` en la raíz con:

```env
VITE_API_BASE_URL=http://localhost:4000
```

- Para el despliegue frontend, define `VITE_API_BASE_URL=https://tu-backend.onrender.com`.

La app usará esa URL para llamar a los endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/psychologists`
- `POST /api/psychologists`

> Nota: el backend actual guarda datos en archivos JSON dentro de `data/`. Render mantiene esos datos mientras el servicio esté activo, pero para un sistema real se recomienda usar una base de datos permanente.

## Probar roles

### Paciente

1. Regístrate como paciente usando un nombre, usuario y contraseña.
2. Al registrarte, podrás seleccionar un psicólogo del listado.
3. Inicia sesión con esos datos.
4. En el dashboard verás un botón `Ir a tests`.
5. Haz clic para ver y seleccionar tests.

### Psicólogo

1. Regístrate como psicólogo.
2. Proporciona nombre, correo y datos de clínica si se solicita.
3. Inicia sesión como psicólogo.
4. Verás el panel de psicólogo con la lista de pacientes y sus resultados.

### Selección de psicólogo con API

- La app intenta cargar psicólogos desde `/api/psychologists`.
- Si el endpoint no está disponible, usa la lista local guardada en `localStorage`.
- Para demostración en Vercel, habilita el endpoint API y el registro de psicólogos se podrá sincronizar mejor.

> Nota: los datos de usuario siguen guardándose en `localStorage` hasta que se implemente un backend completo.

## Notas

- El proyecto está configurado como `type: module` en `package.json`.
- Usa `form` y `localStorage` para la persistencia local de usuarios y resultados.
- Si necesitas ajustar rutas o agregar un backend real, puedes extender `authService.js` y separar la lógica de almacenamiento.

# LumiFlix Frontend

Aplicación web moderna construida con **React**, **TypeScript** y **Vite**, con un diseño limpio, accesible y responsive.

## 🎨 Filosofía de Diseño

Este proyecto implementa los siguientes principios de diseño:

- **Accesibilidad**: Cumplimiento con estándares WCAG 2.1 AA
- **Usabilidad**: Interfaz intuitiva con flujos optimizados
- **Rendimiento**: Carga rápida y responsive en todos los dispositivos
- **Elegancia**: Diseño moderno con animaciones fluidas y microinteracciones
- **Seguridad**: Autenticación robusta y protección de datos

## 🚀 Stack Tecnológico

- **React 18.3+** - Biblioteca UI
- **TypeScript 5.6+** - Tipado estático
- **Vite 5.4+** - Bundler y dev server
- **React Router 6.26+** - Enrutamiento
- **SASS 1.80+** - Preprocesador CSS
- **CSS Grid & Flexbox** - Layouts modernos

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración
```

## 🔧 Scripts

```bash
# Desarrollo (Puerto 5173)
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview
```

## 📂 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── AuthLayout.tsx   # Layout para páginas de autenticación
│   ├── Modal.tsx        # Componente modal reutilizable
│   └── Navbar.tsx       # Barra de navegación
├── context/             # React Context
│   └── AuthContext.tsx  # Gestión de autenticación global
├── lib/                 # Utilidades
│   └── api.ts           # Cliente HTTP y tipos
├── pages/               # Páginas de la aplicación
│   ├── auth/            # Páginas de autenticación
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Forgot.tsx
│   │   └── Reset.tsx
│   ├── profile/         # Páginas de perfil
│   │   ├── Profile.tsx
│   │   └── EditProfile.tsx
│   ├── Home.tsx         # Página principal
│   ├── About.tsx        # Página de información
│   └── App.tsx          # Rutas y shell
├── styles/              # Estilos globales
│   └── main.scss        # SCSS con tokens de diseño
└── main.tsx             # Punto de entrada
```

## 🎯 Rutas de la Aplicación

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Página principal | Público |
| `/about` | Información del proyecto | Público |
| `/login` | Iniciar sesión | Público |
| `/signup` | Crear cuenta | Público |
| `/forgot-password` | Recuperar contraseña | Público |
| `/reset-password` | Restablecer contraseña | Público |
| `/profile` | Perfil del usuario | Autenticado |
| `/profile/edit` | Editar perfil | Autenticado |

## 🎨 Sistema de Diseño

### Paleta de Colores

```scss
--brand: #4f46e5       // Primario
--accent: #06b6d4      // Acento
--danger: #ef4444      // Peligro
--success: #10b981     // Éxito
```

### Tipografía

- **Font**: Inter (Google Fonts)
- **Headings**: Bold (700-800)
- **Body**: Regular (400) / Medium (500)
- **Font Size Base**: 15px

### Espaciado

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

## 🔐 Autenticación

La autenticación se gestiona a través de `AuthContext`, que proporciona:

- `user`: Usuario actual (o null si no está autenticado)
- `setUser()`: Actualizar usuario
- `refresh()`: Verificar sesión
- `logout()`: Cerrar sesión

```typescript
const { user, logout, refresh } = useAuth();
```

## 🌐 Variables de Entorno

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🎬 Animaciones

El proyecto incluye animaciones fluidas para mejorar la experiencia:

- **fadeIn**: Aparición suave (0.4s)
- **slideIn**: Deslizamiento desde la izquierda (0.3s)
- **slideUp**: Deslizamiento desde abajo (0.3s)
- **float**: Efecto flotante (3s-4s)
- **pulse**: Pulso de brillo (2s)

## ♿ Accesibilidad

- ✅ Semántica HTML correcta
- ✅ Atributos ARIA donde sea necesario
- ✅ Navegación por teclado completa
- ✅ Contraste de colores WCAG AA
- ✅ Inputs con labels asociados
- ✅ Error messages con `role="alert"`
- ✅ Focus states visibles

## 📱 Responsive Design

Los breakpoints están optimizados para:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔄 Flujo de Autenticación

```
1. Usuario llena formulario de login/signup
2. Request a /api/auth/login o /api/auth/signup
3. Backend retorna { user, token }
4. Token guardado en cookie (httpOnly)
5. AuthContext actualiza estado global
6. Usuario redirigido a /profile
```

## 🛠️ Desarrollo

### Agregar una Nueva Página

1. Crear archivo en `src/pages/`
2. Importar en `App.tsx`
3. Agregar ruta con `<Route>`

### Agregar un Componente

1. Crear archivo en `src/components/`
2. Exportar como default
3. Importar y usar donde sea necesario

### Actualizar Estilos

Los estilos globales están en `src/styles/main.scss`. Usa las variables CSS definidas en `:root` para consistencia.

## 📋 Checklist de Features

- ✅ Autenticación de usuarios
- ✅ Signup con validación
- ✅ Login y logout
- ✅ Recuperación de contraseña
- ✅ Restablecimiento de contraseña
- ✅ Perfil de usuario
- ✅ Edición de perfil
- ✅ Eliminación de cuenta
- ✅ Navbar responsive
- ✅ Tema oscuro elegante
- ✅ Animaciones fluidas
- ✅ Accesibilidad completa

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crear una rama: `git checkout -b feature/nueva-feature`
2. Hacer cambios manteniendo los estilos de código
3. Commit descriptivos: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-feature`
5. Crear Pull Request

## 📝 Notas

- Las cookies se usan para mantener la sesión (httpOnly)
- Los endpoints esperan y retornan JSON
- Las validaciones ocurren tanto en cliente como en servidor
- Las contraseñas siguen criterios de fortaleza (8+ caracteres, mayús, números, símbolos)

---

**Desarrollado con ❤️ para LumiFlix**

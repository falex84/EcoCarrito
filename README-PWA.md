# EcoCarrito - PWA (Progressive Web App)

Tu aplicación ahora es instalable en dispositivos Android como una PWA.

## Archivos Creados

1. **manifest.json** - Configuración de la aplicación PWA
2. **sw.js** - Service Worker para funcionamiento offline
3. **icon-192.png** - Icono para dispositivos (192x192px)
4. **icon-512.png** - Icono grande (512x512px)

## Cómo Instalar en Android

### Opción 1: Desde Chrome en Android
1. Abre la aplicación en Chrome para Android
2. Toca el menú (tres puntos)
3. Selecciona "Agregar a la pantalla principal" o "Instalar aplicación"
4. Confirma la instalación
5. La app aparecerá en tu pantalla de inicio como una app nativa

### Opción 2: Notificación Automática
- Cuando visites la app, Chrome puede mostrar automáticamente la opción de instalar

## Requisitos para PWA

Para que la PWA funcione correctamente, necesitas:

1. **Servidor HTTPS** (o localhost para desarrollo)
2. **Iconos** en las rutas especificadas en el manifest.json

## Generar Iconos

Puedes generar los iconos usando:

1. **Figma/Canva**: Crea un diseño 512x512 y exporta
2. **Generadores online**:
   - https://realfavicongenerator.net/
   - https://www.appicon.co/
3. **Photoshop/GIMP**: Crea imágenes PNG de 192x192 y 512x512

### Icono Sugerido
- Fondo: Verde (#10b981)
- Texto: "CCS" o un ícono de carrito en blanco
- Estilo: Material Design

## Características PWA

✅ Funciona offline (una vez cargada)
✅ Se puede instalar como app nativa
✅ Icono personalizado en pantalla de inicio
✅ Sin barra de navegador
✅ Carga rápida con caché

## Notas Importantes

- El service worker cachea los archivos principales
- Los datos se guardan en localStorage del navegador
- La tasa BCV se actualiza desde la API cada 30 minutos
- Para producción, necesitas HTTPS

## Estructura de Archivos

```
app mercado 2/
├── index.html          # Aplicación principal
├── manifest.json       # Configuración PWA
├── sw.js              # Service Worker
├── icon-192.png       # Icono pequeño (crear)
└── icon-512.png       # Icono grande (crear)
```

## Pruebas Locales

Para probar la PWA localmente:

1. Usa un servidor local (no abras directamente el archivo)
2. Opciones:
   - VS Code: Extensión "Live Server"
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server`
3. Abre `http://localhost:8000` en Chrome
4. Abre DevTools (F12) → Application → Service Workers

## Solución de Problemas

### La app no se instala
- Verifica que estás usando HTTPS (o localhost)
- Asegúrate de que el manifest.json sea válido
- Revisa la consola del navegador para errores

### El service worker no funciona
- Limpia el caché del navegador
- En DevTools: Application → Service Workers → Unregister
- Recarga la página

### Iconos no se muestran
- Crea los archivos icon-192.png y icon-512.png
- Asegúrate de que estén en la raíz del proyecto
- Verifica que sean PNG válidos

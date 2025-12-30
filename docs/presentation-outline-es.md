# Presentación: "Construyendo un Dev Toolbar"

**Duración:** 30-35 minutos
**Formato:** Diapositivas + Demos en Vivo
**Audiencia:** Desarrolladores, líderes técnicos, equipos de ingeniería
**Estilo:** Texto mínimo, revelación progresiva de código, enfoque en demos

---

## SECCIÓN 1: INTRODUCCIÓN (Diapositivas 1-5)

### Diapositiva 1: Título
**Visual:** Diapositiva de título limpia, centrada
```
Construyendo un
Dev Toolbar
```
**Notas:** Bienvenidos. Hoy les mostraré cómo eliminar el hardcoding y acelerar los flujos de trabajo de desarrollo.

---

### Diapositiva 2: Sobre Mí
**Visual:** Tu foto, redes sociales
```
@alfredo.perez.q
@alfredo-perez
```
**Notas:** Introducción rápida - quién eres, qué haces.

---

### Diapositiva 3: El Problema (Solo texto)
**Visual:** Texto en negrita, centrado, apilado verticalmente
```
Hardcoding

Herramientas Externas

Riesgo de Commits

Romper Entornos
```
**Notas:** Todos lo hacemos. Hacemos hardcode de flags, cambiamos configs, modificamos permisos solo para probar. Es lento y arriesgado.

---

### Diapositiva 4: El Problema (Flujo de trabajo)
**Visual:** Diagrama de flujo de trabajo actual (desordenado, muchos pasos)
```
Desarrollador necesita probar una funcionalidad...

Modificar Backend → Reiniciar Servidor
Cambiar Config → Esperar recordar deshacer
Cambiar Herramientas → Perder Contexto
Riesgo de Commit → Romper el Equipo
```
**Notas:** Esta es la realidad actual. Toma 15 minutos, múltiples herramientas, y podrías romper el entorno de tu equipo.

---

### Diapositiva 5: La Solución
**Visual:** Texto en negrita, centrado
```
Overrides
en Runtime
```
**Subtítulo (texto más pequeño):** "Sin tocar código"

**Notas:** ¿Qué pasaría si pudieras cambiar todo en runtime, localmente, sin afectar a nadie más?

---

## SECCIÓN 2: INTRODUCCIÓN AL DEMO (Diapositivas 6-11)

### Diapositiva 6: ~~ELIMINADA~~

---

### Diapositiva 7: Demo - Aparece el Toolbar
**Visual:** Captura de pantalla del toolbar en la parte inferior de la pantalla
```
Hover para abrir
```
**Notas:** El toolbar vive en la parte inferior. Pasa el mouse sobre él y se expande.

---

### Diapositiva 8: Resumen de Herramientas
**Visual:** Cuadrícula/lista de nombres de herramientas (mínimo)
```
Feature Flags
Permissions
App Features
Presets
```
**Notas:** Obtienes estos tools listos para usar. Cada uno te permite hacer override de diferentes aspectos de tu aplicación.

---

### Diapositiva 9: Cómo Funciona (1/3)
**Visual:** Diagrama de arquitectura - Paso 1 resaltado
```
[Tu App]
    ↓
Registrar Opciones
```
**Notas:** Tres capas. Primero, tu app registra lo que está disponible - flags, permisos, features de app, etc.

---

### Diapositiva 10: Cómo Funciona (2/3)
**Visual:** Mismo diagrama - Paso 2 resaltado
```
[Tu App]
    ↓
Registrar Opciones
    ↓
[Toolbar] ← Capturar Overrides
```
**Notas:** La barra te permite sobrescribir cualquiera de esos valores a través de la UI.

---

### Diapositiva 11: Cómo Funciona (3/3)
**Visual:** Mismo diagrama - Paso 3 resaltado (flujo completo)
```
[Tu App]
    ↓
Register Options
    ↓
[Toolbar] ← Capture Overrides
    ↓
[Merged Values] → Tu Lógica
```
**Notas:** Tu app obtiene el resultado combinado (merged). Los overrides tienen precedencia. Todo se actualiza en tiempo real.

---

## SECCIÓN 3: FEATURE FLAGS (Diapositivas 12-18)

### Diapositiva 12: Feature Flags
**Visual:** Diapositiva de título
```
Feature Flags
```
**Notas:** Empecemos con feature flags - el caso de uso más común.

---

### Diapositiva 13: Código - Registrar Flags (1/3)
**Visual:** Fragmento de código - imports resaltados
```typescript
import { DevToolbarFeatureFlagsService } from 'ngx-dev-toolbar';

export class FeatureFlagsService {







}
```
**Notas:** Primero, importa el servicio DevToolbar.

---

### Diapositiva 14: Código - Registrar Flags (2/3)
**Visual:** Fragmento de código - constructor resaltado, imports atenuados
```typescript
import { DevToolbarFeatureFlagsService } from 'ngx-dev-toolbar';

export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);






}
```
**Notas:** Inyéctalo en tu servicio de feature flags.

---

### Diapositiva 15: Código - Registrar Flags (3/3)
**Visual:** Fragmento de código - setAvailableOptions resaltado, resto atenuado
```typescript
import { DevToolbarFeatureFlagsService } from 'ngx-dev-toolbar';

export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);

  loadFlags() {
    const flags = this.getFromBackend(); // Tu lógica
    this.devToolbar.setAvailableOptions(flags);
  }
}
```
**Notas:** Cuando cargas flags desde tu backend, regístralos con el toolbar. Ahora el toolbar sabe qué está disponible para hacer override.

---

### Diapositiva 16: Código - Obtener Flags (Usado por la App)
**Visual:** Fragmento de código - método getFlags
```typescript
export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);

  getFlags(): Observable<FeatureFlag[]> {
    return this.devToolbar.getValues();
  }





}
```
**Notas:** Tu app llama a getFlags(). Esto devuelve los merged values - flags del backend CON cualquier override del toolbar aplicado.

---

### Diapositiva 17: Código - Inicializar (Cargar desde Backend)
**Visual:** Fragmento de código - método de inicialización resaltado
```typescript
export class FeatureFlagsService {
  private devToolbar = inject(DevToolbarFeatureFlagsService);

  getFlags(): Observable<FeatureFlag[]> {
    return this.devToolbar.getValues();
  }

  initialize(): void {
    this.http.get<FeatureFlag[]>('/api/flags')
      .subscribe(flags => {
        this.devToolbar.setAvailableOptions(flags);
      });
  }
}
```
**Notas:** Al inicio de la app, carga los flags desde el backend y regístralos con el toolbar. Ahora el toolbar sabe qué está disponible para hacer override.

---

### Diapositiva 18: Demo
**Visual:** Texto simple
```
DEMO
```

**Esquema del Demo:**
1. **Mostrar la barra**
   - Hover para abrir
   - Mostrarla colgando en la parte inferior

2. **Abrir herramienta Feature Flags**
   - Señalar barra de búsqueda
   - Señalar indicador de valor real
   - Señalar lista de flags
   - Señalar filtros (todos/habilitados/deshabilitados)

3. **Activar flag de dark mode**
   - Mostrar que está OFF
   - Click para activar ON
   - La UI se actualiza inmediatamente (aparece tema oscuro)

4. **Mostrar persistencia**
   - Recargar página
   - Flag todavía está ON
   - Explicar: localStorage, solo en tu máquina

5. **Volver a diapositivas**

**Notas:** Déjenme cambiar a la app en vivo y mostrarles cómo funciona esto.

---

## SECCIÓN 4: OTRAS HERRAMIENTAS (Diapositivas 19-23)

### Diapositiva 19: Mismo Patrón
**Visual:** Título
```
Mismo
Patrón
```
**Notas:** Permisos y Funcionalidades de App funcionan exactamente de la misma manera. Mismo patrón, misma estructura de código.

---

### Diapositiva 20: Código - Misma Interfaz
**Visual:** Fragmento de código mostrando el patrón
```typescript
// Permisos
devToolbarPermissions.setAvailableOptions(permissions);
devToolbarPermissions.getValues();

// Funcionalidades de App
devToolbarAppFeatures.setAvailableOptions(features);
devToolbarAppFeatures.getValues();

// Mismo patrón cada vez
```
**Notas:** Registras opciones, obtienes valores combinados. Eso es todo.

---

### Diapositiva 21: Permisos
**Visual:** Texto/icono simple
```
Permisos

Admin, Editor, Viewer
Otorgar o Denegar
```
**Notas:** Usa permisos para probar acceso basado en roles. Otorga derechos de admin, deniega permisos de eliminación, etc.

---

### Diapositiva 22: Funcionalidades de App
**Visual:** Texto/icono simple
```
Funcionalidades de App

Gratis, Pro, Enterprise
Funcionalidad basada en tiers
```
**Notas:** Las funcionalidades de app son para funcionalidad basada en tiers. Prueba tier gratis, tier pro, funcionalidades enterprise.

---

### Diapositiva 23: Demo
**Visual:** Texto simple
```
DEMO
```

**Esquema del Demo:**
1. **Abrir herramienta Permisos**
   - Mostrar lista de permisos
   - Otorgar permiso de admin
   - Mostrar cambios en la UI (aparece panel de admin)

2. **Abrir herramienta Funcionalidades de App**
   - Mostrar funcionalidades de tier
   - Activar tier enterprise
   - Mostrar aparición de funcionalidades premium

3. **Volver a diapositivas**

**Notas:** Déjenme mostrarles ambas rápidamente.

---

## SECCIÓN 5: PRESETS (Diapositivas 24-32)

### Diapositiva 24: Múltiples Configuraciones
**Visual:** Texto
```
Usuario Admin
Usuario Invitado
Premium Español
Bug QA #1234
```
**Notas:** Ahora sabes cómo sobrescribir flags, permisos y funcionalidades. Pero cambiar entre configuraciones manualmente sigue siendo tedioso.

---

### Diapositiva 25: Presets
**Visual:** Título
```
Presets
```
**Subtítulo:** "Guardar y Compartir"
**Notas:** Los presets resuelven esto. Guarda todo el estado de tu barra.

---

### Diapositiva 26: ¿Qué es un Preset?
**Visual:** Diagrama
```
Preset = Snapshot Completo

✓ Feature Flags
✓ Permisos
✓ Funcionalidades de App

Un Click → Configuración Completa
```
**Notas:** Todo lo que acabamos de ver - flags, permisos, funcionalidades - todo guardado junto. Aplícalo con un click.

---

### Diapositiva 27: Casos de Uso
**Visual:** Lista con iconos
```
👤 Personas de Usuario
🐛 Reproducción de Bugs
🧪 Escenarios de Prueba
👥 Onboarding de Equipo
```
**Notas:** Crea personas para pruebas, guarda configuraciones de bugs para QA, define escenarios de prueba, incorpora nuevos devs instantáneamente.

---

### Diapositiva 28: Demo
**Visual:** Texto simple
```
DEMO
```

**Esquema del Demo:**
1. **Configurar barra**
   - Habilitar flag de dark mode
   - Otorgar permiso de admin
   - Habilitar funcionalidades enterprise

2. **Guardar como preset**
   - Abrir herramienta Presets
   - Click "Guardar Configuración Actual"
   - Nombrarlo "Admin Dark Enterprise"

3. **Resetear todo**
   - Limpiar todos los overrides
   - Mostrar que la app vuelve a la normalidad

4. **Aplicar preset**
   - Click "Admin Dark Enterprise"
   - Todo se restaura instantáneamente

5. **Mostrar exportar**
   - Click botón exportar
   - Mostrar JSON
   - Explicar: compartir con equipo vía Slack/email/repo

6. **Volver a diapositivas**

**Notas:** Déjenme crear y aplicar un preset.

---

### Diapositiva 29: Compartir con el Equipo
**Visual:** Diagrama simple
```
Desarrollador → Exportar JSON → Equipo
Equipo → Importar → Misma Config
```
**Notas:** Exporta como JSON y comparte. Tu equipo lo importa y tiene exactamente la misma configuración.

---

### Diapositiva 30: Control de Versiones
**Visual:** Texto/icono
```
Commitear presets al repo

team-presets/
  admin.json
  guest.json
  bug-1234.json
```
**Notas:** Mejor aún - commitea los presets a tu repo. Todos los obtienen automáticamente.

---

### Diapositiva 31: Testing
**Visual:** Texto
```
Unit Tests
E2E Tests
Storybook

Cargar datos de preset
```
**Notas:** Usa presets en tus tests. Carga datos de preset para fixtures de prueba consistentes.

---

### Diapositiva 32: El Poder
**Visual:** Texto en negrita
```
10 Segundos

vs

15 Minutos
```
**Notas:** Esa es la diferencia. 15 minutos de configuración manual se convierten en 10 segundos con un preset.

---

## SECCIÓN 6: ESCENARIO DEL MUNDO REAL (Diapositivas 33-42)

### Diapositiva 33: Escenario
**Visual:** Título
```
Viernes
3 PM
```
**Notas:** Déjenme mostrarles un escenario real. Es viernes a las 3 PM.

---

### Diapositiva 34: El Reporte de Bug
**Visual:** Texto (estilizado como mensaje de chat o ticket de bug)
```
Reporte de Bug #1234

"El checkout falla para
usuarios premium en español
con dark mode habilitado"
```
**Notas:** QA reporta este bug. Necesitas reproducirlo.

---

### Diapositiva 35: Forma Antigua (Título)
**Visual:** Texto
```
Sin Toolbar
```
**Notas:** Esto es lo que harías sin la barra.

---

### Diapositiva 36: Forma Antigua (Pasos 1-2)
**Visual:** Checklist
```
☐ Modificar backend (usuario premium)
☐ Reiniciar servidor
```
**Notas:** Primero, modifica tu backend para hacerte usuario premium. Reinicia el servidor.

---

### Diapositiva 37: Forma Antigua (Pasos 3-4)
**Visual:** Checklist (items anteriores marcados)
```
☑ Modificar backend (usuario premium)
☑ Reiniciar servidor
☐ Hardcodear dark mode
☐ Cambiar idioma del navegador
```
**Notas:** Hardcodea dark mode en tu código. Cambia el idioma de tu navegador a español.

---

### Diapositiva 38: Forma Antigua (Paso 5 + Tiempo)
**Visual:** Checklist (todos marcados) + tiempo
```
☑ Modificar backend (usuario premium)
☑ Reiniciar servidor
☑ Hardcodear dark mode
☑ Cambiar idioma del navegador
☑ Esperar haber recordado todo

⏱️ 15 minutos
```
**Notas:** Espera haber recordado todo. 15 minutos perdidos.

---

### Diapositiva 39: Nueva Forma (Título)
**Visual:** Texto
```
Con Toolbar
```
**Notas:** Ahora con la barra.

---

### Diapositiva 40: Nueva Forma (Demo o Captura)
**Visual:** Captura de pantalla aplicando preset O solo texto
```
Aplicar Preset

"Premium Español Dark"
```
**Notas:** Abre la barra. Aplica el preset "Premium Español Dark". Listo.

---

### Diapositiva 41: Nueva Forma (Resultado)
**Visual:** Texto grande
```
⏱️ 10 segundos
```
**Notas:** 10 segundos. Bug reproducido. Esa es la diferencia.

---

### Diapositiva 42: Compartir con QA
**Visual:** Flujo simple
```
QA crea preset → Exporta → Comparte
Desarrollador importa → Reproduce instantáneamente
```
**Notas:** Mejor aún - QA puede crear el preset cuando encuentra el bug, exportarlo, y enviártelo. Tú importas y reproduces instantáneamente.

---

## SECCIÓN 7: BENEFICIOS Y RESUMEN (Diapositivas 43-47)

### Diapositiva 43: ¿Por Qué?
**Visual:** Título
```
¿Por Qué Construir Esto?
```
**Notas:** Entonces, ¿por qué deberías construir una barra de herramientas para desarrolladores?

---

### Diapositiva 44: Beneficios
**Visual:** Lista con iconos + texto
```
⚡ Desarrollo Más Rápido
🛡️ Experimentos Seguros
🤝 Colaboración en Equipo
🧪 Testing Consistente
📦 Sin Contaminación de Código
```
**Notas:** Ciclos de iteración más rápidos. Seguro para experimentar - todo es local. Mejor colaboración en equipo con presets. Fixtures de prueba consistentes. Sin valores hardcodeados en tu código.

---

### Diapositiva 45: Antes vs Después
**Visual:** Comparación de dos columnas
```
ANTES               DESPUÉS
---------------     -----------
15 min setup   →    10 seg
Múltiples tool →    Una barra
Riesgo commits →    Solo local
Config manual  →    Presets
Romper equipo  →    Aislado
```
**Notas:** Esta es la transformación. De lento y arriesgado a rápido y seguro.

---

### Diapositiva 46: El Patrón
**Visual:** Diagrama simple
```
1. Registrar Opciones
2. Capturar Overrides
3. Combinar Valores

Funciona para todo
```
**Notas:** Y es el mismo patrón simple para todo - flags, permisos, funcionalidades, lo que necesites.

---

### Diapositiva 47: Puntos Clave
**Visual:** Lista numerada
```
1. Override en runtime
2. Persistir localmente (localStorage)
3. Compartir con presets
4. Mismo patrón se repite
```
**Notas:** Recuerden estas cuatro cosas. Overrides en runtime, persistencia local, presets compartibles, patrón consistente.

---

## SECCIÓN 8: CIERRE (Diapositivas 48-52)

### Diapositiva 48: ¿Y Ahora Qué?
**Visual:** Título
```
¿Y Ahora Qué?
```
**Notas:** Entonces, ¿qué deberías hacer a continuación?

---

### Diapositiva 49: Tus Opciones
**Visual:** Dos caminos
```
Opción 1:
Usar ngx-dev-toolbar
(Angular 19+)

Opción 2:
Construir tu propia
(Cualquier framework)
```
**Notas:** Si estás en Angular 19+, usa mi librería - está lista para usar. Para otros frameworks, construye tu propia usando el mismo patrón.

---

### Diapositiva 50: Recursos
**Visual:** Código QR + enlace bit.ly (grande)
```
bit.ly/dev-toolbar-ng

📦 GitHub
📖 Documentación
🎬 Demo en Vivo
📝 Artículos
```
**Notas:** Todo está aquí. Repo, docs, demo en vivo, y artículos mostrando cómo construirlo.

---

### Diapositiva 51: Contacto
**Visual:** Redes sociales (grande)
```
@alfredo.perez.q
@alfredo-perez

¿Preguntas?
```
**Notas:** Encuéntrame en redes sociales. Me encantaría saber qué construyes.

---

### Diapositiva 52: Gracias
**Visual:** Simple, limpio
```
Gracias

Empieza a construir hoy
```
**Notas:** ¡Gracias! Deja de hacer hardcoding, empieza a hacer overrides. Construye tu barra hoy.

---

## RESUMEN DE LA PRESENTACIÓN

**Total de Diapositivas:** 51 (Diapositiva 6 eliminada)
**Tiempo Total:** 30-35 minutos
**Puntos de Demo:** 4 demos en vivo
- Demo 1: Feature flags (Diapositiva 18)
- Demo 2: Permisos y Funcionalidades de App (Diapositiva 23)
- Demo 3: Presets (Diapositiva 28)
- Demo 4 (opcional): Recorrido de escenario del mundo real (Diapositiva 40)

**Secciones Clave:**
1. Introducción (Diapositivas 1-5) - Problema y Solución
2. Introducción al Demo (Diapositivas 7-11) - Resumen de arquitectura
3. Feature Flags (Diapositivas 12-18) - Profundización con código + demo
4. Otras Herramientas (Diapositivas 19-23) - Mismo patrón + demo
5. Presets (Diapositivas 24-32) - Guardar/compartir + demo
6. Escenario del Mundo Real (Diapositivas 33-42) - Historia del bug del viernes 3PM
7. Beneficios y Resumen (Diapositivas 43-47) - Por qué importa
8. Cierre (Diapositivas 48-52) - Llamado a la acción

**Secuencias de Revelación de Código:**
- Registro de Feature Flags: 3 diapositivas (13-15)
- Uso de Feature Flags: 2 diapositivas (16-17)
- Mismo patrón: 1 diapositiva (20)

**Flujo del Demo:**
- Empezar con lo simple (feature flags)
- Mostrar que es el mismo patrón (permisos, funcionalidades de app)
- Mostrar el poder (presets combinando todo)
- Contar una historia (escenario del mundo real)

**Llamado a la Acción:**
- Usar ngx-dev-toolbar (devs de Angular)
- Construir tu propia (otros frameworks)
- Compartir lo que construyas

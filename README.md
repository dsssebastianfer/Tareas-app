# Semanas

Tus tareas, una semana de cada color. Lo que arrastras de semanas anteriores conserva su color original y muestra cuánto tiempo lleva pendiente.

## Uso diario
- Escribe y presiona **Enter** para crear una tarea (`N` o `/` enfocan el campo desde cualquier parte).
- Haz clic en el círculo para completarla. **Ctrl+Z** o «Deshacer» la devuelve a pendientes.
- Haz doble clic en una tarea para editarla.
- Abre el contador **Completadas** para ver el historial, la racha y reabrir tareas.
- Haz clic en tu nombre para cambiarlo. El ícono de parlante activa o silencia los sonidos.

## Desarrollo
```bash
npm install
npm run dev        # http://localhost:5173
```
Para simular otra fecha (solo en desarrollo): `http://localhost:5173/?hoy=2026-10-20`

## Instalar en el escritorio
```bash
npm run app        # compila y sirve en http://localhost:4747
```
Abre http://localhost:4747 en Edge y elige **⋯ → Aplicaciones → Instalar esta aplicación** (o el ícono de instalar en la barra de direcciones). Queda con ícono propio y funciona sin el servidor ni internet.

**Para recibir cambios nuevos:** ejecuta `npm run app` y abre la app instalada. Se actualiza sola y conserva las tareas.

> Los datos se guardan en el navegador, ligados a `localhost:4747`. Por eso el puerto es fijo: no lo cambies. Los datos de desarrollo (`localhost:5173`) se guardan aparte. Si borras los datos de navegación de Edge para este sitio, se pierden las tareas.

## Futuro: compartir con otras personas
Todo el acceso a datos pasa por `src/data/TaskRepository.ts`. Para tener cuentas de usuario se agrega una implementación con Supabase (`supabaseTaskRepository.ts`) y se publica en Vercel.

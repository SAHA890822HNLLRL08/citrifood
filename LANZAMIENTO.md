# CitriFood — ruta crítica para piloto local

## Qué sí está listo como demostración
- Cliente: menú, promociones, carrito, pedido simulado, seguimiento e historial.
- Restaurante: recepción y avance de pedidos, promociones.
- Operaciones: asignación manual, incidencias, reportes y CSV.
- Repartidor: pedido asignado, reporte de incidencia y entrega.
- Pruebas: `/pruebas`, un solo navegador/origen.

## Bloqueadores para recibir pedidos reales (en orden)
1. **Compilación y despliegue verificables:** comprobar `npm run test`, `npm run build`, navegación en iPhone y HTTPS. No anunciar servicio antes de esto.
2. **Backend y base de datos compartida:** pedidos, restaurantes, productos, horarios, promociones, estados e incidencias visibles entre distintos teléfonos; transiciones validadas por servidor.
3. **Identidades y permisos:** cliente, restaurante, repartidor y operador con acceso limitado a sus datos. Retirar enlaces de desarrollo y datos ilustrativos de la experiencia pública.
4. **Operación local:** confirmar restaurantes y menús autorizados, radios de entrega, tarifas, disponibilidad de repartidores, tiempos y teléfono/canal de soporte.
5. **Cobro y conciliación:** iniciar con el método que la operación pueda liquidar y documentar; no llamar «tarjeta» a un pago simulado. Definir cancelaciones y devoluciones.
6. **Privacidad y seguridad:** aviso de privacidad, resguardo de direcciones, teléfonos y ubicación; respaldo, registro de cambios y protección contra pedidos duplicados.
7. **Piloto cerrado:** probar con restaurantes y repartidores participantes y pedidos controlados antes de abrir registro general.

## Prueba de salida obligatoria
En **dos dispositivos diferentes**: cliente crea pedido → restaurante lo acepta → Operaciones asigna → repartidor entrega → cliente ve el cambio. Además: cancelación, restaurante rechaza, incidencia bloquea entrega hasta atenderse, reconexión y repetición de envío. No confundir las pruebas en pestañas del mismo navegador con sincronización real.

## Lo que todavía NO hace el MVP
No hay backend, autenticación real, cobros, notificaciones push, GPS ni sincronización entre dispositivos. Los datos viven en almacenamiento local y pueden perderse. No captar pedidos ni información personal real con este prototipo.

## Privacidad en llamadas y mensajes (requisito de lanzamiento)
- Cliente y repartidor **no deben recibir el teléfono personal de la otra parte** mediante interfaz, API, CSV ni enlaces `tel:`/WhatsApp. Limitar la comunicación al pedido activo y a los participantes autenticados.
- El MVP tiene **mensajería ilustrativa dentro del mismo navegador**, sin números visibles en la interfaz. No es chat entre dispositivos ni llamada real.
- Para llamadas reales, elegir **voz por internet dentro de la app (VoIP/WebRTC con proveedor)** o **número intermediario temporal (proxy de llamadas)**. No inventar números ni usar el teléfono personal como identificador público. La telefonía intermediada requiere números contratados, infraestructura, costos, reglas de expiración y verificación de disponibilidad en México.
- Las credenciales del proveedor, números reales y relación pedido-usuario deben quedarse en el servidor. El servidor debe autorizar quién puede contactar a quién y durante cuánto tiempo; limitar abuso y registrar eventos mínimos, sin grabar contenido por defecto.
- Un mensaje puede contener un número escrito voluntariamente por el usuario: no prometer anonimato absoluto sin controles adicionales y revisión de privacidad.

### Flujo de contacto para el piloto
1. Un pedido entra en «En entrega» y tiene repartidor asignado. El servidor autoriza al cliente dueño del pedido y al repartidor asignado, sin confiar en un rol enviado desde el navegador.
2. Se habilita chat privado solo durante la entrega; se cierra al entregar, rechazar o cancelar. Mensajes y metadatos se guardan en backend con política de retención definida.
3. Si el cliente toca «Llamar dentro de CitriFood», el servidor entrega credenciales efímeras de una sesión de voz únicamente a esas dos cuentas. Ningún número personal debe aparecer en payloads públicos, enlaces o logs de aplicación.
4. Si no hay internet o la llamada falla, ofrecer «Reportar problema a soporte» dentro de la app. No publicar números personales como solución de emergencia.
5. Antes de lanzar: pruebas con dos teléfonos, acceso ajeno denegado, intento de llamar tras entrega denegado, reconexión, abuso/bloqueo y consentimiento de micrófono.

La detección de teléfonos y enlaces del chat actual es **una protección parcial de demostración**, no anonimización garantizada. Debe reforzarse en el servidor y evaluarse frente a formatos alternativos y capturas de pantalla.

## Retención del chat para evidencias — 15 días
- Regla acordada: cada mensaje conserva su fecha de envío y vence exactamente **15 × 24 horas** después. El historial del pedido y las incidencias no se eliminan con el chat.
- En el prototipo, los mensajes caducados se eliminan de `localStorage` al abrir/consultar/guardar datos de pedidos; si nadie vuelve a abrir la aplicación, no hay proceso en segundo plano que borre datos del dispositivo al instante. El almacenamiento del navegador no es evidencia inalterable ni respaldo confiable.
- Operaciones puede consultar el chat vigente en el detalle del pedido, incluso si ya fue entregado. La exportación CSV de pedidos no incluye el contenido del chat.
- Para producción, la eliminación debe ejecutarse **en el servidor mediante tarea programada** y también filtrarse en cada consulta; definir copias de seguridad, solicitudes legales y política de privacidad antes de prometer borrado irreversible. Solo cuentas autorizadas podrán consultar evidencia; registrar quién accede y cuándo.

### Base de datos de chat preparada (no desplegada)
El archivo `supabase/migrations/202609230001_order_chat.sql` define tablas de pedidos y mensajes, autenticación por cuenta, políticas de lectura por cliente/repartidor asignado, escritura durante «En entrega» y vencimiento de 15 días. Incluye el comando **comentado** para limpieza horaria mediante Supabase Cron/pg_cron. El proyecto aún no está conectado a Supabase: faltan crear el proyecto, ejecutar/revisar la migración, activar el cron, conectar los roles de la app y comprobar los permisos con usuarios reales de prueba. La vista de Operaciones requiere un endpoint de servidor con autorización propia; nunca poner la clave de servicio en el navegador. Mientras haya datos reales, validar también backups y registros antes de garantizar eliminación definitiva.

En la demostración, al mantener la aplicación abierta se revisan mensajes caducados cada minuto y al volver a enfocarla; si el navegador está cerrado, se limpian al reabrir. Esta limpieza no reemplaza el trabajo programado del servidor.

### Verificación pública de preparación
La ruta `/api/health` y la pantalla `/pruebas` informan de forma explícita si el proyecto sigue en modo demo y si hay variables básicas de base de datos configuradas. **La presencia de variables no prueba conectividad ni autoriza pedidos reales.** El endpoint nunca devuelve credenciales. `.env.example` documenta los nombres de variables sin incluir valores. Antes de cambiar el estado a «listo», implementar autenticación, backend, flujo entre dispositivos, cobros y pruebas reales de extremo a extremo.

### Avance de integración: comprobación de conexión y protección del chat
- `/api/health` comprueba desde el servidor si responde el servicio de autenticación de Supabase configurado, con espera máxima de 3.5 segundos. Nunca publica claves ni considera que esa respuesta equivale a pedidos conectados.
- `/pruebas` distingue «variables configuradas», «servicio responde» y «pedidos entre teléfonos disponibles»; este último sigue **NO** hasta conectar y verificar el flujo completo.
- La migración `supabase/migrations/202609230002_chat_integrity.sql` impone desde PostgreSQL remitente autenticado, fecha de envío asignada por servidor, vencimiento a los 15 días y filtro básico de números/enlaces externos. Aplicar después de la primera migración. Es una protección parcial, no detección infalible de teléfonos.
- Para activar la integración hacen falta un proyecto Supabase controlado por CitriFood, URL y clave pública del proyecto y la clave de servicio guardada **solo en el servidor**. No compartir credenciales por chat ni subir `.env.local` a GitHub. Aún no se han aplicado migraciones ni verificado CI/build.

### Primera ruta de pedidos compartidos — código preparado, no desplegado
- La migración `supabase/migrations/202609230003_customer_orders.sql` añade datos mínimos del pedido y una política que permite a una cuenta autenticada crear únicamente pedidos propios en estado «Nuevo». No autoriza al cliente a cambiar estados ni asignar repartidores.
- `/api/auth/otp` solicita un código de acceso por correo; `/api/auth/verify` lo valida. **Configurar la plantilla de correo OTP de Supabase para mostrar `{{ .Token }}` (6 dígitos), no solo un enlace mágico**, y revisar SMTP, restricciones de alta, CAPTCHA y límites de envío antes de abrir al público.
- `/api/orders` valida el token con Supabase, calcula el total desde los productos enviados, impide que el cliente escoja otro dueño/estado/repartidor y lee solo los pedidos de su cuenta mediante RLS. Esta API es únicamente para pruebas con productos, precios y direcciones ficticios: aún NO comprueba menús autorizados ni precios del restaurante desde el servidor.
- `/piloto` permite entrar por correo, guardar un pedido de prueba y consultar pedidos desde otro dispositivo **con la misma cuenta**, una vez que Supabase esté configurado y las tres migraciones se hayan aplicado. La sesión vive solo en memoria de la pestaña; cerrar o recargar exige nuevo acceso. La interfaz de cliente/restaurante/repartidor principal sigue usando demo local.
- Prueba necesaria antes de usar: confirmar OTP, aplicar migraciones en orden, probar dos navegadores con la misma cuenta, probar una cuenta ajena sin acceso, impedir cambio de precio/estado, y revisar el registro de solicitudes y límites. No pedir a usuarios reales que introduzcan direcciones o hagan compras durante este piloto técnico.

### Primer endpoint de pedidos compartidos (preparado, no conectado a la interfaz)
- `supabase/migrations/202609230003_customer_orders.sql` agrega dirección, artículos, total y permiso RLS para que un usuario autenticado cree **sus propios** pedidos de prueba. Se debe aplicar después de las migraciones 001 y 002.
- `GET /api/orders` y `POST /api/orders` requieren un token de sesión de Supabase válido; verifican la cuenta ante Supabase y consultan la base de datos con **la clave pública y el token del propio usuario**, no con la clave de administrador. La consulta queda limitada al ID autenticado y también por RLS.
- El cliente todavía usa `localStorage`; **no hay pantalla de inicio de sesión ni pedidos compartidos visibles en los módulos**. Los precios del endpoint se validan por consistencia aritmética, pero **no se comparan aún con un catálogo de precios autorizado en el servidor**: no usar este endpoint para cobrar ni aceptar pedidos comerciales. Tampoco está autorizado el cambio de estado desde el servidor.
- Siguiente paso: catálogo y precios confiables, registro/inicio de sesión, integración del cliente y permisos de restaurante/operaciones/repartidor, seguidos de prueba real con varios dispositivos.

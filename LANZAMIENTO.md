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

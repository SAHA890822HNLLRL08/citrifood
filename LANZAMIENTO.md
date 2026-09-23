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

# Asignación múltiple y rutas CitriFood

- Ventana normal de aceptación: **25 segundos**.
- El repartidor puede activar **aceptación automática**. Esto le da prioridad moderada, sin anular distancia, desempeño ni seguridad de la ruta.
- Capacidad inicial: hasta **4 pedidos activos** por repartidor.
- Un pedido adicional solo se agrupa si va en la misma dirección o corredor y el desvío estimado no compromete tiempos.
- El sistema puede insertar una nueva recolección entre entregas si la ruta resultante sigue siendo eficiente.
- Las entregas se reordenan dinámicamente por ETA, cercanía y compromisos de tiempo; no simplemente por orden de llegada.
- Límites iniciales configurables: +8 min de desvío para recoger y +12 min para entregar. Se calibrarán con datos reales.
- Si agregar un pedido perjudica demasiado a cualquiera de los pedidos ya cargados, se ofrece a otro repartidor.
- Cada decisión registra ruta previa, ruta propuesta, ETAs y motivo de agrupación para auditoría.

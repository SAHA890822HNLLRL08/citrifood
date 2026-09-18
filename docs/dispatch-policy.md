# Política inicial de asignación CitriFood

CitriFood no asigna únicamente por distancia. Primero considera repartidores elegibles: conectados, disponibles, documentos aprobados y sin suspensión.

Entre los elegibles se calcula un puntaje combinando cercanía y desempeño histórico. El desempeño contempla puntualidad/tiempo de entrega, porcentaje de pedidos completados, cancelaciones, calificaciones y **solo incidencias verificadas**. La cercanía sigue teniendo el mayor peso individual, pero un repartidor ligeramente más lejano puede recibir el pedido si su desempeño es claramente superior.

## Principios
- No castigar automáticamente una queja no verificada.
- Guardar historial y motivo de cada asignación para auditoría.
- Evitar criterios personales o sensibles; el algoritmo usa únicamente señales relacionadas con la operación.
- Los pesos deben poder configurarse y recalibrarse con datos reales.
- Registrar aceptación, rechazo, cancelación, tiempos de llegada/recogida/entrega, calificaciones e incidencias verificadas.
- Si el primer repartidor no acepta dentro del tiempo configurado, ofrecer al siguiente del ranking.
- Mantener trazabilidad para explicar por qué un pedido fue ofrecido a un repartidor antes que a otro.

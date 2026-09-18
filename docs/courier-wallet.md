# Cartera de efectivo del repartidor

Cada pedido pagado en efectivo genera movimientos separados y auditables:

1. **Efectivo cobrado al cliente**.
2. **Ganancia/bonificación del repartidor** por ese pedido.
3. **Cantidad que el repartidor puede conservar** de ese efectivo.
4. **Saldo que debe depositar a CitriFood**.

Ejemplo: cliente paga $400 y la ganancia del repartidor es $35. El sistema registra $400 cobrados, $35 de ganancia retenida y $365 por depositar.

El cierre diario muestra efectivo cobrado, ganancias del día, cantidad ya tomada por el repartidor, depósitos registrados y saldo pendiente.

## Reglas contables
- Los importes se almacenan en centavos enteros.
- Ningún movimiento previo se sobrescribe: correcciones se registran como ajustes.
- Cada depósito debe tener referencia y puede incluir comprobante.
- Un depósito permanece pendiente hasta ser conciliado/verificado.
- El historial debe permitir reconstruir el saldo pedido por pedido.
- Pedidos pagados digitalmente no generan efectivo por depositar; su ganancia se registra como saldo a favor/pago pendiente al repartidor.

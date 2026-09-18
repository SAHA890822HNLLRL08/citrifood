# Tope de efectivo CitriFood

**Tope operativo: $800 MXN por repartidor.**

- Antes de ofrecer un pedido en efectivo, CitriFood proyecta cuánto efectivo/deuda generaría.
- Si el repartidor lleva $750, no se le ofrece un pedido en efectivo de $500.
- Al alcanzar o superar el tope por el cierre de un pedido ya aceptado, queda en modo **solo pagos digitales**.
- El repartidor sigue trabajando normalmente con pedidos pagados por tarjeta/digital.
- La ganancia de un pedido digital se aplica primero contra el efectivo que debe entregar. Ejemplo: deuda $840 + ganancia digital $40 = deuda nueva $800.
- Cuando su saldo vuelve a un nivel permitido, puede volver a ser candidato para pedidos en efectivo, sujeto a la proyección del siguiente pedido.
- Un depósito conciliado también reduce inmediatamente la deuda.

## Depósitos
La cartera tendrá una acción **Depositar saldo**. La integración real (SPEI, referencia/código para depósito en efectivo en OXXO u otro proveedor) se conectará mediante un proveedor de pagos; CitriFood no marcará el saldo como pagado solo por generar una referencia. El saldo baja cuando el pago sea confirmado/conciliado.

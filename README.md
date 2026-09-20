# CitriFood

Plataforma local de entrega de comida.

## MVP actual
Rama de desarrollo: develop

Rutas de demostración:
- / — Cliente
- /acceso — Selector de perfiles de prueba
- /repartidor — Repartidor y ruta activa
- /repartidor/pedido — Ciclo de entrega
- /repartidor/cartera — Cartera y control de efectivo
- /repartidor/perfil — Desempeño del repartidor
- /operaciones — Centro de operaciones
- /operaciones/asignacion — Asignación inteligente
- /operaciones/pedidos — Monitor de pedidos
- /operaciones/solicitudes — Altas de repartidores
- /operaciones/incidencias — Revisión de incidencias
- /restaurante — Portal del restaurante

## Desarrollo local

npm install
npm run dev

La primera publicación usará develop como versión de prueba. Antes de producción se incorporarán base de datos, autenticación, pagos reales, mapas/GPS y comunicación en tiempo real.

## Prueba integrada en un navegador
Abre `/` y `/restaurante` (Tacos El Centro) y `/operaciones/pedidos` en pestañas del mismo navegador. Confirma un pedido en Tacos El Centro; debe aparecer en las otras pestañas y sus cambios de estado deben reflejarse en el cliente. Se usa localStorage del navegador, no una base de datos compartida entre dispositivos. Los pagos son simulados; no se procesa ninguna tarjeta.

## Recorrido funcional de prueba (mismo navegador)
1. Abre `/` y crea un pedido de cualquier restaurante, con dirección y pago simulado.
2. Abre `/restaurante`, elige ese restaurante y pulsa «Aceptar pedido», «Marcar listo» y «Entregar a repartidor».
3. En `/operaciones/pedidos`, pulsa «Asignar a Juan (demo)».
4. En `/repartidor`, busca «Pedidos asignados desde Operaciones» y pulsa «Confirmar entrega».
5. Regresa al cliente: seguimiento y «Mis pedidos» muestran «Entregado».

Las tarjetas `CF-DEMO-` son ejemplos estáticos; los pedidos creados por el cliente sí cambian de estado entre pestañas del mismo origen. No utilizar pedidos reales ni datos sensibles. No hay GPS, cobros ni sincronización entre teléfonos. Para verificar calidad: `npm test` y `npm run build`.

## Promociones de restaurantes
En `/restaurante`, elige un restaurante y usa «Nueva promoción» para definir nombre, descripción y precio en MXN. Puedes pausar y reactivar las ofertas. Las activas aparecen primero al entrar al menú de ese restaurante y pueden agregarse al carrito. Las promociones patrocinadas de portada son una demostración de espacios publicitarios, no una contratación ni un cobro. Los cambios se guardan únicamente en localStorage del mismo navegador; no hay todavía panel autenticado ni campañas de publicidad reales.

## Centro de pruebas
La ruta `/pruebas` ofrece instrucciones para recorrer cliente → restaurante → operaciones → repartidor → cliente, contadores de pedidos del navegador, resumen de promociones y un botón de reinicio de pedidos de demostración (con confirmación). El reinicio no borra las promociones.

## Publicidad simulada
La promoción activa siempre aparece al principio del menú del restaurante. El interruptor «Patrocinada (demo)» controla por separado si esa promoción aparece también en «Promociones para ti» de la portada, con etiqueta visible de patrocinio. Activar ese interruptor no representa una campaña contratada, no genera facturas y no cobra dinero. La autorización comercial, duración, facturación y límites de publicidad quedan pendientes de un backend real y del panel de Operaciones.

## Cancelación de pedidos de prueba
El cliente puede cancelar su pedido mientras siga en estado `Nuevo`. Una vez que el restaurante lo acepta (`Preparando`), el botón desaparece y el sistema rechaza intentos de cancelación. `Cancelado` es un estado terminal, permanece en «Mis pedidos» y se puede filtrar en Operaciones. Es una simulación: no hay reembolsos ni cargos reales.

## Consulta de pedidos en Operaciones
En `/operaciones/pedidos` se puede buscar por folio, restaurante, cliente, dirección o repartidor; filtrar por estado y consultar cantidades por filtro. «Ver detalle» muestra dirección, productos, importe de envío y cronología de movimientos de los pedidos creados en este navegador. Las tarjetas `CF-DEMO-` permanecen identificadas como ejemplos y no contienen expedientes reales.

## Exportación de pedidos (demostración)
En `/operaciones/pedidos`, filtra o busca pedidos y pulsa «Exportar pedidos filtrados (CSV)». El archivo incluye folio, fechas, restaurante, cliente, dirección, estado, pago, total, envío y repartidor. Se excluyen los pedidos estáticos `CF-DEMO-`. El archivo sale únicamente de los datos de prueba del navegador actual y no representa un reporte contable ni un historial centralizado. Los campos de texto se escapan para evitar que una hoja de cálculo ejecute fórmulas ingresadas como datos.

## Reporte por restaurante (MVP)
La ruta `/operaciones/reportes` resume los pedidos creados en el navegador actual por restaurante: total, activos, entregados, cancelados, rechazados y valor bruto de los pedidos marcados como entregados. Excluye tarjetas ilustrativas `CF-DEMO-`. No calcula utilidad, comisiones, pagos, facturación ni dinero cobrado. Se actualiza entre pestañas del mismo navegador.

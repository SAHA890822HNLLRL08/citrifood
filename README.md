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

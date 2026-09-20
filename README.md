# CitriFood

Plataforma local de entrega de comida.

## MVP actual
Rama de desarrollo: develop

Rutas de demostración:
- / — Cliente\n- /acceso — Selector de perfiles de prueba
- /repartidor — Repartidor y ruta activa
- /repartidor/pedido — Ciclo de entrega
- /repartidor/cartera — Cartera y control de efectivo\n- /repartidor/perfil — Desempeño del repartidor
- /operaciones — Centro de operaciones
- /operaciones/asignacion — Asignación inteligente\n- /operaciones/pedidos — Monitor de pedidos\n- /operaciones/solicitudes — Altas de repartidores\n- /operaciones/incidencias — Revisión de incidencias\n- /restaurante — Portal del restaurante

## Desarrollo local

npm install
npm run dev

La primera publicación usará develop como versión de prueba. Antes de producción se incorporarán base de datos, autenticación, pagos reales, mapas/GPS y comunicación en tiempo real.

## Prueba integrada en un navegador
Abre `/` y `/restaurante` (Tacos El Centro) y `/operaciones/pedidos` en pestañas del mismo navegador. Confirma un pedido en Tacos El Centro; debe aparecer en las otras pestañas y sus cambios de estado deben reflejarse en el cliente. Se usa localStorage del navegador, no una base de datos compartida entre dispositivos. Los pagos son simulados; no se procesa ninguna tarjeta.

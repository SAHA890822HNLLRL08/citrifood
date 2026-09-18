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

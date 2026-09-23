# Publicar el primer piloto de CitriFood (pedidos ficticios)

El código está en la rama `develop`. **Una compilación verde no publica la web ni crea la base de datos.** No uses datos de clientes reales ni recibas dinero con este piloto.

## 1. Crear la base de datos
1. Crear un proyecto Supabase administrado por el propietario de CitriFood.
2. En **SQL Editor**, ejecutar en orden los archivos de `supabase/migrations/`, del `202609230001` al `202609230008`. Revisar cada resultado y detenerse ante cualquier error; no saltar migraciones.
3. Ejecutar `supabase/VERIFY_PILOT.sql` en SQL Editor. Las ocho comprobaciones de objetos deben decir `OK` y las cinco tablas deben mostrar `rls_enabled = true`. Si no, detenerse y revisar la migración que falló.
4. En **Authentication → Providers → Email**, habilitar el correo y configurar el envío de códigos OTP; comprobar el correo con una cuenta de prueba. La cuota de correo de prueba de Supabase puede ser limitada.
5. Crear cuatro usuarios de prueba por correo (cliente, restaurante, Operaciones y repartidor). Identificar sus UUID desde **Authentication → Users**. No copiar tokens ni contraseñas al repositorio.
6. Con la cuenta correcta ya verificada, ejecutar las asignaciones siguientes en SQL Editor, reemplazando cada marcador con el UUID auténtico:
```sql
insert into public.cf_restaurant_members(user_id,restaurant_name)
values ('<UUID_RESTAURANTE>', 'Restaurante de prueba');

insert into public.cf_operations_members(user_id)
values ('<UUID_OPERACIONES>');

insert into public.cf_courier_members(user_id,display_name)
values ('<UUID_REPARTIDOR>', 'Repartidor de prueba');
```
El cliente debe crear el pedido con el nombre **exacto** `Restaurante de prueba`. No asignar membresías a cuentas que no hayan sido verificadas.

## 2. Publicar la rama develop
En el proveedor de alojamiento Next.js, importar el repositorio `SAHA890822HNLLRL08/citrifood`, seleccionar **develop** como rama de despliegue y configurar variables de entorno de servidor:
```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<publishable-or-anon-key-compatible-with-apikey>
```
La clave `SUPABASE_SERVICE_ROLE_KEY` **no es necesaria para este recorrido**; no añadirla sin un caso de uso y revisión de seguridad. No publicar claves en GitHub ni anteponer `NEXT_PUBLIC_` a claves secretas. Si se configura un dominio propio, revisar la URL permitida en Supabase Authentication.

## 3. Comprobar que el despliegue responde
Desde una terminal con Node 22+:
```sh
npm run smoke:pilot -- https://<dominio-publicado> --require-db
```
Esta prueba confirma que la pantalla /piloto y el servidor responden, que los endpoints privados rechazan solicitudes anónimas y, con --require-db, exige que Supabase esté configurado y su servicio de autenticación sea alcanzable. **No comprueba migraciones, permisos de usuarios autenticados ni una entrega real.**

## 4. Prueba entre celulares
Abrir `https://<dominio-publicado>/piloto` en los celulares y entrar cada uno con su correo de prueba:
1. Cliente: crear pedido con restaurante `Restaurante de prueba`, dirección ficticia y producto/precio ficticios.
2. Restaurante: esperar hasta 10 segundos, aceptar y marcar listo.
3. Operaciones: seleccionar repartidor activo y asignar el pedido listo.
4. Repartidor: confirmar entrega de prueba.
5. Cliente: comprobar estado `Entregado`.

Si el estado no cambia, consultar los registros del despliegue y la respuesta de los endpoints; no asumir que un build verde significa que el SQL se aplicó.

## Límites que bloquean ventas reales
No existe catálogo/precio validado en servidor, pagos, aceptación del repartidor, comprobación de recolección, evidencia de entrega, ubicación GPS, manejo completo de incidencias entre celulares ni una política de privacidad/despliegue auditada. La eliminación física de chats a los 15 días requiere activar y comprobar la tarea programada indicada en la migración 001.

-- Align the existing production payload constraint with the current application payment contract.
alter table public.cf_orders drop constraint if exists cf_order_customer_payload_check;
alter table public.cf_orders add constraint cf_order_customer_payload_check check (
 restaurant_name is not null and char_length(btrim(restaurant_name)) between 1 and 100
 and delivery_address is not null and char_length(btrim(delivery_address)) between 5 and 250
 and (delivery_notes is null or char_length(delivery_notes)<=250)
 and jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 40
 and total_cents between 1 and 10000000
 and payment_method in ('Efectivo (simulado)','Tarjeta (simulada)')
) not valid;

-- Customers may create only customer-controlled order fields.
-- Internal workflow/evidence fields remain writable only through trusted RPCs.
revoke insert on table public.cf_orders from authenticated;
grant insert(customer_id,restaurant_name,delivery_address,delivery_notes,items,total_cents,payment_method,delivery_lat,delivery_lng)
on table public.cf_orders to authenticated;

-- Muntaha's Attires — Phase 6 seed data.
-- Categories are fixed slugs per spec; items are placeholder catalog data so
-- the storefront stays populated until real items are uploaded via the admin.

insert into public.categories (slug, display_name, hero_image, hero_caption)
values
  ('stitched', 'Stitched', '/images/categories/stitched.jpg', null),
  ('unstitched', 'Unstitched', '/images/categories/unstitched.jpg', null),
  ('new-arrivals', 'New Arrivals', '/images/categories/new-arrivals.jpg', null),
  ('bottoms', 'Bottoms', '/images/categories/bottoms.jpg', null),
  ('co-ords', 'Co-Ords', '/images/categories/co-ords.jpg', null),
  ('other-brands-sale', 'Other Brands Sale', '/images/categories/other-brands-sale.jpg', null)
on conflict (slug) do update set
  display_name = excluded.display_name,
  hero_image = excluded.hero_image,
  hero_caption = excluded.hero_caption;

insert into public.site_settings (key, value)
values
  ('hero_heading', 'Elegance in Every Thread'),
  ('hero_subheading', 'Stitched, unstitched, co-ords, and more — curated for the modern Pakistani woman.'),
  ('hero_image', '/images/hero.jpg')
on conflict (key) do update set value = excluded.value;

insert into public.shipping_rates (country, province, cost)
values
  ('Pakistan', null, 250),
  ('Pakistan', 'Islamabad Capital Territory', 200),
  ('Pakistan', 'Punjab', 250),
  ('Pakistan', 'Sindh', 300),
  ('Pakistan', 'Khyber Pakhtunkhwa', 300),
  ('Pakistan', 'Balochistan', 400)
on conflict do nothing;

insert into public.promo_codes (code, type, value, active)
values ('WELCOME10', 'percent', 10, true)
on conflict (code) do nothing;

insert into public.items (
  id, category_slug, name, price, stock, announcement, description, images
)
values
  ('stitched-sana-lawn', 'stitched', 'Sana Lawn Embroidered Suit', 7890, 12, 'New Arrival',
   'A lightweight lawn three-piece with delicate threadwork on the neckline and sleeves.',
   array['/images/items/stitched-1.jpg']),
  ('stitched-mariam-silk', 'stitched', 'Mariam Silk Kameez', 9450, 5, null,
   'Pure silk kameez with a subtle sheen, cut for an easy everyday silhouette.',
   array['/images/items/stitched-2.jpg']),
  ('stitched-ayesha-chiffon', 'stitched', 'Ayesha Chiffon Shirt', 6750, 0, 'Sale',
   'Flowing chiffon shirt with printed detail — a graceful choice for evening wear.',
   array['/images/items/stitched-3.jpg']),
  ('unstitched-shalimar', 'unstitched', 'Shalimar 3-Piece Unstitched', 4290, 25, 'New Arrival',
   'Unstitched lawn suit with embroidered dupatta — tailor it to your fit.',
   array['/images/items/unstitched-1.jpg']),
  ('unstitched-gulnaz', 'unstitched', 'Gulnaz Lawn Suit', 3850, 18, null,
   'Classic unstitched lawn suit in a breathable weave, ideal for summer.',
   array['/images/items/unstitched-2.jpg']),
  ('unstitched-mughal-heritage', 'unstitched', 'Mughal Heritage Suit', 5400, 7, null,
   'Inspired by timeless Mughal motifs, this unstitched suit comes with a matching trouser.',
   array['/images/items/unstitched-3.jpg']),
  ('sale-branded-saree', 'other-brands-sale', 'Branded Saree — Sale', 6900, 9, 'Sale',
   'Select brand sarees at marked-down prices while stock lasts.',
   array['/images/items/other-brands-sale-1.jpg']),
  ('sale-pret-shirt', 'other-brands-sale', 'Pret Collection Shirt', 2990, 14, 'Sale',
   'Ready-to-wear pret shirt from our partner brands, priced for quick sale.',
   array['/images/items/other-brands-sale-2.jpg']),
  ('bottoms-plain-trouser', 'bottoms', 'Plain Trouser', 1890, 30, null,
   'Everyday plain trouser in comfortable cotton with a flattering fit.',
   array['/images/items/bottoms-1.jpg']),
  ('bottoms-embroidered-capri', 'bottoms', 'Embroidered Capri Pants', 2450, 16, 'New Arrival',
   'Capri pants finished with a touch of embroidery at the hem.',
   array['/images/items/bottoms-2.jpg']),
  ('bottoms-chiffon-palazzo', 'bottoms', 'Chiffon Palazzo', 2750, 8, null,
   'Wide-leg palazzo in airy chiffon — pairs with any of our kameez.',
   array['/images/items/bottoms-3.jpg']),
  ('new-sitara-festive', 'new-arrivals', 'Sitara Festive Suit', 11200, 6, 'New Arrival',
   'Our newest festive silhouette — rich detailing made for special occasions.',
   array['/images/items/new-arrivals-1.jpg', '/images/items/new-arrivals-2.jpg']),
  ('new-zeba-khaddar', 'new-arrivals', 'Zeba Khaddar Kameez', 5350, 11, 'New Arrival',
   'Khaddar kameez with a soft finish — new to the collection this week.',
   array['/images/items/new-arrivals-2.jpg']),
  ('coords-luna', 'co-ords', 'Luna Co-ord Set', 8450, 4, null,
   'A matching co-ord set with a tailored top and trousers in one print.',
   array['/images/items/co-ords-1.jpg', '/images/items/co-ords-2.jpg']),
  ('coords-hera', 'co-ords', 'Hera 2-Piece Co-ord', 7290, 9, 'New Arrival',
   'Two-piece co-ord with clean lines — easy to dress up or down.',
   array['/images/items/co-ords-2.jpg']),
  ('coords-noor-festival', 'co-ords', 'Noor Festival Co-ord', 9800, 3, null,
   'Festival-ready co-ord set with elevated detailing throughout.',
   array['/images/items/co-ords-3.jpg'])
on conflict (id) do nothing;

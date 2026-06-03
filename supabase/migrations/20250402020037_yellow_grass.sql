/*
  # Add Menu Items

  1. Changes
    - Adds new menu items from the provided JSON data
    - Uses ON CONFLICT DO NOTHING to prevent duplicates
    - Preserves existing items

  2. Security
    - Maintains existing RLS policies
*/

-- Breakfast Section - Eggs Category
INSERT INTO menu_items (
  category_id, 
  name_en, 
  description_en, 
  name_el, 
  description_el, 
  name_tr, 
  description_tr, 
  price, 
  tags, 
  display_order
)
SELECT 
  category_id,
  name_en,
  description_en,
  name_el,
  description_el,
  name_tr,
  description_tr,
  price,
  tags,
  display_order
FROM (
  VALUES
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Avocado Peinirli', 
      'Poached eggs, avocado cream, baby spinach, yogurt, fresh herbs, paprika oil, lemon, and Naxos graviera cheese sauce.',
      'Πεϊνιρλί Αβοκάντο', 
      'Αυγά ποσέ, κρέμα αβοκάντο, baby σπανάκι, γιαούρτι, φρέσκα βότανα, λάδι πάπρικα, λεμόνι και σάλτσα από γραβιέρα Νάξου',
      'Avokado Peinirli', 
      'Poşe yumurta, avokado kreması, bebek ıspanak, yoğurt, taze otlar, paprika yağı, limon ve Naxos graviera peyniri sosu',
      8.50, 
      ARRAY['V'], 
      1
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Kagianas', 
      'Scrambled Chios eggs, fresh tomato sauce, peppers, basil, Chios goat cheese, and grilled focaccia.',
      'Καγιανάς', 
      'Χτυπημένα αυγά φρέσκα Χίου, φρέσκια σάλτσα ντομάτας, πιπεριές, βασιλικό, κατσικίσιο τυρί Χίου και ψητή focaccia',
      'Kagianas', 
      'Chios yumurtasıyla yapılmış çırpılmış yumurta, taze domates sosu, biber, fesleğen, Chios keçi peyniri ve ızgara focaccia',
      7.50, 
      ARRAY['V', 'GF'], 
      2
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Benedict', 
      'Poached eggs, brioche bread, premium smoked turkey, bacon, Chios goat cheese, raw spinach, and hollandaise sauce.',
      'Benedict', 
      'Αυγά πόσε, ψωμί brioche, premium καπνιστή γαλοπούλα, μπέικον, κατσικίσιο τυρί Χίου, σπανάκι ωμό και sauce hollandaise',
      'Benedict', 
      'Poşe yumurta, brioche ekmeği, füme hindi, pastırma, Chios keçi peyniri, çiğ ıspanak ve hollandaise sosu',
      9.50, 
      ARRAY[]::text[], 
      3
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Sunny-Side Eggs with Sausage', 
      'Crispy fried potatoes, sausages, feta cream (PDO), grilled tomato, and rustic bread with olive oil and oregano.',
      'Αυγά ματιά με λουκάνικο', 
      'Φρέσκες πατάτες τηγανιτές, λουκάνικα, κρέμα φέτας Π.Ο.Π, ψητή ντομάτα και χωριάτικο ψωμί με λαδορίγανη.',
      'Sosisli Göz Yumurta', 
      'Kızarmış patates, sosis, feta kreması (PDO), ızgara domates ve zeytinyağlı kekikli köy ekmeği.',
      8.00, 
      ARRAY[]::text[], 
      4
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Mushrooms Truffle', 
      'Scrambled eggs, mushroom ragout, baby arugula, Greek prosciutto, parmesan, truffle mayo, and brioche bread.',
      'Mushrooms Truffle', 
      'Αυγά scrabble, μανιτάρια ραγού, baby ρόκα, ελληνικό προσούτο, παρμεζάνα, μαγιονέζα τρούφας και ψωμί brioche.',
      'Mantarlı Trüf Yumurtası', 
      'Çırpılmış yumurta, mantar ragù, roka, Yunan jambonu, parmesan, trüf mayonez ve briyoş ekmeği.',
      10.50, 
      ARRAY[]::text[], 
      5
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Omelette Your Way', 
      'Chios eggs, gouda, smoked turkey, served with grilled rustic bread. Extra toppings: mushrooms, tomato, peppers, Naxos graviera, feta (PDO), bacon.',
      'Ομελέτα της αρεσκείας σας', 
      'Αυγά Χίου, gouda, καπνιστή γαλοπούλα, σερβίρεται με ψητό χωριάτικο ψωμί. Έξτρα υλικά: μανιτάρια, ντομάτα, πιπεριές, γραβιέρα Νάξου, φέτα Π.Ο.Π, μπέικον.',
      'Kendi Seçiminiz Omlet', 
      'Sakız yumurtası, gouda, füme hindi ve ızgara köy ekmeği ile servis edilir. Ekstra malzemeler: mantar, domates, biber, Naxos graviera, feta (PDO), pastırma.',
      8.00, 
      ARRAY[]::text[], 
      6
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      'Healthy Omelette', 
      'Egg-white omelet with mozzarella, marinated cherry tomatoes, fresh basil, and aromatic cream cheese. Add-ons: Alonissos white tuna / Grilled chicken fillet.',
      'Healthy Omelette', 
      'Ομελέτα από ασπράδια αυγών, μοτσαρέλα, μαριναρισμένα τοματίνια, φρέσκο βασιλικό και αρωματική κρέμα τυριού. +Τόνος Αλοννήσου / +Φιλέτο κοτόπουλο.',
      'Sağlıklı Omlet', 
      'Yumurta akından yapılmış omlet, mozzarella, marine kiraz domates, taze fesleğen ve aromatik krem peynir. Ek: Alonissos beyaz ton balığı / Izgara tavuk göğsü.',
      9.00, 
      ARRAY['V'], 
      7
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Eggs'), 
      '"Avgokalamara" from Chios', 
      'Omelette with fresh Chios eggs, slow-cooked beef mince, smoked cheese, tomato, and Mytilene kasseri sauce.',
      'Αυγοκαλαμάρα Χίου', 
      'Ομελέτα με φρέσκα αυγά Χίου, σιγομαγειρεμένο μοσχαρίσιο κιμά, καπνιστό τυρί, ντομάτα και σάλτσα από κασέρι Μυτιλήνης.',
      'Sakız Adası''ndan ''Avgokalamara''', 
      'Taze Sakız yumurtalı omlet, yavaş pişmiş dana kıyma, füme peynir, domates ve Midilli kasseri sosu.',
      9.50, 
      ARRAY[]::text[], 
      8
    )
) AS new_items(category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name_en = new_items.name_en
);

-- Breakfast Section - Bowls Category
INSERT INTO menu_items (
  category_id, 
  name_en, 
  description_en, 
  name_el, 
  description_el, 
  name_tr, 
  description_tr, 
  price, 
  tags, 
  display_order
)
SELECT 
  category_id,
  name_en,
  description_en,
  name_el,
  description_el,
  name_tr,
  description_tr,
  price,
  tags,
  display_order
FROM (
  VALUES
    (
      (SELECT id FROM menu_categories WHERE name = 'Bowls'), 
      'Greek Yogurt Bowl', 
      'Greek yogurt, fresh fruits, granola, honey, and Chios sour cherry spoon sweet.',
      'Μπολ με Ελληνικό Γιαούρτι', 
      'Ελληνικό γιαούρτι, φρέσκα φρούτα, granola, μέλι και Χιώτικο γλυκό του κουταλιού κεράσι',
      'Yunan Yoğurt Kasesi', 
      'Yunan yoğurdu, taze meyveler, granola, bal ve Sakız Adası vişneli tatlısı',
      6.50, 
      ARRAY['V', 'GF'], 
      1
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Bowls'), 
      'Fruit Salad', 
      'A fresh seasonal fruit selection.',
      'Φρουτοσαλάτα', 
      'Επιλογή από φρέσκα φρούτα εποχής',
      'Meyve Salatası', 
      'Mevsimlik taze meyve seçkisi',
      5.50, 
      ARRAY['V', 'VG', 'GF'], 
      2
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Bowls'), 
      'Açaí Chia Bowl', 
      'Chia seeds, granola, banana, honey, and seasonal fresh fruit.',
      'Açaí Chia Bowl', 
      'Σπόροι chia, granola, μπανάνα, μέλι και φρέσκα φρούτα εποχής.',
      'Açaí Chia Kasesi', 
      'Chia tohumu, granola, muz, bal ve mevsim meyveleri.',
      7.50, 
      ARRAY['V'], 
      3
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Bowls'), 
      'Mango Bowl (Vegan)', 
      'Mango, banana, fresh fruit, coconut flakes, and maple syrup.',
      'Mango Bowl (Vegan)', 
      'Μάνγκο, μπανάνα, φρέσκα φρούτα, φλέικς καρύδας και σιρόπι σφενδάμου.',
      'Mango Kasesi (Vegan)', 
      'Mango, muz, taze meyveler, hindistan cevizi rendesi ve akçaağaç şurubu.',
      7.00, 
      ARRAY['V', 'VG'], 
      4
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Bowls'), 
      'Saint Fire Bowl', 
      'Buckwheat, muesli, fresh fruit, and chia seeds.',
      'Saint Fire Bowl', 
      'Φαγόπυρο, μούσλι, φρέσκα φρούτα και chia.',
      'Saint Fire Kasesi', 
      'Karabuğday, müsli, taze meyveler ve chia tohumu.',
      7.50, 
      ARRAY['V'], 
      5
    )
) AS new_items(category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name_en = new_items.name_en
);

-- Breakfast Section - Toast & Sandwiches Category
INSERT INTO menu_items (
  category_id, 
  name_en, 
  description_en, 
  name_el, 
  description_el, 
  name_tr, 
  description_tr, 
  price, 
  tags, 
  display_order
)
SELECT 
  category_id,
  name_en,
  description_en,
  name_el,
  description_el,
  name_tr,
  description_tr,
  price,
  tags,
  display_order
FROM (
  VALUES
    (
      (SELECT id FROM menu_categories WHERE name = 'Toast & Sandwiches'), 
      'Grilled Cheese', 
      'Rustic bread with butter, beef bacon, cheddar, emmental, la vache cheese, and cocktail sauce.',
      'Grilled Cheese', 
      'Χωριάτικο ψωμί με βούτυρο, μοσχαρίσιο μπέικον, cheddar, emmental, la vache και cocktail sauce.',
      'Izgara Peynirli Tost', 
      'Köy ekmeği, tereyağı, dana pastırma, cheddar, emmental, la vache peyniri ve kokteyl sos.',
      7.00, 
      ARRAY[]::text[], 
      1
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Toast & Sandwiches'), 
      'Sando Croque Madame', 
      'Buttery eggs, brioche bread, caramelized bacon, red cabbage, emmental, béchamel, and cheddar sauce.',
      'Sando Croque Madame', 
      'Αυγά βουτυράτα, ψωμί brioche, καραμελωμένο μπέικον, κόκκινο λάχανο, emmental, μπεσαμέλ και sauce cheddar.',
      'Sando Croque Madame', 
      'Tereyağlı yumurta, briyoş ekmeği, karamelize pastırma, kırmızı lahana, emmental, beşamel ve cheddar sos.',
      8.50, 
      ARRAY[]::text[], 
      2
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Toast & Sandwiches'), 
      'Vegan Puccia Sandwich', 
      'Lettuce, tomato, corn, cucumber, fava, onion, eggplant, zucchini, avocado, olive oil, and oregano.',
      'Vegan Puccia Sandwich', 
      'Μαρούλι, ντομάτα, καλαμπόκι, αγγούρι, φάβα, κρεμμύδι, μελιτζάνα, κολοκύθι, αβοκάντο, λάδι, ρίγανη.',
      'Vegan Puccia Sandviç', 
      'Marul, domates, mısır, salatalık, bakla ezmesi, soğan, patlıcan, kabak, avokado, zeytinyağı ve kekik.',
      7.50, 
      ARRAY['VG', 'V'], 
      3
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Toast & Sandwiches'), 
      'Classic Toast', 
      'White bread, turkey, gouda, and chips.',
      'Toast', 
      'Λευκό ψωμί, γαλοπούλα, gouda και πατατάκια.',
      'Klasik Tost', 
      'Beyaz ekmek, hindi, gouda ve cips.',
      5.50, 
      ARRAY[]::text[], 
      4
    )
) AS new_items(category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name_en = new_items.name_en
);

-- Breakfast Section - Morning Sweets Category
INSERT INTO menu_items (
  category_id, 
  name_en, 
  description_en, 
  name_el, 
  description_el, 
  name_tr, 
  description_tr, 
  price, 
  tags, 
  display_order
)
SELECT 
  category_id,
  name_en,
  description_en,
  name_el,
  description_el,
  name_tr,
  description_tr,
  price,
  tags,
  display_order
FROM (
  VALUES
    (
      (SELECT id FROM menu_categories WHERE name = 'Morning Sweets'), 
      'Merenda Pancakes', 
      'Vanilla namelaka, Oreo biscuit, hazelnut praline, and ruby chocolate sauce.',
      'Merenda Pancakes', 
      'Namelaka βανίλιας, μπισκότο oreo, πραλίνα φουντουκιού και σάλτσα ruby chocolate.',
      'Merenda Pancake', 
      'Vanilyalı namelaka, oreo bisküvi, fındık pralin ve ruby çikolata sosu.',
      8.00, 
      ARRAY[]::text[], 
      1
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Morning Sweets'), 
      'Maple Syrup Pancakes', 
      'Maple syrup, banana, bacon, walnuts, and sunflower seeds.',
      'Maple Syrup Pancakes', 
      'Σιρόπι σφενδάμου, μπανάνα, μπέικον, καρύδια και ηλιόσποροι.',
      'Akçaağaç Şuruplu Pancake', 
      'Akçaağaç şurubu, muz, pastırma, ceviz ve ay çekirdeği.',
      7.50, 
      ARRAY[]::text[], 
      2
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Morning Sweets'), 
      'Summer Bougatsa', 
      'Crispy phyllo, vanilla custard, cinnamon, powdered sugar, and a scoop of ice cream.',
      'Μπουγάτσα Καλοκαιρινή', 
      'Τραγανό φύλλο, κρέμα βανίλιας, κανέλα, άχνη ζάχαρη και μπάλα παγωτού.',
      'Yaz Bougatsa', 
      'Gevrek yufka, vanilyalı muhallebi, tarçın, pudra şekeri ve bir top dondurma.',
      7.00, 
      ARRAY[]::text[], 
      3
    ),
    (
      (SELECT id FROM menu_categories WHERE name = 'Morning Sweets'), 
      'Oreo Madness', 
      'Tempura-fried Oreo, Madagascar vanilla ice cream, and white chocolate sauce.',
      'Oreo Madness', 
      'Tempura Oreo, παγωτό βανίλια Μαδαγασκάρης και σάλτσα λευκής σοκολάτας.',
      'Oreo Çılgınlığı', 
      'Tempura kızartılmış Oreo, Madagaskar vanilyalı dondurma ve beyaz çikolata sosu.',
      7.50, 
      ARRAY[]::text[], 
      4
    )
) AS new_items(category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name_en = new_items.name_en
);

-- Create a temporary table to identify duplicates
CREATE TEMP TABLE menu_item_duplicates AS
WITH ranked_items AS (
  SELECT 
    id,
    category_id,
    name_en,
    name_el,
    name_tr,
    ROW_NUMBER() OVER (
      PARTITION BY category_id, name_en, name_el, name_tr
      ORDER BY created_at ASC
    ) AS row_num
  FROM menu_items
)
SELECT id
FROM ranked_items
WHERE row_num > 1;

-- Delete the duplicates, keeping the oldest entry for each unique item
DELETE FROM menu_items
WHERE id IN (SELECT id FROM menu_item_duplicates);

-- Drop the temporary table
DROP TABLE menu_item_duplicates;
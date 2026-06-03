/*
  # Add Menu Items Data

  1. Changes
    - Add menu items for all categories
    - Include translations in English, Greek, and Turkish
    - Set proper prices and tags
    - Maintain display order

  2. Security
    - Uses existing tables and policies
*/

-- Breakfast Section Items

-- Eggs Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Eggs'), 
'Avocado Peinirli', 
'Poached eggs, avocado cream, baby spinach, yogurt, fresh herbs, paprika oil, lemon, and Naxos graviera cheese sauce.',
'Πεϊνιρλί Αβοκάντο', 
'Αυγά ποσέ, κρέμα αβοκάντο, baby σπανάκι, γιαούρτι, φρέσκα βότανα, λάδι πάπρικα, λεμόνι και σάλτσα από γραβιέρα Νάξου',
'Avokado Peinirli', 
'Poşe yumurta, avokado kreması, bebek ıspanak, yoğurt, taze otlar, paprika yağı, limon ve Naxos graviera peyniri sosu',
8.50, 
ARRAY['V'], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Eggs'), 
'Kagianas', 
'Scrambled Chios eggs, fresh tomato sauce, peppers, basil, Chios goat cheese, and grilled focaccia.',
'Καγιανάς', 
'Χτυπημένα αυγά φρέσκα Χίου, φρέσκια σάλτσα ντομάτας, πιπεριές, βασιλικό, κατσικίσιο τυρί Χίου και ψητή focaccia',
'Kagianas', 
'Chios yumurtasıyla yapılmış çırpılmış yumurta, taze domates sosu, biber, fesleğen, Chios keçi peyniri ve ızgara focaccia',
7.50, 
ARRAY['V', 'GF'], 
2);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Eggs'), 
'Benedict', 
'Poached eggs, brioche bread, premium smoked turkey, bacon, Chios goat cheese, raw spinach, and hollandaise sauce.',
'Benedict', 
'Αυγά πόσε, ψωμί brioche, premium καπνιστή γαλοπούλα, μπέικον, κατσικίσιο τυρί Χίου, σπανάκι ωμό και sauce hollandaise',
'Benedict', 
'Poşe yumurta, brioche ekmeği, füme hindi, pastırma, Chios keçi peyniri, çiğ ıspanak ve hollandaise sosu',
9.50, 
ARRAY[]::text[], 
3);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Eggs'), 
'Sunny-Side Eggs with Sausage', 
'Crispy fried potatoes, sausages, feta cream (PDO), grilled tomato, and rustic bread with olive oil and oregano.',
'Αυγά ματιά με λουκάνικο', 
'Φρέσκες πατάτες τηγανιτές, λουκάνικα, κρέμα φέτας Π.Ο.Π, ψητή ντομάτα και χωριάτικο ψωμί με λαδορίγανη.',
'Sosisli Göz Yumurta', 
'Kızarmış patates, sosis, feta kreması (PDO), ızgara domates ve zeytinyağlı kekikli köy ekmeği.',
8.00, 
ARRAY[]::text[], 
4);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Eggs'), 
'Mushrooms Truffle', 
'Scrambled eggs, mushroom ragout, baby arugula, Greek prosciutto, parmesan, truffle mayo, and brioche bread.',
'Mushrooms Truffle', 
'Αυγά scrabble, μανιτάρια ραγού, baby ρόκα, ελληνικό προσούτο, παρμεζάνα, μαγιονέζα τρούφας και ψωμί brioche.',
'Mantarlı Trüf Yumurtası', 
'Çırpılmış yumurta, mantar ragù, roka, Yunan jambonu, parmesan, trüf mayonez ve briyoş ekmeği.',
10.50, 
ARRAY[]::text[], 
5);

-- Bowls Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Bowls'), 
'Greek Yogurt Bowl', 
'Greek yogurt, fresh fruits, granola, honey, and Chios sour cherry spoon sweet.',
'Μπολ με Ελληνικό Γιαούρτι', 
'Ελληνικό γιαούρτι, φρέσκα φρούτα, granola, μέλι και Χιώτικο γλυκό του κουταλιού κεράσι',
'Yunan Yoğurt Kasesi', 
'Yunan yoğurdu, taze meyveler, granola, bal ve Sakız Adası vişneli tatlısı',
6.50, 
ARRAY['V', 'GF'], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Bowls'), 
'Fruit Salad', 
'A fresh seasonal fruit selection.',
'Φρουτοσαλάτα', 
'Επιλογή από φρέσκα φρούτα εποχής',
'Meyve Salatası', 
'Mevsimlik taze meyve seçkisi',
5.50, 
ARRAY['V', 'VG', 'GF'], 
2);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Bowls'), 
'Açaí Chia Bowl', 
'Chia seeds, granola, banana, honey, and seasonal fresh fruit.',
'Açaí Chia Bowl', 
'Σπόροι chia, granola, μπανάνα, μέλι και φρέσκα φρούτα εποχής.',
'Açaí Chia Kasesi', 
'Chia tohumu, granola, muz, bal ve mevsim meyveleri.',
7.50, 
ARRAY['V'], 
3);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Bowls'), 
'Mango Bowl (Vegan)', 
'Mango, banana, fresh fruit, coconut flakes, and maple syrup.',
'Mango Bowl (Vegan)', 
'Μάνγκο, μπανάνα, φρέσκα φρούτα, φλέικς καρύδας και σιρόπι σφενδάμου.',
'Mango Kasesi (Vegan)', 
'Mango, muz, taze meyveler, hindistan cevizi rendesi ve akçaağaç şurubu.',
7.00, 
ARRAY['V', 'VG'], 
4);

-- Toast & Sandwiches Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Toast & Sandwiches'), 
'Grilled Cheese', 
'Rustic bread with butter, beef bacon, cheddar, emmental, la vache cheese, and cocktail sauce.',
'Grilled Cheese', 
'Χωριάτικο ψωμί με βούτυρο, μοσχαρίσιο μπέικον, cheddar, emmental, la vache και cocktail sauce.',
'Izgara Peynirli Tost', 
'Köy ekmeği, tereyağı, dana pastırma, cheddar, emmental, la vache peyniri ve kokteyl sos.',
7.00, 
ARRAY[]::text[], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Toast & Sandwiches'), 
'Sando Croque Madame', 
'Buttery eggs, brioche bread, caramelized bacon, red cabbage, emmental, béchamel, and cheddar sauce.',
'Sando Croque Madame', 
'Αυγά βουτυράτα, ψωμί brioche, καραμελωμένο μπέικον, κόκκινο λάχανο, emmental, μπεσαμέλ και sauce cheddar.',
'Sando Croque Madame', 
'Tereyağlı yumurta, briyoş ekmeği, karamelize pastırma, kırmızı lahana, emmental, beşamel ve cheddar sos.',
8.50, 
ARRAY[]::text[], 
2);

-- Morning Sweets Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Morning Sweets'), 
'Merenda Pancakes', 
'Vanilla namelaka, Oreo biscuit, hazelnut praline, and ruby chocolate sauce.',
'Merenda Pancakes', 
'Namelaka βανίλιας, μπισκότο oreo, πραλίνα φουντουκιού και σάλτσα ruby chocolate.',
'Merenda Pancake', 
'Vanilyalı namelaka, oreo bisküvi, fındık pralin ve ruby çikolata sosu.',
8.00, 
ARRAY[]::text[], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Morning Sweets'), 
'Maple Syrup Pancakes', 
'Maple syrup, banana, bacon, walnuts, and sunflower seeds.',
'Maple Syrup Pancakes', 
'Σιρόπι σφενδάμου, μπανάνα, μπέικον, καρύδια και ηλιόσποροι.',
'Akçaağaç Şuruplu Pancake', 
'Akçaağaç şurubu, muz, pastırma, ceviz ve ay çekirdeği.',
7.50, 
ARRAY[]::text[], 
2);

-- Beach & Snack Section Items

-- Salads Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Salads'), 
'Crispy Chicken Salad', 
'Chicken schnitzel, romaine lettuce, iceberg, Greek bacon, corn, croutons, and parmesan dressing.',
'Crispy Chicken Σαλάτα', 
'Σνίτσελ κοτόπουλο, γαλλικό μαρούλι, iceberg, ελληνικό μπέικον, καλαμπόκι, κρουτόν και dressing παρμεζάνας',
'Crispy Tavuk Salatası', 
'Tavuk şinitzel, kıvırcık marul, iceberg, Yunan pastırması, mısır, kruton ve parmesan sos',
9.50, 
ARRAY[]::text[], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Salads'), 
'Quinoa Salad', 
'Quinoa, bulgur, avocado, fresh vegetables, herbed cheese cream, and citrus vinaigrette.',
'Σαλάτα Κινόα', 
'Κινόα, πλιγούρι, αβοκάντο, φρέσκα λαχανικά, αρωματική κρέμα τυριού και ντρέσινγκ εσπεριδοειδών.',
'Kinoa Salatası', 
'Kinoa, bulgur, avokado, taze sebzeler, otlu peynir kreması ve narenciye sos.',
8.50, 
ARRAY['V'], 
2);

-- Burgers Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Burgers'), 
'Yiayia''s Burger', 
'Stuffed beef burger with cheese, bacon, fried egg, herbs, grilled tomato, lettuce, spicy cheese spread, Jorgito sauce, and French fries.',
'Cheese Explosion Burger', 
'Ελληνικό μπιφτέκι γεμιστό με τυρί, μπέικον, τηγανητό αυγό, βότανα, μαρούλι, ντομάτα ψητή, τυροκαφτερή, σάλτσα Jorgito και πατάτες τηγανιτές',
'Peynir Patlaması Burger', 
'Peynir dolgulu dana burger, pastırma, kızarmış yumurta, otlar, ızgara domates, marul, acılı peynir sosu, Jorgito sosu ve patates kızartması',
12.50, 
ARRAY[]::text[], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Burgers'), 
'Steakhouse Burger (180g)', 
'Black Angus beef patty, brioche bun, cheddar, lettuce, crispy bacon, tomato, pickles, onion, mayo, ketchup, and French fries.',
'Steakhouse Burger (180g)', 
'Μπιφτέκι από μοσχάρι Black Angus, ψωμάκι brioche, cheddar, μαρούλι, τραγανό μπέικον, ντομάτα, πίκλες, κρεμμύδι, μαγιονέζα, κέτσαπ και πατάτες τηγανιτές.',
'Steakhouse Burger (180g)', 
'Black Angus dana burger köftesi, briyoş ekmeği, cheddar, marul, çıtır pastırma, domates, turşu, soğan, mayonez, ketçap ve patates kızartması.',
11.00, 
ARRAY[]::text[], 
2);

-- Clubs Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Clubs'), 
'Tuna Club ''Alonissou''', 
'Alonissos tuna, whole grain bread, avocado, coleslaw, cucumber, boiled egg, and fresh green salad.',
'Tuna Club "Αλοννήσου"', 
'Τόνος Αλοννήσου, ψωμάκι ολικής, avocado, coleslaw, αγγουράκι, αυγό βραστό και δροσερή πράσινη σαλάτα',
'Ton Balıklı Kulüp Sandviç "Alonissou"', 
'Alonissos ton balığı, tam tahıllı ekmek, avokado, coleslaw, salatalık, haşlanmış yumurta ve yeşil salata',
10.50, 
ARRAY[]::text[], 
1);

-- Puccia Sandwiches Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Puccia Sandwiches'), 
'Shrimp Nuggets', 
'Tempura shrimp, avocado, cucumber, coleslaw, teriyaki sauce, and spicy mayo.',
'Shrimp Nuggets', 
'Γαρίδες tempura, αβοκάντο, αγγούρι, coleslaw, sauce teriyaki και spicy mayo.',
'Karides Nugget', 
'Tempura karides, avokado, salatalık, lahana salatası, teriyaki sos ve acılı mayonez.',
11.00, 
ARRAY[]::text[], 
1);

-- Restaurant Section Items

-- Raw Bar Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Raw Bar'), 
'Ceviche of the Day', 
'Fresh fish, lime, mango, chili, avocado, passion fruit, aromatic herbs & extra crispy phyllo.',
'Ceviche με Φρέσκο Ψάρι Ημέρας', 
'Λάιμ, μάνγκο, τσίλι, αβοκάντο, passion fruit, αρωματικά βότανα & extra τραγανό φύλλο.',
'Günün Ceviche''si', 
'Taze balık, lime, mango, chili, avokado, passion fruit, aromatik otlar ve çıtır yufka ile.',
16.00, 
ARRAY[]::text[], 
1);

-- Appetizers Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Appetizers'), 
'Potato Chips with Fried Eggs', 
'With light staka cream, paprika oil, and fresh coriander.',
'Πατάτες Τσιπς με Αυγά Μάτια', 
'Με ελαφριά κρέμα στάκας, λάδι πάπρικας και φρέσκο κόλιανδρο.',
'Yumurtalı Patates Cipsi', 
'Hafif staka kreması, paprika yağı ve taze kişniş ile.',
8.00, 
ARRAY[]::text[], 
1);

-- Pasta & Risotto Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Pasta & Risotto'), 
'Orzo with Shrimp & Octopus', 
'Thick orzo, saganaki-style tomato sauce, Chios souma, fresh herbs, and grated feta (PDO).',
'Κριθαρότο με Γαρίδες & Χταπόδι', 
'Κριθαράκι χονδρό, φρέσκια σάλτσα σαγανάκι, σούμα Χίου, φρέσκα βότανα και τριμμένη φέτα Π.Ο.Π.',
'Karides ve Ahtapotlu Arpa Şehriye', 
'Kalın arpa şehriye, saganaki domates sosu, Sakız souma, taze otlar ve rendelenmiş feta (PDO).',
18.00, 
ARRAY[]::text[], 
1);

-- Fish & Meat Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Fish & Meat'), 
'Fresh Fish of the Day (Fillet)', 
'Served with Milanese-style risotto, carrot textures, pine nuts, and lemon beurre blanc sauce.',
'Φιλέτο Φρέσκου Ψαριού Ημέρας', 
'Συνοδεύεται με ριζότο μιλανέζα, υφές καρότου, κουκουνάρι και σάλτσα beurre blanc με λεμόνι.',
'Günün Taze Balığı (Fileto)', 
'Milano usulü risotto, havuç dokuları, çam fıstığı ve limonlu beurre blanc sos ile servis edilir.',
24.00, 
ARRAY[]::text[], 
1);

-- Steaks Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Steaks'), 
'T-Bone Steak (USA Angus ~700g)', 
'Premium T-Bone cut from USA Angus beef. Served sliced with bone marrow butter, smoked salt, and cracked pepper.',
'Μπριζόλα T-Bone (USA Angus ~700γρ)', 
'Εκλεκτή κοπή T-Bone από USA Angus μοσχάρι. Σερβίρεται σε φέτες με βούτυρο μεδούλι, καπνιστό αλάτι και φρεσκοτριμμένο πιπέρι.',
'T-Bone Biftek (ABD Angus ~700g)', 
'ABD Angus dana etinden özel T-Bone kesimi. İlikli tereyağı, tütsülenmiş tuz ve taze çekilmiş karabiber ile servis edilir.',
65.00, 
ARRAY[]::text[], 
1);

-- Desserts Category
INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Desserts'), 
'Ekmek Kataifi', 
'Chios mastiha ice cream, patisserie cream, Aegina pistachios, and cinnamon.',
'Εκμέκ κανταΐφι', 
'Παγωτό μαστίχα Χίου, κρέμα patisserie, φιστίκι Αιγίνης και κανέλα.',
'Ekmek Kadayıfı', 
'Sakız dondurması, pastane kreması, Eginap fıstığı ve tarçın.',
8.00, 
ARRAY['V'], 
1);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Desserts'), 
'Chocolate Bomb', 
'Bitter chocolate, crunchy choco-wafer biscuit, hazelnuts, espresso cream, and blackberry textures.',
'Σοκολατίνα', 
'Σοκολάτα bitter, τραγανό μπισκότο σοκοφρέτας, φουντούκια, κρέμα espresso και υφές βατόμουρο.',
'Çikolata Bombası', 
'Bitter çikolata, çıtır çikolatalı gofret, fındık, espresso kreması ve böğürtlen dokuları.',
9.00, 
ARRAY[]::text[], 
2);

INSERT INTO menu_items (category_id, name_en, description_en, name_el, description_el, name_tr, description_tr, price, tags, display_order) VALUES
((SELECT id FROM menu_categories WHERE name = 'Desserts'), 
'Oreo Madness', 
'Tempura-fried Oreo with Madagascar vanilla ice cream and white chocolate sauce.',
'Oreo Madness', 
'Tempura oreo, παγωτό βανίλια Μαγαδασκάρης και sauce λευκής σοκολάτας.',
'Oreo Çılgınlığı', 
'Tempura kızartılmış oreo, Madagaskar vanilyalı dondurma ve beyaz çikolata sosu.',
7.50, 
ARRAY[]::text[], 
3);
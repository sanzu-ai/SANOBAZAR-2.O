import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const neTranslations = {
  'Free shipping over NPR 2,000': 'रु. २,००० भन्दा माथिको अर्डरमा निःशुल्क डेलिभरी',
  'Free Shipping on Orders Over NPR 2,000': 'रु. २,००० भन्दा माथिको अर्डरमा निःशुल्क डेलिभरी',
  'Track Order': 'अर्डर ट्र्याक गर्नुहोस्', Help: 'सहायता', English: 'अंग्रेजी', नेपाली: 'नेपाली',
  Home: 'गृहपृष्ठ', Shop: 'किनमेल', Categories: 'वर्गहरू', 'About Us': 'हाम्रोबारे', Contact: 'सम्पर्क', Blog: 'ब्लग',
  'Search products': 'उत्पादन खोज्नुहोस्', 'Search for products...': 'उत्पादन खोज्नुहोस्...', Search: 'खोज्नुहोस्',
  'Account menu': 'खाता मेनु', 'My dashboard / orders': 'मेरो खाता / अर्डरहरू', 'My wishlist': 'मेरो इच्छा सूची',
  Logout: 'लगआउट', Login: 'लगइन', Register: 'दर्ता गर्नुहोस्', 'Sign In': 'लगइन गर्नुहोस्', 'Sign out': 'लगआउट गर्नुहोस्',
  'Admin dashboard': 'प्रशासक ड्यासबोर्ड', 'Admin Dashboard': 'प्रशासक ड्यासबोर्ड', 'Close menu': 'मेनु बन्द गर्नुहोस्', 'Open menu': 'मेनु खोल्नुहोस्',
  'Shopping benefits': 'किनमेलका सुविधाहरू', 'Free Shipping': 'निःशुल्क डेलिभरी', 'On orders over NPR 2,000': 'रु. २,००० भन्दा माथिको अर्डरमा',
  'Secure Payments': 'सुरक्षित भुक्तानी', 'Safe checkout experience': 'सुरक्षित चेकआउट', 'Customer Support': 'ग्राहक सहायता', 'We are here to help': 'हामी सहयोगका लागि यहाँ छौँ',
  'Easy Returns': 'सजिलो फिर्ता', 'Hassle-free returns': 'झन्झटरहित फिर्ता', 'Find your next favorite': 'आफ्नो मनपर्ने सामान खोज्नुहोस्',
  'Shop by Category': 'वर्गअनुसार किनमेल गर्नुहोस्', 'View Products': 'उत्पादन हेर्नुहोस्', 'Shop Now': 'अहिले किनमेल गर्नुहोस्',
  'Categories will appear here when the catalog is available.': 'क्याटलग उपलब्ध भएपछि यहाँ वर्गहरू देखिनेछन्।',
  'From the live catalog': 'हालको क्याटलगबाट', 'Featured Products': 'छानिएका उत्पादनहरू', 'Best Sellers': 'धेरै बिक्री भएका', 'New Arrivals': 'नयाँ उत्पादनहरू', 'Product collections': 'उत्पादनका सूचीहरू',
  'Show Best Sellers': 'बेस्ट सेलर देखाउनुहोस्', 'Show fewer products': 'थोरै उत्पादन देखाउनुहोस्',
  'View All Products': 'सबै उत्पादन हेर्नुहोस्', 'Clear category filter': 'वर्ग फिल्टर हटाउनुहोस्', 'No products are available yet.': 'अहिलेसम्म कुनै उत्पादन उपलब्ध छैन।',
  'No reviews yet': 'अहिलेसम्म समीक्षा छैन', 'Add to Cart': 'कार्टमा राख्नुहोस्', 'Sold Out': 'स्टक सकियो', 'Only': 'मात्र', left: 'बाँकी',
  'Recently added to the catalog': 'क्याटलगमा हालै थपिएका', 'View all products →': 'सबै उत्पादन हेर्नुहोस् →',
  'Special offers': 'विशेष अफरहरू', 'Looking for a deal?': 'राम्रो अफर खोज्दै हुनुहुन्छ?',
  'Promotional prices will appear here when offers are configured. Browse the catalog for current prices and stock.': 'अफरहरू राखिएपछि छुटका मूल्य यहाँ देखिनेछन्। हालको मूल्य र स्टकका लागि क्याटलग हेर्नुहोस्।',
  'Explore products': 'उत्पादनहरू हेर्नुहोस्', 'Stay Updated with Sano Bazar': 'सानो बजारका नयाँ जानकारी पाउनुहोस्',
  'Get the latest offers and new arrivals in your inbox.': 'नयाँ अफर र उत्पादनको जानकारी इमेलमा पाउनुहोस्।',
  'Enter your email address': 'आफ्नो इमेल ठेगाना लेख्नुहोस्', Subscribe: 'सदस्यता लिनुहोस्',
  'YOUR ONE STOP ONLINE STORE': 'तपाईंको एकै ठाउँको अनलाइन बजार', 'Shop Smarter. Live Better.': 'बुद्धिमानी किनमेल, सहज जीवन।',
  'Discover quality products at great prices, all in one place.': 'गुणस्तरीय सामान उचित मूल्यमा, सबै एकै ठाउँमा।', 'Made for Nepal': 'नेपालका लागि',
  'Everyday essentials': 'दैनिक आवश्यक सामान', 'Discover useful finds for your home, work, and everyday life.': 'घर, काम र दैनिक जीवनका लागि उपयोगी सामान खोज्नुहोस्।',
  'TECH FOR EVERY DAY': 'हरेक दिनका लागि प्रविधि', 'Upgrade your routine.': 'आफ्नो दैनिकी अझ सहज बनाउनुहोस्।', 'Find your next gadget': 'आफ्नो अर्को ग्याजेट छान्नुहोस्',
  'Explore headphones, speakers, smart devices, and more from the live catalog.': 'हालको क्याटलगमा हेडफोन, स्पिकर, स्मार्ट डिभाइस र अन्य सामान हेर्नुहोस्।',
  'GOOD FINDS, ALL IN ONE PLACE': 'राम्रो सामान, एउटै ठाउँमा', 'Make home feel better.': 'घरलाई अझ राम्रो बनाउनुहोस्।', 'Shop home & living': 'घरायसी सामान हेर्नुहोस्',
  'Browse practical picks for your space, style, and daily needs.': 'घर, शैली र दैनिक आवश्यकताका लागि उपयोगी सामान हेर्नुहोस्।',
  'Featured home and lifestyle product': 'घर तथा जीवनशैलीका विशेष सामान', 'Show campaign': 'अभियान देखाउनुहोस्', 'Play campaigns': 'अभियान चलाउनुहोस्',
  'Pause campaigns': 'अभियान रोक्नुहोस्', 'Previous campaign': 'अघिल्लो अभियान', 'Next campaign': 'अर्को अभियान',
  'Your Cart': 'तपाईंको कार्ट', 'Your cart is empty.': 'तपाईंको कार्ट खाली छ।', 'Total Amount': 'कुल रकम',
  'Proceed to Checkout': 'चेकआउटमा जानुहोस्', 'Remove item': 'सामान हटाउनुहोस्', 'Please log in to complete your checkout.': 'चेकआउट पूरा गर्न कृपया लगइन गर्नुहोस्।',
  'Your account': 'तपाईंको खाता', 'Your orders': 'तपाईंका अर्डरहरू', 'Track your orders': 'आफ्ना अर्डर ट्र्याक गर्नुहोस्',
  'Order updates and delivery status for your recent purchases.': 'हालका खरिदको अर्डर र डेलिभरी स्थिति यहाँ हेर्नुहोस्।',
  Profile: 'प्रोफाइल', 'My orders': 'मेरा अर्डरहरू', Delivery: 'डेलिभरी', Payment: 'भुक्तानी',
  'Cash on delivery': 'सामान पाएपछि भुक्तानी', 'Simulated digital wallet': 'डिजिटल वालेट (डेमो)',
  'No orders yet.': 'अहिलेसम्म कुनै अर्डर छैन।', 'Browse the shop': 'पसल हेर्नुहोस्', 'Sign in to view your account': 'खाता हेर्न लगइन गर्नुहोस्',
  'Sign in': 'लगइन गर्नुहोस्', 'Loading your account…': 'खाता लोड हुँदैछ…', 'Member since': 'सदस्य भएको मिति',
  'Shop all products': 'सबै उत्पादन हेर्नुहोस्', 'Browse the live product catalog. Filter by category, price, and current stock.': 'हालको क्याटलग हेर्नुहोस्। वर्ग, मूल्य र स्टकअनुसार छान्नुहोस्।',
  Category: 'वर्ग', 'All categories': 'सबै वर्ग', 'Maximum price': 'अधिकतम मूल्य', 'In stock only': 'स्टक भएका मात्र', 'Sort by': 'क्रम मिलाउनुहोस्',
  Featured: 'विशेष', 'Price: low to high': 'मूल्य: कमदेखि बढी', 'Price: high to low': 'मूल्य: बढीदेखि कम', 'Newest added': 'नयाँ थपिएका',
  'products': 'उत्पादनहरू', 'Brand, ratings, and popularity filters are not available in the current product data.': 'हालको उत्पादन विवरणमा ब्रान्ड, रेटिङ र लोकप्रियता फिल्टर उपलब्ध छैनन्।',
  'You may also like': 'तपाईंलाई मन पर्न सक्छ', 'Back to shop': 'पसलमा फर्कनुहोस्',
  'YOUR SELECTION': 'तपाईंको छनोट', 'Shopping cart': 'किनमेल कार्ट', 'Continue shopping': 'किनमेल जारी राख्नुहोस्',
  'Your wishlist': 'तपाईंको इच्छा सूची', 'No saved products yet': 'अहिलेसम्म कुनै सामान सुरक्षित गरिएको छैन।',
  'Quick Links': 'छिटो लिङ्कहरू', 'Customer Service': 'ग्राहक सेवा', 'Shipping information': 'डेलिभरी जानकारी',
  'Returns and support': 'फिर्ता तथा सहायता', 'Help center': 'सहायता केन्द्र', 'Business contact details will appear here when configured.': 'व्यापारिक सम्पर्क विवरण थपेपछि यहाँ देखिनेछन्।',
  'Discover products for everyday life at Sano Bazar.': 'सानो बजारमा दैनिक जीवनका उपयोगी सामान खोज्नुहोस्।', 'Product availability is shown from the current catalog.': 'उत्पादनको उपलब्धता हालको क्याटलगअनुसार देखाइएको छ।',
  Electronics: 'इलेक्ट्रोनिक्स', Accessories: 'सामान', Wearables: 'लगाउन मिल्ने सामान', Groceries: 'किराना', 'Home & Living': 'घरायसी सामान', 'Books & Stationery': 'पुस्तक तथा स्टेशनरी', 'Beauty & Wellness': 'सौन्दर्य तथा स्वास्थ्य',
};

const extraTranslations = {
  'Utility navigation': 'उपयोगी लिङ्कहरू', 'Main navigation': 'मुख्य नेभिगेसन', 'Mobile navigation': 'मोबाइल नेभिगेसन', Language: 'भाषा',
  Cart: 'कार्ट', Wishlist: 'इच्छा सूची', 'All rights reserved.': 'सर्वाधिकार सुरक्षित।',
  'Order updates': 'अर्डर अपडेट', Welcome: 'स्वागत छ', 'Order updates and delivery status for your recent purchases.': 'हालका खरिदको अर्डर र डेलिभरी स्थिति यहाँ हेर्नुहोस्।',
  'Account details and order history from your signed-in Sano Bazar session.': 'तपाईंको सानो बजार खाताको विवरण र अर्डर इतिहास।',
  'Please log in to view your account.': 'खाता हेर्न कृपया लगइन गर्नुहोस्।', 'Please sign in to view your account.': 'अर्डर हेर्न कृपया लगइन गर्नुहोस्।', 'Sign in to track your orders': 'अर्डर ट्र्याक गर्न लगइन गर्नुहोस्',
  Order: 'अर्डर', 'item(s)': 'वटा सामान', 'date unavailable': 'मिति उपलब्ध छैन',
  View: 'हेर्नुहोस्', Remove: 'हटाउनुहोस्', Add: 'थप्नुहोस्', 'from wishlist': 'इच्छा सूचीबाट', 'to wishlist': 'इच्छा सूचीमा',
  'Out of Stock': 'स्टक सकियो', 'in stock': 'स्टकमा उपलब्ध', 'Out of stock': 'स्टक सकियो', 'Recommended for you': 'तपाईंका लागि सिफारिस',
  'Your one stop online store': 'तपाईंको एकै ठाउँको अनलाइन बजार', 'Shop local': 'स्थानीय बजार',
  'The Sano Bazar catalog': 'सानो बजार क्याटलग', 'Catalog is unavailable.': 'क्याटलग उपलब्ध छैन।', 'Loading products…': 'उत्पादन लोड हुँदैछ…',
  'Loading catalog': 'क्याटलग लोड हुँदैछ', 'Loading categories…': 'वर्गहरू लोड हुँदैछन्…', 'No matching products. Try clearing a filter.': 'मिल्दो उत्पादन भेटिएन। फिल्टर हटाएर प्रयास गर्नुहोस्।',
  'Clear category': 'वर्ग हटाउनुहोस्', 'Any price': 'कुनै पनि मूल्य', Department: 'विभाग', 'Browse our departments': 'हाम्रा विभाग हेर्नुहोस्',
  'Shop by category': 'वर्गअनुसार किनमेल', 'Choose a department to explore products in the live catalog.': 'क्याटलगका उत्पादन हेर्न विभाग छान्नुहोस्।',
  'Explore category →': 'वर्ग हेर्नुहोस् →', 'Popular searches in this department': 'यस विभागका लोकप्रिय खोजहरू',
  'Subcategories are not configured. Continue to see products filed under this department.': 'उपवर्ग सेट गरिएको छैन। यस विभागका उत्पादन हेर्न जारी राख्नुहोस्।',
  Close: 'बन्द गर्नुहोस्', 'Continue shopping': 'किनमेल जारी राख्नुहोस्', 'Back to shop': 'पसलमा फर्कनुहोस्',
  'Product not found': 'उत्पादन भेटिएन', 'Browse products': 'उत्पादन हेर्नुहोस्', 'Loading product…': 'उत्पादन लोड हुँदैछ…',
  'Detailed product description, specifications, discounts, and customer reviews have not been added to the catalog yet.': 'उत्पादनको विस्तृत विवरण, विशेषता, छुट र ग्राहक समीक्षा अझै क्याटलगमा थपिएको छैन।',
  'Reviews and specifications will show when product data is available.': 'उत्पादन विवरण उपलब्ध भएपछि समीक्षा र विशेषता देखिनेछन्।',
  'Add to cart': 'कार्टमा राख्नुहोस्', 'Buy now': 'अहिले नै किन्नुहोस्', 'Your cart is empty': 'तपाईंको कार्ट खाली छ',
  'Welcome Back': 'फेरि स्वागत छ', 'Sign in to manage your account and orders': 'आफ्नो खाता र अर्डर व्यवस्थापन गर्न लगइन गर्नुहोस्',
  'Email Address': 'इमेल ठेगाना', Password: 'पासवर्ड', 'Authenticating...': 'लगइन हुँदैछ...', 'Invalid email or password.': 'इमेल वा पासवर्ड गलत छ।',
  "Don't have an account?": 'खाता छैन?', 'Create an account': 'खाता खोल्नुहोस्', 'Unable to connect to the server. Please check XAMPP.': 'सर्भरमा जडान हुन सकेन। कृपया XAMPP जाँच्नुहोस्।',
  'Create Account': 'खाता खोल्नुहोस्', 'Join SANOBAZAR for a modern shopping experience': 'आधुनिक किनमेल अनुभवका लागि सानो बजारमा जोडिनुहोस्',
  'Full Name': 'पूरा नाम', 'Confirm Password': 'पासवर्ड पुष्टि गर्नुहोस्', 'Creating Account...': 'खाता बनाउँदैछ...',
  'Passwords do not match.': 'पासवर्ड मिलेन।', 'Password must be at least 6 characters long.': 'पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।',
  'Account created successfully! Redirecting to login...': 'खाता सफलतापूर्वक बन्यो! लगइनमा जाँदैछ...', 'Registration failed. Email may already exist.': 'दर्ता असफल भयो। यो इमेल पहिले नै प्रयोग भएको हुन सक्छ।',
  'Already have an account?': 'पहिले नै खाता छ?', 'All categories': 'सबै वर्ग', 'Maximum price': 'अधिकतम मूल्य', 'In stock only': 'स्टक भएका मात्र',
  'Sort by': 'क्रम मिलाउनुहोस्', Featured: 'विशेष', 'Price: low to high': 'मूल्य: कमदेखि बढी', 'Price: high to low': 'मूल्य: बढीदेखि कम', 'Newest added': 'नयाँ थपिएका',
  'Explore products': 'उत्पादनहरू हेर्नुहोस्', 'Email address': 'इमेल ठेगाना', 'Enter your email address': 'आफ्नो इमेल ठेगाना लेख्नुहोस्',
  'All': 'सबै', 'Order status': 'अर्डर स्थिति', pending: 'प्रक्रियामा', processing: 'तयारी हुँदैछ', completed: 'पूरा भयो', cancelled: 'रद्द भयो',
  simulated: 'डेमो भुक्तानी', 'Please log in to complete your checkout.': 'चेकआउट पूरा गर्न कृपया लगइन गर्नुहोस्.',
  'Browse the live product catalog. Filter by category, price, and current stock.': 'हालको क्याटलग हेर्नुहोस्। वर्ग, मूल्य र स्टकअनुसार छान्नुहोस्.',
  products: 'उत्पादनहरू',
  'Thanks for your interest. Newsletter sign-up is not connected yet.': 'रुचिका लागि धन्यवाद। न्यूजलेटर सदस्यता सुविधा अझै जडान गरिएको छैन।',
  Checkout: 'चेकआउट', 'Customer Name': 'ग्राहकको नाम', 'Phone Number': 'फोन नम्बर', 'Shipping Address': 'डेलिभरी ठेगाना',
  'Street address, City, Ward No. (e.g. New Baneshwor, Kathmandu)': 'ठेगाना, सहर, वडा नं. (जस्तै: नयाँ बानेश्वर, काठमाडौं)',
  'Cash on Delivery': 'सामान पाएपछि भुक्तानी', 'Pay when order arrives': 'अर्डर आइपुगेपछि भुक्तानी गर्नुहोस्', 'Digital Wallet': 'डिजिटल वालेट',
  'eSewa / Khalti Simulated': 'eSewa / Khalti (डेमो)', Qty: 'परिमाण', Subtotal: 'उप-जम्मा', 'Delivery Charge': 'डेलिभरी शुल्क', FREE: 'निःशुल्क', Total: 'जम्मा',
  'Order Placed Successfully!': 'अर्डर सफलतापूर्वक भयो!', 'Thank you for shopping with SANOBAZAR.': 'सानो बजारबाट किनमेल गर्नुभएकोमा धन्यवाद।',
  'Order ID': 'अर्डर नम्बर', 'Order Total': 'अर्डर जम्मा', 'Delivery Address': 'डेलिभरी ठेगाना', 'Payment Method': 'भुक्तानी विधि', 'Payment Status': 'भुक्तानी स्थिति',
  'Add products to your cart before proceeding to checkout.': 'चेकआउट अघि कार्टमा सामान थप्नुहोस्।', 'Failed to place order. Please try again.': 'अर्डर गर्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
  'Connection failed. Make sure XAMPP Apache and MySQL are running.': 'जडान असफल भयो। XAMPP Apache र MySQL चलिरहेको छ कि जाँच्नुहोस्।',
  'Continue Shopping': 'किनमेल जारी राख्नुहोस्', 'Back to Store': 'पसलमा फर्कनुहोस्', 'Processing Transaction...': 'कारोबार हुँदैछ...', 'Confirm Order': 'अर्डर पुष्टि गर्नुहोस्', 'Order Summary': 'अर्डर सारांश', items: 'वटा सामान',
  'Wireless Noise-Canceling Headphones': 'वायरलेस आवाज-रद्द गर्ने हेडफोन', 'Smart Fitness Watch Series 5': 'स्मार्ट फिटनेस घडी सिरिज ५',
  'Portable Bluetooth Speaker': 'पोर्टेबल ब्लुटुथ स्पिकर', 'Mechanical Gaming Keyboard': 'मेकानिकल गेमिङ किबोर्ड', 'Classic Denim Jacket': 'क्लासिक डेनिम ज्याकेट',
  'Minimalist Leather Sneakers': 'मिनिमलिस्ट छालाका जुत्ता', 'Cotton Casual Hoodie': 'कटन क्याजुअल हुडी', 'UV-Protected Sunglasses': 'यूभी सुरक्षित सनग्लास',
  'Organic Green Tea (200g)': 'अर्गानिक हरियो चिया (२०० ग्राम)', 'Extra Virgin Olive Oil (1L)': 'एक्स्ट्रा भर्जिन ओलिभ तेल (१ लिटर)',
  'Pure Himalayan Honey (500g)': 'शुद्ध हिमाली मह (५०० ग्राम)', 'Ergonomic Desk Chair': 'आरामदायी डेस्क कुर्सी', 'Modern Ceramic Table Lamp': 'आधुनिक सिरेमिक टेबल बत्ती',
  'Scented Soy Candle Set': 'सुगन्धित सोया मैनबत्ती सेट', 'Hardcover Hard-bound Journal': 'हार्डकभर जर्नल', 'Executive Fountain Pen': 'एक्जुकेटिभ फाउन्टेन पेन',
  'Hydrating Facial Moisturizer': 'अनुहारको मोइस्चराइजर', 'Natural Vitamin C Serum': 'प्राकृतिक भिटामिन सी सिरम', 'master bed': 'मास्टर बेड',
  'About Sano Bazar': 'सानो बजारबारे', 'A simpler way to shop in Nepal': 'नेपालमा किनमेल गर्ने सरल तरिका',
  'Sano Bazar is an online marketplace designed to make discovering everyday products straightforward.': 'सानो बजार दैनिक उपयोगका सामान सजिलै खोज्न बनाइएको अनलाइन बजार हो।',
  'Our story': 'हाम्रो कथा', 'Sano Bazar is being built as a convenient place to browse products and shop online. Add your company milestones here when they are ready to share.': 'सानो बजार उत्पादन हेर्न र अनलाइन किनमेल गर्न सजिलो ठाउँका रूपमा बनाइएको हो। कम्पनीका उपलब्धि तयार भएपछि यहाँ थप्नुहोस्।',
  'Our mission': 'हाम्रो लक्ष्य', 'Help customers discover useful products with clear pricing and a simple shopping experience.': 'स्पष्ट मूल्य र सरल किनमेल अनुभवसहित उपयोगी सामान खोज्न ग्राहकलाई सहयोग गर्नु।',
  'Our values': 'हाम्रा मूल्यहरू', 'Useful information, respectful customer service, and a focus on making the buying journey easier.': 'उपयोगी जानकारी, सम्मानजनक ग्राहक सेवा र किनमेललाई सहज बनाउने प्रतिबद्धता।',
  'Why shop with us?': 'हामीबाट किनमेल किन गर्ने?', 'Browse a changing catalog, check current stock, and place orders through the available checkout flow. Product-specific details are shown on each listing.': 'अद्यावधिक क्याटलग हेर्नुहोस्, उपलब्ध स्टक जाँच्नुहोस् र चेकआउटबाट अर्डर गर्नुहोस्। प्रत्येक उत्पादनका विवरण त्यसको पृष्ठमा छन्।',
  'Shop now': 'अहिले किनमेल गर्नुहोस्', 'We’re here to help': 'हामी सहयोगका लागि यहाँ छौँ', 'Contact Sano Bazar': 'सानो बजारमा सम्पर्क गर्नुहोस्',
  'Send a message here and our team will review it.': 'यहाँ सन्देश पठाउनुहोस्, हाम्रो टोलीले हेरेर जवाफ दिनेछ।',
  'Full name': 'पूरा नाम', 'Phone number (optional)': 'फोन नम्बर (ऐच्छिक)', Subject: 'विषय', Message: 'सन्देश', 'Send message': 'सन्देश पठाउनुहोस्', 'Sending…': 'पठाउँदैछ…', 'Message sent.': 'तपाईंको सन्देश सानो बजारमा पठाइयो।',
  'Check the contact form fields and try again.': 'सम्पर्क फारमका विवरण जाँचेर फेरि प्रयास गर्नुहोस्।',
  'Unable to send your message right now. Please contact us by phone or email.': 'अहिले सन्देश पठाउन सकिएन। कृपया फोन वा इमेलबाट सम्पर्क गर्नुहोस्।',
  'Unable to connect to the contact service. Please try again.': 'सम्पर्क सेवामा जोडिन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
  'Contact information': 'सम्पर्क जानकारी', 'Business hours': 'कार्यालय समय',
  '[Add your current support hours]': '[हालको सहायता समय थप्नुहोस्]', 'Social media': 'सामाजिक सञ्जाल', '[Add official social links]': '[आधिकारिक सामाजिक सञ्जाल लिङ्क थप्नुहोस्]',
  'Ideas and guides': 'विचार र मार्गदर्शन', 'Sano Bazar Journal': 'सानो बजार जर्नल', 'Helpful reads': 'उपयोगी लेखहरू', 'Read the blog': 'ब्लग पढ्नुहोस्',
  'Editorial content from Sano Bazar. Articles are starter content and can be replaced with your own.': 'सानो बजारका लेखहरू। यी प्रारम्भिक सामग्रीलाई आफ्नै लेखले बदल्न सक्नुहुन्छ।',
  'Search articles': 'लेख खोज्नुहोस्', 'No matching articles.': 'मिल्दो लेख भेटिएन।', 'Read article': 'लेख पढ्नुहोस्', 'Back to blog': 'ब्लगमा फर्कनुहोस्',
  'Article not found': 'लेख भेटिएन', 'Related posts': 'सम्बन्धित लेखहरू', 'By Sano Bazar Editorial': 'सानो बजार सम्पादकीय टोलीद्वारा',
  Newsletter: 'न्यूजलेटर', 'Article category': 'लेखको वर्ग', Email: 'इमेल', Phone: 'फोन', Address: 'ठेगाना',
  'Shopping tips': 'किनमेल सुझाव', Guides: 'मार्गदर्शन', Ideas: 'विचार',
  WhatsApp: 'व्हाट्सएप', 'Every day': 'हरेक दिन',
  'Contact us by phone, WhatsApp, email, or Facebook. Send a message here and our team will review it.': 'फोन, WhatsApp, इमेल वा Facebook बाट सम्पर्क गर्नुहोस्। यहाँ सन्देश पठाउनुहोस्, हाम्रो टोलीले हेरेर जवाफ दिनेछ।',
  'Order summary': 'अर्डर सारांश', 'Shipping estimate': 'डेलिभरी अनुमान', Free: 'निःशुल्क', 'Proceed to checkout': 'चेकआउटमा जानुहोस्',
  'Saved for later': 'पछि हेर्न सुरक्षित गरिएको', 'Explore the shop': 'पसल हेर्नुहोस्', 'Loading your saved products…': 'सुरक्षित गरिएका सामान लोड हुँदैछन्…', 'Move to cart': 'कार्टमा सार्नुहोस्',
  '[Business phone]': '[व्यापारिक फोन]', '[Business email]': '[व्यापारिक इमेल]', '[Business address]': '[व्यापारिक ठेगाना]', 'Contact page →': 'सम्पर्क पृष्ठ →',
  'A few simple ways to shop online with confidence': 'आत्मविश्वासका साथ अनलाइन किनमेल गर्ने केही सरल तरिका',
  'Practical checks to make before placing an online order.': 'अनलाइन अर्डर गर्नुअघि जाँच गर्नुपर्ने व्यावहारिक कुरा।',
  'Before ordering, review the product details, price, availability, and delivery information shown by the store. Use a unique password for your account and contact the seller through verified channels if you need clarification. Keep your order confirmation until delivery is complete.': 'अर्डर गर्नुअघि उत्पादन विवरण, मूल्य, उपलब्धता र डेलिभरी जानकारी जाँच्नुहोस्। खाताका लागि छुट्टै पासवर्ड प्रयोग गर्नुहोस् र थप जानकारीका लागि प्रमाणित माध्यमबाट विक्रेतालाई सम्पर्क गर्नुहोस्। सामान नआएसम्म अर्डर पुष्टि सुरक्षित राख्नुहोस्।',
  'How to compare everyday essentials': 'दैनिक उपयोगका सामान कसरी तुलना गर्ने', 'Compare the details that matter for your next purchase.': 'अर्को खरिदका लागि महत्त्वपूर्ण विवरण तुलना गर्नुहोस्।',
  'Start with the product’s intended use, compare the specifications provided, and check that the size or compatibility suits your needs. If important specifications are missing, ask the seller before purchasing.': 'उत्पादनको उपयोगबाट सुरु गर्नुहोस्, दिइएका विशेषता तुलना गर्नुहोस् र आकार वा मिल्दोपन आफ्नो आवश्यकताअनुसार छ कि जाँच्नुहोस्। आवश्यक विवरण नदिइएको भए खरिदअघि विक्रेतालाई सोध्नुहोस्।',
  'Planning a shopping budget that works for you': 'आफूलाई सुहाउँदो किनमेल बजेट बनाउनुहोस्', 'A straightforward approach to planning purchases.': 'खरिद योजना बनाउने सरल तरिका।',
  'List what you need first, set a comfortable spending limit, and compare the final order cost including delivery. A clear budget can help you prioritize products and avoid impulse purchases.': 'पहिले आवश्यक सामानको सूची बनाउनुहोस्, खर्चको सहज सीमा तय गर्नुहोस् र डेलिभरीसहितको कुल मूल्य तुलना गर्नुहोस्। स्पष्ट बजेटले प्राथमिकता तय गर्न र हतारमा खरिद गर्नबाट जोगाउँछ।',
};
const translations = { ...neTranslations, ...extraTranslations };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('sanobazar_language') === 'ne' ? 'ne' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback(nextLanguage => {
    setLanguageState(nextLanguage === 'ne' ? 'ne' : 'en');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sanobazar_language', language);
    } catch {
      // The selected language still applies for this session if storage is unavailable.
    }
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(text => language === 'ne' ? (translations[text] || text) : text, [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider.');
  return context;
}

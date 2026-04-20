export interface MultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

export const translations = {
  header: {
    welcome: {
      en: "Welcome to Agri-Eco — Fresh Organic Products",
      rw: "Ikaze muri Agri-Eco — Hano usanga ibyo kurya bitoshye kandi by'umwimerere",
      fr: "Bienvenue chez Agri-Eco — Produits biologiques frais",
      sw: "Karibu Agri-Eco — Bidhaa Mbichi za Organiki",
    },
    feedback: { en: "Feedback", rw: "Ibitekerezo", fr: "Commentaires", sw: "Maoni" },
    contact: { en: "Contact", rw: "Twandikire", fr: "Contact", sw: "Wasiliana" },
    allCategories: {
      en: "All Categories",
      rw: "Ibyiciro Byose",
      fr: "Toutes les Catégories",
      sw: "Jamii Zote",
    },
    searchPlaceholder: {
      products: {
        en: "Search for organic products...",
        rw: "Shakisha ibicuruzwa by'umwimerere...",
        fr: "Rechercher des produits bio...",
        sw: "Tafuta bidhaa za organiki...",
      },
      tours: {
        en: "Search for tours...",
        rw: "Shakisha ingendo z'ubukerarugendo...",
        fr: "Rechercher des visites...",
        sw: "Tafuta ziara...",
      },
      training: {
        en: "Search for training programs...",
        rw: "Shakisha amahugurwa...",
        fr: "Rechercher des formations...",
        sw: "Tafuta programu za mafunzo...",
      },
    },
    nav: {
      home: { en: "Home", rw: "Ahabanza", fr: "Accueil", sw: "Nyumbani" },
      shop: { en: "Shop", rw: "Iduka", fr: "Boutique", sw: "Duka" },
      tours: { en: "Tours", rw: "Ingendo", fr: "Visites", sw: "Ziara" },
      beekeeping: { en: "Beekeeping", rw: "Ubworozi bw'inzuki", fr: "Apiculture", sw: "Ufugaji wa Nyuki" },
      education: { en: "Education", rw: "Uburezi", fr: "Éducation", sw: "Elimu" },
      blog: { en: "Blog", rw: "Amakuru", fr: "Blog", sw: "Blogu" },
      community: { en: "Community", rw: "Umuryango", fr: "Communauté", sw: "Jamii" },
      about: { en: "About", rw: "Twebwe", fr: "À propos", sw: "Kuhusu" },
      deals: { en: "Hot Deals", rw: "Ofu Ridasanzwe", fr: "Offres Spéciales", sw: "Ofa Maalum" },
    },
    account: {
      myAccount: { en: "My Account", rw: "Konti Yanjye", fr: "Mon Compte", sw: "Akaunti Yangu" },
      logout: { en: "Log Out", rw: "Sohoka", fr: "Déconnexion", sw: "Ondoka" },
      dashboard: { en: "Go to Dashboard", rw: "Jya kuri Dashboard", fr: "Tableau de bord", sw: "Dashibodi" },
    },
  },
  hero: {
    organic: {
      title: {
        en: "Farm-Fresh Organic Produce",
        rw: "Ibiribwa Bitoshye by'Umwimerere",
        fr: "Produits Bio Frais de la Ferme",
        sw: "Mazao Mbichi ya Organiki",
      },
      desc: {
        en: "Shop certified organic fruits, vegetables, and natural honey directly from Rwanda's best farmers.",
        rw: "Gura imbuto, imboga n'ubuki by'umwimerere biturutse ku bahinzi b'indashyikirwa mu Rwanda.",
        fr: "Achetez des fruits, légumes et miel naturel certifiés bio directement auprès des meilleurs agriculteurs du Rwanda.",
        sw: "Nunua matunda, mboga, na asali ya asili iliyoidhinishwa moja kwa moja kutoka kwa wakulima bora wa Rwanda.",
      },
      cta: { en: "Shop Organic", rw: "Gura Iby'umwimerere", fr: "Acheter Bio", sw: "Nunua Bidhaa za Organiki" },
    },
    beekeeping: {
      title: {
        en: "The Magic of Rwandan Honey",
        rw: "Igitangaza cy'Ubuki bw'u Rwanda",
        fr: "La Magie du Miel Rwandais",
        sw: "Maajabu ya Asali ya Rwanda",
      },
      desc: {
        en: "Explore the art of apiculture, from traditional hives to modern sustainable beekeeping practices.",
        rw: "Sura ubworozi bw'inzuki, kuva ku mizinga gakondo kugeza ku buryo bugezweho burambye.",
        fr: "Explorez l'art de l'apiculture, des ruches traditionnelles aux pratiques apicoles durables modernes.",
        sw: "Gundua sanaa ya ufugaji wa nyuki, kutoka kwa mizinga ya kiasili hadi mbinu za kisasa za kudumu.",
      },
      cta: { en: "Explore Beekeeping", rw: "Sura Ubworozi bw'inzuki", fr: "Explorer l'Apiculture", sw: "Gundua Ufugaji wa Nyuki" },
    },
    training: {
      title: {
        en: "Sustainable Farming Education",
        rw: "Uburezi ku Buhinzi Burambye",
        fr: "Éducation à l'Agriculture Durable",
        sw: "Elimu ya Kilimo Endelevu",
      },
      desc: {
        en: "Join our training programs and school visits to learn the future of sustainable agriculture.",
        rw: "Fatanya natwe mu mahugurwa no gusura ibigo by'amashuri kugira ngo umenye ejo hazaza h'ubuhinzi.",
        fr: "Rejoignez nos programmes de formation et visites scolaires pour apprendre l'avenir de l'agriculture durable.",
        sw: "Jiunge na programu zetu za mafunzo na ziara za shule ili kujifunza mustakabali wa kilimo endelevu.",
      },
      cta: { en: "View Programs", rw: "Reba Porogaramu", fr: "Voir les Programmes", sw: "Tazama Programu" },
    },
    community: {
      title: {
        en: "Empowering Local Communities",
        rw: "Gushyigikira Abaturage",
        fr: "Autonomiser les Communautés Locales",
        sw: "Kuwezesha Jamii za Mitaa",
      },
      desc: {
        en: "Connecting local artisans and tourism partners to build a vibrant, sustainable ecosystem.",
        rw: "Guhuza abanyabugeni n'abafatanyabikorwa mu bukerarugendo kugira ngo twubake umuryango ukomeye.",
        fr: "Connecter les artisans locaux et les partenaires touristiques pour construire un écosystème dynamique et durable.",
        sw: "Kuunganisha mafundi wa ndani na washirika wa utalii ili kujenga mfumo wa kijamii wenye nguvu na endelevu.",
      },
      cta: { en: "Become a Partner", rw: "Ba Umufatanyabikorwa", fr: "Devenir Partenaire", sw: "Kuwa Mshirika" },
    },
    tours: {
      title: {
        en: "Immersive Agritourism Tours",
        rw: "Ingendo mu Buhinzi n'Ubukerarugendo",
        fr: "Tours d'Agrotourisme Immersifs",
        sw: "Ziara za Kilimo na Utalii",
      },
      desc: {
        en: "Experience the beauty of Rwanda's landscapes with guided tours through tea and coffee plantations.",
        rw: "Ihere ijisho ubwiza bw'u Rwanda unyuze mu mirima y'icyayi n'ikawa.",
        fr: "Découvrez la beauté des paysages du Rwanda avec des visites guidées à travers les plantations de thé et de café.",
        sw: "Jionee uzuri wa mandhari ya Rwanda kupitia ziara zinazoongozwa katika mashamba ya chai na kahawa.",
      },
      cta: { en: "Book a Tour", rw: "Vara Urugendo", fr: "Réserver une Visite", sw: "Weka Nafasi ya Ziara" },
    },
    common: {
      meetCommunity: { en: "Meet Our Community", rw: "Sura Umuryango Wacu", fr: "Rencontrez Notre Communauté", sw: "Kutana na Jamii Yetu" },
    }
  },
  sections: {
    popularExperiences: {
      title: { en: "Popular Experiences", rw: "Ingendo Zikunzwe", fr: "Expériences Populaires", sw: "Matukio Maarufu" },
      sub: { en: "Book immersive agritourism experiences on our organic farm", rw: "Vara ingendo z'ubukerarugendo bushingiye ku buhinzi bw'umwimerere", fr: "Réservez des expériences d'agrotourisme immersives dans notre ferme bio", sw: "Weka nafasi kwa ziara za kilimo-biashara katika shamba letu la organiki" },
      exploreMore: { en: "Explore More", rw: "Reba Ibindi", fr: "Explorer Plus", sw: "Gundua Zaidi" },
      limited: { en: "Limited Spots", rw: "Imyanya Ni Mike", fr: "Places Limitées", sw: "Nafasi Chache" },
      seasonal: { en: "Seasonal", rw: "Igihe kigeze", fr: "Saisonnier", sw: "Ya Msimu" },
      perPerson: { en: "per person", rw: "kuri buri muntu", fr: "par personne", sw: "kwa kila mtu" },
      spotsLeft: { en: "spots left", rw: "imyanya isigaye", fr: "places restantes", sw: "nafasi zilizobaki" },
      loadMore: { en: "Load More Experiences", rw: "Reba Ibindi Bikunzwe", fr: "Charger plus d'expériences", sw: "Pakia Matukio Zaidi" },
    },
    ourProducts: {
        title: { en: "Our Products", rw: "Ibicuruzwa Byacu", fr: "Nos Produits", sw: "Bidhaa Zetu" },
        sub: { en: "Handpicked organic products delivered fresh from local farms", rw: "Ibicuruzwa by'umwimerere byatoranyijwe neza bivuye ku bahinzi", fr: "Produits bio sélectionnés à la main, livrés frais des fermes locales", sw: "Bidhaa za organiki zilizochaguliwa kwa mikono zikiwa mbichi kutoka mashambani" },
        bestDeals: { en: "Best Deals", rw: "Ofu Nziza", fr: "Meilleures Offres", sw: "Ofa Bora" },
        allProducts: { en: "All Products", rw: "Ibicuruzwa Byose", fr: "Tous les Produits", sw: "Bidhaa Zote" },
        noneFound: { en: "No products found in this category.", rw: "Nta bicuruzwa byabonetse muri iki cyiciro.", fr: "Aucun produit trouvé dans cette catégorie.", sw: "Hakuna bidhaa zilizopatikana katika jamii hii." },
        exploreShop: { en: "Explore More Products", rw: "Sura Iduka Ryacu", fr: "Explorer plus de produits", sw: "Gundua Bidhaa Zaidi" },
    },
    beekeeping: {
        badge: { en: "Beekeeping", rw: "Ubworozi bw'inzuki", fr: "Apiculture", sw: "Ufugaji wa nyuki" },
        title: { en: "Discover the World of Honeybees", rw: "Menya Ubuzima bw'inzuki", fr: "Découvrez le monde des abeilles", sw: "Gundua Ulimwengu wa Nyuki" },
        desc: { en: "From live hive inspections to honey harvesting and beeswax workshops — experience the magic of apiculture at our farm apiary.", rw: "Kuva ku kugenzura imizinga kugeza ku gukamura ubuki - ihere ijisho ubworozi bw'inzuki.", fr: "De l'inspection des ruches à la récolte du miel et aux ateliers de cire d'abeille — découvrez la magie de l'apiculture.", sw: "Kutoka kwa ukaguzi wa mizinga hadi uvunaji wa asali na warsha za nta — jionee maajabu ya ufugaji nyuki." },
        honeyTasting: { title: { en: "Honey Tasting", rw: "Gusogongera Ubuki", fr: "Dégustation de Miel", sw: "Kuonja Asali" }, desc: { en: "Sample 5 seasonal honey varieties", rw: "Sogongera amoko 5 y'ubuki", fr: "Dégustez 5 variétés de miel", sw: "Onja aina 5 za asali ya msimu" } },
        hiveInspections: { title: { en: "Hive Inspections", rw: "Gusura Imizinga", fr: "Inspection des Ruches", sw: "Ukaguzi wa Mizinga" }, desc: { en: "Get suited up and open live hives", rw: "Kwambara imyenda no gusura imizinga", fr: "Équipez-vous et ouvrez des ruches", sw: "Vaa sare na ufungue mizinga ya nyuki" } },
        waxWorkshops: { title: { en: "Wax Workshops", rw: "Amahugurwa ku nzuki", fr: "Ateliers de Cire", sw: "Warsha za Nta" }, desc: { en: "Create candles, balms & soaps", rw: "Kora buji, amavuta n'isabune", fr: "Créeez des bougies, baumes et savons", sw: "Tengeneza mishumaa, mafuta na sabuni" } },
        shopHoney: { en: "Shop Honey Products", rw: "Gura Ubuki", fr: "Acheter des produits à base de miel", sw: "Nunua Bidhaa za Asali" },
    },
    education: {
      title: { en: "Organic Education Hub", rw: "Ihuriro ry'Uburezi ku Buhinzi bw'Umwimerere", fr: "Centre d'Éducation Bio", sw: "Kitovu cha Elimu ya Organiki" },
      sub: { en: "Empowering farmers and enthusiasts with practical organic knowledge", rw: "Gushyigikira abahinzi n'abafite amatsiko binyuze mu bumenyi bufatika", fr: "Autonomiser les agriculteurs et les passionnés avec des connaissances bio pratiques", sw: "Kuwezesha wakulima na wapenda maarifa ya kilimo cha organiki" },
      exploreAcademy: { en: "Explore Academy", rw: "Sura Ishuri Ryacu", fr: "Explorer l'Académie", sw: "Gundua Chuo" },
      weeks: { en: "Weeks", rw: "Ibyumweru", fr: "Semaines", sw: "Wiki" },
      selfPaced: { en: "Self-paced", rw: "Wiyigisha", fr: "À son rythme", sw: "Kujifunza kwa kasi yako" },
      tbd: { en: "TBD", rw: "Biracyategurwa", fr: "À déterminer", sw: "Itapangwa" },
      enrollment: { en: "Enrollment", rw: "Kwiyandikisha", fr: "Inscription", sw: "Usajili" },
      more: { en: "more", rw: "bindi", fr: "plus", sw: "zaidi" },
      cert: { en: "Certificate included", rw: "Harimo n'impamyabumenyi", fr: "Certificat inclus", sw: "Cheti kimejumuishwa" },
      viewDetails: { en: "View Details", rw: "Reba Amakuru Arambuye", fr: "Voir les Détails", sw: "Tazama Maelezo" },
      none: { en: "No training programs available at this time.", rw: "Nta mahugurwa aboneka muri iki gihe.", fr: "Aucun programme de formation disponible pour le moment.", sw: "Hakuna programu za mafunzo zinazopatikana kwa sasa." },
      loadMore: { en: "Load More Programs", rw: "Reba Ibindi", fr: "Charger plus de programmes", sw: "Pakia Programu Zaidi" },
    },
    artisans: {
      title: { en: "Local Artisans Showcase", rw: "Imurikagurisha ry'Abanyabugeni", fr: "Vitrine des Artisans Locaux", sw: "Onyesho la Mafundi wa Ndani" },
      sub: { en: "Discover unique handcrafted goods from Rwanda's finest artisans", rw: "Vumbura ibikoresho byakozwe n'intoki n'abanyabugeni bakomeye mu Rwanda", fr: "Découvrez des articles faits à la main uniques par les meilleurs artisans du Rwanda", sw: "Gundua bidhaa za kipekee zilizoundwa na mafundi bora wa Rwanda" },
      exploreArtisans: { en: "Meet the Artisans", rw: "Hura n'Abanyabugeni", fr: "Rencontrrez les Artisans", sw: "Kutana na Mafundi" },
    },
    testimonials: {
      title: { en: "Voices from the Farm", rw: "Ibyo Batuvugaho", fr: "Voix de la Ferme", sw: "Maoni ya Wadau" },
      sub: { en: "Hear from our happy customers and visitors about their experiences", rw: "Ega ibyo abakiriya bacu n'abasura umurima batuvugaho", fr: "Découvrez ce que nos clients et visiteurs satisfaits disent de leurs expériences", sw: "Sikia kutoka kwa wateja na wageni wetu kuhusu uzoefu wao" },
    },
    features: {
      freeShipping: { title: { en: "Free Shipping", rw: "Kuhagezwa ku buntu", fr: "Livraison Gratuite", sw: "Usafirishaji wa Bure" }, sub: { en: "For orders over", rw: "Kuri komande irenze", fr: "Pour les commandes de plus de", sw: "Kwa maagizo zaidi ya" } },
      organic: { title: { en: "100% Organic", rw: "100% Umwimerere", fr: "100% Bio", sw: "100% Organiki" }, sub: { en: "Certified organic products", rw: "Ibicuruzwa byemejwe ko ari umwimerere", fr: "Produits bio certifiés", sw: "Bidhaa zilizoidhinishwa" } },
      payments: { title: { en: "Secure Payments", rw: "Kwishura Kutajegajega", fr: "Paiements Sécurisés", sw: "Malipo Salama" }, sub: { en: "Safe & encrypted transactions", rw: "Kwishura mu mutekano", fr: "Transactions sûres et cryptées", sw: "Mihamala salama" } },
      support: { title: { en: "Local Support", rw: "Gushyigikira ab'iwacu", fr: "Support Local", sw: "Msaada wa Ndani" }, sub: { en: "Empowering Rwandan farmers", rw: "Gushyigikira abahinzi b'Abanyarwanda", fr: "Soutenir les agriculteurs rwandais", sw: "Kuwezesha wakulima wa Rwanda" } },
    },
    promo: {
      special: { en: "Special Offer", rw: "Ofu Ridasanzwe", fr: "Offre Spéciale", sw: "Ofa Maalum" },
      discount: { en: "Get 15% Discount", rw: "Habwa igabanuka rya 15%", fr: "Obtenez 15% de Réduction", sw: "Pata Punguzo la 15%" },
      firstPurchase: { en: "on Your First Purchase", rw: "kuri komande yawe ya mbere", fr: "sur votre premier achat", sw: "kwa agizo lako la kwanza" },
      useCode: { en: "Use code", rw: "Koresha kodi", fr: "Utilisez le code", sw: "Tumia msimbo" },
      validFor: { en: "at checkout. Valid for new customers on orders above", rw: "at checkout. Bikora ku bakiriya bashya kuri komande hejuru ya", fr: "lors du paiement. Valable pour les nouveaux clients sur les commandes supérieures à", sw: "wakati wa kulipa. Inafanya kazi kwa wateja wapya kwenye maagizo zaidi ya" },
      shopNow: { en: "Shop Now", rw: "Gura Ubu", fr: "Achetez Maintenant", sw: "Nunua Sasa" },
    },
    feedback: {
      none: { en: "Hear from our community soon!", rw: "Ibyo batuvugaho biri vuba!", fr: "Découvrez bientôt l'avis de notre communauté !", sw: "Sikia kutoka kwa jamii yetu hivi karibuni!" },
      loadMore: { en: "Load More Feedbacks", rw: "Reba Ibindibe", fr: "Charger plus d'avis", sw: "Pakia Maoni Zaidi" },
    }
  },
  footer: {
    subscribeTitle: { en: "Subscribe to Our Newsletter", rw: "Iyandikishe mu kinyamakuru cyacu", fr: "Abonnez-vous à notre newsletter", sw: "Jiandikishe kwa Jarida Letu" },
    subscribeDesc: { en: "Get the latest deals and organic recipes in your inbox", rw: "Habwa amakuru n'ama-ofu mashya kuri emeyiri yawe", fr: "Recevez les dernières offres et recettes bio dans votre boîte de réception", sw: "Pata ofa za hivi punde na maelekezo ya organiki kwenye kikasha chako" },
    emailPlaceholder: { en: "Your email address", rw: "Emeyiri yawe", fr: "Votre adresse e-mail", sw: "Barua pepe yako" },
    subscribeBtn: { en: "Subscribe", rw: "Iyandikishe", fr: "S'abonner", sw: "Jiandikishe" },
    aboutDesc: { en: "Your trusted source for 100% organic, farm-fresh agricultural products. We deliver health and sustainability to your doorstep.", rw: "Isoko yizerwa y'ibiribwa 100% by'umwimerere biturutse ku bahinzi. Tukugezaho ubuzima bwiza n'uburambe.", fr: "Votre source de confiance pour des produits agricoles 100% bio et frais de la ferme. Nous livrons santé et durabilité à votre porte.", sw: "Chanzo chako kinachoaminika cha bidhaa za kilimo za organiki 100%. Tunaleta afya na uendelevu mlangoni pako." },
    quickLinks: { en: "Quick Links", rw: "Ihuza Rikoreshwa Cyane", fr: "Liens Rapides", sw: "Viungo vya Haraka" },
    customerService: { en: "Customer Service", rw: "Serivisi ku Bakiriya", fr: "Service Client", sw: "Huduma kwa Wateja" },
    copyright: { en: "© 2026 Agri-Eco. All rights reserved.", rw: "© 2026 Agri-Eco. Uburenganzira bwose ni ubwacu.", fr: "© 2026 Agri-Eco. Tous droits réservés.", sw: "© 2026 Agri-Eco. Haki zote zimehifadhiwa." },
    tagline: { en: "Organic • Natural • Sustainable", rw: "Umwimerere • Asili • Burambye", fr: "Bio • Naturel • Durable", sw: "Organiki • Asili • Endelevu" },
  }
};

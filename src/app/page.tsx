"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Car, 
  Bike, 
  Truck, 
  Zap, 
  DollarSign, 
  Clock, 
  Truck as TruckDelivery, 
  Star, 
  MapPin, 
  Phone, 
  MessageCircle,
  Send,
  CheckCircle,
  Calculator,
  Upload,
  X,
  Image as ImageIcon,
  Brain,
  Camera,
  AlertTriangle,
  Wrench
} from "lucide-react";

// Car brands and models database
const carBrandsAndModels: Record<string, string[]> = {
  "Acura": ["MDX", "RDX", "TLX", "ILX", "RLX", "NSX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale", "4C", "8C"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron", "TT", "R8"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "i3", "i4", "iX", "Z4"],
  "Buick": ["Enclave", "Encore", "Envision", "LaCrosse", "Regal", "Verano"],
  "Cadillac": ["ATS", "CT4", "CT5", "CTS", "Escalade", "SRX", "XT4", "XT5", "XT6"],
  "Chery": ["Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 5", "Tiggo 7", "Tiggo 8", "Exeed VX"],
  "Chevrolet": ["Avalanche", "Camaro", "Captiva", "Colorado", "Cruze", "Equinox", "Impala", "Malibu", "Silverado", "Spark", "Suburban", "Tahoe", "TrailBlazer", "Traverse", "Trax"],
  "Chrysler": ["200", "300", "Pacifica", "Pacifica Hybrid", "Town & Country", "Voyager"],
  "Citroen": ["C1", "C3", "C3 Aircross", "C4", "C4 Cactus", "C5 Aircross", "DS4", "DS7", "Berlingo", "Jumper"],
  "Daewoo": ["Gentra", "Lanos", "Leganza", "Matiz", "Nexia", "Nubira", "Tico"],
  "Datsun": ["mi-DO", "on-DO", "redi-GO"],
  "Dodge": ["Challenger", "Charger", "Durango", "Journey", "Ram 1500", "Ram 2500", "Ram 3500"],
  "FAW": ["Bestune B50", "Bestune B70", "Bestune T77", "Bestune T99", "Oley", "V80"],
  "Fiat": ["500", "500L", "500X", "Doblo", "Freemont", "Panda", "Punto", "Tipo"],
  "Ford": ["Bronco", "Bronco Sport", "C-Max", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Mustang", "Puma", "Ranger", "S-Max", "Taurus", "Tourneo Connect", "Transit"],
  "Geely": ["Atlas", "Atlas Pro", "Coolray", "Emgrand EC7", "Emgrand EV", "FYI", "Monjaro", "Okavango", "Tugella"],
  "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  "GMC": ["Acadia", "Canyon", "Sierra", "Terrain", "Yukon", "Yukon XL"],
  "Great Wall": ["Coolbear", "Deer", "Florid", "Hover", "M4", "Peri", "Poer", "Safe", "Wingle"],
  "Haval": ["Dargo", "F7", "F7x", "H3", "H5", "H6", "H6 Coupe", "H7", "H8", "H9", "Jolion", "M6", "Monster", "P500"],
  "Honda": ["Accord", "Civic", "Clarity", "CR-V", "CR-Z", "Element", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  "Hyundai": ["Accent", "Creta", "Elantra", "Genesis", "Getz", "Grand Santa Fe", "Grand Starex", "H-1", "Ioniq", "Ioniq 5", "Kona", "Palisade", "Santa Fe", "Sonata", "Starex", "Strix", "Tucson", "Veloster", "Venue", "Veracruz"],
  "Infiniti": ["EX35", "EX37", "FX35", "FX37", "FX50", "G25", "G35", "G37", "JX35", "M25", "M35", "M37", "Q30", "Q40", "Q50", "Q60", "Q70", "QX30", "QX50", "QX55", "QX60", "QX70", "QX80"],
  "Jaguar": ["E-PACE", "F-PACE", "F-TYPE", "I-PACE", "XE", "XF", "XJ"],
  "Jeep": ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Grand Cherokee L", "Renegade", "Wrangler"],
  "Kia": ["Borrego", "Carnival", "Ceed", "Cerato", "K3", "K5", "K7", "K8", "K9", "Mohave", "Niro", "Optima", "Picanto", "Rio", "Seltos", "Sonet", "Sorento", "Soul", "Sportage", "Stinger", "XCeed"],
  "Lada (ВАЗ)": ["Granta", "Kalina", "Largus", "Niva Legend", "Niva Travel", "Priora", "Vesta", "XRAY"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  "Lexus": ["CT", "ES", "GS", "IS", "LC", "LS", "LX", "NX", "RX", "RZ", "UX"],
  "Lifan": ["Breez", "Cebrium", "Solano", "X50", "X60", "X70", "X80"],
  "Lincoln": ["Aviator", "Continental", "Corsair", "MKC", "MKS", "MKT", "MKX", "MKZ", "Nautilus", "Navigator"],
  "Maserati": ["Ghibli", "GranTurismo", "Levante", "MC20", "Quattroporte"],
  "Mazda": ["2", "3", "3 Hatchback", "3 Sedan", "6", "CX-3", "CX-30", "CX-4", "CX-5", "CX-50", "CX-60", "CX-7", "CX-8", "CX-9", "MX-5", "MX-30"],
  "Mercedes": ["A-Class", "B-Class", "C-Class", "CL-Class", "CLA", "CLK", "CLS", "E-Class", "EQC", "EQE", "EQS", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "S-Class", "SL-Class", "SLC", "V-Class", "X-Class"],
  "Mini": ["Clubman", "Convertible", "Countryman", "Hardtop 2 Door", "Hardtop 4 Door", "John Cooper Works"],
  "Mitsubishi": ["ASX", "Eclipse Cross", "Galant", "L200", "Lancer", "Mirage", "Montero", "Outlander", "Pajero", "Pajero Sport", "Space Star"],
  "Nissan": ["Almera", "Altima", "Armada", "Frontier", "Juke", "Kicks", "Leaf", "Maxima", "Micra", "Murano", "Navara", "Note", "Pathfinder", "Patrol", "Qashqai", "Rogue", "Sentra", "Silvia", "Skyline", "Terrano", "Tiida", "Titan", "X-Trail", "Z"],
  "Opel": ["Adam", "Astra", "Combo", "Corsa", "Crossland X", "Grandland X", "Insignia", "Karl", "Mokka", "Mokka X", "Movano", "Vivaro", "Zafira", "Zafira Life"],
  "Peugeot": ["108", "2008", "207", "208", "3008", "301", "308", "4008", "5008", "508", "Boxer", "Expert", "Partner", "Rifter", "Traveller"],
  "Porsche": ["911", "Boxster", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"],
  "Ram": ["1500", "1500 Classic", "2500", "3500", "ProMaster"],
  "Renault": ["Arkana", "Austral", "Captur", "Clio", "Dokker", "Duster", "Espace", "Fluence", "Kadjar", "Kangoo", "Kiger", "Koleos", "Laguna", "Logan", "Master", "Megane", "Modus", "Sandero", "Symbol", "Talisman", "Trafic", "Triber", "Twingo", "Wind"],
  "Saab": ["9-2X", "9-3", "9-4X", "9-5", "9-7X"],
  "Seat": ["Alhambra", "Altea", "Arona", "Ateca", "Ibiza", "Leon", "Tarraco", "Toledo"],
  "Skoda": ["Citigo", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Roomster", "Superb", "Yeti"],
  "Smart": ["EQ ForFour", "EQ ForTwo", "Fortwo"],
  "SsangYong": ["Actyon", "Actyon Sports", "Chairman", "Korando", "Kyron", "Musso", "Rexton", "Rexton Sports", "Rodius", "Tivoli", "XLV"],
  "Subaru": ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Levorg", "Outback", "Solterra", "Tribeca", "WRX", "XV"],
  "Suzuki": ["Baleno", "Ciaz", "Ertiga", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "Liana", "S-Cross", "Swift", "SX4", "Vitara", "XL7"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["4Runner", "Alphard", "Auris", "Avalon", "bZ4X", "Camry", "C-HR", "Corolla", "Corolla Cross", "Crown", "FJCruiser", "Fortuner", "GR86", "Highlander", "Hilux", "Innova", "iQ", "Land Cruiser", "Land Cruiser Prado", "Mirai", "Prius", "Prius C", "Prius V", "RAV4", "Sequoia", "Sienna", "Supra", "Tacoma", "Tundra", "Urban Cruiser", "Veloz", "Venza", "Yaris", "Yaris Cross"],
  "Volkswagen": ["Amarok", "Arteon", "Atlas", "Beetle", "Bora", "Caddy", "Caravelle", "Crafter", "Golf", "Golf GTI", "Golf R", "ID.3", "ID.4", "ID.5", "ID.6", "Jetta", "Multivan", "Passat", "Passat CC", "Polo", "Scirocco", "Sharan", "T-Cross", "T-Roc", "Taos", "Tiguan", "Touareg", "Touran", "Transporter", "Up!"],
  "Volvo": ["C30", "C40", "S40", "S60", "S60 Cross Country", "S80", "S90", "V40", "V50", "V60", "V60 Cross Country", "V70", "V90", "V90 Cross Country", "XC40", "XC60", "XC70", "XC90"],
  "ГАЗ": ["Волга", "Газель", "Соболь", "Баргузин"],
  "УАЗ": ["Hunter", "Patriot", "Pickup", "Profi", "Буханка"],
  "ЗАЗ": ["Chance", "Forza", "Lanos", "Sens", "Slavuta", "Tavria"],
  "Другая": []
};

// All brands list for dropdown
const allBrands = Object.keys(carBrandsAndModels);

// Review data
const reviews = [
  {
    name: "Алексей Петров",
    city: "Калуга",
    text: "Продал свой Ford Focus за 45 минут! Оценщик приехал прямо на работу, всё осмотрел и рассчитался на месте. Отличный сервис!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Михаил Иванов",
    city: "Тула",
    text: "Взяли мою старую Toyota Camry даже с неисправным двигателем. Цена устроила, вывезли на эвакуаторе бесплатно. Рекомендую!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Сергей Николаев",
    city: "Обнинск",
    text: "Продал мотоцикл Honda CBR. Всё чётко, без лишних вопросов. Деньги получил в день обращения. Молодцы!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    name: "Дмитрий Смирнов",
    city: "Калуга",
    text: "Продавал экскаватор-погрузчик. Компания оценила технику справедливо, помогли с оформлением документов. Очень доволен!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face"
  }
];

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "auto",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculator state
  const [calcData, setCalcData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    engineType: "petrol",
    condition: "good",
    hasDocuments: "yes",
    hasAccidents: "no"
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // AI Damage Assessment state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [damageZones, setDamageZones] = useState<Array<{
    id: number;
    zone: string;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
    repairCost: number;
  }>>([]);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedDamages, setSelectedDamages] = useState<string[]>([]);

  // Model autocomplete state
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelInputRef, setModelInputRef] = useState<HTMLInputElement | null>(null);

  // Filter models based on input
  const filterModels = (input: string) => {
    if (!calcData.brand || calcData.brand === "Другая") {
      return [];
    }
    const models = carBrandsAndModels[calcData.brand] || [];
    if (!input) return models.slice(0, 10);
    const filtered = models.filter(model => 
      model.toLowerCase().includes(input.toLowerCase())
    );
    return filtered.slice(0, 10);
  };

  const handleModelChange = (value: string) => {
    setCalcData({ ...calcData, model: value });
    setModelSuggestions(filterModels(value));
    setShowModelDropdown(true);
  };

  const handleModelSelect = (model: string) => {
    setCalcData({ ...calcData, model: model });
    setShowModelDropdown(false);
    setModelSuggestions([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos].slice(0, 5));
      setPhotoPreviews([...photoPreviews, ...newPreviews].slice(0, 5));
      // Reset damage analysis when new photos are uploaded
      setDamageZones([]);
      setEstimatedPrice(null);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    setDamageZones([]);
    setEstimatedPrice(null);
  };

  // Estimated repair cost database based on typical Russian market prices (2024)
  // Brand multipliers for repair costs - parts for premium cars cost more
  const brandRepairMultiplier: Record<string, number> = {
    // Budget brands - cheaper repairs
    'Lada (ВАЗ)': 0.7,
    'ГАЗ': 0.7,
    'УАЗ': 0.75,
    'Daewoo': 0.75,
    'Datsun': 0.75,
    'Chery': 0.8,
    'Geely': 0.8,
    'JAC': 0.8,
    // Mid-range brands - standard repairs
    'Kia': 1.0,
    'Hyundai': 1.0,
    'Volkswagen': 1.0,
    'Skoda': 1.0,
    'Ford': 1.0,
    'Toyota': 1.1,
    'Honda': 1.1,
    'Nissan': 1.1,
    'Mazda': 1.1,
    'Mitsubishi': 1.1,
    'Subaru': 1.1,
    'Suzuki': 1.0,
    'Peugeot': 1.0,
    'Citroen': 1.0,
    'Renault': 0.9,
    'SsangYong': 0.9,
    'Opel': 1.0,
    'Chevrolet': 0.95,
    'Fiat': 0.9,
    'Seat': 1.0,
    'Daihatsu': 0.85,
    'Chrysler': 1.1,
    'Dodge': 1.15,
    'Jeep': 1.15,
    'Mini': 1.2,
    'Smart': 1.3,
    'Saab': 1.1,
    // Premium brands - more expensive repairs
    'Audi': 1.5,
    'BMW': 1.6,
    'Mercedes-Benz': 1.7,
    'Lexus': 1.8,
    'Porsche': 2.2,
    'Land Rover': 1.7,
    'Jaguar': 1.6,
    'Volvo': 1.4,
    'Infiniti': 1.6,
    'Acura': 1.6,
    'Cadillac': 1.6,
    'Lincoln': 1.5,
    'Buick': 1.4,
    'Alfa Romeo': 1.4,
    'Maserati': 2.0,
    'Ferrari': 2.5,
    'Lamborghini': 2.5,
    'Aston Martin': 2.3,
    'Bentley': 2.4,
    'Rolls-Royce': 2.5,
    'Genesis': 1.3,
    // Default for unknown brands
    'Другая': 1.0,
  };

  // These are approximate values for demonstration purposes - actual prices vary by service, region, and parts quality
  const repairCostDatabase = {
    // Body parts - average repair costs in Rubles
    bodyParts: {
      'Передний бампер': { minor: 8000, moderate: 18000, severe: 35000 },
      'Задний бампер': { minor: 8000, moderate: 16000, severe: 30000 },
      'Капот': { minor: 12000, moderate: 25000, severe: 45000 },
      'Крышка багажника': { minor: 10000, moderate: 20000, severe: 38000 },
      'Крыша': { minor: 15000, moderate: 30000, severe: 55000 },
      'Левое крыло': { minor: 10000, moderate: 20000, severe: 38000 },
      'Правое крыло': { minor: 10000, moderate: 20000, severe: 38000 },
      'Дверь водителя': { minor: 8000, moderate: 18000, severe: 32000 },
      'Дверь пассажира': { minor: 8000, moderate: 18000, severe: 32000 },
      'Задняя дверь': { minor: 8000, moderate: 18000, severe: 32000 },
      'Порог левый': { minor: 12000, moderate: 22000, severe: 40000 },
      'Порог правый': { minor: 12000, moderate: 22000, severe: 40000 },
      'Лонжерон передний': { minor: 25000, moderate: 45000, severe: 80000 },
      'Лонжерон задний': { minor: 20000, moderate: 40000, severe: 70000 },
    },
    // Glass parts
    glass: {
      'Лобовое стекло': { minor: 15000, moderate: 22000, severe: 35000 },
      'Заднее стекло': { minor: 10000, moderate: 15000, severe: 25000 },
      'Боковое стекло': { minor: 6000, moderate: 10000, severe: 18000 },
    },
    // Lighting
    lighting: {
      'Фара передняя': { minor: 12000, moderate: 25000, severe: 45000 },
      'Фара задняя': { minor: 8000, moderate: 15000, severe: 28000 },
      'Противотуманная фара': { minor: 5000, moderate: 10000, severe: 18000 },
      'Поворотник': { minor: 3000, moderate: 6000, severe: 12000 },
    },
    // Mirrors
    mirrors: {
      'Зеркало левое': { minor: 6000, moderate: 12000, severe: 22000 },
      'Зеркало правое': { minor: 6000, moderate: 12000, severe: 22000 },
      'Зеркало заднего вида': { minor: 4000, moderate: 8000, severe: 15000 },
    },
    // Wheels/suspension
    wheels: {
      'Диск колесный': { minor: 8000, moderate: 15000, severe: 28000 },
      'Подвеска передняя': { minor: 15000, moderate: 35000, severe: 65000 },
      'Подвеска задняя': { minor: 12000, moderate: 28000, severe: 50000 },
      'Рулевая рейка': { minor: 20000, moderate: 40000, severe: 70000 },
    },
    // Engine/transmission
    engine: {
      'Двигатель': { minor: 30000, moderate: 80000, severe: 150000 },
      'Коробка передач': { minor: 25000, moderate: 60000, severe: 120000 },
      'ГБЦ': { minor: 20000, moderate: 45000, severe: 85000 },
    },
    // Interior
    interior: {
      'Салон': { minor: 8000, moderate: 20000, severe: 40000 },
      'Панель приборов': { minor: 10000, moderate: 25000, severe: 45000 },
      'Сиденье': { minor: 5000, moderate: 15000, severe: 30000 },
    },
  };

  // All possible damage zones with categories
  const allDamageZones = [
    { category: 'bodyParts', key: 'Передний бампер', defaultSeverity: 'moderate', probability: 0.4 },
    { category: 'bodyParts', key: 'Задний бампер', defaultSeverity: 'moderate', probability: 0.35 },
    { category: 'bodyParts', key: 'Капот', defaultSeverity: 'moderate', probability: 0.3 },
    { category: 'bodyParts', key: 'Крышка багажника', defaultSeverity: 'minor', probability: 0.25 },
    { category: 'bodyParts', key: 'Крыша', defaultSeverity: 'minor', probability: 0.15 },
    { category: 'bodyParts', key: 'Левое крыло', defaultSeverity: 'minor', probability: 0.3 },
    { category: 'bodyParts', key: 'Правое крыло', defaultSeverity: 'minor', probability: 0.3 },
    { category: 'bodyParts', key: 'Дверь водителя', defaultSeverity: 'minor', probability: 0.25 },
    { category: 'bodyParts', key: 'Дверь пассажира', defaultSeverity: 'minor', probability: 0.2 },
    { category: 'bodyParts', key: 'Задняя дверь', defaultSeverity: 'minor', probability: 0.2 },
    { category: 'glass', key: 'Лобовое стекло', defaultSeverity: 'moderate', probability: 0.2 },
    { category: 'glass', key: 'Заднее стекло', defaultSeverity: 'minor', probability: 0.1 },
    { category: 'glass', key: 'Боковое стекло', defaultSeverity: 'minor', probability: 0.15 },
    { category: 'lighting', key: 'Фара передняя', defaultSeverity: 'severe', probability: 0.2 },
    { category: 'lighting', key: 'Фара задняя', defaultSeverity: 'moderate', probability: 0.15 },
    { category: 'mirrors', key: 'Зеркало левое', defaultSeverity: 'minor', probability: 0.15 },
    { category: 'mirrors', key: 'Зеркало правое', defaultSeverity: 'minor', probability: 0.15 },
    { category: 'wheels', key: 'Диск колесный', defaultSeverity: 'minor', probability: 0.2 },
  ];

  // Severity descriptions based on damage type
  const severityDescriptions: Record<string, Record<string, string>> = {
    'minor': {
      'bodyParts': 'Царапины, потертости, незначительные следы эксплуатации',
      'glass': 'Сколы, микротрещины',
      'lighting': 'Помутнение, незначительные повреждения',
      'mirrors': 'Царапины, трещины без деформации',
      'wheels': 'Царапины на диске, небольшая деформация',
    },
    'moderate': {
      'bodyParts': 'Вмятины, деформация, частичные повреждения',
      'glass': 'Трещины, сколы более 2 см',
      'lighting': 'Разбит рассеиватель, не работает',
      'mirrors': 'Трещина, частичная деформация',
      'wheels': 'Деформация диска, нарушен баланс',
    },
    'severe': {
      'bodyParts': 'Сильная деформация, сквозные повреждения, требует замены',
      'glass': 'Полностью разбито',
      'lighting': 'Полностью разбито, повреждены крепления',
      'mirrors': 'Полностью разбито, повреждены крепления',
      'wheels': 'Трещины на диске, не подлежит ремонту',
    }
  };

  // Analyze damage based on user selected parts
  const analyzeDamage = async () => {
    setIsAnalyzing(true);
    setDamageZones([]);
    
    // Simulate API call delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use selected damages from the checkbox list
    const selectedDamagesData: Array<{
      id: number;
      zone: string;
      severity: 'minor' | 'moderate' | 'severe';
      description: string;
      repairCost: number;
    }> = [];
    
    // Get damage zones that user selected
    for (const selectedKey of selectedDamages) {
      const zone = allDamageZones.find(z => z.key === selectedKey);
      if (zone) {
        // Use moderate severity as default for user-selected damages
        const severity: 'minor' | 'moderate' | 'severe' = (zone.defaultSeverity as 'minor' | 'moderate' | 'severe') || 'moderate';
        
        const costs = repairCostDatabase[zone.category as keyof typeof repairCostDatabase];
        const partCosts = costs[zone.key as keyof typeof costs];
        const baseRepairCost = partCosts[severity];
        // Apply brand multiplier - premium brands have more expensive parts
        const brandMultiplier = brandRepairMultiplier[calcData.brand] || 1.0;
        const repairCost = Math.round(baseRepairCost * brandMultiplier);
        
        const category = zone.category as keyof typeof severityDescriptions;
        
        selectedDamagesData.push({
          id: selectedDamagesData.length + 1,
          zone: zone.key,
          severity,
          description: severityDescriptions[severity][category] || 'Требует осмотра',
          repairCost,
        });
      }
    }
    
    setDamageZones(selectedDamagesData);
    setIsAnalyzing(false);
  };

  const calculatePrice = async () => {
    setIsCalculating(true);
    
    // Base prices by brand (comprehensive)
    const basePrices: Record<string, number> = {
      // Luxury
      "Mercedes": 2800000,
      "BMW": 2700000,
      "Audi": 2500000,
      "Lexus": 3200000,
      "Porsche": 4500000,
      "Maserati": 3800000,
      "Jaguar": 2200000,
      "Land Rover": 3000000,
      "Infiniti": 2100000,
      "Acura": 2000000,
      "Genesis": 2400000,
      "Alfa Romeo": 2600000,
      // Japanese
      "Toyota": 1800000,
      "Honda": 1500000,
      "Nissan": 1400000,
      "Mitsubishi": 1300000,
      "Mazda": 1200000,
      "Subaru": 1500000,
      "Suzuki": 900000,
      // Korean
      "Hyundai": 1100000,
      "Kia": 1000000,
      // German (non-luxury)
      "Volkswagen": 1300000,
      "Opel": 900000,
      "Peugeot": 850000,
      "Citroen": 800000,
      "Fiat": 750000,
      "Seat": 950000,
      "Skoda": 1000000,
      // American
      "Ford": 1400000,
      "Chevrolet": 1300000,
      "Dodge": 2000000,
      "Jeep": 2200000,
      "Cadillac": 2500000,
      "Lincoln": 2300000,
      "Buick": 1800000,
      "Chrysler": 1500000,
      "Tesla": 3500000,
      "Ram": 1800000,
      "GMC": 2000000,
      // Chinese
      "Geely": 1200000,
      "Haval": 1400000,
      "Chery": 1100000,
      "Changan": 1000000,
      "FAW": 900000,
      "Lifan": 700000,
      "Great Wall": 850000,
      "Dongfeng": 800000,
      // Russian
      "Lada (ВАЗ)": 600000,
      "ГАЗ": 900000,
      "УАЗ": 850000,
      "ЗАЗ": 400000,
      // Others
      "Mini": 1500000,
      "Smart": 1200000,
      "Saab": 800000,
      "Volvo": 1800000,
      "Datsun": 550000,
      "Daewoo": 450000,
      // Buses & Trucks
      "Renault": 1200000,
      "SsangYong": 1100000,
      "Другая": 500000
    };

    let basePrice = basePrices[calcData.brand] || 500000;
    
    // Year adjustment (depreciation)
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - parseInt(calcData.year || "2015");
    const yearMultiplier = Math.max(0.3, 1 - (yearDiff * 0.05));
    basePrice *= yearMultiplier;

    // Mileage adjustment
    const mileage = parseInt(calcData.mileage || "0");
    if (mileage > 100000) basePrice *= 0.9;
    if (mileage > 200000) basePrice *= 0.85;
    if (mileage > 300000) basePrice *= 0.75;

    // Engine type
    if (calcData.engineType === "electric") basePrice *= 1.1;
    if (calcData.engineType === "diesel") basePrice *= 0.95;

    // Condition
    if (calcData.condition === "excellent") basePrice *= 1.15;
    if (calcData.condition === "fair") basePrice *= 0.8;
    if (calcData.condition === "poor") basePrice *= 0.6;

    // Accidents
    if (calcData.hasAccidents === "yes") basePrice *= 0.7;

    // Documents
    if (calcData.hasDocuments === "no") basePrice *= 0.5;

    // AI Damage Assessment - subtract repair costs
    const totalDamageCost = damageZones.reduce((sum, d) => sum + d.repairCost, 0);
    basePrice = Math.max(100000, basePrice - totalDamageCost * 0.7);

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEstimatedPrice(Math.round(basePrice));
    setIsCalculating(false);
  };

  const sendCalculationToTelegram = () => {
    const damageInfo = damageZones.length > 0 
      ? damageZones.map(d => `• ${d.zone}: ${d.description} (${d.severity}) - ~${d.repairCost.toLocaleString()} ₽`).join('\n')
      : 'Не обнаружены';
    
    const message = `🚗 *Запрос расчета стоимости авто*\n\n` +
      `*Марка:* ${calcData.brand}\n` +
      `*Модель:* ${calcData.model}\n` +
      `*Год:* ${calcData.year}\n` +
      `*Пробег:* ${calcData.mileage} км\n` +
      `*Двигатель:* ${calcData.engineType}\n` +
      `*Состояние:* ${calcData.condition}\n` +
      `*ДТП:* ${calcData.hasAccidents === "yes" ? "Да" : "Нет"}\n` +
      `*Документы:* ${calcData.hasDocuments === "yes" ? "Есть" : "Нет"}\n` +
      `*Фото:* ${photos.length} фото\n\n` +
      `*AI-анализ повреждений:*\n${damageInfo}\n\n` +
      `*Предварительная цена:* ${estimatedPrice?.toLocaleString()} ₽`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://t.me/krisdev13?text=${encodedMessage}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create message for Telegram
    const telegramMessage = `🚗 *Новая заявка на выкуп авто*\n\n` +
      `*Имя:* ${formData.name}\n` +
      `*Телефон:* ${formData.phone}\n` +
      `*Тип ТС:* ${formData.vehicleType === 'auto' ? 'Легковой автомобиль' : formData.vehicleType === 'motorcycle' ? 'Мотоцикл' : 'Спецтехника'}\n` +
      `*Сообщение:* ${formData.message || 'Не указано'}`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(telegramMessage);
    
    // Open Telegram with pre-filled message
    window.open(`https://t.me/krisdev13?text=${encodedMessage}`, '_blank');
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: "", phone: "", vehicleType: "auto", message: "" });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-neutral-950 to-black"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/5 via-red-800/5 to-red-600/5 rounded-full blur-[100px]"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
              <span className="text-xl font-bold">АВ</span>
            </div>
            <span className="text-xl font-bold">АвтоВыкуп<span className="text-red-500">40</span></span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-6"
          >
            <a href="#services" className="hover:text-red-400 transition-colors font-medium">Услуги</a>
            <a href="#calculator" className="hover:text-red-400 transition-colors font-medium">Калькулятор</a>
            <a href="#advantages" className="hover:text-red-400 transition-colors font-medium">Преимущества</a>
            <a href="#reviews" className="hover:text-red-400 transition-colors font-medium">Отзывы</a>
            <a href="#contact" className="hover:text-red-400 transition-colors font-medium">Контакты</a>
          </motion.div>
          <motion.a 
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-red-600 to-red-900 px-6 py-2 rounded-full font-semibold shadow-lg shadow-red-600/30"
          >
            Связаться
          </motion.a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-red-600/20 via-red-800/20 to-red-600/20 border border-red-600/30 text-red-400 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                <Zap className="inline-block w-4 h-4 mr-2" />
                Выкуп в Калуге, Туле и Обнинске
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-red-100 to-red-300 bg-clip-text text-transparent">
                ВЫКУПАЕМ АВТО
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 via-red-600 to-red-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                ЗА 15 МИНУТ
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-10"
            >
              Автомобили, мотоциклы и спецтехника любого состояния. 
              <span className="text-red-400 font-semibold">Бесплатный вывоз</span> по Калужской области до 200 км
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a 
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-600 to-red-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-red-600/30"
              >
                Продать авто сейчас
              </motion.a>
              <motion.a 
                href="#advantages"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-600/20 transition-colors"
              >
                Узнать условия
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-500">500+</div>
                <div className="text-gray-400 mt-1">Авто выкуплено</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-500">15 мин</div>
                <div className="text-gray-400 mt-1">Среднее время</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-500">98%</div>
                <div className="text-gray-400 mt-1">Довольных клиентов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-gray-400 mt-1">Работаем всегда</div>
              </div>
            </motion.div>

            {/* Cities We Serve */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 flex flex-wrap justify-center gap-4"
            >
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-gray-300">Калуга</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-gray-300">Тула</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-gray-300">Обнинск</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <span className="text-gray-300">+ 200км от Калуги</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                ЧТО МЫ ВЫКУПАЕМ
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Берем всё, что можно продать</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Auto */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors group overflow-hidden"
            >
              <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop" 
                  alt="Автомобили премиум класса"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">BMW, Mercedes, Audi</div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Легковые авто</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Иномарки и отечественные</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> С пробегом и без</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> После ДТП</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Неисправные</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Без документов</li>
              </ul>
            </motion.div>

            {/* Motorcycle */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors group overflow-hidden"
            >
              <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c3d?w=600&h=400&fit=crop" 
                  alt="Мотоциклы"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">Kawasaki, Honda, Yamaha</div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Мотоциклы</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Все марки и модели</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Скутеры и квадроциклы</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Снегоходы</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Мототехника б/у</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Разбор на запчасти</li>
              </ul>
            </motion.div>

            {/* Special Tech */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors group overflow-hidden"
            >
              <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&h=400&fit=crop" 
                  alt="Спецтехника"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold">Экскаваторы, погрузчики</div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Спецтехника</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Экскаваторы</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Погрузчики</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Комбайны</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Строительная техника</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-red-500" /> Сельхозтехника</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                ПОЧЕМУ ВЫБИРАЮТ НАС
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Работаем честно и быстро</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Быстрая оценка",
                desc: "Онлайн-оценка за 5 минут. Выезд оценщика в любую точку области"
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Честные цены",
                desc: "Платим реальную рыночную стоимость. Без скрытых комиссий"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Выкуп за 15 минут",
                desc: "Деньги наличными или переводом сразу после осмотра"
              },
              {
                icon: <TruckDelivery className="w-8 h-8" />,
                title: "Бесплатный вывоз",
                desc: "Эвакуатор за наш счет. Забираем авто в любом состоянии"
              }
            ].map((adv, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-red-500/50 transition-colors"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-xl flex items-center justify-center text-red-500 mb-4">
                  {adv.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{adv.title}</h3>
                <p className="text-gray-400 text-sm">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="relative z-10 py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                КАЛЬКУЛЯТОР СТОИМОСТИ
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Узнайте примерную цену за 2 минуты</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Brand */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Марка автомобиля</label>
                  <select
                    value={calcData.brand}
                    onChange={(e) => {
                      setCalcData({ ...calcData, brand: e.target.value, model: "" });
                      setShowModelDropdown(false);
                      setModelSuggestions([]);
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="" className="bg-neutral-900">Выберите марку</option>
                    {allBrands.map((brand) => (
                      <option key={brand} value={brand} className="bg-neutral-900">{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Model with autocomplete */}
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Модель</label>
                  <input
                    type="text"
                    placeholder={calcData.brand && calcData.brand !== "Другая" ? "Начните вводить модель..." : "Сначала выберите марку"}
                    value={calcData.model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    onFocus={() => {
                      if (calcData.brand && calcData.brand !== "Другая") {
                        setModelSuggestions(filterModels(calcData.model));
                        setShowModelDropdown(true);
                      }
                    }}
                    disabled={!calcData.brand || calcData.brand === "Другая"}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {/* Autocomplete dropdown */}
                  {showModelDropdown && modelSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {modelSuggestions.map((model, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleModelSelect(model)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-red-600/30 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Год выпуска</label>
                  <select
                    value={calcData.year}
                    onChange={(e) => setCalcData({ ...calcData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="" className="bg-neutral-900">Выберите год</option>
                    {[...Array(25)].map((_, i) => {
                      const year = 2025 - i;
                      return <option key={year} value={year} className="bg-neutral-900">{year}</option>;
                    })}
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Пробег (км)</label>
                  <input
                    type="number"
                    placeholder="Например: 150000"
                    value={calcData.mileage}
                    onChange={(e) => setCalcData({ ...calcData, mileage: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Engine Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Тип двигателя</label>
                  <select
                    value={calcData.engineType}
                    onChange={(e) => setCalcData({ ...calcData, engineType: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="petrol" className="bg-neutral-900">Бензин</option>
                    <option value="diesel" className="bg-neutral-900">Дизель</option>
                    <option value="electric" className="bg-neutral-900">Электро</option>
                    <option value="hybrid" className="bg-neutral-900">Гибрид</option>
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Состояние</label>
                  <select
                    value={calcData.condition}
                    onChange={(e) => setCalcData({ ...calcData, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="excellent" className="bg-neutral-900">Отличное</option>
                    <option value="good" className="bg-neutral-900">Хорошее</option>
                    <option value="fair" className="bg-neutral-900">Удовлетворительное</option>
                    <option value="poor" className="bg-neutral-900">Плохое</option>
                  </select>
                </div>

                {/* Accidents */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Были ДТП?</label>
                  <select
                    value={calcData.hasAccidents}
                    onChange={(e) => setCalcData({ ...calcData, hasAccidents: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="no" className="bg-neutral-900">Нет</option>
                    <option value="yes" className="bg-neutral-900">Да</option>
                  </select>
                </div>

                {/* Documents */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Документы</label>
                  <select
                    value={calcData.hasDocuments}
                    onChange={(e) => setCalcData({ ...calcData, hasDocuments: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="yes" className="bg-neutral-900">Есть</option>
                    <option value="no" className="bg-neutral-900">Нет / Потеряны</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-8">
                <label className="block text-sm text-gray-400 mb-2">
                  <Camera className="inline w-4 h-4 mr-1" />
                  Фото автомобиля (до 5 фото)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                      <Image 
                        src={preview} 
                        alt={`Фото ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-red-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-red-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs">Загрузить</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Manual Damage Selection */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-white">Отметьте повреждения</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">Выберите все повреждённые элементы автомобиля:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allDamageZones.slice(0, 12).map((zone) => (
                    <label
                      key={zone.key}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm ${
                        selectedDamages.includes(zone.key)
                          ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDamages.includes(zone.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDamages([...selectedDamages, zone.key]);
                          } else {
                            setSelectedDamages(selectedDamages.filter(d => d !== zone.key));
                          }
                          // Clear AI damage zones when manually selecting
                          setDamageZones([]);
                        }}
                        className="hidden"
                      />
                      <span>{zone.key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Damage Analysis Button */}
              {selectedDamages.length > 0 && damageZones.length === 0 && !isAnalyzing && (
                <motion.button
                  onClick={analyzeDamage}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-blue-600/30 mb-6 flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Рассчитать стоимость ремонта
                </motion.button>
              )}

              {/* AI Analysis Loading */}
              {isAnalyzing && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                    <span className="text-blue-400 font-bold">AI анализирует повреждения...</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-progress" style={{ width: '100%' }}></div>
                  </div>
                  <div className="text-center text-gray-400 text-sm">
                    Компьютерное зрение сканирует загруженные изображения
                  </div>
                </div>
              )}

              {/* Damage Zones Results */}
              {damageZones.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                    <span className="text-orange-400 font-bold text-lg">Обнаруженные повреждения</span>
                  </div>
                  
                  <div className="space-y-3">
                    {damageZones.map((damage) => (
                      <div 
                        key={damage.id}
                        onClick={() => setSelectedZone(selectedZone === damage.id ? null : damage.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedZone === damage.id 
                            ? 'bg-white/20 border-2 border-orange-500' 
                            : 'bg-white/5 border border-white/10 hover:border-orange-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{damage.zone}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              damage.severity === 'minor' ? 'bg-yellow-600' : 
                              damage.severity === 'moderate' ? 'bg-orange-600' : 'bg-red-600'
                            }`}>
                              {damage.severity === 'minor' ? 'Легкое' : 
                               damage.severity === 'moderate' ? 'Среднее' : 'Тяжелое'}
                            </span>
                          </div>
                          <span className="text-red-400 font-bold">
                            ~{Math.round(damage.repairCost).toLocaleString()} ₽
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">{damage.description}</div>
                        
                        {selectedZone === damage.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-white/10"
                          >
                            <div className="text-sm text-gray-300">
                              <strong>Рекомендация:</strong> требуется {damage.description.toLowerCase()}, 
                              рекомендуется ремонт в автосервисе
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-gray-400">Всего повреждений: <strong className="text-white">{damageZones.length}</strong></span>
                    <span className="text-orange-400 font-bold">
                      Примерный ремонт: ~{damageZones.reduce((s, d) => s + d.repairCost, 0).toLocaleString()} ₽
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Calculate Button */}
              <motion.button
                onClick={calculatePrice}
                disabled={isCalculating || !calcData.brand || !calcData.year}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-red-600 to-red-900 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Расчет...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Рассчитать стоимость
                  </>
                )}
              </motion.button>

              {/* Result */}
              {estimatedPrice !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30"
                >
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">Примерная стоимость</div>
                    <div className="text-4xl md:text-5xl font-bold text-green-400 mb-4">
                      {estimatedPrice.toLocaleString()} ₽
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      *Точная цена после осмотра. Зависит от реального состояния авто
                    </p>
                    <motion.button
                      onClick={sendCalculationToTelegram}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-600 px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Получить точную оценку в Telegram
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="relative z-10 py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                ОТЗЫВЫ КЛИЕНТОВ
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Более 500 довольных клиентов</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-red-500">
                    <Image 
                      src={review.avatar} 
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{review.name}</div>
                    <div className="text-sm text-red-400">{review.city}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                  ))}
                </div>
                <p className="text-gray-300 text-sm italic">&ldquo;{review.text}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative z-10 py-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                    ПРОДАЙ АВТО ЗА 15 МИНУТ
                  </span>
                </h2>
                <p className="text-gray-400">Оставь заявку и получи деньги уже сегодня</p>
              </div>

              <AnimatePresence mode="wait">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-500 mb-2">Заявка отправлена!</h3>
                    <p className="text-gray-400">Мы свяжемся с вами в течение 5 минут</p>
                  </motion.div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Ваше имя"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Номер телефона"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                        required
                      />
                    </div>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                    >
                      <option value="auto" className="bg-neutral-900">Легковой автомобиль</option>
                      <option value="motorcycle" className="bg-neutral-900">Мотоцикл</option>
                      <option value="special" className="bg-neutral-900">Спецтехника</option>
                    </select>
                    <textarea
                      placeholder="Сообщение (марка, модель, год выпуска, состояние)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                    />
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-red-600 to-red-900 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Оставить заявку
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 grid md:grid-cols-3 gap-6"
            >
              <a 
                href="https://t.me/krisdev13"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-red-500/50 transition-colors flex items-center gap-4 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold">Telegram</div>
                  <div className="text-gray-400 text-sm">@krisdev13</div>
                </div>
              </a>

              <a 
                href="https://wa.me/74842555555"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-red-500/50 transition-colors flex items-center gap-4 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold">WhatsApp</div>
                  <div className="text-gray-400 text-sm">+7 4842 55-55-55</div>
                </div>
              </a>

              <a 
                href="tel:+74842555555"
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-red-500/50 transition-colors flex items-center gap-4 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold">Телефон</div>
                  <div className="text-gray-400 text-sm">+7 4842 55-55-55</div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2024 АвтоВыкуп. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}

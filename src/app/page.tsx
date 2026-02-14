"use client";

import { useState } from "react";
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
  AlertTriangle
} from "lucide-react";

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

  // Simulate AI damage detection
  const analyzeDamage = async () => {
    setIsAnalyzing(true);
    setDamageZones([]);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate random damage zones for demo
    const possibleZones = [
      { zone: 'Передний бампер', severity: 'minor' as const, description: 'Царапины', baseCost: 15000 },
      { zone: 'Капот', severity: 'moderate' as const, description: 'Вмятина', baseCost: 25000 },
      { zone: 'Левое крыло', severity: 'severe' as const, description: 'Деформация', baseCost: 35000 },
      { zone: 'Дверь водителя', severity: 'minor' as const, description: 'Царапины', baseCost: 12000 },
      { zone: 'Задний бампер', severity: 'moderate' as const, description: 'Трещина', baseCost: 20000 },
      { zone: 'Крыша', severity: 'minor' as const, description: 'Царапины', baseCost: 18000 },
      { zone: 'Фара', severity: 'severe' as const, description: 'Разбита', baseCost: 40000 },
      { zone: 'Зеркало', severity: 'moderate' as const, description: 'Трещина', baseCost: 15000 },
    ];
    
    // Randomly select 1-4 damage zones
    const numDamages = Math.floor(Math.random() * 4) + 1;
    const shuffled = possibleZones.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numDamages);
    
    const damages = selected.map((d, i) => ({
      id: i + 1,
      ...d,
      repairCost: d.baseCost * (d.severity === 'minor' ? 0.5 : d.severity === 'moderate' ? 1 : 1.5)
    }));
    
    setDamageZones(damages);
    setIsAnalyzing(false);
  };

  const calculatePrice = async () => {
    setIsCalculating(true);
    
    // Base prices by brand
    const basePrices: Record<string, number> = {
      "BMW": 1500000,
      "Mercedes": 1600000,
      "Audi": 1400000,
      "Toyota": 1200000,
      "Honda": 1000000,
      "Nissan": 900000,
      "Ford": 800000,
      "Volkswagen": 850000,
      "Hyundai": 700000,
      "Kia": 650000,
      "Lada": 400000,
      "Renault": 600000,
      "Mitsubishi": 950000,
      "Mazda": 880000,
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
                    onChange={(e) => setCalcData({ ...calcData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="" className="bg-neutral-900">Выберите марку</option>
                    <option value="BMW" className="bg-neutral-900">BMW</option>
                    <option value="Mercedes" className="bg-neutral-900">Mercedes</option>
                    <option value="Audi" className="bg-neutral-900">Audi</option>
                    <option value="Toyota" className="bg-neutral-900">Toyota</option>
                    <option value="Honda" className="bg-neutral-900">Honda</option>
                    <option value="Nissan" className="bg-neutral-900">Nissan</option>
                    <option value="Ford" className="bg-neutral-900">Ford</option>
                    <option value="Volkswagen" className="bg-neutral-900">Volkswagen</option>
                    <option value="Hyundai" className="bg-neutral-900">Hyundai</option>
                    <option value="Kia" className="bg-neutral-900">Kia</option>
                    <option value="Lada" className="bg-neutral-900">Lada (ВАЗ)</option>
                    <option value="Renault" className="bg-neutral-900">Renault</option>
                    <option value="Mitsubishi" className="bg-neutral-900">Mitsubishi</option>
                    <option value="Mazda" className="bg-neutral-900">Mazda</option>
                    <option value="Другая" className="bg-neutral-900">Другая</option>
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Модель</label>
                  <input
                    type="text"
                    placeholder="Например: Camry, X5, Focus"
                    value={calcData.model}
                    onChange={(e) => setCalcData({ ...calcData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
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

              {/* AI Damage Analysis Button */}
              {photos.length > 0 && damageZones.length === 0 && !isAnalyzing && (
                <motion.button
                  onClick={analyzeDamage}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-blue-600/30 mb-6 flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  AI-анализ повреждений
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
                          <div>
                            <span className="font-bold">{damage.zone}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
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

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Icons as SVG components
const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MotorcycleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const LightningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TruckIcon2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Review data
const reviews = [
  {
    name: "Алексей Петров",
    city: "Калуга",
    text: "Продал свой Ford Focus за 45 минут! Оценщик приехал прямо на работу, всё осмотрел и рассчитался на месте. Отличный сервис!",
    rating: 5
  },
  {
    name: "Михаил Иванов",
    city: "Тула",
    text: "Взяли мою старую Toyota Camry даже с неисправным двигателем. Цена устроила, вывезли на эвакуаторе бесплатно. Рекомендую!",
    rating: 5
  },
  {
    name: "Сергей Николаев",
    city: "Обнинск",
    text: "Продал мотоцикл Honda CBR. Всё чётко, без лишних вопросов. Деньги получил в день обращения. Молодцы!",
    rating: 5
  },
  {
    name: "Дмитрий Смирнов",
    city: "Калуга",
    text: "Продавал экскаватор-погрузчик. Компания оценила технику справедливо, помогли с оформлением документов. Очень доволен!",
    rating: 5
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: "", phone: "", vehicleType: "auto", message: "" });
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-neutral-950 to-black"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-magenta-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 via-magenta-500/5 to-cyan-500/5 rounded-full blur-[100px]"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-xl font-bold">А</span>
            </div>
            <span className="text-xl font-bold">АвтоВыкуп</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-6"
          >
            <a href="#services" className="hover:text-cyan-400 transition-colors font-medium">Услуги</a>
            <a href="#advantages" className="hover:text-cyan-400 transition-colors font-medium">Преимущества</a>
            <a href="#reviews" className="hover:text-cyan-400 transition-colors font-medium">Отзывы</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors font-medium">Контакты</a>
          </motion.div>
          <motion.a 
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-cyan-500 to-magenta-500 px-6 py-2 rounded-full font-semibold shadow-lg shadow-cyan-500/30"
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
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500/20 via-magenta-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                ⚡ Выкуп в Калуге, Туле и Обнинске
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                ВЫКУПАЕМ АВТО
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
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
              <span className="text-cyan-400 font-semibold">Бесплатный вывоз</span> по Калужской области до 200 км
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
                className="bg-gradient-to-r from-cyan-500 to-magenta-500 px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-cyan-500/30"
              >
                Продать авто сейчас
              </motion.a>
              <motion.a 
                href="#advantages"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-cyan-500/20 transition-colors"
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
                <div className="text-4xl md:text-5xl font-bold text-cyan-400">500+</div>
                <div className="text-gray-400 mt-1">Авто выкуплено</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-cyan-400">15 мин</div>
                <div className="text-gray-400 mt-1">Среднее время</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-cyan-400">98%</div>
                <div className="text-gray-400 mt-1">Довольных клиентов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">24/7</div>
                <div className="text-gray-400 mt-1">Работаем всегда</div>
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
              <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
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
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                <CarIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4">Легковые авто</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ Иномарки и отечественные</li>
                <li>✓ С пробегом и без</li>
                <li>✓ После ДТП</li>
                <li>✓ Неисправные</li>
                <li>✓ Без документов</li>
              </ul>
            </motion.div>

            {/* Motorcycle */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                <MotorcycleIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4">Мотоциклы</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ Все марки и модели</li>
                <li>✓ Скутеры и квадроциклы</li>
                <li>✓ Снегоходы</li>
                <li>✓ Мототехника б/у</li>
                <li>✓ Разбор на запчасти</li>
              </ul>
            </motion.div>

            {/* Special Tech */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-colors group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                <TruckIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4">Спецтехника</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ Экскаваторы</li>
                <li>✓ Погрузчики</li>
                <li>✓ Комбайны</li>
                <li>✓ Строительная техника</li>
                <li>✓ Сельхозтехника</li>
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
              <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                ПОЧЕМУ ВЫБИРАЮТ НАС
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Работаем честно и быстро</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <LightningIcon />,
                title: "Быстрая оценка",
                desc: "Онлайн-оценка за 5 минут. Выезд оценщика в любую точку области"
              },
              {
                icon: <CashIcon />,
                title: "Честные цены",
                desc: "Платим реальную рыночную стоимость. Без скрытых комиссий"
              },
              {
                icon: <ClockIcon />,
                title: "Выкуп за 15 минут",
                desc: "Деньги наличными или переводом сразу после осмотра"
              },
              {
                icon: <TruckIcon2 />,
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
                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-colors"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
                  {adv.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{adv.title}</h3>
                <p className="text-gray-400 text-sm">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
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
              <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
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
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} filled={j < review.rating} />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">&ldquo;{review.text}&rdquo;</p>
                <div className="border-t border-white/10 pt-3">
                  <div className="font-bold">{review.name}</div>
                  <div className="text-sm text-cyan-400">{review.city}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative z-10 py-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-magenta-500/10 rounded-full blur-[100px]"></div>
        
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
                  <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
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
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Ваше имя</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="Иван Иванов"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Телефон *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="+7 (999) 123-45-67"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Тип техники</label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors"
                      >
                        <option value="auto">Легковой автомобиль</option>
                        <option value="moto">Мотоцикл</option>
                        <option value="spec">Спецтехника</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Сообщение (марка, модель, год)</label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                        placeholder="Toyota Camry, 2018 год, пробег 150 000 км..."
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Отправляем...
                        </span>
                      ) : (
                        "Получить оценку за 15 минут"
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contacts Section - 2026 Style */}
      <section className="relative z-10 py-24 overflow-hidden">
        {/* Neon Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-cyan-500/10 via-transparent to-magenta-500/10 rounded-full blur-3xl animate-spin-slow"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="inline-block"
            >
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 bg-[length:200%_200%] animate-gradient text-white font-bold rounded-full text-sm mb-6 shadow-lg shadow-cyan-500/30">
                ⚡ СВЯЖИСЬ С НАМИ
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                КОНТАКТЫ
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Выбери удобный способ связи</p>
          </motion.div>

          {/* Contact Methods - Glassmorphism Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { 
                icon: <TelegramIcon />, 
                title: "Telegram", 
                desc: "Быстрые ответы",
                link: "https://t.me/autovykup_kaluga",
                color: "from-cyan-400 to-cyan-600",
                glow: "shadow-cyan-500/50",
                borderColor: "border-cyan-500/50"
              },
              { 
                icon: <WhatsAppIcon />, 
                title: "WhatsApp", 
                desc: "Напиши нам",
                link: "https://wa.me/74842555555",
                color: "from-green-400 to-green-600",
                glow: "shadow-green-500/50",
                borderColor: "border-green-500/50"
              },
              { 
                icon: <PhoneIcon />, 
                title: "Телефон", 
                desc: "Звони прямо сейчас",
                link: "tel:+74842555555",
                color: "from-magenta-500 to-pink-600",
                glow: "shadow-magenta-500/50",
                borderColor: "border-magenta-500/50"
              }
            ].map((contact, i) => (
              <motion.a
                key={i}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30, rotateX: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 150 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  boxShadow: `0 20px 40px -20px ${contact.glow}`
                }}
                className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl border ${contact.borderColor} hover:border-opacity-100 transition-all duration-300`}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${contact.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-300`}></div>
                
                <div className="relative z-10 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                    className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${contact.color} rounded-2xl flex items-center justify-center shadow-lg ${contact.glow}`}
                  >
                    <span className="text-white">{contact.icon}</span>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                    {contact.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {contact.desc}
                  </p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Нажми для связи →
                  </motion.div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Main Phone CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 mb-6">Или звоните напрямую:</p>
            <motion.a 
              href="tel:+74842555555"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-4 bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 bg-[length:200%_200%] animate-gradient px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            >
              <PhoneIcon />
              <span>+7 (4842) 55-55-55</span>
            </motion.a>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-4 h-4 bg-cyan-500/30 rounded-full blur-sm"
          />
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 w-6 h-6 bg-magenta-500/30 rounded-full blur-sm"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-sm font-bold">А</span>
              </div>
              <span className="font-bold">АвтоВыкуп</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 АвтоВыкуп Калуга. Выкуп автомобилей, мотоциклов и спецтехники.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-neutral-900 to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">А</span>
            </div>
            <span className="text-xl font-bold">АвтоВыкуп</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-4"
          >
            <a href="#services" className="hover:text-orange-400 transition-colors">Услуги</a>
            <a href="#advantages" className="hover:text-orange-400 transition-colors">Преимущества</a>
            <a href="#reviews" className="hover:text-orange-400 transition-colors">Отзывы</a>
            <a href="#contact" className="hover:text-orange-400 transition-colors">Контакты</a>
          </motion.div>
          <motion.a 
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 rounded-full font-semibold"
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
              <span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold mb-6">
                🚀 Выкуп в Калуге, Туле и Обнинске
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">
                ВЫКУПАЕМ АВТО
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
              <span className="text-orange-400"> Бесплатный вывоз</span> по Калужской области до 200 км
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
                className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-orange-500/25"
              >
                Продать авто сейчас
              </motion.a>
              <motion.a 
                href="#advantages"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-orange-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-500/20 transition-colors"
              >
                Узнать условия
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">500+</div>
                <div className="text-gray-400">Авто выкуплено</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">15 мин</div>
                <div className="text-gray-400">Среднее время</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">98%</div>
                <div className="text-gray-400">Довольных клиентов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">24/7</div>
                <div className="text-gray-400">Работаем всегда</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative z-10 py-24 bg-black/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
              className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl border border-neutral-700 hover:border-orange-500 transition-colors group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
              className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl border border-neutral-700 hover:border-orange-500 transition-colors group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
              className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 rounded-2xl border border-neutral-700 hover:border-orange-500 transition-colors group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
                className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700 hover:border-orange-500/50 transition-colors"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center text-orange-500 mb-4">
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
      <section id="reviews" className="relative z-10 py-24 bg-black/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
                className="bg-neutral-800 p-6 rounded-xl border border-neutral-700"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} filled={j < review.rating} />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">&ldquo;{review.text}&rdquo;</p>
                <div className="border-t border-neutral-700 pt-3">
                  <div className="font-bold">{review.name}</div>
                  <div className="text-sm text-orange-500">{review.city}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-8 md:p-12 rounded-3xl border border-neutral-700"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
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
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
                          placeholder="+7 (999) 123-45-67"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Тип техники</label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors"
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
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                        placeholder="Toyota Camry, 2018 год, пробег 150 000 км..."
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Contacts Section */}
      <section className="relative z-10 py-24 bg-black/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                КОНТАКТЫ
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Ждем вас в офисах</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { city: "Калуга", address: "ул. Кирова, 19", phone: "+7 (4842) 55-55-55" },
              { city: "Тула", address: "ул. Фридриха Энгельса, 26", phone: "+7 (4872) 55-55-55" },
              { city: "Обнинск", address: "ул. Королева, 6", phone: "+7 (4843) 55-55-55" }
            ].map((office, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <LocationIcon />
                  </div>
                  <h3 className="text-xl font-bold">{office.city}</h3>
                </div>
                <p className="text-gray-400 mb-2">{office.address}</p>
                <a href={`tel:${office.phone}`} className="text-orange-500 font-semibold hover:underline">
                  {office.phone}
                </a>
                <div className="mt-4 h-32 bg-neutral-900 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  Карта скоро появится
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-400 mb-4">Или звоните прямо сейчас:</p>
            <a 
              href="tel:+74842555555" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              <PhoneIcon />
              +7 (4842) 55-55-55
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
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

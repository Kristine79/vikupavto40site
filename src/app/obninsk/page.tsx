import type { Metadata } from "next";
import { Car, Truck, Bike, MapPin, Phone, MessageCircle, Clock, CheckCircle, Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "АВТОВЫКУП Обнинск - Срочный выкуп автомобилей за 15 минут",
  description: "Срочный выкуп автомобилей в Обнинске. Выкупаем машины любого состояния: после ДТП, неисправные, с пробегом. Бесплатный вывоз по Обнинску. Звоните: 89105250060",
  keywords: ["выкуп авто Обнинск", "выкуп автомобилей Обнинск", "продать авто Обнинск", "срочный выкуп авто Обнинск", "выкуп битых авто Обнинск"],
  alternates: {
    canonical: "https://vikupavto40.ru/obninsk"
  }
};

export default function ObninskPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-500">АВТОВЫКУП</span>
          </Link>
          <Link 
            href="/"
            className="bg-gradient-to-r from-red-600 to-red-900 px-6 py-2 rounded-full font-semibold shadow-lg shadow-red-600/30"
          >
            На главную
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-neutral-950 to-black"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-full mb-6">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">Обнинск</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white via-red-100 to-red-300 bg-clip-text text-transparent">
                АВТОВЫКУП В ОБНИНСКЕ
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Выкупаем автомобили, мотоциклы и спецтехнику в Обнинске и Калужской области. 
              <span className="text-red-400 font-semibold"> Оценка за 15 минут, бесплатный вывоз</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#contact"
                className="bg-gradient-to-r from-red-600 to-red-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-red-600/30"
              >
                Продать авто в Обнинске
              </Link>
              <a 
                href="tel:+79105250060"
                className="border-2 border-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-600/20 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                +7 (910) 525-00-60
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              ПОЧЕМУ ВЫБИРАЮТ НАС В ОБНИНСКЕ
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <Clock className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Быстрая оценка</h3>
              <p className="text-gray-400">Оцениваем ваш автомобиль за 15 минут. Приезжаем в любой район Обнинска</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <CheckCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Честная цена</h3>
              <p className="text-gray-400">Предлагаем рыночную стоимость без скрытых комиссий и платежей</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <Truck className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Бесплатный вывоз</h3>
              <p className="text-gray-400">Эвакуатор за наш счёт в любую точку Обнинска и области</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-black/20">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              ЧТО МЫ ВЫКУПАЕМ В ОБНИНСКЕ
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Car className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Легковые автомобили</h3>
              <p className="text-gray-400">Иномарки и отечественные авто, с пробегом и без, после ДТП</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Bike className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Мотоциклы и квадроциклы</h3>
              <p className="text-gray-400">Мототехника любого состояния и года выпуска</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Truck className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Спецтехника</h3>
              <p className="text-gray-400">Экскаваторы, погрузчики, комбайны и строительная техника</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">ПРОДАЙ АВТО В ОБНИНСКЕ ЗА 15 МИНУТ</h2>
          <p className="text-gray-400 mb-8">Оставьте заявку или позвоните нам</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/#contact"
              className="bg-gradient-to-r from-red-600 to-red-900 px-8 py-4 rounded-full font-bold text-lg"
            >
              Оставить заявку
            </Link>
            <a 
              href="tel:+79105250060"
              className="border-2 border-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-600/20 transition-colors"
            >
              <Phone className="w-5 h-5 inline mr-2" />
              +7 (910) 525-00-60
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-gray-500">
        <div className="container mx-auto px-4">
          <p>© 2026 АВТОВЫКУП Обнинск. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}

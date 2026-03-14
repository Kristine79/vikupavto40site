import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vikupavto40.ru'),
  title: {
    default: "АвтоВыкуп Калуга, Тула, Обнинск - Выкуп автомобилей за 15 минут",
    template: "%s | АвтоВыкуп40"
  },
  description: "Срочный выкуп автомобилей, мотоциклов и спецтехники в Калуге, Туле и Обнинске. Бесплатный вывоз на эвакуаторе. Оценка за 5 минут. Честные цены. Звоните: 79105954668",
  keywords: ["выкуп авто", "выкуп автомобилей", "продать авто", "выкуп мотоциклов", "выкуп спецтехники", "автовыкуп Калуга", "автовыкуп Тула", "автовыкуп Обнинск", "срочный выкуп авто", "выкуп битых авто", "выкуп авто с пробегом", "продать машину Калуга", "автовыкуп быстрый", "выкуп неисправных авто"],
  authors: [{ name: "АвтоВыкуп40" }],
  creator: "АвтоВыкуп40",
  publisher: "АвтоВыкуп40",
  formatDetection: {
    email: false,
    address: false,
    telephone: true
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "АвтоВыкуп Калуга, Тула, Обнинск - Выкуп автомобилей за 15 минут",
    description: "Срочный выкуп автомобилей, мотоциклов и спецтехники в Калуге, Туле и Обнинске. Бесплатный вывоз на эвакуаторе.",
    url: "https://vikupavto40.ru",
    siteName: "АвтоВыкуп40",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "АвтоВыкуп Калуга, Тула, Обнинск - Выкуп автомобилей за 15 минут",
    description: "Срочный выкуп автомобилей, мотоциклов и спецтехники. Бесплатный вывоз на эвакуаторе.",
    creator: "@avtovikupkaluga_bot",
    site: "@avtovikupkaluga_bot"
  },
  alternates: {
    canonical: "https://vikupavto40.ru",
    languages: {
      "ru": "https://vikupavto40.ru"
    }
  },
  category: "business",
  classification: "Car Buying Service",
  verification: {
    yandex: "yandex_verification_code",
    google: "google_verification_code"
  }
};

// JSON-LD Structured Data for LocalBusiness
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "АвтоВыкуп40",
  "alternateName": "АвтоВыкуп Калуга",
  "description": "Срочный выкуп автомобилей, мотоциклов и спецтехники в Калуге, Туле и Обнинске",
  "url": "https://vikupavto40.ru",
  "telephone": "+79105954668",
  "priceRange": "₽₽₽₽",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Калуга",
    "addressRegion": "Калужская область",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "54.5293",
    "longitude": "36.2754"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "54.5293",
      "longitude": "36.2754"
    },
    "geoRadius": "200000"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  ],
  "image": "https://vikupavto40.ru/og-image.jpg",
  "sameAs": [
    "https://t.me/avtovikupkaluga_bot"
  ],
  "serviceType": ["Автовыкуп", "Выкуп мотоциклов", "Выкуп спецтехники", "Срочный выкуп авто"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Услуги выкупа",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Выкуп легковых автомобилей",
        "description": "Выкуп иномарок и отечественных автомобилей с пробегом и без, после ДТП, неисправных"
      },
      {
        "@type": "Offer",
        "name": "Выкуп мотоциклов",
        "description": "Выкуп мотоциклов, скутеров, квадроциклов, снегоходов"
      },
      {
        "@type": "Offer",
        "name": "Выкуп спецтехники",
        "description": "Выкуп экскаваторов, погрузчиков, комбайнов, строительной и сельхозтехники"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

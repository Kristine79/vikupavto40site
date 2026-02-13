import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "АвтоВыкуп Калуга, Тула, Обнинск - Выкуп автомобилей за 15 минут",
  description: "Срочный выкуп автомобилей, мотоциклов и спецтехники в Калуге, Туле и Обнинске. Бесплатный вывоз на эвакуаторе. Оценка за 5 минут. Честные цены. Звоните: +7 (4842) 55-55-55",
  keywords: "выкуп авто, выкуп автомобилей, продать авто, выкуп мотоциклов, выкуп спецтехники, автовыкуп Калуга, автовыкуп Тула, автовыкуп Обнинск, срочный выкуп авто, выкуп битых авто",
  authors: [{ name: "АвтоВыкуп" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "АвтоВыкуп Калуга, Тула, Обнинск - Выкуп автомобилей за 15 минут",
    description: "Срочный выкуп автомобилей, мотоциклов и спецтехники. Бесплатный вывоз на эвакуаторе.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

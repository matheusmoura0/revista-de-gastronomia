import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Revista de Gastronomia | Comer é cultura",description:"Receitas, restaurantes, tendências e histórias para quem ama comer bem.",openGraph:{title:"Revista de Gastronomia",description:"O prazer de comer bem, todos os dias.",type:"website"},icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}

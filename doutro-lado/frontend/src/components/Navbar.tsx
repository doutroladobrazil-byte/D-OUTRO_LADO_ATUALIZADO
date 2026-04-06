import Link from "next/link";
import { Globe, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo-mark">
          <span className="eyebrow">Brazilian Premium Export</span>
          <strong>D’OUTRO LADO</strong>
        </Link>
        <nav className="nav-links">
          <Link href="/">Início</Link>
          <Link href="/brands/casa">Coleções</Link>
          <Link href="/gift-builder">Presentes</Link>
          <Link href="/about">Sobre</Link>
          <Link href="/wholesale">Atacado</Link>
          <Link href="/international-shipping">Envio internacional</Link>
          <Link href="/contact">Contato</Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="Buscar"><Search size={18} /></button>
          <button className="icon-btn" aria-label="Idioma e moeda"><Globe size={18} /></button>
          <Link className="icon-btn" href="/favorites" aria-label="Favoritos"><Heart size={18} /></Link>
          <Link className="icon-btn" href="/account" aria-label="Conta"><User size={18} /></Link>
          <Link className="icon-btn" href="/cart" aria-label="Carrinho"><ShoppingBag size={18} /></Link>
          <button className="icon-btn" aria-label="Abrir menu"><Menu size={18} /></button>
        </div>
      </div>
    </header>
  );
}

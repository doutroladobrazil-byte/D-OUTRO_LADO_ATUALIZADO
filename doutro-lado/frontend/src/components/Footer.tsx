import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container grid-4">
        <div className="stack-16">
          <div className="logo-mark">
            <span className="eyebrow">D’OUTRO LADO</span>
            <strong>Brazilian Premium Export</strong>
          </div>
          <p className="body">
            Curadoria brasileira premium para casa, moda e presentes com experiência internacional refinada.
          </p>
        </div>
        <div className="stack-12">
          <strong>Institucional</strong>
          <Link href="/about">Sobre a marca</Link>
          <Link href="/contact">Contato</Link>
          <Link href="/international-shipping">Envio internacional</Link>
          <Link href="/wholesale">Atacado</Link>
        </div>
        <div className="stack-12">
          <strong>Categorias</strong>
          <Link href="/brands/casa">Casa & Cerâmica</Link>
          <Link href="/brands/moda">Moda & Couro</Link>
          <Link href="/gift-builder">Kits de presente</Link>
          <Link href="/search">Busca premium</Link>
        </div>
        <div className="stack-12">
          <strong>Newsletter</strong>
          <p className="body">Receba editoriais, lançamentos e oportunidades comerciais.</p>
          <input className="input" placeholder="Seu e-mail" />
          <button className="btn btn-primary">Assinar</button>
        </div>
      </div>
    </footer>
  );
}

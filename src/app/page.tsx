import { Header } from "@/src/components/navigation/header";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 w-full px-2 md:px-6">
      <Header />
    </div>
  );
}

// TODOs:
// - migliorare l'editor con supporto a formule matematiche, codice, ecc.
// - aggiungere formulario d'esempio nel nuovo account

// - [COMMUNITY] cerca e aggiungi ai preferiti formulari e rendi tuo (modifiche i formulari pubblici e salvali nei tuoi)
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
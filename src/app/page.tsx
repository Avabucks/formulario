import { Header } from "@/src/components/navigation/header";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 w-full px-2 md:px-6">
      <Header />
    </div>
  );
}

// TODOs:
// - edit capitoli e argomenti con modifica titolo, modifca ordine ed eliminazione
// - migliorare l'editor con supporto a formule matematiche, codice, ecc.
// - aggiungere funzionalità di ricerca e filtro per formulari, capitoli e argomenti
// - aggiungere preferiti formulari e rendi tuo (modifiche i formulari pubblici e salvali nei tuoi)
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
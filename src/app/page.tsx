import { Header } from "@/src/components/navigation/header";
import { Cta } from "../components/landing/cta";
import { Faq } from "../components/landing/faq";
import { Features } from "../components/landing/features";
import { Footer } from "../components/landing/footer";
import { Hero } from "../components/landing/hero";
import { VideoDemo } from "../components/landing/video-demo";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <VideoDemo />
      <Features />
      <Faq />
      <Cta />
      <Footer />
    </>
  );
}

// TODOs:

// - [FIX]
// 3. Medium: Account deletion relies only on the session cookie server-side,
//    bypassing the stronger “recent login” guarantee enforced in the client. The
//    client does reauthentication before calling the API in src/components/auth/
//    delete-account.tsx:27, but the server endpoint in src/app/api/auth/delete/
//    route.ts:7 ignores that completely and immediately deletes all data for
//    session.uid at lines 14-15. If a stale session cookie is stolen or left
//    active on a shared machine, an attacker can erase the victim’s local data
//    without passing Firebase’s recent-auth check.

// - [EDITOR]
// - undo non funziona quando lo schiacci (problema: disabled=true)
// -- [x] 6 HEADERS
// -- [x] BOLD
// -- [x] ITALIC
// -- [x] ORDERED LIST
// -- [x] UNORDERED LIST
// -- [x] QUOTE
// -- [x] DIVIDER
// -- [ ] INLINE CODE
// -- [ ] BLOCK CODE (deve rimettere il focus e sistemare item attivo)
// -- [ ] MERMAID
// -- [ ] INLINE MATH
// -- [ ] BLOCK MATH (deve rimettere il focus e sistemare items)
// -- [ ] SIMBOLI
// -- [ ] TABLE

// - [GENERALI]
// - report che manda mail a admin (mail nell'env) solo se la formula non è tua (in impostazioni)
// - aggiornare kb shortcuts e termini condizioni
// - per eliminare l'account deve scrivere una parola chiave (es. ELIMINA) per confermare, e deve essere case sensitive (per evitare click accidentali) controllata sul server

// - [PREMIUM]
// - abbonamento a 1,99 che ti da accesso illimitato a creazione formulari e 200 crediti AI (senza crediti ma con tokens cosi e piu preciso ma senza scrivere il ilmite, semplicemente quando finiscono esce popup)

// - [NOVITA]
// - ⁠categorie per organizzare formulari
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - flashcards con ai per ogni argomento
// - image manager nelle impostazioni
// - tree del formulario (accessibile da tasto di fianco a impostazioni e apre drawer laterale)
// - console errori
// - note protette da password
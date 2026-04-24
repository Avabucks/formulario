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
// 1. High: Private formulari can be cloned by any authenticated user via direct
//    object reference in src/app/api/formulari/take/route.ts:28. The route loads
//    SELECT * FROM formulari WHERE beautiful_id = $1 and then copies all
//    chapters and topics at lines 46-70 without checking owner_uid = session.uid
//    or visibility > 0. If an attacker learns or guesses a private beautiful_id,
//    they can exfiltrate the full private content by duplicating it into their
//    own account.
// 2. High: Stored XSS is possible through Mermaid blocks in src/components/
//    editor/editor-katex/markdown-components.tsx:112. The preview initializes
//    Mermaid with securityLevel: 'loose' at line 115, renders attacker-
//    controlled diagram text, and injects the returned SVG with innerHTML at
//    lines 109 and 125. That combination is unsafe for untrusted content and can
//    let malicious markdown execute script or event-handler payloads when
//    another user opens the page.
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
// -- [ ] 6 HEADERS
// -- [x] BOLD
// -- [x] ITALIC
// -- [x] ORDERED LIST
// -- [x] UNORDERED LIST
// -- [x] QUOTE
// -- [x] DIVIDER
// -- [ ] CODE
// -- [ ] MERMAID
// -- [ ] INLINE MATH
// -- [ ] BLOCK MATH
// -- [ ] TABLE

// - [GENERALI]
// - seo
// - report che manda mail a admin (mail nell'env) solo se la formula non è tua (in impostazioni)
// - aggiornare kb shortcuts e termini condizioni

// - [PREMIUM]
// - abbonamento a 1,99 che ti da accesso illimitato a creazione formulari e 200 crediti AI (senza crediti ma con tokens cosi e piu preciso ma senza scrivere il ilmite, semplicemente quando finiscono esce popup)

// - [NOVITA]
// - ⁠categorie per organizzare formulari
// - aggiungere funzionalità di esportazione (pdf, markdown, ecc.)
// - image manager nelle impostazioni
// - tree del formulario (accessibile da tasto di fianco a impostazioni e apre drawer laterale)
// - console errori
// - note protette da password
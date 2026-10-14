export type LegalDocumentId = "privacy" | "terms" | "cookies";

export interface LegalDocument {
  title: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  /** Sentence that introduces the contact address, when one is configured. */
  contact: string;
}

/** Date of the last substantive change to any of the documents below. */
export const LEGAL_UPDATED_AT = "2026-10-14";

const fr: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: "Politique de confidentialité",
    intro:
      "Cette page explique quelles données personnelles Fly & taxi traite, pourquoi, et comment exercer vos droits au titre du Règlement général sur la protection des données (RGPD).",
    sections: [
      {
        heading: "Données que nous traitons",
        paragraphs: [
          "Compte : prénom, nom, adresse e-mail, numéro de téléphone et mot de passe. Le mot de passe est stocké sous forme d'empreinte chiffrée, jamais en clair.",
          "Réservations : les vols choisis, l'identité des passagers que vous saisissez, les services ajoutés (bagages, transfert, enregistrement) et l'état de la réservation.",
          "Paiement : les paiements par carte sont traités par Stripe. Nous ne recevons ni ne conservons votre numéro de carte.",
          "Préférences : la langue et la devise choisies, ainsi que votre réponse à la demande de consentement, sont enregistrées dans votre navigateur.",
        ],
      },
      {
        heading: "Pourquoi nous les traitons",
        paragraphs: [
          "Pour créer et sécuriser votre compte, puis exécuter vos réservations : ce traitement est nécessaire à l'exécution du contrat qui nous lie.",
          "Pour respecter nos obligations légales, notamment comptables.",
          "Pour mesurer l'audience du site, uniquement si vous y avez consenti.",
        ],
      },
      {
        heading: "Destinataires",
        paragraphs: [
          "Vos données sont accessibles à Fly & taxi et à ses prestataires techniques, dans la limite de ce qui est nécessaire à leur mission : hébergement du site et de la base de données, et paiement (Stripe).",
          "Lorsque vous poursuivez une réservation sur le site d'une compagnie ou d'une agence partenaire, c'est ce partenaire qui collecte vos données, selon sa propre politique.",
          "Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.",
        ],
      },
      {
        heading: "Durée de conservation",
        paragraphs: [
          "Les données de compte sont conservées tant que le compte existe, puis supprimées à sa clôture.",
          "Les données de réservation sont conservées pendant la durée exigée par nos obligations légales, puis supprimées ou anonymisées.",
        ],
      },
      {
        heading: "Vos droits",
        paragraphs: [
          "Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, leur portabilité, ou la limitation de leur traitement, et vous opposer à un traitement. Vous pouvez retirer votre consentement à la mesure d'audience à tout moment depuis le lien « Gérer les cookies » en bas de page.",
          "Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL (cnil.fr).",
        ],
      },
    ],
    contact: "Pour toute demande concernant vos données, écrivez-nous à",
  },
  terms: {
    title: "Conditions générales d'utilisation",
    intro:
      "Ces conditions encadrent l'utilisation du site Fly & taxi. En créant un compte ou en effectuant une réservation, vous les acceptez.",
    sections: [
      {
        heading: "Le service",
        paragraphs: [
          "Fly & taxi permet de rechercher des vols, de comparer les tarifs proposés par des compagnies et des agences, de réserver, et d'ajouter des services au sol comme un transfert à l'arrivée.",
          "Certaines offres renvoient vers le site du vendeur. Dans ce cas, la réservation est conclue avec ce vendeur, selon ses propres conditions.",
        ],
      },
      {
        heading: "Votre compte",
        paragraphs: [
          "Vous vous engagez à fournir des informations exactes et à garder votre mot de passe confidentiel. Vous êtes responsable de l'activité réalisée depuis votre compte.",
          "Nous pouvons suspendre un compte en cas d'usage frauduleux ou contraire à ces conditions.",
        ],
      },
      {
        heading: "Prix et réservations",
        paragraphs: [
          "Les prix sont affichés dans la devise que vous choisissez. La conversion est indicative : le montant débité est celui confirmé au moment du paiement.",
          "Les tarifs aériens évoluent rapidement. Une réservation n'est ferme qu'une fois confirmée.",
          "Les conditions de modification et d'annulation dépendent du tarif choisi et du transporteur. Elles vous sont indiquées avant le paiement.",
        ],
      },
      {
        heading: "Contenus générés par intelligence artificielle",
        paragraphs: [
          "Les guides de destination peuvent être rédigés avec l'aide d'une intelligence artificielle. Ils sont signalés comme tels et fournis à titre indicatif : vérifiez les informations de sécurité et les formalités auprès des sources officielles avant de partir.",
        ],
      },
      {
        heading: "Responsabilité",
        paragraphs: [
          "Le transport est assuré par les compagnies aériennes et les prestataires de transfert, qui en sont responsables. Fly & taxi s'efforce de fournir des informations exactes mais ne garantit pas l'absence d'erreur ou d'interruption du site.",
        ],
      },
      {
        heading: "Droit applicable",
        paragraphs: [
          "Ces conditions sont soumises au droit français. Si vous êtes consommateur, vous bénéficiez des dispositions impératives de la loi de votre pays de résidence.",
        ],
      },
      {
        heading: "Crédits",
        paragraphs: [
          "Photo de la berline : « Mercedes-Benz S 320 CDI 4MATIC L (V 221) – Seitenansicht » par M 93, Wikimedia Commons, sous licence CC BY-SA 3.0 DE. L'image a été détourée ; la version modifiée est diffusée sous la même licence.",
        ],
      },
    ],
    contact: "Une question sur ces conditions ? Écrivez-nous à",
  },
  cookies: {
    title: "Politique de cookies",
    intro:
      "Fly & taxi utilise très peu de traceurs. Aucun n'est publicitaire.",
    sections: [
      {
        heading: "Stockage nécessaire au fonctionnement",
        paragraphs: [
          "Votre navigateur conserve votre session de connexion, la langue et la devise choisies, ainsi que votre réponse à la demande de consentement. Ces informations sont indispensables au service et ne nécessitent pas votre accord.",
          "Lors d'un paiement, Stripe dépose ses propres cookies pour sécuriser la transaction et prévenir la fraude.",
        ],
      },
      {
        heading: "Mesure d'audience",
        paragraphs: [
          "Avec votre accord, nous utilisons Vercel Web Analytics pour compter les visites et savoir quelles pages sont consultées. Cet outil ne dépose pas de cookie et ne permet pas de vous suivre d'un site à l'autre.",
          "Sans votre accord, il n'est pas chargé.",
        ],
      },
      {
        heading: "Changer d'avis",
        paragraphs: [
          "Votre choix est conservé six mois. Vous pouvez le modifier à tout moment avec le lien « Gérer les cookies » en bas de chaque page.",
        ],
      },
    ],
    contact: "Une question ? Écrivez-nous à",
  },
};

const en: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: "Privacy policy",
    intro:
      "This page explains which personal data Fly & taxi processes, why, and how to exercise your rights under the General Data Protection Regulation (GDPR).",
    sections: [
      {
        heading: "Data we process",
        paragraphs: [
          "Account: first name, last name, email address, phone number and password. The password is stored as a cryptographic hash, never in plain text.",
          "Bookings: the flights you choose, the passenger details you enter, added services (baggage, transfer, check-in) and the booking status.",
          "Payment: card payments are handled by Stripe. We never receive or store your card number.",
          "Preferences: your chosen language and currency, and your answer to the consent request, are saved in your browser.",
        ],
      },
      {
        heading: "Why we process it",
        paragraphs: [
          "To create and secure your account and carry out your bookings: this is necessary to perform our contract with you.",
          "To meet our legal obligations, including accounting.",
          "To measure site traffic, only if you have consented.",
        ],
      },
      {
        heading: "Who receives it",
        paragraphs: [
          "Your data is available to Fly & taxi and its technical providers, limited to what their job requires: hosting of the site and database, and payment (Stripe).",
          "When you continue a booking on a partner airline's or agency's site, that partner collects your data under its own policy.",
          "We do not sell your data or use it for advertising.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Account data is kept for as long as the account exists and deleted when it is closed.",
          "Booking data is kept for as long as our legal obligations require, then deleted or anonymised.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You can ask to access, correct, erase or export your data, restrict its processing, or object to it. You can withdraw your consent to audience measurement at any time using the “Manage cookies” link at the bottom of the page.",
          "If you believe your rights are not respected, you can lodge a complaint with your data protection authority (in France, the CNIL).",
        ],
      },
    ],
    contact: "For any request about your data, write to",
  },
  terms: {
    title: "Terms of use",
    intro:
      "These terms govern the use of the Fly & taxi site. By creating an account or making a booking, you accept them.",
    sections: [
      {
        heading: "The service",
        paragraphs: [
          "Fly & taxi lets you search for flights, compare fares from airlines and agencies, book, and add ground services such as an arrival transfer.",
          "Some offers link to the seller's site. In that case the booking is made with that seller, under its own terms.",
        ],
      },
      {
        heading: "Your account",
        paragraphs: [
          "You agree to provide accurate information and keep your password confidential. You are responsible for activity carried out from your account.",
          "We may suspend an account used fraudulently or in breach of these terms.",
        ],
      },
      {
        heading: "Prices and bookings",
        paragraphs: [
          "Prices are shown in the currency you choose. Conversion is indicative: the amount charged is the one confirmed at payment.",
          "Air fares change quickly. A booking is only firm once confirmed.",
          "Change and cancellation conditions depend on the fare and the carrier. They are shown to you before payment.",
        ],
      },
      {
        heading: "AI-generated content",
        paragraphs: [
          "Destination guides may be written with the help of artificial intelligence. They are labelled as such and provided for guidance only: check safety information and entry requirements with official sources before you travel.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Transport is provided by the airlines and transfer operators, who are responsible for it. Fly & taxi works to keep information accurate but does not guarantee the site is free of errors or interruptions.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by French law. If you are a consumer, you keep the mandatory protections of the law of your country of residence.",
        ],
      },
      {
        heading: "Credits",
        paragraphs: [
          "Sedan photo: “Mercedes-Benz S 320 CDI 4MATIC L (V 221) – Seitenansicht” by M 93, Wikimedia Commons, licensed CC BY-SA 3.0 DE. The background was removed; the modified version is shared under the same licence.",
        ],
      },
    ],
    contact: "A question about these terms? Write to",
  },
  cookies: {
    title: "Cookie policy",
    intro: "Fly & taxi uses very few trackers. None are for advertising.",
    sections: [
      {
        heading: "Storage the site needs to work",
        paragraphs: [
          "Your browser keeps your sign-in session, your chosen language and currency, and your answer to the consent request. This is essential to the service and does not require your agreement.",
          "During a payment, Stripe sets its own cookies to secure the transaction and prevent fraud.",
        ],
      },
      {
        heading: "Audience measurement",
        paragraphs: [
          "With your agreement, we use Vercel Web Analytics to count visits and see which pages are viewed. It sets no cookie and cannot follow you from one site to another.",
          "Without your agreement, it is not loaded.",
        ],
      },
      {
        heading: "Changing your mind",
        paragraphs: [
          "Your choice is kept for six months. You can change it at any time with the “Manage cookies” link at the bottom of every page.",
        ],
      },
    ],
    contact: "A question? Write to",
  },
};

/** French readers get the French text; every other locale falls back to English. */
export function getLegalDocument(id: LegalDocumentId, language: string): LegalDocument {
  return (language.startsWith("fr") ? fr : en)[id];
}

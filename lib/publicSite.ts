import { landingPageStats, seoLandingPages, serviceCards } from "./mockData";

export const publicFaqs = [
  {
    question: "What ID is acceptable?",
    answer:
      "Bring a government-issued ID such as a driver license, state ID, passport, or other allowed credential. In-person Ohio workflows generally require a current ID or one expired no more than 3 years.",
  },
  {
    question: "Can you notarize a document if it is already signed?",
    answer:
      "Sometimes, depending on the act type, but the safest approach is to wait until the appointment unless you were specifically instructed otherwise.",
  },
  {
    question: "Can you come to a hospital or nursing home?",
    answer:
      "Yes. Hospital, nursing home, hospice, and bedside visits are supported, with readiness and access details confirmed in advance.",
  },
  {
    question: "Can you notarize vehicle titles?",
    answer:
      "Yes, but Ohio title matters receive extra screening. If required title sections are blank, the request is blocked or routed to manual review.",
  },
  {
    question: "Can you notarize for someone out of state?",
    answer:
      "For in-person work, the signer must appear before the notary in Ohio. For RON, the Ohio notary must be physically located in Ohio while the signer may be elsewhere if the session is otherwise compliant.",
  },
  {
    question: "Can you do online notarization?",
    answer:
      "Yes, when the notary's Ohio RON authorization is active. RON requires identity proofing, credential analysis, and live audio-video.",
  },
  {
    question: "Can you help me choose the right document?",
    answer:
      "No. Unless separately licensed as an attorney, the notary cannot give legal advice, select forms, or decide whether a document is legally sufficient.",
  },
  {
    question: "What if my document has blanks?",
    answer:
      "The appointment may be blocked until the document is complete. Ohio workflows should not proceed with incomplete or materially blank documents.",
  },
  {
    question: "What if I need witnesses?",
    answer:
      "The booking flow asks about witnesses so the appointment can be prepared correctly. Witness availability should be confirmed before the appointment.",
  },
  {
    question: "What happens if the appointment cannot be completed?",
    answer:
      "The portal will show the matter as could not complete, and any allowed fees or revised next steps will be communicated clearly.",
  },
];

export const homepageHighlights = [
  "Ohio commissioned workflow",
  "Same-day and evening availability",
  "Mobile appointments across Columbus",
  "RON-ready operations when authorized",
];

export const complianceMessages = [
  "A notary is not a lawyer unless separately licensed as one.",
  "The notary cannot give legal advice, select forms, or decide whether a document is legally sufficient.",
  "The signer must properly appear before the notary in person or through compliant Ohio RON.",
  "In-person notarial act fees are capped by Ohio law and shown separately from travel and convenience fees.",
  "Travel fees must be separately disclosed and agreed to in advance.",
  "RON is offered only when Ohio online authorization is active and includes identity proofing, credential analysis, and live audio-video.",
  "Copy-certification style requests are blocked because Ohio notaries generally may not certify a document is a true copy.",
];

export const bookingSteps = [
  "Choose service mode",
  "Choose document type",
  "Add signer details",
  "Confirm logistics",
  "Complete readiness screening",
  "Review quote and disclosures",
  "Create portal account",
  "Confirm booking",
];

export const pricingSnapshot = [
  "In-person notarial acts: up to $5 per act",
  "RON notarial acts: up to $30 per act",
  "RON technology fee: up to $10 per session",
  "Travel, after-hours, and specialty fees shown separately",
];

export const landingPagesBySlug = Object.fromEntries(
  seoLandingPages.map((page) => [page.slug, page]),
);

export const landingStatsBySlug = Object.fromEntries(
  landingPageStats.map((item) => [item.slug, item]),
);

export function getServiceCards() {
  return serviceCards;
}

// Campaign photography cut from real INDUKA product photos (src/assets/real).
// These are editorial images only — they never decide which shop a product belongs to.
import whistle from "@/assets/real/cat-pendants.jpg";
import trident from "@/assets/real/col-ardh-chand.jpg";
import serpent from "@/assets/real/col-nakshatra.jpg";
import lionTag from "@/assets/real/col-purnima.jpg";
import butterflyBlue from "@/assets/real/cat-earrings.jpg";
import butterflyPink from "@/assets/real/col-chandni.jpg";
import butterflyGreen from "@/assets/real/col-chandrika.jpg";
import butterflyStuds from "@/assets/real/col-tara.jpg";
import giftingPackaging from "@/assets/induka-gifting-packaging.jpg.asset.json";
import mensCampaign from "@/assets/campaign/mens-campaign.jpg";
import womensCampaign from "@/assets/campaign/womens-campaign.jpg";

export type CampaignImage = { src: string; alt: string };

export const menImagery: CampaignImage[] = [
  { src: lionTag, alt: "Engraved sterling silver tag pendant on a box chain" },
  { src: serpent, alt: "Oxidised sterling silver serpent pendant on a box chain" },
  { src: trident, alt: "Sterling silver trident pendant on a box chain" },
  { src: whistle, alt: "Engraved sterling silver whistle pendant on a snake chain" },
];

export const womenImagery: CampaignImage[] = [
  { src: butterflyBlue, alt: "Blue enamel butterfly earrings in sterling silver" },
  { src: butterflyPink, alt: "Pink enamel butterfly earrings in sterling silver" },
  { src: butterflyGreen, alt: "Green enamel butterfly earring in sterling silver" },
  { src: butterflyStuds, alt: "Blue butterfly stud earrings in sterling silver" },
];

export const giftingImage: CampaignImage = {
  src: giftingPackaging.url,
  alt: "INDUKA gift box with the Jaguar Noir pendant and blue butterfly stud earrings on satin",
};

// AI-generated fashion campaign editorials for the homepage Men/Women sections.
// Deliberately model-led (no product photography) so the sections read as a
// luxury fashion campaign rather than a catalogue.
export const menCampaignImage: CampaignImage = {
  src: mensCampaign,
  alt: "Close-up of a man's neck and shoulders wearing the Jaguar Noir panther pendant on a silver chain, dark luxury campaign photograph",
};

export const womenCampaignImage: CampaignImage = {
  src: womensCampaign,
  alt: "Close-up of a woman's ear wearing the Oceanic Wings iridescent blue-green butterfly stud, dark luxury campaign photograph",
};

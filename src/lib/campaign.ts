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
import gifting from "@/assets/sample/gifting-blush.jpg";
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

export const giftingImage: CampaignImage = { src: gifting, alt: "Gift box with silver earrings on satin" };

// AI-generated fashion campaign editorials for the homepage Men/Women sections.
// Deliberately model-led (no product photography) so the sections read as a
// luxury fashion campaign rather than a catalogue.
export const menCampaignImage: CampaignImage = {
  src: mensCampaign,
  alt: "Male model in a deep chocolate overcoat and black knitwear with a subtle silver chain, luxury fashion campaign photograph",
};

export const womenCampaignImage: CampaignImage = {
  src: womensCampaign,
  alt: "Female model in an ivory silk blouse and champagne tailored trousers in soft window light, luxury fashion campaign photograph",
};

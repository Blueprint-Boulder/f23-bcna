// ButterflyDB.jsx
import { WildlifeDB } from "./WildlifeDB";

export function ButterflyDB() {
  return (
    <WildlifeDB
      type="butterflies"
      label="Butterfly"
      heroImage="/butterfly-hero.png"
      heroPosition="25% 65%"
      title={<>Explore the <br /> Butterflies of <br /> Colorado's <br /> Front Range</>}
    />
  );
}
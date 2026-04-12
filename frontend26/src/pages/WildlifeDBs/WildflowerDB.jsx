import { WildlifeDB } from "./WildlifeDB";

export function WildflowerDB() {
  return (
    <WildlifeDB
      type="wildflowers"
      label="Wildflower"
      heroImage="/wildflower-hero.jpg"
      heroPosition="25% 50%" 
      title={<>Explore the <br /> Wildflowers of <br /> Colorado's <br /> Front Range</>}
    />
  );
}
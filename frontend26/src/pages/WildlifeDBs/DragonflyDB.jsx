// DragonflyDB.jsx
import { WildlifeDB } from "./WildlifeDB";

export function DragonflyDB() {
  return (
    <WildlifeDB
      type="dragonflies"
      label="Dragonfly"
      heroImage="/dragonfly-hero.JPG"
      heroPosition="0% 50%"
      title={<>Explore the <br /> Dragonflies of <br /> Colorado's <br /> Front Range</>}
    />
  );
}
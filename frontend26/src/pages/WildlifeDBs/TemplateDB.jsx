/**
 * TemplateDB renders a generic WildlifeDB page for the template dataset.
 * This page uses the shared WildlifeDB component to avoid duplication.
 */
import { WildlifeDB } from "./WildlifeDB";

export function TemplateDB() {
  return (
    <WildlifeDB
      type="template"
      label="Template"
      heroImage="/template-hero.jpg"
      heroPosition="50% 50%"
      title={<>Explore the <br /> Templates of <br /> Colorado's <br /> Front Range</>}
    />
  );
}
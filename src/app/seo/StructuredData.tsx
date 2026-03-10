import { getEntityGraph } from "./schemas";

export function StructuredData() {
  const graph = getEntityGraph();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

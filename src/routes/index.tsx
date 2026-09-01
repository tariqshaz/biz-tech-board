import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board/Board";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenBoard — Your own Kanban board" },
      {
        name: "description",
        content:
          "A fast, free Kanban board: create lists, add cards, drag them between columns, and everything stays saved on your device.",
      },
      { property: "og:title", content: "OpenBoard — Your own Kanban board" },
      {
        property: "og:description",
        content:
          "Create lists, add cards, drag and drop between columns. A self-owned alternative to Trello.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Board />;
}

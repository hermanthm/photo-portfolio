import { parseAboutContent } from "@/lib/parse-about-content";

type AboutContentProps = {
  content: string;
};

export function AboutContent({ content }: AboutContentProps) {
  const blocks = parseAboutContent(content);

  return (
    <div className="mt-8 space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              key={`${block.type}-${index}`}
              className="pt-2 ui-eyebrow"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`${block.type}-${index}`}
              className="space-y-3 ui-body-lg"
            >
              {block.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-accent" aria-hidden="true">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={`${block.type}-${index}`}
            className="ui-body-lg"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
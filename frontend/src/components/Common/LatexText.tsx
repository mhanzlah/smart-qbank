import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface LatexTextProps {
  children: string;
}

export function LatexText({ children }: LatexTextProps) {
  const parts = children.split(/(\$\$[\s\S]*?\$\$|\$[^$]+\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }

        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

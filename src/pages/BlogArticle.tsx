import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { blogArticles } from "@/data/blogArticles";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = blogArticles.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — is this ok?`;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", article.metaDescription);
    }
  }, [article]);

  if (!article) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12">
        <article className="max-w-2xl mx-auto space-y-6">
          <BackButton to="/blog" />
          <h1 className="text-h1">{article.title}</h1>

          <div className="space-y-4">
            {article.content.map((section, i) => {
              switch (section.type) {
                case "heading":
                  return (
                    <h2 key={i} className="text-h2 mt-8 mb-2">
                      {section.text}
                    </h2>
                  );
                case "paragraph":
                  return (
                    <p key={i} className="text-body text-muted-foreground">
                      {section.text}
                    </p>
                  );
                case "list":
                  return (
                    <ul key={i} className="list-disc pl-6 space-y-1.5">
                      {section.items?.map((item, j) => (
                        <li key={j} className="text-body text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                case "cta":
                  return (
                    <div key={i} className="pt-4 pb-2">
                      <Link to="/check-in">
                        <Button className="w-full sm:w-auto">{section.text}</Button>
                      </Link>
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>

          <div className="pt-6 border-t border-border/30">
            <a
              href="https://isthisok.app"
              className="text-caption text-muted-foreground hover:text-foreground transition-colors"
            >
              isthisok.app
            </a>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogArticle;

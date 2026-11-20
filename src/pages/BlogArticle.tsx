import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { blogArticles } from "@/data/blogArticles";

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) return <Navigate to="/blog" replace />;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    author: { "@type": "Organization", name: "ito" },
    publisher: { "@type": "Organization", name: "ito" },
    mainEntityOfPage: `https://isthisok.app/blog/${article.slug}`,
  };

  const faqs = article.content.flatMap((section) => section.faqs ?? []);
  const jsonLd = faqs.length
    ? [
        articleJsonLd,
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ]
    : articleJsonLd;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`${article.title} — ito`}
        description={article.metaDescription}
        path={`/blog/${article.slug}`}
        type="article"
        jsonLd={jsonLd}
      />
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
                      {section.link && (
                        <>
                          {" "}
                          <Link
                            to={section.link.to}
                            className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                          >
                            {section.link.text}
                          </Link>
                          .
                        </>
                      )}
                    </p>
                  );
                case "answer":
                  return (
                    <div key={i} className="rounded-lg border border-border bg-card p-5">
                      <p className="text-caption text-muted-foreground mb-1">Short answer</p>
                      <p className="text-body text-foreground">{section.text}</p>
                    </div>
                  );
                case "faq":
                  return (
                    <div key={i} className="space-y-5">
                      {section.faqs?.map((f, j) => (
                        <div key={j} className="space-y-1">
                          <h3 className="text-body font-medium text-foreground">{f.q}</h3>
                          <p className="text-body text-muted-foreground">{f.a}</p>
                        </div>
                      ))}
                    </div>
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

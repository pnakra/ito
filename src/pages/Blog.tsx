import { Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { blogArticles } from "@/data/blogArticles";

const Blog = () => {
  useEffect(() => {
    document.title = "Blog — is this ok?";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Articles about hookups, consent, and how to think through what happened.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-5 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <BackButton to="/" />
            <h1 className="text-h1 mb-2">Resources</h1>
            <p className="text-muted-foreground text-body">
              Honest articles about hookups, consent, and how to think through what happened.
            </p>
          </div>

          <div className="space-y-3">
            {blogArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="block bg-card shadow-card rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <h2 className="text-body font-medium mb-1">{article.title}</h2>
                <p className="text-muted-foreground text-caption">{article.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blog;

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Share, MoreVertical, PlusSquare, Download, Smartphone } from "lucide-react";

const Install = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-xl mx-auto space-y-6">
          <BackButton to="/" />
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-accent rounded-xl mb-4">
              <Smartphone className="w-6 h-6 text-muted-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Add to home screen</h1>
            <p className="text-muted-foreground text-sm">
              Quick, private access anytime.
            </p>
          </div>

          {/* iOS Instructions */}
          <Card className="p-5 sm:p-6 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-lg">🍎</span>
              </div>
              <div>
                <h2 className="font-medium text-foreground">iPhone / iPad</h2>
                <p className="text-xs text-muted-foreground">Safari browser</p>
              </div>
            </div>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <div>
                  <p className="text-foreground text-sm">
                    Tap the <strong>Share</strong> button
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                    <Share className="w-3.5 h-3.5" /> at the bottom of Safari
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <div>
                  <p className="text-foreground text-sm">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                    <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-foreground text-sm">
                  Tap <strong>"Add"</strong> in the top right corner
                </p>
              </li>
            </ol>
          </Card>

          {/* Android Instructions */}
          <Card className="p-5 sm:p-6 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h2 className="font-medium text-foreground">Android</h2>
                <p className="text-xs text-muted-foreground">Chrome browser</p>
              </div>
            </div>
            
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <div>
                  <p className="text-foreground text-sm">
                    Tap the <strong>menu</strong> button
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                    <MoreVertical className="w-3.5 h-3.5" /> three dots in top right
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <div>
                  <p className="text-foreground text-sm">
                    Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                    <Download className="w-3.5 h-3.5" /> Install app
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-foreground text-sm">
                  Tap <strong>"Install"</strong> to confirm
                </p>
              </li>
            </ol>
          </Card>

          {/* Why install */}
          <Card className="p-4 sm:p-5 bg-accent/30 border-border/50">
            <h3 className="font-medium text-foreground mb-2 text-sm">Why add to home screen?</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>✓ Quick access</li>
              <li>✓ Works offline</li>
              <li>✓ No app store needed</li>
              <li>✓ Still 100% private</li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;

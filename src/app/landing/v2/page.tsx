import { LandingFeatureV2 } from "@/components/landing-v2/LandingFeatureV2";
import { LandingFooterV2 } from "@/components/landing-v2/LandingFooterV2";
import { LandingHeaderV2 } from "@/components/landing-v2/LandingHeaderV2";
import { LandingHeroV2 } from "@/components/landing-v2/LandingHeroV2";
import { LandingUsageV2 } from "@/components/landing-v2/LandingUsageV2";

export default function LandingPageV2() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <LandingHeaderV2 />
      <main>
        <LandingHeroV2 />
        <section id="features">
          <LandingFeatureV2 />
        </section>
        <LandingUsageV2 />
      </main>
      <LandingFooterV2 />
    </div>
  );
}

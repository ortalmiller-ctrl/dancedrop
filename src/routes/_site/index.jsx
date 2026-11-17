import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/site/Hero";
import HowItWorks from "@/components/site/HowItWorks";
import LiveDemo from "@/components/site/LiveDemo";
import CharacterLibrary from "@/components/site/CharacterLibrary";
import PrivacySection from "@/components/site/PrivacySection";
import DownloadCta from "@/components/site/DownloadCta";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "DanceDrop · Consent-based remote animations for any screen" },
      {
        name: "description",
        content:
          "DanceDrop sends playful animated characters to screens that opted in. Install the companion, activate your device, and let a banana dance in the corner.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <LiveDemo />
      <CharacterLibrary />
      <PrivacySection />
      <DownloadCta />
    </>
  );
}
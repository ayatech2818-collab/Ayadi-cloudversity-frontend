import { Hero } from '@/components/website/sections/Hero';
import WhyChooseAyadi from '@/components/website/sections/WhyChooseAyadi';
import LearningPathways from '@/components/website/sections/LearningPathways';
import  FeaturedCourses from '@/components/website/sections/FeaturedCourses';
import HowItWorks from "@/components/website/sections/HowItWorks";
import CEOMessage from '@/components/website/sections/CEOMessage';
import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { PauseOffscreen } from '@/components/website/layout/PauseOffscreen';
import { ScrollProbe } from '@/components/website/layout/ScrollProbe';

export default function WebsiteHomePage() {
  return (
    <>
      <Hero />
      {/* Everything below stops animating while it is off screen. */}
      <PauseOffscreen />
      {/* <WhyChooseAyadi /> */}
      <LearningPathways />
      <CEOMessage />
      <HowItWorks />
      <FeaturedCourses />
      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />
      {/* Temporary, and silent without ?probe — see ScrollProbe.tsx. */}
      <ScrollProbe />
    </>
  );
}

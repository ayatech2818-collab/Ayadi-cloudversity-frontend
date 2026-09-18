'use client';

import { useCallback, useState } from 'react';

import GetStartedCta from '@/components/website/sections/GetStartedCta';

import { BrandCourses } from './BrandCourses';
import { CourseBrandTabs } from './CourseBrandTabs';
import { CoursesIntro } from './CoursesIntro';
import { Pathways } from './Pathways';
import { brandContentMap } from './dummyData';
import type { BrandId } from './types';

export function CoursesPageContent() {
  const [activeBrand, setActiveBrand] = useState<BrandId>('ayadi');

  /* Choosing from the intro or the pathway panels should also carry you down to
     that pathway's programmes; choosing from the sticky tabs should not,
     because you are already there. */
  const selectAndScroll = useCallback((id: BrandId) => {
    setActiveBrand(id);
    document.getElementById('programmes')?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <main>
      {/* GSAP-driven */}
      <CoursesIntro onSelectBrand={selectAndScroll} />

      {/* Visitor-driven expanding panels — no scroll-jacking */}
      <Pathways onSelectBrand={selectAndScroll} />

      <CourseBrandTabs activeBrand={activeBrand} onSelectBrand={setActiveBrand} />

      <BrandCourses activeBrand={activeBrand} data={brandContentMap[activeBrand]} />

      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />
    </main>
  );
}

'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Brain,
  Code2,
  Cpu,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { brandById } from '@/components/website/courses/brands';

import styles from './ayatech.module.css';
import {
  AYATECH_LOGO,
  FIELD,
  POINTS,
  SIGNALS,
  stopAyatechIntro,
  TRACES,
  type SignalId,
} from './ayatechIntro';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const brand = brandById.ayatech;

/** The 5 core capability areas defining the AyaTech spatial ecosystem */
const CAPABILITIES = [
  {
    id: 'innovation',
    index: '01',
    title: 'Innovation',
    icon: Sparkles,
    tag: 'Applied Research',
    positionStyle: { left: '50%', top: '9%', transform: 'translateX(-50%)' },
    svgCoord: { x: 500, y: 160 },
  },
  {
    id: 'cyber',
    index: '02',
    title: 'Cyber Security',
    icon: ShieldCheck,
    tag: 'Defense & Resilience',
    positionStyle: { left: '6%', top: '24%' },
    svgCoord: { x: 210, y: 290 },
  },
  {
    id: 'ai',
    index: '03',
    title: 'Artificial Intelligence',
    icon: Brain,
    tag: 'Autonomous Systems',
    positionStyle: { right: '6%', top: '24%' },
    svgCoord: { x: 790, y: 290 },
  },
  {
    id: 'software',
    index: '04',
    title: 'Software Development',
    icon: Code2,
    tag: 'Full-Stack & Cloud',
    positionStyle: { left: '8%', bottom: '15%' },
    svgCoord: { x: 250, y: 730 },
  },
  {
    id: 'digital',
    index: '05',
    title: 'Digital Technology',
    icon: Cpu,
    tag: 'Next-Gen Computing',
    positionStyle: { right: '8%', bottom: '15%' },
    svgCoord: { x: 750, y: 730 },
  },
];

export function AyatechWorld({ bare = true }: { bare?: boolean }) {
  const scopeRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const scope = scopeRef.current;
    const stage = stageRef.current;
    if (!scope || !stage) return;

    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();

      // Desktop Cinematic Experience (wide & allows motion)
      media.add(
        { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 768px)' },
        (context) => {
          const { motion: allowMotion, wide } = context.conditions as {
            motion: boolean;
            wide: boolean;
          };

          if (!allowMotion || !wide) return;

          // Adjust stage height to account for navbar clearance
          gsap.set(stage, { height: 'calc(100svh - 84px)' });

          // Atmospheric Spotlight elements
          const spotPrimary = scope.querySelector('[data-element="spotlight-primary"]');
          const spotSecondary = scope.querySelector('[data-element="spotlight-secondary"]');
          const spotAccent = scope.querySelector('[data-element="spotlight-accent"]');

          // Cinematic scene element references
          const introAct = scope.querySelector('[data-act="intro"]');
          const core = scope.querySelector('[data-element="core"]');
          const coreCallout = scope.querySelector('[data-element="core-callout"]');
          const spatialNodes = scope.querySelectorAll('[data-element="spatial-node"]');
          const networkSvg = scope.querySelector('[data-element="network-svg"]');
          const networkLines = scope.querySelectorAll('[data-element="network-line"]');

          // Identity scene element references
          const identityAct = scope.querySelector('[data-act="identity"]');
          const identityCard = scope.querySelector('[data-element="identity-card"]');
          const identityCardGlow = scope.querySelector('[data-element="identity-card-glow"]');
          const identityPill = scope.querySelector('[data-element="identity-pill"]');
          const identityPillSweep = scope.querySelector('[data-element="identity-pill-sweep"]');
          const identityLogo = scope.querySelector('[data-element="identity-logo"]');
          const identityWords = scope.querySelectorAll('[data-element="identity-motto-word"]');
          const identityTagline = scope.querySelector('[data-element="identity-tagline"]');
          const identityChips = scope.querySelectorAll('[data-element="identity-chip"]');
          const identityChipIcons = scope.querySelectorAll('[data-element="identity-chip-icon"]');
          const identityCta = scope.querySelector('[data-element="identity-cta"]');

          // Initial resting positions before scroll begins
          // SCENE 1: Start very light — soft off-white canvas with gentle, subtle blurred glow
          gsap.set(spotPrimary, { scale: 0.65, autoAlpha: 0.28, x: 0, y: 0 });
          gsap.set(spotSecondary, { scale: 0.55, autoAlpha: 0.16, x: 50, y: 30 });
          gsap.set(spotAccent, { scale: 0.5, autoAlpha: 0.1 });

          gsap.set(introAct, { autoAlpha: 1, y: 0 });
          gsap.set(core, { autoAlpha: 0.55, scale: 0.8, rotation: 0 });
          gsap.set(coreCallout, { autoAlpha: 0, y: 15 });
          gsap.set(spatialNodes, { autoAlpha: 0, scale: 0.4, z: -120 });
          gsap.set(networkSvg, { autoAlpha: 0 });
          gsap.set(networkLines, { autoAlpha: 0, strokeDasharray: 1000, strokeDashoffset: 1000 });

          // Identity scene initial resting positions before Scene 5
          gsap.set(identityAct, { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(identityCard, { autoAlpha: 0, y: 32, scale: 0.96 });
          gsap.set(identityCardGlow, { autoAlpha: 0, scale: 0.75 });
          gsap.set(identityPill, { autoAlpha: 0, y: 14, scale: 0.96 });
          gsap.set(identityPillSweep, { left: '-100%', autoAlpha: 0 });
          gsap.set(identityLogo, {
            autoAlpha: 0,
            y: 16,
            scale: 0.92,
            filter: 'drop-shadow(0 4px 16px rgba(4, 42, 34, 0.12))',
          });
          gsap.set(identityWords, { autoAlpha: 0, y: 18 });
          gsap.set(identityTagline, { autoAlpha: 0, y: 12, letterSpacing: '0.06em' });
          gsap.set(identityChips, { autoAlpha: 0, y: 18, scale: 0.96 });
          gsap.set(identityChipIcons, { autoAlpha: 0, scale: 0.7, rotation: -12 });
          gsap.set(identityCta, { autoAlpha: 0, y: 20, scale: 0.96 });

          // Master 5-Scene Scrubbed Timeline (participates with background spotlights)
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: scope,
              start: 'top 84px',
              end: '+=520%',
              pin: true,
              scrub: 1.2,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Scene 1 -> Scene 2: Intro departs; Digital Core activates; volumetric emerald spotlight blooms behind core
          tl.to(
            introAct,
            { autoAlpha: 0, y: -45, scale: 0.94, duration: 1.4, ease: 'power2.inOut' },
            0.8
          )
            .to(
              spotPrimary,
              { scale: 1.25, autoAlpha: 0.65, duration: 2.2, ease: 'power2.out' },
              1.0
            )
            .to(
              spotSecondary,
              { scale: 1.1, autoAlpha: 0.35, duration: 2.0, ease: 'power2.out' },
              1.2
            )
            .to(
              core,
              {
                autoAlpha: 1,
                scale: 1.35,
                rotation: 180,
                duration: 2.2,
                ease: 'power3.out',
              },
              1.0
            )
            .to(coreCallout, { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power2.out' }, 1.6)
            .to(coreCallout, { autoAlpha: 0, y: -15, duration: 0.8, ease: 'power2.in' }, 3.0)

            // Scene 2 -> Scene 3: Core recedes to center; 5 Spatial Nodes emerge; atmospheric spotlights shift across capability zones
            .to(core, { scale: 0.95, duration: 1.6, ease: 'power2.inOut' }, 3.4)
            .to(
              spotPrimary,
              { scale: 1.45, autoAlpha: 0.7, x: -60, y: -25, duration: 1.8, ease: 'power2.inOut' },
              3.4
            )
            .to(
              spotSecondary,
              { scale: 1.35, autoAlpha: 0.52, x: 80, y: 35, duration: 1.8, ease: 'power2.inOut' },
              3.4
            )
            .to(
              spotAccent,
              { scale: 1.2, autoAlpha: 0.35, duration: 1.6, ease: 'power2.inOut' },
              3.6
            )
            .to(
              spatialNodes,
              {
                autoAlpha: 1,
                scale: 1,
                z: 0,
                duration: 1.8,
                stagger: 0.12,
                ease: 'back.out(1.5)',
              },
              3.6
            )

            // Scene 3 -> Scene 4: Network circuits connect; blurred lighting spreads wider across the viewport
            .to(networkSvg, { autoAlpha: 1, duration: 0.5 }, 5.2)
            .to(
              spotPrimary,
              { scale: 1.75, autoAlpha: 0.78, x: -20, duration: 2.0, ease: 'power2.inOut' },
              5.2
            )
            .to(
              spotSecondary,
              { scale: 1.6, autoAlpha: 0.62, x: 35, duration: 2.0, ease: 'power2.inOut' },
              5.2
            )
            .to(
              spotAccent,
              { scale: 1.45, autoAlpha: 0.45, duration: 1.8, ease: 'power2.inOut' },
              5.4
            )
            .to(
              networkLines,
              {
                autoAlpha: 1,
                strokeDashoffset: 0,
                duration: 2.0,
                stagger: 0.08,
                ease: 'power2.inOut',
              },
              5.4
            )
            .to(
              core,
              {
                scale: 1.05,
                duration: 1.4,
                ease: 'sine.inOut',
              },
              6.0
            )

            // =======================================================================
            // SCENE 5: CINEMATIC AYATECH IDENTITY REVEAL (Progressive Assembly)
            // =======================================================================

            // 1. Digital Environment Powers Up
            // Spotlights converge into a calm, radiant aura centered behind the card
            .to(
              spotPrimary,
              { scale: 1.52, autoAlpha: 0.86, x: 0, y: -15, duration: 1.8, ease: 'power2.inOut' },
              7.5
            )
            .to(
              spotSecondary,
              { scale: 1.42, autoAlpha: 0.62, x: 0, y: 25, duration: 1.8, ease: 'power2.inOut' },
              7.5
            )
            .to(
              spotAccent,
              { scale: 1.35, autoAlpha: 0.5, duration: 1.8, ease: 'power2.inOut' },
              7.5
            )
            // Digital core softly recedes into the ambient center
            .to(
              core,
              {
                autoAlpha: 0.18,
                scale: 0.68,
                duration: 1.6,
                ease: 'power2.inOut',
              },
              7.5
            )
            // Network lines gently draw/focus toward center
            .to(
              networkSvg,
              {
                autoAlpha: 0.28,
                scale: 0.94,
                transformOrigin: '50% 50%',
                duration: 1.6,
                ease: 'power2.inOut',
              },
              7.5
            )
            // Blurred capability nodes softly transition into ambient constellation
            .to(
              spatialNodes,
              {
                autoAlpha: 0.32,
                scale: 0.88,
                filter: 'blur(2.5px)',
                duration: 1.6,
                stagger: 0.08,
                ease: 'power2.inOut',
              },
              7.5
            )
            // Extremely subtle atmospheric floating movement of background nodes
            .to(
              spatialNodes,
              {
                y: (i) => (i % 2 === 0 ? -6 : 6),
                x: (i) => (i % 3 === 0 ? 5 : -5),
                duration: 5.0,
                ease: 'sine.inOut',
              },
              8.2
            )

            // 2. Glass Identity Panel Materialization
            .to(
              identityCardGlow,
              { autoAlpha: 1, scale: 1, duration: 1.5, ease: 'power2.out' },
              8.2
            )
            .to(
              identityCard,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1.4,
                ease: 'power2.out',
              },
              8.2
            )

            // 3. "Technology · Development" Pill Reveal with subtle horizontal light sweep
            .to(
              identityPill,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                borderColor: 'rgba(16, 185, 129, 0.42)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.14)',
                duration: 0.85,
                ease: 'power2.out',
              },
              9.0
            )
            .fromTo(
              identityPillSweep,
              { left: '-100%', autoAlpha: 0 },
              { left: '200%', autoAlpha: 0.8, duration: 0.8, ease: 'power2.inOut' },
              9.25
            )

            // 4. AyaTech Logo Assembly with Power-On Glow Pulse
            .to(
              identityLogo,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: 'power2.out',
              },
              9.5
            )
            .to(
              identityLogo,
              {
                filter:
                  'drop-shadow(0 0 24px rgba(16, 185, 129, 0.7)) drop-shadow(0 0 8px rgba(13, 148, 136, 0.85)) drop-shadow(0 4px 16px rgba(4, 42, 34, 0.16))',
                duration: 0.35,
                ease: 'power2.out',
              },
              10.25
            )
            .to(
              identityLogo,
              {
                filter: 'drop-shadow(0 4px 16px rgba(4, 42, 34, 0.12))',
                duration: 0.5,
                ease: 'power2.inOut',
              },
              10.6
            )

            // 5. Main Heading Word-by-Word Sequential Reveal ("Learn. Build. Innovate.")
            .to(
              identityWords,
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.12,
                duration: 0.75,
                ease: 'power2.out',
              },
              10.4
            )

            // 6. Subtitle Reveal ("Built for What Comes Next.")
            .to(
              identityTagline,
              {
                autoAlpha: 1,
                y: 0,
                letterSpacing: '0.02em',
                duration: 0.8,
                ease: 'power2.out',
              },
              10.9
            )

            // 7 & 8. Capability Domains Connecting with Icon Micro-Rotation
            .to(
              identityChips,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                stagger: 0.1,
                duration: 0.7,
                ease: 'back.out(1.2)',
              },
              11.2
            )
            .to(
              identityChipIcons,
              {
                autoAlpha: 1,
                scale: 1,
                rotation: 0,
                stagger: 0.1,
                duration: 0.65,
                ease: 'back.out(1.4)',
              },
              11.22
            )

            // 9. Explore Pathways CTA Button Activation
            .to(
              identityCta,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.75,
                ease: 'back.out(1.3)',
              },
              11.9
            )
            .to(
              identityCta,
              {
                boxShadow:
                  '0 18px 42px -4px rgba(16, 185, 129, 0.65), 0 0 35px rgba(13, 148, 136, 0.45)',
                duration: 0.4,
                ease: 'power2.out',
              },
              12.45
            )
            .to(
              identityCta,
              {
                boxShadow:
                  '0 12px 28px -8px rgba(16, 185, 129, 0.45), 0 0 20px rgba(13, 148, 136, 0.2)',
                duration: 0.45,
                ease: 'power2.inOut',
              },
              12.85
            )

            // 10. Synchronized Final "System Alive" Moment
            .to(
              spotPrimary,
              { scale: 1.58, autoAlpha: 0.92, duration: 0.5, ease: 'sine.inOut' },
              12.95
            )
            .to(
              networkSvg,
              { autoAlpha: 0.45, duration: 0.5, ease: 'sine.inOut' },
              12.95
            )
            .to(
              spatialNodes,
              { autoAlpha: 0.45, duration: 0.5, ease: 'sine.inOut' },
              12.95
            )
            .to(
              identityCard,
              {
                borderColor: 'rgba(16, 185, 129, 0.48)',
                boxShadow:
                  '0 32px 75px -12px rgba(4, 42, 34, 0.15), 0 0 65px -6px rgba(16, 185, 129, 0.28), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                duration: 0.5,
                ease: 'sine.inOut',
              },
              12.95
            )
            .to(
              identityLogo,
              {
                filter:
                  'drop-shadow(0 0 18px rgba(16, 185, 129, 0.45)) drop-shadow(0 4px 16px rgba(4, 42, 34, 0.12))',
                duration: 0.5,
                ease: 'sine.inOut',
              },
              12.95
            )
            // Settle back to stable ecosystem state
            .to(
              spotPrimary,
              { scale: 1.52, autoAlpha: 0.86, duration: 0.5, ease: 'sine.inOut' },
              13.45
            )
            .to(
              networkSvg,
              { autoAlpha: 0.28, duration: 0.5, ease: 'sine.inOut' },
              13.45
            )
            .to(
              spatialNodes,
              { autoAlpha: 0.32, duration: 0.5, ease: 'sine.inOut' },
              13.45
            )
            .to(
              identityCard,
              {
                borderColor: 'rgba(16, 185, 129, 0.3)',
                boxShadow:
                  '0 32px 70px -16px rgba(4, 42, 34, 0.12), 0 0 55px -10px rgba(16, 185, 129, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
                duration: 0.5,
                ease: 'sine.inOut',
              },
              13.45
            )
            .to(
              identityLogo,
              {
                filter: 'drop-shadow(0 4px 16px rgba(4, 42, 34, 0.12))',
                duration: 0.5,
                ease: 'sine.inOut',
              },
              13.45
            );
        }
      );

      // Reduced motion or mobile: ensure all content is visible and readable without scrub
      media.add(
        { reduced: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)' },
        (context) => {
          const { reduced, mobile } = context.conditions as {
            reduced: boolean;
            mobile: boolean;
          };
          if (!reduced && !mobile) return;

          gsap.set(scope.querySelectorAll('[data-act], [data-element]'), {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            clearProps: 'transform,filter,boxShadow,borderColor,letterSpacing',
          });
        }
      );
    }, scope);

    return () => {
      /* The intro runs on its own clock (ayatechIntro.ts); leaving the world ends it. */
      stopAyatechIntro(scope);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={scopeRef}
      id="ayatech-world"
      aria-label={brand.name}
      data-bare={bare ? 'true' : undefined}
      className={styles.section}
    >
      <div ref={stageRef} className={styles.stage}>
        {/* Atmospheric ambient background layers with blurred physical spotlights */}
        <div data-intro="atmosphere" aria-hidden="true" className={styles.atmosphere}>
          <div data-element="spotlight-primary" className={styles.spotlightPrimary} />
          <div data-element="spotlight-secondary" className={styles.spotlightSecondary} />
          <div data-element="spotlight-accent" className={styles.spotlightAccent} />
          <div data-intro="grid" className={styles.digitalGrid} />
          <div data-intro="particles" className={styles.particlesOverlay} />
        </div>

        {/* Central 3D Digital Core */}
        <div
          data-element="core"
          aria-hidden="true"
          className={styles.coreWrapper}
        >
          {/* Atmospheric core bloom */}
          <div className={styles.coreGlowPulse} />

          {/* 3D Gyroscopic & Data Rings */}
          <div className={styles.coreRingOuter} />
          <div className={styles.coreRingMiddle} />
          <div className={styles.coreRingInner} />

          {/* Orbiting particle satellites */}
          <div className={styles.coreOrbitTrack1}>
            <span className={styles.orbitParticle} />
          </div>
          <div className={styles.coreOrbitTrack2}>
            <span className={styles.orbitParticle} />
          </div>

          {/* Central Faceted Hex Crystal */}
          <div className={styles.coreCenterHex}>
            <div className={styles.coreFacetHighlight} />
            <div className={styles.coreInnerContent}>
              <Cpu size={32} strokeWidth={2} className={styles.coreCpuIcon} />
            </div>
          </div>
        </div>

        {/* Core HUD status indicator on activation */}
        <div
          data-element="core-callout"
          aria-hidden="true"
          className={styles.coreCallout}
        >
          <span className={styles.coreCalloutBadge}>Digital Core Active</span>
          <span className={styles.coreCalloutText}>Ecosystem Connected</span>
        </div>

        {/* SVG Network Constellation Lines (Center to Nodes & Node to Node) */}
        <svg
          data-element="network-svg"
          aria-hidden="true"
          viewBox="0 0 1000 1000"
          className={styles.networkSvg}
          preserveAspectRatio="none"
        >
          {/* Radial Lines: Center Core (500, 500) to each Capability Node */}
          {CAPABILITIES.map((cap) => (
            <line
              key={`radial-${cap.id}`}
              data-element="network-line"
              x1="500"
              y1="500"
              x2={cap.svgCoord.x}
              y2={cap.svgCoord.y}
              className={styles.circuitLineActive}
            />
          ))}

          {/* Inter-Node Constellation Perimeter Circuits */}
          {/* Innovation (500, 160) <-> Cyber Security (210, 290) */}
          <line
            data-element="network-line"
            x1="500"
            y1="160"
            x2="210"
            y2="290"
            className={styles.circuitLine}
          />
          {/* Cyber Security (210, 290) <-> Software Development (250, 730) */}
          <line
            data-element="network-line"
            x1="210"
            y1="290"
            x2="250"
            y2="730"
            className={styles.circuitLine}
          />
          {/* Software Development (250, 730) <-> Digital Technology (750, 730) */}
          <line
            data-element="network-line"
            x1="250"
            y1="730"
            x2="750"
            y2="730"
            className={styles.circuitLine}
          />
          {/* Digital Technology (750, 730) <-> Artificial Intelligence (790, 290) */}
          <line
            data-element="network-line"
            x1="750"
            y1="730"
            x2="790"
            y2="290"
            className={styles.circuitLine}
          />
          {/* Artificial Intelligence (790, 290) <-> Innovation (500, 160) */}
          <line
            data-element="network-line"
            x1="790"
            y1="290"
            x2="500"
            y2="160"
            className={styles.circuitLine}
          />
        </svg>

        {/* Acts Container */}
        <div className={styles.actsContainer}>
          {/* SCENE 1: the intro — AyaTech's identity. The official logo,
              centred on the stage, in a pool of light, with the ecosystem it
              stands for signalling round it. This is its resting state,
              where the scroll journey starts; entering the world assembles
              it (ayatechIntro.ts). */}
          <div data-act="intro" className={`${styles.actLayer} ${styles.introAct}`}>
            <div className={styles.introStage}>
              <span data-intro="halo" aria-hidden="true" className={styles.introHalo} />
              <span data-intro="bloom" aria-hidden="true" className={styles.introBloom} />

              <div aria-hidden="true" className={styles.introField}>
                <svg
                  viewBox={`0 0 ${FIELD.width} ${FIELD.height}`}
                  preserveAspectRatio="none"
                  className={styles.introTraces}
                >
                  <g className={styles.introPoints}>
                    {POINTS.map(([cx, cy]) => (
                      <circle key={`${cx}-${cy}`} data-intro="point" cx={cx} cy={cy} r={1.6} />
                    ))}
                  </g>
                  {TRACES.map(({ signal, d, end }) => (
                    <g key={d} data-ambient={signal ? undefined : ''}>
                      <path data-intro="trace" d={d} pathLength={1} className={styles.introTrace} />
                      {signal && <path data-intro="pulse" d={d} pathLength={1} className={styles.introPulse} />}
                      <circle
                        data-intro="terminal"
                        data-signal={signal}
                        cx={end[0]}
                        cy={end[1]}
                        r={2.8}
                        className={styles.introTerminal}
                      />
                    </g>
                  ))}
                </svg>

                {CAPABILITIES.map(({ id, title }) => {
                  const { at, label } = SIGNALS[id as SignalId];
                  return (
                    <span
                      key={id}
                      data-intro="signal"
                      data-label={label}
                      style={{ left: `${(at[0] / FIELD.width) * 100}%`, top: `${(at[1] / FIELD.height) * 100}%` }}
                      className={styles.introSignal}
                    >
                      <span data-intro="signal-dot" className={styles.introSignalDot} />
                      <span className={styles.introSignalLabel}>{title}</span>
                    </span>
                  );
                })}
              </div>

              <h1 data-intro="logo" className={styles.introLogo}>
                <Image
                  src={AYATECH_LOGO}
                  alt="AyaTech"
                  width={1000}
                  height={450}
                  priority
                  unoptimized
                  className={styles.introLogoImg}
                />
                <span
                  data-intro="sheen"
                  aria-hidden="true"
                  style={{ maskImage: `url(${AYATECH_LOGO})`, WebkitMaskImage: `url(${AYATECH_LOGO})` }}
                  className={styles.introSheen}
                />
              </h1>
            </div>

            <div className={styles.introCopy}>
              <div data-intro="badge" className={styles.introBadge}>
                <span className={styles.pulseIndicator} />
                <span>Technology · Development</span>
              </div>
              <p data-intro="motto" className={styles.introMotto}>
                Learn. Build. Innovate.
              </p>
              <p data-intro="tagline" className={styles.introTagline}>
                Built for What Comes Next
              </p>
              <span data-intro="hint" className={styles.introScrollHint}>
                <Zap size={14} className="text-emerald-600" />
                <span>Scroll into the technology ecosystem</span>
              </span>
            </div>
          </div>

          {/* SCENES 3 & 4: 3D Spatial Capability Nodes (Zero course-specific names) */}
          <div className={styles.nodesContainer}>
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.id}
                  data-element="spatial-node"
                  style={cap.positionStyle}
                  className={styles.spatialNode}
                >
                  {/* Glowing beacon point with radar pulse */}
                  <div className={styles.nodeBeacon}>
                    <span className={styles.beaconDot} />
                    <span className={styles.beaconPing} />
                  </div>

                  {/* Compact floating 3D glass panel */}
                  <div className={styles.nodePanel}>
                    <div className={styles.nodePanelGlow} />
                    <div className={styles.nodeHeaderRow}>
                      <div className={styles.nodeIconBox}>
                        <Icon size={17} strokeWidth={2.2} />
                      </div>
                      <span className={styles.nodeBadge}>{cap.index}</span>
                    </div>
                    <div className={styles.nodeTextContent}>
                      <h3 className={styles.nodeTitle}>{cap.title}</h3>
                      <span className={styles.nodeDomain}>{cap.tag}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SCENE 5: Grand AyaTech Identity Reveal with official AyaTech brand asset */}
          <div data-act="identity" className={styles.actLayer}>
            <div className={styles.identityContainer}>
              <div data-element="identity-card" className={styles.identityCard}>
                <div data-element="identity-card-glow" className={styles.identityCardGlow} />

                <div data-element="identity-pill" className={styles.identityHeaderPill}>
                  <div data-element="identity-pill-sweep" className={styles.pillSweep} />
                  <Sparkles size={14} strokeWidth={2.2} />
                  <span>Technology · Development</span>
                </div>

                <div data-element="identity-logo" className={styles.identityLogoWrap}>
                  <Image
                    src="/images/Ayatech.png"
                    alt="AyaTech"
                    width={1000}
                    height={450}
                    priority
                    unoptimized
                    className={styles.identityLogoImg}
                  />
                </div>

                <h2 className="sr-only">AyaTech</h2>
                <p className={styles.identityMotto}>
                  <span data-element="identity-motto-word" className={styles.mottoWord}>Learn.</span>{' '}
                  <span data-element="identity-motto-word" className={styles.mottoWord}>Build.</span>{' '}
                  <span data-element="identity-motto-word" className={styles.mottoWord}>Innovate.</span>
                </p>
                <p data-element="identity-tagline" className={styles.identityTagline}>
                  Built for What Comes Next.
                </p>

                {/* Broad Capability Pillars Ribbon */}
                <div className={styles.pillarsRow}>
                  {CAPABILITIES.map((c) => (
                    <span key={c.id} data-element="identity-chip" className={styles.pillarChip}>
                      <span data-element="identity-chip-icon" className={styles.pillarIconWrap}>
                        <c.icon size={13} strokeWidth={2} />
                      </span>
                      <span>{c.title}</span>
                    </span>
                  ))}
                </div>

                {/* Primary Action Button */}
                <div className={styles.ctaGroup}>
                  <Link
                    href="#learning-pathways"
                    data-element="identity-cta"
                    className={styles.primaryCta}
                  >
                    <span>Explore Pathways</span>
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

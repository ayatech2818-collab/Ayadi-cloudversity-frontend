'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Brain,
  Code2,
  Cpu,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { brandById } from '@/components/website/courses/brands';

import styles from './ayatech.module.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const brand = brandById.ayatech;

/** The 5 core capability areas defining the AyaTech ecosystem */
const CAPABILITIES = [
  {
    id: 'cyber',
    index: '01',
    title: 'Cyber Security',
    icon: ShieldCheck,
    tag: 'Defense & Resilience',
    desc: 'Offensive and defensive security architectures, threat intelligence, vulnerability engineering, and cryptographic systems.',
    coords: { x: -320, y: -160 },
    positionStyle: { left: '8%', top: '16%' },
    svgCoord: { x: 200, y: 260 },
  },
  {
    id: 'ai',
    index: '02',
    title: 'Artificial Intelligence',
    icon: Brain,
    tag: 'Autonomous Systems',
    desc: 'Foundational models, agentic workflows, machine learning pipelines, and production neural deployment.',
    coords: { x: 320, y: -160 },
    positionStyle: { right: '8%', top: '16%' },
    svgCoord: { x: 800, y: 260 },
  },
  {
    id: 'software',
    index: '03',
    title: 'Software Development',
    icon: Code2,
    tag: 'Full-Stack & Cloud',
    desc: 'Modern distributed architectures, cloud-native engineering, high-throughput microservices, and performance optimization.',
    coords: { x: -340, y: 190 },
    positionStyle: { left: '7%', bottom: '13%' },
    svgCoord: { x: 220, y: 750 },
  },
  {
    id: 'digital',
    index: '04',
    title: 'Digital Technology',
    icon: Cpu,
    tag: 'Next-Gen Computing',
    desc: 'Ubiquitous edge computing, Internet of Things, robust modern infrastructure, and platform engineering.',
    coords: { x: 340, y: 190 },
    positionStyle: { right: '7%', bottom: '13%' },
    svgCoord: { x: 780, y: 750 },
  },
  {
    id: 'innovation',
    index: '05',
    title: 'Innovation',
    icon: Sparkles,
    tag: 'Applied Research',
    desc: 'Translating breakthrough technologies into industry-defining products through hands-on builder methodologies.',
    coords: { x: 0, y: -260 },
    positionStyle: { left: '50%', top: '6%', transform: 'translateX(-50%)' },
    svgCoord: { x: 500, y: 140 },
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

          // Elements references
          const introAct = scope.querySelector('[data-act="intro"]');
          const core = scope.querySelector('[data-element="core"]');
          const nodeCards = scope.querySelectorAll('[data-element="node-card"]');
          const networkLines = scope.querySelectorAll('[data-element="network-line"]');
          const identityAct = scope.querySelector('[data-act="identity"]');

          // Initial resting positions before scroll begins
          gsap.set(introAct, { autoAlpha: 1, y: 0 });
          gsap.set(core, { autoAlpha: 0.45, scale: 0.75, rotation: 0 });
          gsap.set(nodeCards, { autoAlpha: 0, scale: 0.5, z: -100 });
          gsap.set(networkLines, { autoAlpha: 0, strokeDasharray: 1000, strokeDashoffset: 1000 });
          gsap.set(identityAct, { autoAlpha: 0, y: 60, scale: 0.92 });

          // Master 5-Scene Scrubbed Timeline
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: scope,
              start: 'top 84px',
              end: '+=440%',
              pin: true,
              scrub: 1.2,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Scene 1 -> Scene 2: Intro departs, Digital Core activates & expands
          tl.to(
            introAct,
            { autoAlpha: 0, y: -45, scale: 0.94, duration: 1.5, ease: 'power2.inOut' },
            1.0
          )
            .to(
              core,
              {
                autoAlpha: 1,
                scale: 1.25,
                rotation: 180,
                duration: 2.2,
                ease: 'power3.out',
              },
              1.2
            )

            // Scene 2 -> Scene 3: Core recedes slightly, 5 Capability Nodes form from center
            .to(core, { scale: 0.85, duration: 1.6, ease: 'power2.inOut' }, 3.4)
            .to(
              nodeCards,
              {
                autoAlpha: 1,
                scale: 1,
                z: 0,
                duration: 1.8,
                stagger: 0.15,
                ease: 'back.out(1.4)',
              },
              3.6
            )

            // Scene 3 -> Scene 4: Nodes connect into luminous network circuits
            .to(
              networkLines,
              {
                autoAlpha: 1,
                strokeDashoffset: 0,
                duration: 2.0,
                stagger: 0.1,
                ease: 'power2.inOut',
              },
              5.4
            )
            .to(
              core,
              {
                scale: 0.95,
                boxShadow: '0 0 60px rgba(16, 185, 129, 0.6)',
                duration: 1.4,
              },
              6.0
            )

            // Scene 4 -> Scene 5: Nodes & network harmonize into backdrop; AyaTech Identity reveals
            .to(
              nodeCards,
              {
                autoAlpha: 0.22,
                scale: 0.9,
                filter: 'blur(3px)',
                duration: 1.6,
                ease: 'power2.inOut',
              },
              7.5
            )
            .to(
              networkLines,
              {
                autoAlpha: 0.25,
                duration: 1.6,
              },
              7.5
            )
            .to(
              core,
              {
                autoAlpha: 0.2,
                scale: 0.7,
                duration: 1.6,
              },
              7.5
            )
            .to(
              identityAct,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 2.0,
                ease: 'power3.out',
              },
              7.9
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
            clearProps: 'transform,filter',
          });
        }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={scopeRef}
      id="ayatech-world"
      aria-label={brand.name}
      className={styles.section}
    >
      <div ref={stageRef} className={styles.stage}>
        {/* Ambient atmospheric lighting */}
        <div aria-hidden="true" className={styles.atmosphere}>
          <div className={styles.ambientGlowPrimary} />
          <div className={styles.ambientGlowSecondary} />
          <div className={styles.digitalGrid} />
          <div className={styles.particlesOverlay} />
        </div>

        {/* Central 3D Digital Core */}
        <div
          data-element="core"
          aria-hidden="true"
          className={styles.coreWrapper}
        >
          <div className={styles.coreGlowPulse} />
          <div className={styles.coreRingOuter} />
          <div className={styles.coreRingMiddle} />
          <div className={styles.coreRingInner} />
          <div className={styles.coreCenterHex}>
            <div className={styles.coreInnerContent}>
              <Cpu size={32} strokeWidth={2} />
            </div>
          </div>
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
          <line
            data-element="network-line"
            x1="500"
            y1="140"
            x2="200"
            y2="260"
            className={styles.circuitLine}
          />
          <line
            data-element="network-line"
            x1="200"
            y1="260"
            x2="220"
            y2="750"
            className={styles.circuitLine}
          />
          <line
            data-element="network-line"
            x1="220"
            y1="750"
            x2="780"
            y2="750"
            className={styles.circuitLine}
          />
          <line
            data-element="network-line"
            x1="780"
            y1="750"
            x2="800"
            y2="260"
            className={styles.circuitLine}
          />
          <line
            data-element="network-line"
            x1="800"
            y1="260"
            x2="500"
            y2="140"
            className={styles.circuitLine}
          />
        </svg>

        {/* Acts Container */}
        <div className={styles.actsContainer}>
          {/* ACT 1: Intro Atmosphere & Core Statement */}
          <div data-act="intro" className={styles.actLayer}>
            <div className={styles.introBadge}>
              <span className={styles.pulseIndicator} />
              <span>Technology · Development</span>
            </div>
            <h1 className={styles.introTitle}>AYA TECH</h1>
            <p className={styles.introSub}>Learn. Build. Innovate.</p>
            <p className={styles.introTagline}>
              {brand.tagline} — an ecosystem architected for modern software, systems engineering,
              and applied intelligence.
            </p>
          </div>

          {/* ACTS 3 & 4: Capability Nodes */}
          <div className={styles.nodesContainer}>
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <article
                  key={cap.id}
                  data-element="node-card"
                  style={cap.positionStyle}
                  className={styles.nodeCard}
                >
                  <header className={styles.nodeHeader}>
                    <div className={styles.nodeIconWrapper}>
                      <Icon size={20} strokeWidth={2.1} />
                    </div>
                    <span className={styles.nodeIndex}>{cap.index}</span>
                  </header>
                  <h3 className={styles.nodeTitle}>{cap.title}</h3>
                  <p className={styles.nodeDesc}>{cap.desc}</p>
                  <span className={styles.nodeTag}>
                    <Zap size={12} strokeWidth={2.4} />
                    {cap.tag}
                  </span>
                </article>
              );
            })}
          </div>

          {/* ACT 5: Full AyaTech Identity Reveal */}
          <div data-act="identity" className={styles.actLayer}>
            <div className={styles.identityContainer}>
              <div className={styles.identityCard}>
                <div className={styles.identityHeaderPill}>
                  <Sparkles size={14} strokeWidth={2.2} />
                  <span>AyaTech Ecosystem</span>
                </div>

                <h2 className={styles.identityMainHeading}>AYA TECH</h2>
                <p className={styles.identitySubHeading}>Technology · Development</p>
                <p className={styles.identityMotto}>Learn. Build. Innovate.</p>
                <p className={styles.identityTagline}>Built for What Comes Next.</p>

                <p className={styles.identityLede}>{brand.lede}</p>

                {/* Capability Pillars Row */}
                <div className={styles.pillarsRow}>
                  {CAPABILITIES.map((c) => (
                    <span key={c.id} className={styles.pillarChip}>
                      <c.icon size={13} strokeWidth={2} />
                      {c.title}
                    </span>
                  ))}
                </div>

                {/* Call to action */}
                <div className={styles.ctaGroup}>
                  <Link
                    href="#learning-pathways"
                    className={styles.primaryCta}
                  >
                    <span>Enter the Ecosystem</span>
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

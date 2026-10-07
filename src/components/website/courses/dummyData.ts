import type { BrandId, BrandSectionData, BrandTabInfo } from './types';

export const brandTabs: BrandTabInfo[] = [
  {
    id: 'ayadi',
    name: 'AYADI CLOUDVERSITY',
    subtitle: 'Learning & Professional Programs',
    tagline: 'Main Learning Platform',
    iconName: 'GraduationCap',
  },
  {
    id: 'ayatech',
    name: 'AYATECH',
    subtitle: 'Technology & AI',
    tagline: 'Tech & Software Hub',
    iconName: 'Cpu',
  },
  {
    id: 'ags',
    name: 'AYADI GLOCAL SCHOOL',
    subtitle: 'Online Schooling',
    tagline: 'Grades 1 to 8',
    iconName: 'School',
  },
];

export const brandContentMap: Record<BrandId, BrandSectionData> = {
  ayadi: {
    eyebrow: 'Ayadi Cloudversity',
    title: 'Learning for Every Journey',
    description:
      'Explore programs designed to help you develop practical skills, strengthen your career, and continue learning at every stage.',
    brandBadge: 'Core Ecosystem',
    ctaText: 'Explore Ayadi Programs →',
    courses: [
      {
        id: 'ayadi-1',
        title: 'Python Full Stack Development',
        category: 'Technology',
        level: 'Advanced',
        duration: '12 Weeks',
        description: 'Build real-world full-stack web applications with Python, contemporary frameworks, and modern databases.',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
        badge: 'Popular',
      },
      {
        id: 'ayadi-2',
        title: 'Digital Marketing Mastery',
        category: 'Business & Growth',
        level: 'Intermediate',
        duration: '8 Weeks',
        description: 'Learn data-driven marketing campaigns, brand positioning, and omnichannel analytics to accelerate growth.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        badge: 'Featured',
      },
      {
        id: 'ayadi-3',
        title: 'UI/UX Design & Design Systems',
        category: 'Creative & Design',
        level: 'Beginner',
        duration: '6 Weeks',
        description: 'Master human-centric interface design, wireframing, interactive prototyping, and design systems.',
        image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
        badge: 'Hands-on',
      },
    ],
  },
  ayatech: {
    eyebrow: 'AyaTech Ecosystem',
    title: 'Technology & AI, Powered by AyaTech',
    description:
      'Discover technology-focused programs built around modern software development, artificial intelligence, programming, and emerging technologies.',
    brandBadge: 'Technology & AI Hub',
    ctaText: 'Explore AyaTech →',
    courses: [
      {
        id: 'ayatech-1',
        title: 'Applied Generative AI & LLM Systems',
        category: 'Artificial Intelligence',
        level: 'Advanced',
        duration: '10 Weeks',
        description: 'Architect production-grade LLM applications, RAG pipelines, fine-tuning workflows, and agentic systems.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
        badge: 'Next-Gen AI',
      },
      {
        id: 'ayatech-2',
        title: 'Cloud Architecture & DevOps at Scale',
        category: 'Cloud Engineering',
        level: 'Intermediate',
        duration: '12 Weeks',
        description: 'Deploy resilient cloud infrastructure with Docker, Kubernetes, automated CI/CD pipelines, and Terraform.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        badge: 'High Demand',
      },
      {
        id: 'ayatech-3',
        title: 'Modern Software Engineering & Distributed Systems',
        category: 'Software Architecture',
        level: 'Advanced',
        duration: '14 Weeks',
        description: 'Design high-throughput distributed microservices, event-driven architectures, and secure API networks.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        badge: 'Enterprise',
      },
    ],
  },
  /* Placeholder programmes, written from what ayadischool.com says the school
     offers (Grades 1–8, CBSE-aligned, live classes, coding/robotics/languages).
     The split into three cards and the durations are ours — confirm with AGS. */
  ags: {
    eyebrow: 'Ayadi Glocal School',
    title: 'Global Learning, Close to Home',
    description:
      'Explore online school programmes for Grades 1 to 8, aligned to the CBSE curriculum and taught through live, interactive classes with personal mentoring.',
    brandBadge: 'Online School',
    ctaText: 'Explore AGS →',
    courses: [
      {
        id: 'ags-1',
        title: 'Primary School Programme',
        category: 'Core Academics',
        level: 'Grades 1–5',
        duration: 'Academic Year',
        description: 'English, Mathematics, Science and Social Studies taught in live, interactive classes aligned to the CBSE curriculum.',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        badge: 'CBSE Aligned',
      },
      {
        id: 'ags-2',
        title: 'Middle School Programme',
        category: 'Core Academics',
        level: 'Grades 6–8',
        duration: 'Academic Year',
        description: 'A deeper run through the core subjects, with personal mentoring to keep every learner confident and on track.',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
        badge: 'Live Classes',
      },
      {
        id: 'ags-3',
        title: 'Coding, Robotics & World Languages',
        category: 'Beyond the Core',
        level: 'Grades 1–8',
        duration: 'Academic Year',
        description: 'Coding and robotics alongside Spanish and French, so learners build future-ready skills next to their core subjects.',
        image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
        badge: 'Future Skills',
      },
    ],
  },
};

import { categoryById } from './categories';
import type { BrandId, BrandSectionData, CatalogueCourse } from './types';

/*
 * The Ayadi Cloudversity catalogue — everything the Courses page lists.
 *
 * Placeholder data. Each course names its category by id (categories.ts), the
 * way a backend course carries `category_id`, so moving to the API means
 * replacing this array with `getCourses({ brand_id, is_published: true })`
 * and mapping `short_description` → description, `thumbnail_url` → image.
 *
 * ayadi-1 to ayadi-3 are the page's original three, ids unchanged. ayadi-4 to
 * ayadi-6 are the other Cloudversity courses the home page already features
 * (FeaturedCourses.tsx), copied as they are there; they have no badge because
 * none was written for them. Which category each course sits in is a
 * placeholder too — confirm with the real catalogue.
 */
export const ayadiCourses: CatalogueCourse[] = [
  {
    id: 'ayadi-1',
    title: 'Python Full Stack Development',
    categoryId: 'readiness',
    level: 'Advanced',
    duration: '12 Weeks',
    description: 'Build real-world full-stack web applications with Python, contemporary frameworks, and modern databases.',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
    badge: 'Popular',
  },
  {
    id: 'ayadi-2',
    title: 'Digital Marketing Mastery',
    categoryId: 'readiness',
    level: 'Intermediate',
    duration: '8 Weeks',
    description: 'Learn data-driven marketing campaigns, brand positioning, and omnichannel analytics to accelerate growth.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    badge: 'Featured',
  },
  {
    id: 'ayadi-3',
    title: 'UI/UX Design & Design Systems',
    categoryId: 'creative',
    level: 'Beginner',
    duration: '6 Weeks',
    description: 'Master human-centric interface design, wireframing, interactive prototyping, and design systems.',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
    badge: 'Hands-on',
  },
  {
    id: 'ayadi-4',
    title: 'Data Science & Analytics',
    categoryId: 'academic',
    level: 'Intermediate',
    duration: '10 Weeks',
    description: 'Turn data into meaningful insights using modern analytical tools.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ayadi-5',
    title: 'Artificial Intelligence',
    categoryId: 'academic',
    level: 'Advanced',
    duration: '12 Weeks',
    description: 'Understand AI concepts and build intelligent applications.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ayadi-6',
    title: 'Communication Skills',
    categoryId: 'creative',
    level: 'Beginner',
    duration: '4 Weeks',
    description: 'Develop confident communication skills for academic and professional growth.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
  },
];

/*
 * The brand-keyed view. The Courses page no longer reads it — it lists
 * Cloudversity only — but other sections still do (the AyaTech world's
 * programme strip on the home page, the universe chapters), so AyaTech and
 * AGS stay here.
 */
export const brandContentMap: Record<BrandId, BrandSectionData> = {
  ayadi: {
    eyebrow: 'Ayadi Cloudversity',
    title: 'Learning for Every Journey',
    description:
      'Explore programs designed to help you develop practical skills, strengthen your career, and continue learning at every stage.',
    brandBadge: 'Core Ecosystem',
    ctaText: 'Explore Ayadi Programs →',
    /* The catalogue above, with each category spelled out by name. */
    courses: ayadiCourses.map(({ categoryId, ...course }) => ({
      ...course,
      category: categoryById(categoryId)?.name ?? '',
    })),
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

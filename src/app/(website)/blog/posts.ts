/*
 * The blog's single source of truth. BlogList and [slug]/page.tsx both read
 * from here — they used to carry their own copies, which is why only two of the
 * nine posts had a detail page.
 *
 * Body copy is placeholder written in the client's voice; swap it for the real
 * articles. Cover images are expected at the paths below — until those files
 * exist, BlogCover falls back to a branded placeholder rather than a broken
 * image box.
 */

export type PostSection = {
  heading: string;
  paragraphs: string[];
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO, for <time dateTime> and sorting. */
  date: string;
  displayDate: string;
  readTime: string;
  author: string;
  image: string;
  content: PostSection[];
};

export const posts: Post[] = [
  {
    slug: 'future-of-digital-learning',
    title: 'The Future of Digital Learning',
    excerpt:
      'Discover how technology is transforming education and creating new possibilities for learners everywhere.',
    category: 'Education',
    date: '2026-09-12',
    displayDate: 'September 12, 2026',
    readTime: '5 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/digital-learning.jpg',
    content: [
      {
        heading: 'A new era of learning',
        paragraphs: [
          'Education is changing rapidly. Digital technologies are creating new ways for students to access knowledge, collaborate with others, and build skills that extend far beyond the traditional classroom.',
          'The future of learning is not simply about replacing classrooms with screens. It is about creating experiences that are more flexible, engaging, and connected to the needs of individual learners.',
        ],
      },
      {
        heading: 'Technology as an enabler',
        paragraphs: [
          'Technology can give learners access to resources, experts, and experiences that were previously difficult to reach. Interactive platforms, digital content, and intelligent learning tools can support students throughout their learning journey.',
          'However, technology works best when it supports thoughtful teaching rather than replacing the human connection at the heart of education.',
        ],
      },
      {
        heading: 'Learning for the future',
        paragraphs: [
          "Tomorrow's learners will need more than academic knowledge. Creativity, communication, critical thinking, collaboration, and adaptability will become increasingly important.",
          'At Ayadi Cloudversity, we believe education should help learners develop these capabilities while giving them the confidence to continuously learn and grow.',
        ],
      },
    ],
  },
  {
    slug: 'why-curiosity-matters-in-learning',
    title: 'Why Curiosity Matters in Learning',
    excerpt: "Curiosity is one of the most powerful drivers of meaningful learning. Here's why it matters.",
    category: 'Learning',
    date: '2026-09-08',
    displayDate: 'September 8, 2026',
    readTime: '4 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/curiosity.jpg',
    content: [
      {
        heading: 'Curiosity drives discovery',
        paragraphs: [
          'Curiosity encourages learners to look beyond what they already know. A simple question can become the beginning of a much deeper learning journey.',
          'When students feel comfortable asking questions, they become active participants in their education rather than passive recipients of information.',
        ],
      },
      {
        heading: 'Creating curious learners',
        paragraphs: [
          'Teachers and learning environments play an important role in encouraging curiosity. Giving students room to explore, experiment, and question ideas can create a much richer learning experience.',
        ],
      },
    ],
  },
  {
    slug: 'building-career-ready-students',
    title: 'Building Career-Ready Students',
    excerpt:
      'Academic knowledge is only one part of preparing students for a rapidly changing professional world.',
    category: 'Career',
    date: '2026-09-03',
    displayDate: 'September 3, 2026',
    readTime: '6 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/career-ready.jpg',
    content: [
      {
        heading: 'Beyond the transcript',
        paragraphs: [
          'Employers consistently describe the same gap: graduates who know their subject but have had little practice applying it. Career readiness begins when learning moves from recall to judgement.',
          'That shift happens through projects, feedback, and real constraints — not through additional content.',
        ],
      },
      {
        heading: 'Skills that travel',
        paragraphs: [
          'Communication, collaboration, and the ability to learn something unfamiliar quickly outlast any single tool or platform. They are also the hardest things to teach in isolation.',
          'Our workspace readiness pathways build them into the work itself, so learners practise them rather than study them.',
        ],
      },
    ],
  },
  {
    slug: 'technology-in-modern-classrooms',
    title: 'Technology in Modern Classrooms',
    excerpt:
      'From interactive learning tools to AI-powered experiences, technology is reshaping the modern classroom.',
    category: 'Technology',
    date: '2026-08-28',
    displayDate: 'August 28, 2026',
    readTime: '5 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/classroom.jpg',
    content: [
      {
        heading: 'Tools in service of teaching',
        paragraphs: [
          'The classrooms that use technology best are rarely the ones with the most of it. They are the ones where every tool answers a question the teacher already had.',
          'Interactive boards, shared documents, and adaptive practice all work when they remove friction from something worth doing.',
        ],
      },
      {
        heading: 'Where it goes wrong',
        paragraphs: [
          'Technology adopted for its own sake adds administration, not learning. The test is simple: does this give the teacher more attention to spend on students, or less?',
        ],
      },
    ],
  },
  {
    slug: 'learning-beyond-the-classroom',
    title: 'Learning Beyond the Classroom',
    excerpt:
      'Education becomes more meaningful when learners can connect knowledge with real-world experiences.',
    category: 'Education',
    date: '2026-08-21',
    displayDate: 'August 21, 2026',
    readTime: '4 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/beyond-classroom.jpg',
    content: [
      {
        heading: 'Context makes knowledge stick',
        paragraphs: [
          'A concept met once in a textbook is fragile. The same concept met again in a workshop, a conversation, or a problem someone actually cares about becomes durable.',
          'Field work, community projects, and mentorship all serve the same purpose: they give knowledge somewhere to land.',
        ],
      },
      {
        heading: 'Designing for transfer',
        paragraphs: [
          'The goal is not variety for its own sake. It is transfer — the moment a learner recognises a familiar idea wearing unfamiliar clothes.',
        ],
      },
    ],
  },
  {
    slug: 'developing-critical-thinking',
    title: 'Developing Critical Thinking Skills',
    excerpt:
      'Learn how critical thinking helps students approach challenges, solve problems, and make better decisions.',
    category: 'Learning',
    date: '2026-08-15',
    displayDate: 'August 15, 2026',
    readTime: '7 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/critical-thinking.jpg',
    content: [
      {
        heading: 'Thinking is a practice',
        paragraphs: [
          'Critical thinking is not a personality trait that some learners arrive with. It is a set of habits: asking what the evidence is, noticing what is missing, and being willing to change your mind in public.',
          'Those habits are built by repetition, in low-stakes settings, long before they matter in high-stakes ones.',
        ],
      },
      {
        heading: 'Room to be wrong',
        paragraphs: [
          'Students reason carefully when being wrong is survivable. A classroom that rewards the confident answer over the examined one teaches the opposite lesson.',
        ],
      },
    ],
  },
  {
    slug: 'the-role-of-mentorship',
    title: 'The Role of Mentorship in Education',
    excerpt:
      'The right guidance can help learners build confidence, discover their strengths, and find direction.',
    category: 'Community',
    date: '2026-08-10',
    displayDate: 'August 10, 2026',
    readTime: '5 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/mentorship.jpg',
    content: [
      {
        heading: 'Someone who has been there',
        paragraphs: [
          'A mentor shortens the distance between a learner and a possibility they had not considered. Often the most valuable thing they offer is not advice but evidence that a path exists.',
          'That matters most for students who are the first in their family to take it.',
        ],
      },
      {
        heading: 'Making it deliberate',
        paragraphs: [
          'Informal mentorship tends to find the students who are already confident enough to ask. Structured programmes reach the ones who are not — which is usually the point.',
        ],
      },
    ],
  },
  {
    slug: 'preparing-learners-for-tomorrow',
    title: 'Preparing Learners for Tomorrow',
    excerpt: 'Education must evolve with the world. Explore the skills learners need for the future.',
    category: 'Future',
    date: '2026-08-04',
    displayDate: 'August 4, 2026',
    readTime: '6 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/future.jpg',
    content: [
      {
        heading: 'Planning without a forecast',
        paragraphs: [
          'Nobody can name the jobs that will exist in fifteen years, which makes preparing for them sound impossible. It is not — it just means optimising for adaptability rather than for any particular destination.',
          'Learners who know how to learn stay employable through changes that nobody predicted.',
        ],
      },
      {
        heading: 'The durable core',
        paragraphs: [
          'Reasoning, communication, collaboration, and self-direction have outlasted every technology shift so far. They are the safest thing to invest a decade of schooling in.',
        ],
      },
    ],
  },
  {
    slug: 'creating-inclusive-learning-spaces',
    title: 'Creating Inclusive Learning Spaces',
    excerpt:
      'A truly effective learning environment gives every learner the confidence and opportunity to participate.',
    category: 'Community',
    date: '2026-07-28',
    displayDate: 'July 28, 2026',
    readTime: '5 min read',
    author: 'Ayadi Cloudversity',
    image: '/images/blog/inclusive-learning.jpg',
    content: [
      {
        heading: 'Participation is the measure',
        paragraphs: [
          'An inclusive classroom is not one where everyone is present. It is one where everyone contributes — and where the quiet students are quiet by choice rather than by exclusion.',
          'That distinction is visible in who speaks, who is asked, and who is waited for.',
        ],
      },
      {
        heading: 'Design, not goodwill',
        paragraphs: [
          'Good intentions do not redistribute attention on their own. Structured turn-taking, varied assessment, and accessible materials do.',
        ],
      },
    ],
  },
];

export const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category)))];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

/** Same category first, then most recent; never includes the post itself. */
export function getRelatedPosts(slug: string, limit = 3) {
  const current = getPost(slug);
  if (!current) return [];

  return posts
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const byCategory = Number(b.category === current.category) - Number(a.category === current.category);
      return byCategory !== 0 ? byCategory : b.date.localeCompare(a.date);
    })
    .slice(0, limit);
}

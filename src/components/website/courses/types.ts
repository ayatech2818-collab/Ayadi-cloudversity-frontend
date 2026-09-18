export type BrandId = 'ayadi' | 'ayatech' | 'netscape';

export interface BrandTabInfo {
  id: BrandId;
  name: string;
  subtitle: string;
  tagline: string;
  iconName: 'GraduationCap' | 'Cpu' | 'BookOpen';
}

export interface DummyCourseItem {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  image: string;
  badge: string;
}

export interface BrandSectionData {
  title: string;
  eyebrow: string;
  description: string;
  brandBadge: string;
  ctaText?: string;
  courses: DummyCourseItem[];
}

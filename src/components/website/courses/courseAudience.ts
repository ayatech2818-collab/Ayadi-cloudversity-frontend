/*
 * Who a course is for, by subcategory slug.
 *
 * The backend has no audience field, so this is the site's own copy, not course
 * data. Only subcategories whose name itself says who they serve are listed:
 * the rest (Leadership, Digital Literacy…) name a skill, and any line for them
 * would be a guess, so the page leaves the section out.
 */
const AUDIENCE_BY_SUBCATEGORY: Record<string, string> = {
  'preschool-to-secondary-school': 'School learners, from preschool through secondary.',
  'exam-booster': 'Students preparing for exams.',
  'entrance-scholarship-exams': 'Students preparing for entrance or scholarship exams.',
  'benchmarking-exams': 'Students taking benchmarking exams.',
  'higher-education': 'Learners in, or moving towards, higher education.',
  'inclusive-learning-support': 'Learners who need extra support with their learning.',
  'after-school-programmes': 'School-age learners, outside school hours.',
  'workspace-entry-programmes': 'People preparing to enter the workplace.',
  'employment-generation-skills': 'People building skills to find work.',
  'professional-development': 'Working professionals developing their careers.',
};

export const courseAudience = (subcategorySlug: string | undefined): string | undefined =>
  subcategorySlug ? AUDIENCE_BY_SUBCATEGORY[subcategorySlug] : undefined;

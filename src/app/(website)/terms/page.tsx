import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/website/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Ayadi Cloudversity",
  description:
    "The Terms & Conditions for using Ayadi Cloudversity's website, courses, and services.",
};

const sections: LegalSection[] = [
  {
    title: "Use of Our Services",
    body: "Our courses and services are intended for personal, non-commercial use only. You agree to use the platform responsibly and not engage in any activity that disrupts or harms the learning experience of others.",
  },
  {
    title: "Course Enrollment & Access",
    body: "Course access is granted upon successful enrollment and, where applicable, payment confirmation. Access duration, content availability, and learning outcomes may vary depending on the course.",
  },
  {
    title: "Payments & Refunds",
    body: "All fees are clearly stated at the time of enrollment. Payments must be completed in full to access paid courses. Refunds, if applicable, are governed by our refund policy and communicated separately.",
  },
  {
    title: "Intellectual Property",
    body: "All course materials, content, videos, and resources provided by Ayadi Cloudversity are protected by intellectual property laws. You may not copy, reproduce, distribute, or resell any content without written permission.",
  },
  {
    title: "User Responsibilities",
    body: "Users are responsible for maintaining the confidentiality of their account information and for all activities conducted through their account. Any misuse may result in suspension or termination of access.",
  },
  {
    title: "Limitation of Liability",
    body: "Ayadi Cloudversity shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our courses or services.",
  },
  {
    title: "Changes to Terms",
    body: "We reserve the right to update or modify these Terms & Conditions at any time. Continued use of our services after changes are posted constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms &"
      highlight="Conditions"
      intro="Welcome to Ayadi Cloudversity. By accessing or using our website, courses, and services, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before enrolling in or using any of our educational offerings."
      sections={sections}
    />
  );
}

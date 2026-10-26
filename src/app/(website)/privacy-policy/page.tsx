import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/website/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Ayadi Cloudversity",
  description:
    "How Ayadi Cloudversity collects, uses, and safeguards your personal information.",
};

const sections: LegalSection[] = [
  {
    title: "Information We Collect",
    body: "We may collect personal and non-personal information including:",
    items: [
      "Name, email address, and contact details",
      "Course enrollment and learning progress",
      "Payment and billing information",
      "Device, browser, and usage data",
    ],
  },
  {
    title: "How We Use Your Information",
    body: "The information collected is used to deliver courses, manage accounts, process transactions, communicate important updates, improve platform performance, and ensure a secure learning experience.",
  },
  {
    title: "Data Protection & Security",
    body: "We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, alteration, or disclosure.",
  },
  {
    title: "Third-Party Services",
    body: "We may use trusted third-party tools for payments, analytics, and course delivery. These services are bound by confidentiality and data protection obligations.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, update, or request deletion of your personal information. For any privacy-related requests, please contact us directly.",
  },
  {
    title: "Policy Updates",
    body: "This Privacy Policy may be updated periodically. Any changes will be posted on this page to keep you informed.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy"
      highlight="Policy"
      intro="At Ayadi Cloudversity, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you access our educational courses, services, and website."
      sections={sections}
    />
  );
}

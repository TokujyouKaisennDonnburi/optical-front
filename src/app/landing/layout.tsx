import {
  OrganizationJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD 構造化データ（SEO用） */}
      <WebApplicationJsonLd />
      <OrganizationJsonLd />
      {children}
    </>
  );
}

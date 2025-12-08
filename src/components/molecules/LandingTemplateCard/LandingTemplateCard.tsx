// src/components/molecules/LandingTemplateCard/LandingTemplateCard.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import type { LandingTemplate } from "@/components/organisms/LandingTemplateSection/TemplateData";

type Props = {
  template: LandingTemplate;
  onClick: (id: string) => void;
};

export const LandingTemplateCard = ({ template, onClick }: Props) => {
  return (
    <Card
      className="
        bg-white 
        border border-gray-300 
        rounded-3xl 
        shadow-sm
        overflow-hidden 
        w-full"
    >
      {/* タイトルヘッダー */}
      <div className="bg-gray-200 w-full text-center py-5 rounded-t-3xl">
        <Text as="h3" size="lg" weight="bold" className="text-gray-800">
          {template.name}
        </Text>
      </div>

      {/* 本文エリア */}
      <div className="p-6 flex flex-col gap-4 text-left">
        {/* 説明文 */}
        <Text as="p" size="md" className="text-gray-900">
          {template.description}
        </Text>

        {/* 箇条書きオプション */}
        <div className="text-gray-900 leading-relaxed">
          {template.options?.map((opt, index) => (
            <p key={`${template.id}-option-${index}`}>・{opt}</p>
          ))}
        </div>
        {/* 始めるボタン */}
        <Button
          size="lg"
          className="mt-4 w-full bg-black text-white rounded-xl py-3 text-center"
          onClick={() => onClick(template.id)}
        >
          <Link href="/auth/signup">
            <Text as="span" size="md" weight="medium">
              このテンプレートで始める
            </Text>
          </Link>
        </Button>
      </div>
    </Card>
  );
};

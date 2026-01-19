import Link from "next/link";
import { Text } from "@/components/atoms/Text";

export const LandingFooter = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-10 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gray-700">
        {/* 1列目: OptiCal */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Text as="h4" size="lg" weight="bold" className="mb-4 text-white">
            OptiCal
          </Text>
          <Text as="span" size="sm">
            用途に合わせた
            <br />
            スケジュール管理サービス
            <br />
          </Text>
        </div>

        {/* 2列目: サービス */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Text as="h4" size="md" weight="bold" className="mb-4 text-white">
            サービス
          </Text>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              製品紹介
            </Text>
          </Link>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              Option紹介
            </Text>
          </Link>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              テンプレート紹介
            </Text>
          </Link>
        </div>

        {/* 3列目: ヘルプ */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Text as="h4" size="md" weight="bold" className="mb-4 text-white">
            ヘルプ
          </Text>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              よくある質問
            </Text>
          </Link>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              お問い合わせ
            </Text>
          </Link>
        </div>

        {/* 4列目: 法的情報 */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Text as="h4" size="md" weight="bold" className="mb-4 text-white">
            法的情報
          </Text>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              利用規約
            </Text>
          </Link>
          <Link href="" className="mb-2 hover:text-white transition-colors">
            <Text as="span" size="sm">
              プライバシーポリシー
            </Text>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-8 text-center">
        <Text as="p" size="sm" className="text-gray-500">
          &copy; 2025 OptiCal. All rights reserved.
        </Text>
      </div>
    </footer>
  );
};

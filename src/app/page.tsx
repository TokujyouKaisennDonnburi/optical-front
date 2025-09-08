"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { Icon } from "@/components/atoms/Icon";
import { Calendar as CalendarIcon, Check, User, Mail, Info } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/atoms/HoverCard";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Calendar } from "@/components/atoms/Calendar";
import { Toaster, toast } from "@/components/atoms/Toast";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>

        {/* Atoms preview (temporary) */}
        <Showcase />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

function Showcase() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <section className="w-full max-w-5xl rounded-lg border p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Icon icon={CalendarIcon} />
        <Text as="p" size="lg" weight="semibold">
          UI Atoms Preview
        </Text>
      </div>

      {/* Inputs & Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Text as="label" size="sm" weight="medium" htmlFor="demo-input">
            Email
          </Text>
          <Input id="demo-input" placeholder="example@mail.com" />
          <Text as="p" size="sm" className="text-muted-foreground flex items-center gap-1">
            <Icon icon={Info} size={16} /> We'll never share your email.
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg" className="gap-1">
            <Icon icon={Check} size="sm" /> Confirm
          </Button>
          <Button variant="link" className="px-1 py-0 h-auto">
            Link style
          </Button>
        </div>
      </div>

      {/* Card & Avatar & Badge */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/100?img=13" alt="avatar" />
              <AvatarFallback>
                <Icon icon={User} />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Atoms Card</CardTitle>
              <CardDescription>Avatar / Badge / Text inside Card</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="cb1" defaultChecked />
            <Text as="label" htmlFor="cb1">
              I agree to the terms
            </Text>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={() => toast.success("Saved!", { description: "Your changes were saved." })}>
            Save
          </Button>
          <Button variant="outline">Cancel</Button>
        </CardFooter>
      </Card>

      {/* HoverCard */}
      <div>
        <HoverCard>
          <HoverCardTrigger>
            <Text as="span" className="underline cursor-pointer">
              Hover me
            </Text>
          </HoverCardTrigger>
          <HoverCardContent>Here is some hover content.</HoverCardContent>
        </HoverCard>
      </div>

      {/* ScrollArea & Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <ScrollArea className="h-48 w-full rounded-md border p-3">
          <div className="space-y-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-6 rounded bg-secondary" />
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-2">
        <Text weight="medium">Calendar</Text>
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border inline-block" />
      </div>

      {/* Toaster */}
      <Toaster />
    </section>
  );
}

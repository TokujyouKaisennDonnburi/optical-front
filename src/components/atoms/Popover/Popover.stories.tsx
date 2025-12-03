import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Atoms/Popover",
  component: Popover,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Dimensions</h4>
              <p className="text-muted-foreground text-sm">
                Set the dimensions for the layer.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  defaultValue="100%"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Max. width</Label>
                <Input
                  id="maxWidth"
                  defaultValue="300px"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  defaultValue="25px"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxHeight">Max. height</Label>
                <Input
                  id="maxHeight"
                  defaultValue="none"
                  className="col-span-2 h-8"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <PopoverClose asChild>
              <Button variant="ghost">Close</Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

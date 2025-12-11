import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { MilestoneProgress } from "@/components/molecules/MilestoneProgress/MilestoneProgress";

type MilestoneProgressOptionProps = {
  open?: number;
  closed?: number;
  milestoneName?: string;
  title?: string;
};

const MilestoneProgressOption: 
    React.FC<MilestoneProgressOptionProps> = ({ 
        open, closed, milestoneName, title = "マイルストーン進行率確認",
    }) => {

  return (
    <Card className="p-0 rounded-lg shadow">
        <CardHeader className="text-ceter">
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <MilestoneProgress open={open} closed={closed} milestoneName={milestoneName} />
        </CardContent>
    </Card>
  );
};

export default MilestoneProgressOption;

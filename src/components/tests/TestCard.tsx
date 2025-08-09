import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestRequest } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

interface Props { test: TestRequest }

const TestCard = ({ test }: Props) => {
  const navigate = useNavigate();
  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{test.title}</span>
          <Badge variant="secondary">{test.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Time: {test.timeRequired} min</span>
          <span>Reward: <Badge>{test.reward} cr</Badge></span>
        </div>
        <Button onClick={() => navigate(`/test/${test.id}`)}>Test Now</Button>
      </CardContent>
    </Card>
  );
};

export default TestCard;

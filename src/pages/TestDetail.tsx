import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";

const TestDetail = () => {
  const { id } = useParams();
  const { user, tests, feedbacks, submitFeedback, approveFeedback } = useApp();
  const test = useMemo(()=> tests.find((t)=> t.id === id), [tests, id]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);

  const mySubmitted = useMemo(()=> feedbacks.find((f)=> f.testId === id && f.testerId === user?.id), [feedbacks, id, user?.id]);
  const pendingForOwner = useMemo(()=> feedbacks.filter((f)=> f.testId === id && f.status === "submitted"), [feedbacks, id]);

  if (!test) return <div className="container py-10">Test not found.</div>;

  const isOwner = user?.id === test.ownerId;

  return (
    <div className="container py-10 space-y-8">
      <Helmet>
        <title>{test.title} — IdeaSoop Beta Hub</title>
        <meta name="description" content={test.goals} />
        <link rel="canonical" href={`/test/${test.id}`} />
      </Helmet>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{test.title}</span>
                <span className="text-sm text-muted-foreground">{test.type} • {test.timeRequired} min • Reward {test.reward} cr</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium mb-1">Testing Goals</div>
                <p className="text-muted-foreground">{test.goals}</p>
              </div>
              <div>
                <div className="font-medium mb-1">Demo Link</div>
                <a href={test.link} target="_blank" rel="noreferrer" className="text-foreground underline break-all">{test.link}</a>
              </div>
              {test.nda && (
                <div className="rounded-md border p-3 text-sm">This test requires NDA acknowledgement.</div>
              )}
            </CardContent>
          </Card>

          {!isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mySubmitted ? (
                  <div className="rounded-md border p-4 text-sm">You submitted feedback — status: <span className="font-medium">{mySubmitted.status}</span></div>
                ) : (
                  <form className="grid gap-4" onSubmit={(e)=> { e.preventDefault(); submitFeedback(test.id, content, rating); }}>
                    <div className="grid gap-2">
                      <Label>Your Feedback</Label>
                      <Textarea value={content} onChange={(e)=> setContent(e.target.value)} required rows={5} />
                    </div>
                    <div className="grid gap-2 max-w-[200px]">
                      <Label>Rating (1-5)</Label>
                      <Input type="number" min={1} max={5} value={rating} onChange={(e)=> setRating(Number(e.target.value))} />
                    </div>
                    <Button type="submit">Submit Feedback</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Approvals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingForOwner.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No pending feedback.</div>
                ) : (
                  pendingForOwner.map((f)=> (
                    <div key={f.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                      <div className="max-w-[420px]">
                        <div className="font-medium">Submission</div>
                        <div className="text-muted-foreground truncate">{f.content}</div>
                      </div>
                      <Button size="sm" onClick={()=> approveFeedback(f.id)}>Approve</Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestDetail;

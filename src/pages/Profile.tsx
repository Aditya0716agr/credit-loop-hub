import { Helmet } from "react-helmet-async";
import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BuyCreditsModal from "@/components/credits/BuyCreditsModal";
import { useMemo, useState } from "react";
import TestCard from "@/components/tests/TestCard";

const Profile = () => {
  const { user, credits, tests, feedbacks } = useApp();
  const [buyOpen, setBuyOpen] = useState(false);

  const myPosted = useMemo(()=> tests.filter((t)=> t.ownerId === user?.id), [tests, user?.id]);
  const myCompleted = useMemo(()=> feedbacks.filter((f)=> f.testerId === user?.id), [feedbacks, user?.id]);

  return (
    <div className="container py-10 space-y-8">
      <Helmet>
        <title>Profile — IdeaSoop Beta Hub</title>
        <meta name="description" content="View your profile, credit balance, and activity." />
        <link rel="canonical" href="/profile" />
      </Helmet>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {(user?.name ?? "U").slice(0,2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xl font-medium">{user?.name || "Guest"}</div>
            {user?.bio && (
              <div className="text-sm text-muted-foreground max-w-md">{user.bio}</div>
            )}
            <div className="text-sm text-muted-foreground mt-1">
              Credits: <span className="font-medium text-foreground">{credits}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={()=> setBuyOpen(true)}>Buy Credits</Button>
          {!user && <Button asChild><Link to="/login">Login</Link></Button>}
        </div>
      </div>

      <Tabs defaultValue="posted" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posted">My Posted Tests</TabsTrigger>
          <TabsTrigger value="completed">Tests Completed</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        <TabsContent value="posted" className="space-y-4">
          {myPosted.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">No tests posted yet.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosted.map((t)=> <TestCard key={t.id} test={t} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {myCompleted.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">No completed tests yet.</CardContent></Card>
          ) : (
            myCompleted.map((f)=> (
              <Card key={f.id}>
                <CardHeader>
                  <CardTitle className="text-base">Feedback submitted — {new Date(f.createdAt).toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{f.content}</div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="badges">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Badges & achievements coming soon.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BuyCreditsModal open={buyOpen} onOpenChange={setBuyOpen} />
    </div>
  );
};

export default Profile;

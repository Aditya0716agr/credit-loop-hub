import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { Megaphone, Clock, Users, Coins, ArrowLeft } from "lucide-react";

const PostTest = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeRequired: "5-10",
    maxTesters: "3",
    reward: "5",
    tasks: "",
    targetAudience: "",
    requirements: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth?redirect=/post");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual test posting logic
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the new test
      navigate("/hub");
    } catch (error) {
      console.error("Failed to post test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const timeOptions = [
    { value: "5-10", label: "5-10 minutes", credits: 3 },
    { value: "10-20", label: "10-20 minutes", credits: 5 },
    { value: "20+", label: "20+ minutes", credits: 10 }
  ];

  const selectedTime = timeOptions.find(t => t.value === formData.timeRequired);
  const suggestedReward = selectedTime?.credits || 3;

  return (
    <div className="container max-w-4xl py-8">
      <Helmet>
        <title>Post a Test — Refi</title>
        <meta name="description" content="Post your test and get real user feedback within hours. Fast, simple, and effective." />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-sm font-medium">
            <Megaphone className="h-4 w-4" />
            <span>Post Your Test</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Get Your Product Tested</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create a clear test brief and get real user feedback within hours. 
            Our community of testers will help you validate your ideas fast.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Test our new mobile app onboarding flow"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you want testers to do and what you're trying to learn..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timeRequired">Time Required *</Label>
                <Select
                  value={formData.timeRequired}
                  onValueChange={(value) => handleInputChange("timeRequired", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <Badge variant="secondary">{option.credits} cr</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Recommended reward: {suggestedReward} credits
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTesters">Max Testers *</Label>
                <Select
                  value={formData.maxTesters}
                  onValueChange={(value) => handleInputChange("maxTesters", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'tester' : 'testers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Details */}
        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tasks">Specific Tasks *</Label>
              <Textarea
                id="tasks"
                placeholder="List the specific steps testers should follow. Be clear and concise..."
                value={formData.tasks}
                onChange={(e) => handleInputChange("tasks", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Small business owners, Mobile app users, etc."
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements (device, browser, experience level, etc.)"
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Pricing & Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reward">Credit Reward per Tester *</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="reward"
                  type="number"
                  min="1"
                  value={formData.reward}
                  onChange={(e) => handleInputChange("reward", e.target.value)}
                  className="w-32"
                  required
                />
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Total cost: {Number(formData.reward) * Number(formData.maxTesters)} credits 
                ({formData.maxTesters} testers × {formData.reward} credits each)
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">Pricing Guidelines</h4>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>5-10 minutes:</span>
                  <Badge variant="outline">3-5 credits</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>10-20 minutes:</span>
                  <Badge variant="outline">5-8 credits</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>20+ minutes:</span>
                  <Badge variant="outline">8-15 credits</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Posting Test..." : "Post Test"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/hub")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Your test will be reviewed and published within 24 hours. 
            You'll be notified when testers start completing it.
          </p>
        </div>
      </form>
    </div>
  );
};

export default PostTest;

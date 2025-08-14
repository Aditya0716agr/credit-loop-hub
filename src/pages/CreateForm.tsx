import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'long_answer' | 'rating' | 'yes_no' | 'email';
  title: string;
  description: string;
  required: boolean;
  options: string[];
}

const CreateForm = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  
  // Form basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<'internal' | 'external' | 'private'>('internal');
  const [creditsPerResponse, setCreditsPerResponse] = useState(1);
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'short_answer',
      title: '',
      description: '',
      required: false,
      options: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [...(questions.find(q => q.id === questionId)?.options || []), '']
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newOptions = question.options.filter((_, index) => index !== optionIndex);
    updateQuestion(questionId, { options: newOptions });
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!user) {
      toast.error('You must be signed in to create forms');
      return;
    }

    if (!title.trim()) {
      toast.error('Form title is required');
      return;
    }

    if (questions.length === 0) {
      toast.error('Add at least one question to your form');
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.title.trim()) {
        toast.error('All questions must have a title');
        return;
      }
      if (question.type === 'multiple_choice' && question.options.length < 2) {
        toast.error('Multiple choice questions must have at least 2 options');
        return;
      }
    }

    setLoading(true);
    try {
      // Create form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          creator_id: user.id,
          status,
          visibility,
          credits_per_response: creditsPerResponse
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create questions
      const questionsToInsert = questions.map((question, index) => ({
        form_id: form.id,
        type: question.type,
        title: question.title.trim(),
        description: question.description.trim() || null,
        required: question.required,
        options: question.type === 'multiple_choice' ? question.options.filter(opt => opt.trim()) : [],
        order_index: index
      }));

      const { error: questionsError } = await supabase
        .from('form_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success(`Form ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
      navigate('/forms');
    } catch (error: any) {
      console.error('Error creating form:', error);
      toast.error(error.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-10 max-w-2xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-4">You need to be signed in to create forms.</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl">
      <Helmet>
        <title>Create Form — IdeaSoop</title>
        <meta name="description" content="Create a new form for idea validation and feedback collection." />
        <link rel="canonical" href="/forms/create" />
      </Helmet>

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/forms">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Form</h1>
          <p className="text-muted-foreground">Build a custom form to collect feedback and validate ideas.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter form title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this form is for..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal - Team members only</SelectItem>
                    <SelectItem value="external">External - Share with anyone</SelectItem>
                    <SelectItem value="private">Private - Only you can access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="credits">Credits per Response</Label>
                <Input
                  id="credits"
                  type="number"
                  min="0"
                  max="10"
                  value={creditsPerResponse}
                  onChange={(e) => setCreditsPerResponse(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Questions</CardTitle>
              <Button onClick={addQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions added yet. Click "Add Question" to get started.
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                          <SelectItem value="long_answer">Long Answer</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="rating">Rating (1-5)</SelectItem>
                          <SelectItem value="yes_no">Yes/No</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id={`required-${question.id}`}
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                      />
                      <Label htmlFor={`required-${question.id}`}>Required</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Question Title *</Label>
                    <Input
                      value={question.title}
                      onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                      placeholder="Enter your question..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description (optional)</Label>
                    <Input
                      value={question.description}
                      onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                      placeholder="Add additional context..."
                      className="mt-1"
                    />
                  </div>

                  {question.type === 'multiple_choice' && (
                    <div>
                      <div className="flex justify-between items-center">
                        <Label>Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(question.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2 mt-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('active')}
            disabled={loading}
          >
            Publish Form
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateForm;
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";

interface Form {
  id: string;
  title: string;
  description: string | null;
  status: string;
  visibility: string;
  response_count: number;
  credits_per_response: number;
  created_at: string;
  updated_at: string;
}

const Forms = () => {
  const { user } = useApp();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setForms(data || []);
      } catch (error) {
        console.error('Error fetching forms:', error);
        toast.error('Failed to load forms');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'draft': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'closed': return 'bg-slate-500/10 text-slate-700 border-slate-200';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'internal': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'external': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'private': return 'bg-slate-500/10 text-slate-700 border-slate-200';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  if (!user) {
    return (
      <div className="container py-10 max-w-2xl">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-4">You need to be signed in to create and manage forms.</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Helmet>
        <title>Forms — IdeaSoop</title>
        <meta name="description" content="Create and manage internal forms for idea validation and feedback collection." />
        <link rel="canonical" href="/forms" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Forms</h1>
          <p className="text-muted-foreground">Create and manage forms for idea validation and feedback.</p>
        </div>
        <Button asChild>
          <Link to="/forms/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first form to collect feedback and validate ideas.
            </p>
            <Button asChild>
              <Link to="/forms/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{form.title}</CardTitle>
                  <div className="flex gap-1 flex-col">
                    <Badge variant="outline" className={getStatusColor(form.status)}>
                      {form.status}
                    </Badge>
                    <Badge variant="outline" className={getVisibilityColor(form.visibility)}>
                      {form.visibility}
                    </Badge>
                  </div>
                </div>
                {form.description && (
                  <CardDescription className="line-clamp-2">
                    {form.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{form.response_count} responses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>+{form.credits_per_response} credits</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/forms/${form.id}/edit`}>Edit</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link to={`/forms/${form.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forms;
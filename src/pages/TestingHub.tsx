import { Helmet } from "react-helmet-async";
import { useApp } from "@/context/AppContext";
import TestCard from "@/components/tests/TestCard";
import FilterBar, { Filters } from "@/components/tests/FilterBar";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const TestingHub = () => {
  const { tests } = useApp();
  const [filters, setFilters] = useState<Filters>({ category: "All", time: "All", minReward: 0 });
  const [visible, setVisible] = useState(6);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      if (filters.category !== "All" && t.type !== filters.category) return false;
      if (filters.time !== "All" && t.timeRequired !== filters.time) return false;
      if (t.reward < filters.minReward) return false;
      return true;
    });
  }, [tests, filters]);

  return (
    <div className="container py-10 space-y-8">
      <Helmet>
        <title>Testing Hub — IdeaSoop Beta Hub</title>
        <meta name="description" content="Browse active beta tests and earn credits by helping founders." />
        <link rel="canonical" href="/hub" />
      </Helmet>

      <h1 className="text-3xl font-semibold tracking-tight">Testing Hub</h1>
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(0, visible).map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>

      {visible < filtered.length && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setVisible((v) => v + 6)}>Load more</Button>
        </div>
      )}
    </div>
  );
};

export default TestingHub;

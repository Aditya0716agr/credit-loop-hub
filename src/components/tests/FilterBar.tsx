import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface Filters {
  category: "All" | "Website" | "App" | "Service Flow" | "Other";
  time: "All" | 5 | 10 | 15 | 30;
  minReward: number;
}

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
}

const FilterBar = ({ filters, onChange }: Props) => {
  return (
    <div className="rounded-lg border p-4 md:p-5 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={filters.category} onValueChange={(v)=> onChange({ ...filters, category: v as Filters["category"] })}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              {(["All","Website","App","Service Flow","Other"] as const).map((c)=> (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Time Required</Label>
          <Select value={String(filters.time)} onValueChange={(v)=> onChange({ ...filters, time: (v === "All" ? "All" : Number(v)) as Filters["time"] })}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              {(["All",5,10,15,30] as const).map((t)=> (
                <SelectItem key={String(t)} value={String(t)}>{String(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Min Reward: {filters.minReward} cr</Label>
          <Slider value={[filters.minReward]} onValueChange={(v)=> onChange({ ...filters, minReward: v[0] })} min={0} max={20} step={1} />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

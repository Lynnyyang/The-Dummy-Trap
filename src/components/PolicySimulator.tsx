import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Briefcase,
  GraduationCap,
  User,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  calculateSalary, 
  getSalaryBreakdown,
  formatCurrency,
  COEFFICIENTS,
  type Person,
  type Gender,
  type Education,
  type JobType
} from '@/lib/regression';

interface CandidateCardProps {
  id: string;
  person: Person;
  genderPenaltyOverride?: number;
  onUpdate: (updates: Partial<Person>) => void;
}

function CandidateCard({ id, person, genderPenaltyOverride, onUpdate }: CandidateCardProps) {
  const originalSalary = calculateSalary(person);
  
  // Calculate modified salary if gender penalty is overridden
  const modifiedSalary = useMemo(() => {
    if (genderPenaltyOverride === undefined || person.gender === 'male') {
      return originalSalary;
    }
    // Calculate what salary would be with modified gender coefficient
    const baseSalary = originalSalary - COEFFICIENTS.sex;
    return baseSalary + genderPenaltyOverride;
  }, [originalSalary, genderPenaltyOverride, person.gender]);

  const breakdown = getSalaryBreakdown(person);
  const salaryDiff = modifiedSalary - originalSalary;

  const educationOptions: { value: Education; label: string }[] = [
    { value: 'below', label: '初中以下' },
    { value: 'junior', label: '初中' },
    { value: 'senior', label: '高中' },
    { value: 'university', label: '大学' },
  ];

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className="text-sm">
          候选人 {id}
        </Badge>
        <div className="flex items-center gap-2">
          {person.gender === 'female' ? (
            <User className="w-5 h-5 text-destructive" />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-4">
        {/* Age */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">年龄</span>
            <span className="font-medium">{person.age}岁</span>
          </div>
          <Slider
            value={[person.age]}
            onValueChange={([age]) => onUpdate({ age })}
            min={20}
            max={60}
            step={1}
            className="w-full"
          />
        </div>

        {/* Gender */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">性别</Label>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${person.gender === 'male' ? 'text-foreground' : 'text-muted-foreground'}`}>
              男
            </span>
            <Switch
              checked={person.gender === 'female'}
              onCheckedChange={(checked) => onUpdate({ gender: checked ? 'female' : 'male' })}
            />
            <span className={`text-sm ${person.gender === 'female' ? 'text-foreground' : 'text-muted-foreground'}`}>
              女
            </span>
          </div>
        </div>

        {/* Education */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">学历</Label>
          <div className="grid grid-cols-2 gap-2">
            {educationOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={person.education === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate({ education: opt.value })}
                className="text-xs"
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">铁饭碗</Label>
          <Switch
            checked={person.jobType === 'stable'}
            onCheckedChange={(checked) => onUpdate({ jobType: checked ? 'stable' : 'unstable' })}
          />
        </div>
      </div>

      {/* Salary Display */}
      <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
        <div className="text-sm text-muted-foreground mb-1">理论薪资</div>
        <div className="flex items-end gap-3">
          <motion.div
            key={modifiedSalary}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold"
          >
            {formatCurrency(modifiedSalary)}
          </motion.div>
          {salaryDiff !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center text-sm ${salaryDiff > 0 ? 'text-success' : 'text-destructive'}`}
            >
              {salaryDiff > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {salaryDiff > 0 ? '+' : ''}{formatCurrency(salaryDiff)}
            </motion.div>
          )}
        </div>

        {/* Breakdown */}
        <div className="mt-4 space-y-1">
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{item.component}</span>
              <span className={item.value >= 0 ? 'text-success' : 'text-destructive'}>
                {item.value >= 0 ? '+' : ''}{formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function PolicySimulator() {
  const [candidateA, setCandidateA] = useState<Person>({
    age: 30,
    gender: 'male',
    education: 'senior',
    jobType: 'unstable',
  });

  const [candidateB, setCandidateB] = useState<Person>({
    age: 30,
    gender: 'female',
    education: 'university',
    jobType: 'stable',
  });

  const [genderPenalty, setGenderPenalty] = useState<number>(COEFFICIENTS.sex);
  const [simulateNoIronRice, setSimulateNoIronRice] = useState(false);

  // Calculate costs
  const salaryA = calculateSalary(candidateA);
  const salaryB = useMemo(() => {
    let salary = calculateSalary(candidateB);
    if (candidateB.gender === 'female') {
      salary = salary - COEFFICIENTS.sex + genderPenalty;
    }
    return salary;
  }, [candidateB, genderPenalty]);

  const totalCost = salaryA + salaryB;
  const policyAdjustment = candidateB.gender === 'female' ? genderPenalty - COEFFICIENTS.sex : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-warning" />
            政策模拟器
          </h2>
          <p className="text-muted-foreground mt-1">
            HR视角：理解回归系数的经济含义
          </p>
        </div>
      </div>

      {/* Candidate Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CandidateCard
          id="A"
          person={candidateA}
          onUpdate={(updates) => setCandidateA({ ...candidateA, ...updates })}
        />
        <CandidateCard
          id="B"
          person={candidateB}
          genderPenaltyOverride={genderPenalty}
          onUpdate={(updates) => setCandidateB({ ...candidateB, ...updates })}
        />
      </div>

      {/* Policy Controls */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          政策干预面板
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gender Policy Slider */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">性别差异系数调整</span>
                <Badge variant={genderPenalty === 0 ? 'default' : 'secondary'}>
                  {genderPenalty === 0 ? '完全公平' : formatCurrency(genderPenalty)}
                </Badge>
              </div>
              <Slider
                value={[genderPenalty]}
                onValueChange={([value]) => setGenderPenalty(value)}
                min={COEFFICIENTS.sex}
                max={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatCurrency(COEFFICIENTS.sex)}（当前）</span>
                <span>0（公平）</span>
              </div>
            </div>
            
            {policyAdjustment !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-success/10 border border-success/30"
              >
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-success">
                    政策调整后，候选人B薪资增加 {formatCurrency(policyAdjustment)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Iron Rice Bowl Simulation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">模拟取消铁饭碗制度</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  观察高学历员工的薪资变化
                </p>
              </div>
              <Switch
                checked={simulateNoIronRice}
                onCheckedChange={setSimulateNoIronRice}
              />
            </div>

            {simulateNoIronRice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-accent/10 border border-accent/30"
              >
                <div className="text-sm text-accent">
                  <strong>洞察发现：</strong>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  根据模型(3)，当取消铁饭碗制度时，高学历员工的薪资反而上升！
                  因为去掉了负的交互项 DPT × DE4 = {formatCurrency(COEFFICIENTS.interaction.dptDE4)}。
                  这验证了"鼓励高学历者创业/去私企"的结论。
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">团队总人力成本</span>
            </div>
            <motion.div
              key={totalCost}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-primary"
            >
              {formatCurrency(totalCost)}
            </motion.div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>候选人 A: {formatCurrency(salaryA)}</span>
            <ArrowRight className="w-4 h-4" />
            <span>候选人 B: {formatCurrency(salaryB)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

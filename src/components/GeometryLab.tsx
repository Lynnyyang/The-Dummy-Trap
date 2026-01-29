import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { 
  generateChartData, 
  COEFFICIENTS, 
  formatCurrency,
  type Gender,
  type Education,
  type JobType 
} from '@/lib/regression';

interface LineConfig {
  id: string;
  gender: Gender;
  education: Education;
  jobType: JobType;
  color: string;
  label: string;
  active: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-sm text-muted-foreground mb-1">{label}岁</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function GeometryLab() {
  const [showFemale, setShowFemale] = useState(false);
  const [education, setEducation] = useState<Education>('below');
  const [showStableJob, setShowStableJob] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  // Generate data for all configurations
  const chartData = useMemo(() => {
    const ages = Array.from({ length: 21 }, (_, i) => 20 + i * 2);
    
    return ages.map(age => {
      const result: Record<string, number | string> = { age };
      
      // Baseline (male, below education, unstable)
      result.baseline = generateChartData('male', 'below', 'unstable', [age, age])[0].salary;
      
      // Current selection
      const gender: Gender = showFemale ? 'female' : 'male';
      const jobType: JobType = showStableJob ? 'stable' : 'unstable';
      result.current = generateChartData(gender, education, jobType, [age, age])[0].salary;
      
      return result;
    });
  }, [showFemale, education, showStableJob]);

  // Calculate the current effect
  const currentEffect = useMemo(() => {
    const baselineSalary = (chartData[5]?.baseline as number) || 0;
    const currentSalary = (chartData[5]?.current as number) || 0;
    return currentSalary - baselineSalary;
  }, [chartData]);

  const educationOptions: { value: Education; label: string; effect: number }[] = [
    { value: 'below', label: '初中以下', effect: 0 },
    { value: 'junior', label: '初中', effect: COEFFICIENTS.education.junior },
    { value: 'senior', label: '高中', effect: COEFFICIENTS.education.senior },
    { value: 'university', label: '大学', effect: COEFFICIENTS.education.university },
  ];

  const hasInteractionEffect = showStableJob && education !== 'below';
  const interactionValue = hasInteractionEffect 
    ? education === 'junior' ? COEFFICIENTS.interaction.dptDE2
    : education === 'senior' ? COEFFICIENTS.interaction.dptDE3
    : COEFFICIENTS.interaction.dptDE4
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            几何实验室
          </h2>
          <p className="text-muted-foreground mt-1">
            探索虚拟变量如何改变回归线：截距移动 vs 斜率旋转
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="age" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: '年龄', position: 'bottom', fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                  label={{ value: '薪资', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Baseline reference line */}
                {showComparison && (
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="hsl(var(--base-line))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    name="基准线"
                  />
                )}
                
                {/* Current selection line */}
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke={hasInteractionEffect ? "hsl(var(--interaction-effect))" : "hsl(var(--primary))"}
                  strokeWidth={3}
                  dot={false}
                  name="当前选择"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-baseline border-dashed border-baseline border-t-2" />
              <span className="text-sm text-muted-foreground">基准组（初中以下/男/非稳定）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-primary rounded" />
              <span className="text-sm text-muted-foreground">当前选择</span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Gender Toggle */}
          <motion.div 
            className="glass-card p-4"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">性别</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {showFemale ? '女性' : '男性（基准）'}
                </p>
              </div>
              <Switch checked={showFemale} onCheckedChange={setShowFemale} />
            </div>
            {showFemale && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2"
              >
                <ArrowDown className="w-4 h-4 text-destructive" />
                <Badge variant="destructive" className="font-mono">
                  {formatCurrency(COEFFICIENTS.sex)}
                </Badge>
                <span className="text-xs text-muted-foreground">性别差异</span>
              </motion.div>
            )}
          </motion.div>

          {/* Education Selection */}
          <div className="glass-card p-4">
            <Label className="text-base font-medium">学历</Label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {educationOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  onClick={() => setEducation(opt.value)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    education === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 hover:bg-secondary text-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {opt.label}
                  {opt.effect > 0 && (
                    <span className="block text-xs opacity-80 font-mono">
                      +{(opt.effect / 10000).toFixed(1)}万
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            {education !== 'below' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2"
              >
                <ArrowUp className="w-4 h-4 text-primary" />
                <Badge className="font-mono bg-primary/20 text-primary border-primary/30">
                  +{formatCurrency(educationOptions.find(e => e.value === education)?.effect || 0)}
                </Badge>
                <span className="text-xs text-muted-foreground">学历溢价</span>
              </motion.div>
            )}
          </div>

          {/* Job Type Toggle */}
          <motion.div 
            className="glass-card p-4"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">工作类型</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {showStableJob ? '铁饭碗' : '非稳定工作（基准）'}
                </p>
              </div>
              <Switch checked={showStableJob} onCheckedChange={setShowStableJob} />
            </div>
            {showStableJob && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-warning" />
                  <Badge className="font-mono bg-warning/20 text-warning border-warning/30">
                    +{formatCurrency(COEFFICIENTS.job)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">铁饭碗效应</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Interaction Effect Warning */}
          {hasInteractionEffect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4 border-accent/50 bg-accent/10"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent flex items-center gap-2">
                    检测到交互效应！
                    <Sparkles className="w-4 h-4" />
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    铁饭碗 × {educationOptions.find(e => e.value === education)?.label} 
                    的交互项抵消了原本的溢价
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-accent" />
                    <Badge className="font-mono bg-accent/20 text-accent border-accent/30">
                      {formatCurrency(interactionValue)}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Total Effect Summary */}
          <div className="glass-card p-4 border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">总效应（相对基准）</span>
              <motion.span
                key={currentEffect}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`font-mono font-bold ${
                  currentEffect >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {currentEffect >= 0 ? '+' : ''}{formatCurrency(currentEffect)}
              </motion.span>
            </div>
          </div>

          {/* Show Comparison Toggle */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">显示基准线对比</span>
            <Switch checked={showComparison} onCheckedChange={setShowComparison} />
          </div>
        </div>
      </div>
    </div>
  );
}

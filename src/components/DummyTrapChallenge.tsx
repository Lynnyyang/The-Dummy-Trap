import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb, Puzzle, RotateCcw } from 'lucide-react';

type Variable = {
  id: string;
  label: string;
  type: 'intercept' | 'continuous' | 'dummy';
  category?: string;
  coefficient?: string;
};

const AVAILABLE_VARIABLES: Variable[] = [
  { id: 'C', label: 'C (截距)', type: 'intercept', coefficient: 'β₀' },
  { id: 'Age', label: 'Age (年龄)', type: 'continuous', coefficient: 'β₁' },
  { id: 'DE1', label: 'D_初中以下', type: 'dummy', category: 'education' },
  { id: 'DE2', label: 'D_初中', type: 'dummy', category: 'education' },
  { id: 'DE3', label: 'D_高中', type: 'dummy', category: 'education' },
  { id: 'DE4', label: 'D_大学', type: 'dummy', category: 'education' },
];

export function DummyTrapChallenge() {
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasIntercept = selectedVariables.includes('C');
  const educationVars = selectedVariables.filter(v => 
    ['DE1', 'DE2', 'DE3', 'DE4'].includes(v)
  );
  
  const isTrapped = hasIntercept && educationVars.length === 4;
  const isValid = selectedVariables.length > 0 && !isTrapped;

  const handleAddVariable = (varId: string) => {
    if (selectedVariables.includes(varId)) return;
    
    const newSelected = [...selectedVariables, varId];
    const newEducationVars = newSelected.filter(v => 
      ['DE1', 'DE2', 'DE3', 'DE4'].includes(v)
    );
    const newHasIntercept = newSelected.includes('C');
    
    if (newHasIntercept && newEducationVars.length === 4) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    setSelectedVariables(newSelected);
  };

  const handleRemoveVariable = (varId: string) => {
    setSelectedVariables(prev => prev.filter(v => v !== varId));
    setShowSuccess(false);
  };

  const handleReset = () => {
    setSelectedVariables([]);
    setShowError(false);
    setShowSuccess(false);
  };

  const handleValidate = () => {
    if (isValid) {
      setShowSuccess(true);
    }
  };

  const getVariableColor = (v: Variable) => {
    if (v.type === 'intercept') return 'bg-warning/20 text-warning border-warning/30';
    if (v.type === 'continuous') return 'bg-success/20 text-success border-success/30';
    return 'bg-primary/20 text-primary border-primary/30';
  };

  const baseReference = useMemo(() => {
    if (!hasIntercept) return null;
    const missing = ['DE1', 'DE2', 'DE3', 'DE4'].find(v => !selectedVariables.includes(v));
    if (missing) {
      const labels: Record<string, string> = {
        DE1: '初中以下',
        DE2: '初中',
        DE3: '高中',
        DE4: '大学',
      };
      return labels[missing];
    }
    return null;
  }, [selectedVariables, hasIntercept]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-accent" />
            虚拟变量陷阱挑战
          </h2>
          <p className="text-muted-foreground mt-1">
            为什么 n 个分类只能引入 n-1 个虚拟变量？
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Variable Warehouse */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            变量仓库
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_VARIABLES.map((variable) => {
              const isSelected = selectedVariables.includes(variable.id);
              return (
                <motion.button
                  key={variable.id}
                  onClick={() => handleAddVariable(variable.id)}
                  disabled={isSelected}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'opacity-40 cursor-not-allowed border-border bg-muted/20'
                      : 'border-border/50 hover:border-primary/50 cursor-grab hover:bg-secondary/30'
                  }`}
                  whileHover={!isSelected ? { scale: 1.02 } : {}}
                  whileTap={!isSelected ? { scale: 0.98 } : {}}
                >
                  <div className="font-mono text-sm font-medium">{variable.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {variable.type === 'intercept' && '常数项'}
                    {variable.type === 'continuous' && '连续变量'}
                    {variable.type === 'dummy' && '虚拟变量 (学历)'}
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Tips */}
          <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">提示</p>
                <p className="mt-1">
                  学历有4个分类。当包含截距项时，最多只能引入3个学历虚拟变量。
                  尝试将所有4个学历变量都添加到方程中，看看会发生什么！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Equation Builder */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              方程构建区
            </h3>
            
            {/* Equation Display */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 min-h-[120px]">
              <div className="font-mono text-lg flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Y = </span>
                {selectedVariables.length === 0 ? (
                  <span className="text-muted-foreground/50 italic">
                    点击左侧变量添加到方程...
                  </span>
                ) : (
                  selectedVariables.map((varId, index) => {
                    const variable = AVAILABLE_VARIABLES.find(v => v.id === varId);
                    if (!variable) return null;
                    return (
                      <motion.span
                        key={varId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center"
                      >
                        {index > 0 && <span className="text-muted-foreground mx-1">+</span>}
                        <Badge 
                          className={`cursor-pointer hover:opacity-80 ${getVariableColor(variable)}`}
                          onClick={() => handleRemoveVariable(varId)}
                        >
                          {variable.coefficient || `β·${variable.label.split(' ')[0]}`}
                        </Badge>
                      </motion.span>
                    );
                  })
                )}
                {selectedVariables.length > 0 && (
                  <span className="text-muted-foreground ml-1">+ ε</span>
                )}
              </div>
            </div>

            {/* Base Reference Group */}
            {baseReference && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30"
              >
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-success">基准组默认为：{baseReference}</span>
                </div>
              </motion.div>
            )}

            {/* Validate Button */}
            <div className="mt-4 flex gap-3">
              <Button 
                onClick={handleValidate} 
                disabled={!isValid}
                className="flex-1"
              >
                验证模型
              </Button>
            </div>
          </div>

          {/* Status Indicator */}
          <motion.div 
            className={`glass-card p-4 flex items-center gap-4 ${
              showError ? 'border-destructive/50 bg-destructive/10' : 
              showSuccess ? 'border-success/50 bg-success/10' :
              'border-border/50'
            }`}
            animate={showError ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              showError ? 'bg-destructive/20' :
              showSuccess ? 'bg-success/20' :
              isValid ? 'bg-warning/20' : 'bg-muted'
            }`}>
              {showError ? (
                <XCircle className="w-6 h-6 text-destructive" />
              ) : showSuccess ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <div className={`w-4 h-4 rounded-full ${
                  isValid ? 'bg-warning animate-pulse' : 'bg-muted-foreground/30'
                }`} />
              )}
            </div>
            <div>
              <h4 className={`font-medium ${
                showError ? 'text-destructive' :
                showSuccess ? 'text-success' : ''
              }`}>
                {showError ? '警告：陷入虚拟变量陷阱！' :
                 showSuccess ? '模型有效！' :
                 '模型状态'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {showError 
                  ? '当引入截距项时，4个分类最多只能引入3个虚拟变量，否则导致完全共线性。'
                  : showSuccess
                  ? `模型构建正确。${baseReference ? `基准组为"${baseReference}"。` : ''}`
                  : `已选择 ${selectedVariables.length} 个变量 | 学历变量：${educationVars.length}/4`
                }
              </p>
            </div>
          </motion.div>

          {/* Error Explanation */}
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 border-destructive/30"
              >
                <h4 className="font-medium text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  完全多重共线性解释
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  当所有学历虚拟变量都被包含时，它们的线性组合恒等于1（因为每个人必属于其中一类）。
                  这与截距项产生完全共线性，导致设计矩阵 X'X 不可逆。
                </p>
                <div className="mt-3 p-3 rounded-lg bg-secondary/50 font-mono text-sm">
                  D₁ + D₂ + D₃ + D₄ = 1 = C
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  <strong>解决方案：</strong>移除截距项，或者移除任意一个学历虚拟变量作为基准组。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

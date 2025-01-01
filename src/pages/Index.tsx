import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GeometryLab } from '@/components/GeometryLab';
import { DummyTrapChallenge } from '@/components/DummyTrapChallenge';
import { PolicySimulator } from '@/components/PolicySimulator';
import { TrendingUp, Puzzle, Calculator, BookOpen, Github } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('geometry');

  const tabs = [
    { id: 'geometry', label: '几何实验室', icon: TrendingUp },
    { id: 'trap', label: '虚拟变量陷阱', icon: Puzzle },
    { id: 'simulator', label: '政策模拟器', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">虚拟变量交互案例</h1>
                <p className="text-xs text-muted-foreground">计量经济学可视化教学工具</p>
              </div>
            </div>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto bg-secondary/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg rounded-lg py-3 transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="geometry" className="mt-0">
                <GeometryLab />
              </TabsContent>
              
              <TabsContent value="trap" className="mt-0">
                <DummyTrapChallenge />
              </TabsContent>
              
              <TabsContent value="simulator" className="mt-0">
                <PolicySimulator />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Formula Reference Card */}
        <motion.div 
          className="glass-card p-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold mb-4 text-muted-foreground">回归模型参考</h3>
          <div className="font-mono text-sm bg-secondary/30 p-4 rounded-lg overflow-x-auto">
            <p className="whitespace-nowrap">
              <span className="text-primary">W</span> = 
              <span className="text-warning"> -52057</span> + 
              <span className="text-success"> 1920</span>·AGE + 
              <span className="text-destructive"> -19773</span>·SEX + 
              <span className="text-primary"> 7272</span>·DE₂ + 
              <span className="text-primary"> 16851</span>·DE₃ + 
              <span className="text-primary"> 70377</span>·DE₄ + 
              <span className="text-warning"> 21306</span>·DPT
            </p>
            <p className="whitespace-nowrap mt-2 text-accent">
              + <span className="text-accent">-9847</span>·DPT×DE₂ + 
              <span className="text-accent"> -12131</span>·DPT×DE₃ + 
              <span className="text-accent"> -221986</span>·DPT×DE₄
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">学历效应</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">性别效应</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">铁饭碗效应</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">交互效应</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>虚拟变量交互案例 · 计量经济学可视化教学工具</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

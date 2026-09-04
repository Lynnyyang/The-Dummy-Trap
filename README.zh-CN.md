# The Dummy Trap

[English](README.md) | **中文**

英文名 *The Dummy Trap*（虚拟变量陷阱）：用交互界面讲清 **虚拟变量、参照组、完全共线性以及学历 × 工作稳定性交互项** 对工资预测的影响。

仓库：<https://github.com/Lynnyyang/The-Dummy-Trap>

界面语言为中文。页面标题为「虚拟变量交互案例」。

---

## 这是什么

本项目是一个纯前端 Web 应用。工资预测 **不现场估计回归**，而是使用案例研究中已经给定的系数，在浏览器里即时计算并可视化：

```
W = -52057 + 1920·AGE − 19773·SEX
    + 7272·DE₂ + 16851·DE₃ + 70377·DE₄
    + 21306·DPT
    − 9847·DPT×DE₂ − 12131·DPT×DE₃ − 221986·DPT×DE₄
```

$$W = -52057 + 1920\cdot\mathrm{AGE} - 19773\cdot\mathrm{SEX} + 7272\cdot\mathrm{DE}_{2} + 16851\cdot\mathrm{DE}_{3} + 70377\cdot\mathrm{DE}_{4} + 21306\cdot\mathrm{DPT} - 9847\cdot\mathrm{DPT}\times\mathrm{DE}_{2} - 12131\cdot\mathrm{DPT}\times\mathrm{DE}_{3} - 221986\cdot\mathrm{DPT}\times\mathrm{DE}_{4}$$

变量含义（与代码 `src/lib/regression.ts` 一致）：

| 符号 | 含义 | 编码 |
| --- | --- | --- |
| $W$ | 预测工资（元） | 连续 |
| $\mathrm{AGE}$ | 年龄 | 连续 |
| $\mathrm{SEX}$ | 性别 | 女性 = 1 |
| $\mathrm{DE}_{2},\mathrm{DE}_{3},\mathrm{DE}_{4}$ | 初中 / 高中 / 大学 | 虚拟变量；**初中以下为参照组** |
| $\mathrm{DPT}$ | 「铁饭碗」（稳定工作） | 稳定 = 1 |
| $\mathrm{DPT}\times\mathrm{DE}_{k}$ | 稳定工作与学历的交互 | 大学 × 铁饭碗的交互项为大幅负值 |

参照组：男性、初中以下学历、非稳定工作。

---

## 三个模块

首页用三个 Tab 切换，对应三个组件。

### 1. 几何实验室（`GeometryLab`）

把回归看成工资–年龄平面上的一组平行线：斜率由年龄系数固定，截距随性别、学历、工作类型和交互项移动。

- 开关：是否显示女性、是否为铁饭碗
- 选择学历：初中以下 / 初中 / 高中 / 大学
- 折线图对比「当前设定」与「男性 + 初中以下 + 非稳定工作」基线
- 展示相对基线的工资差额，并提示大学学历与铁饭碗叠加时交互项可能把「学历溢价」抵消甚至反转

### 2. 虚拟变量陷阱（`DummyTrapChallenge`）

交互式建模练习：从变量池中挑选进入方程的项。

可选变量：截距 $C$、连续变量 Age、学历虚拟变量 $\mathrm{DE}_{1}$–$\mathrm{DE}_{4}$。

规则（与课堂定义一致）：

- **有截距时，同一分类不能放入全部类别虚拟变量**（完全共线性）
- 若同时选中 $C$ 与四个学历虚拟变量，界面拒绝并提示陷阱
- 有截距且漏掉某一学历虚拟变量时，被漏掉的那一类即为参照组
- 无截距时可以放入全部学历虚拟变量（饱和编码）

### 3. 政策模拟器（`PolicySimulator`）

并排比较两名候选人的预测工资。

- 调节年龄、性别、学历、是否铁饭碗
- 分解各项贡献：常数项、年龄、性别、学历、铁饭碗、交互
- 可覆盖女性性别系数，模拟「缩小性别工资差」的政策冲击，观察预测工资如何变化

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 构建 | Vite 5、TypeScript |
| UI | React 18、Tailwind CSS、shadcn/ui（Radix） |
| 图表 / 动效 | Recharts、Framer Motion |
| 路由 | React Router（目前仅 `/` 与 404） |
| 测试 | Vitest（仓库内目前只有占位用例） |

开发服务器默认端口 **8080**（见 `vite.config.ts`）。项目最初由 Lovable 脚手架生成，业务逻辑集中在 `src/components/*` 与 `src/lib/regression.ts`。

---

## 本地运行

需要 Node.js 与 npm。

```bash
git clone https://github.com/Lynnyyang/The-Dummy-Trap.git
cd The-Dummy-Trap
npm install
npm run dev
```

浏览器打开终端提示的本地地址（一般为 `http://localhost:8080`）。

其他脚本：

```bash
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建结果
npm run lint       # ESLint
npm test           # Vitest
```

无后端、无环境变量、无需 API Key。系数写死在前端。

---

## 目录结构

```
src/
  App.tsx                      # 路由与全局 Provider
  pages/Index.tsx              # 首页：三个 Tab + 回归公式卡片
  pages/NotFound.tsx
  components/
    GeometryLab.tsx            # 几何实验室
    DummyTrapChallenge.tsx     # 虚拟变量陷阱
    PolicySimulator.tsx        # 政策模拟器
    ui/                        # shadcn 组件
  lib/
    regression.ts              # 系数、工资计算、分解、图表数据
    utils.ts
  test/                        # Vitest
```

工资计算入口：`calculateSalary`、`getSalaryBreakdown`、`generateChartData`（`src/lib/regression.ts`）。

---

## 教学使用建议

1. 先打开几何实验室，只改学历，观察截距平移、斜率不变。
2. 打开「铁饭碗」，对比大学组：交互项 $-221986$ 会显著压低预测工资，用来讨论「主效应 + 交互」不能单独看学历系数。
3. 再到陷阱模块：故意把截距和四个学历虚拟变量全部放入，体会软件为何无法识别。
4. 用政策模拟器拆解两名候选人，强调预测值是给定系数下的线性组合，不是因果识别结果。

---

## 局限

- 系数来自既定案例，不是用真实微观数据在本仓库中估计得到的。
- 预测工资可能为负（常数项为负且年龄较小时），界面按公式如实显示。
- GitHub 图标目前指向 `#`，部署后可改为本仓库 URL。
- `src/test/example.test.ts` 仅为占位，尚未覆盖 `calculateSalary` 与陷阱判定逻辑。

---

## 许可

[MIT](LICENSE)

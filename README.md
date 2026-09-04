# The Dummy Trap

**English** | [中文](README.zh-CN.md)

Visual econometrics labs on **dummy variables**, **reference groups**, the **dummy-variable trap**, and **education × job-stability interactions** in a wage equation.

*The Dummy Trap* is the classroom name for perfect collinearity: an intercept plus every category dummy of the same factor.

Repository: <https://github.com/Lynnyyang/The-Dummy-Trap>

The app UI is in Chinese. The on-screen title is「虚拟变量交互案例」(Dummy-variable interaction case).

---

## What this is

A client-only web app. Predicted wages are **not estimated live**. Coefficients from a case study are applied in the browser:

```
W = -52057 + 1920·AGE − 19773·SEX
    + 7272·DE₂ + 16851·DE₃ + 70377·DE₄
    + 21306·DPT
    − 9847·DPT×DE₂ − 12131·DPT×DE₃ − 221986·DPT×DE₄
```

$$W = -52057 + 1920\cdot\mathrm{AGE} - 19773\cdot\mathrm{SEX} + 7272\cdot\mathrm{DE}_{2} + 16851\cdot\mathrm{DE}_{3} + 70377\cdot\mathrm{DE}_{4} + 21306\cdot\mathrm{DPT} - 9847\cdot\mathrm{DPT}\times\mathrm{DE}_{2} - 12131\cdot\mathrm{DPT}\times\mathrm{DE}_{3} - 221986\cdot\mathrm{DPT}\times\mathrm{DE}_{4}$$

Variable definitions match `src/lib/regression.ts`:

| Symbol | Meaning | Coding |
| --- | --- | --- |
| $W$ | Predicted wage (CNY) | Continuous |
| $\mathrm{AGE}$ | Age | Continuous |
| $\mathrm{SEX}$ | Gender | Female = 1 |
| $\mathrm{DE}_{2},\mathrm{DE}_{3},\mathrm{DE}_{4}$ | Junior high / senior high / university | Dummies; **below junior high is the reference** |
| $\mathrm{DPT}$ | Stable job (“iron rice bowl”) | Stable = 1 |
| $\mathrm{DPT}\times\mathrm{DE}_{k}$ | Job stability × education | University × stable job has a large negative interaction |

Reference group: male, below junior-high education, unstable job.

---

## Three modules

The home page switches among three tabs (three components).

### 1. Geometry lab (`GeometryLab`)

Treat the regression as parallel lines in the wage–age plane: the slope is the age coefficient; intercepts shift with gender, education, job type, and interactions.

- Toggles: show female; iron-rice-bowl job
- Education: below junior high / junior high / senior high / university
- Line chart vs. baseline (male + below junior high + unstable job)
- Wage gap vs. baseline; university + iron rice bowl can wipe out or reverse the education premium via the interaction

### 2. Dummy-variable trap (`DummyTrapChallenge`)

Pick terms from a pool into the equation.

Available: intercept $C$, continuous Age, education dummies $\mathrm{DE}_{1}$–$\mathrm{DE}_{4}$.

Rules:

- **With an intercept, you cannot include every dummy of the same category** (perfect collinearity)
- Selecting $C$ and all four education dummies is rejected as a trap
- With an intercept, the omitted education dummy is the reference group
- Without an intercept, all education dummies may be included (saturated coding)

### 3. Policy simulator (`PolicySimulator`)

Compare predicted wages for two candidates side by side.

- Age, gender, education, job stability
- Decomposition: intercept, age, gender, education, iron rice bowl, interaction
- Override the female gender coefficient to simulate a smaller gender wage gap

---

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 5, TypeScript |
| UI | React 18, Tailwind CSS, shadcn/ui (Radix) |
| Charts / motion | Recharts, Framer Motion |
| Routing | React Router (`/` and 404) |
| Tests | Vitest (placeholder only) |

Dev server port **8080** (`vite.config.ts`). Scaffolded with Lovable; domain logic lives in `src/components/*` and `src/lib/regression.ts`.

---

## Run locally

Node.js and npm required.

```bash
git clone https://github.com/Lynnyyang/The-Dummy-Trap.git
cd The-Dummy-Trap
npm install
npm run dev
```

Open the URL printed in the terminal (typically `http://localhost:8080`).

```bash
npm run build      # production build → dist/
npm run preview    # preview the build
npm run lint       # ESLint
npm test           # Vitest
```

No backend, no env vars, no API keys. Coefficients are hard-coded.

---

## Layout

```
src/
  App.tsx                      # routes and global providers
  pages/Index.tsx              # home: three tabs + formula card
  pages/NotFound.tsx
  components/
    GeometryLab.tsx            # geometry lab
    DummyTrapChallenge.tsx     # dummy-variable trap
    PolicySimulator.tsx        # policy simulator
    ui/                        # shadcn components
  lib/
    regression.ts              # coefficients, wages, breakdowns, chart data
    utils.ts
  test/                        # Vitest
```

Wage helpers: `calculateSalary`, `getSalaryBreakdown`, `generateChartData` in `src/lib/regression.ts`.

---

## Suggested classroom path

1. Geometry lab: change education only — intercepts shift, slope stays put.
2. Turn on iron rice bowl for university: interaction $-221986$ pulls predicted wages down; main effects plus interaction cannot be read from the education coefficient alone.
3. Trap module: include intercept and all four education dummies; see why the model is not identified.
4. Policy simulator: decompose two candidates; predicted values are linear combinations of given coefficients, not causal estimates.

---

## Limits

- Coefficients come from a fixed case study; this repo does not estimate them from microdata.
- Predicted wages can be negative (negative intercept, young ages); the UI shows the formula as-is.
- The GitHub icon currently points to `#`; set it to this repo URL after deploy.
- `src/test/example.test.ts` is a stub; it does not cover `calculateSalary` or trap checks.

---

## License

[MIT](LICENSE)

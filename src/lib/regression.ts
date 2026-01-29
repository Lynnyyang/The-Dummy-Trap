// Regression coefficients from the case study
export const COEFFICIENTS = {
  intercept: -52057,
  age: 1920,
  sex: -19773, // Female = 1
  education: {
    junior: 7272,    // DE2 - 初中
    senior: 16851,   // DE3 - 高中
    university: 70377, // DE4 - 大学
  },
  job: 21306, // DPT - 铁饭碗
  interaction: {
    dptDE2: -9847,   // 铁饭碗 × 初中
    dptDE3: -12131,  // 铁饭碗 × 高中
    dptDE4: -221986, // 铁饭碗 × 大学 (dramatic negative!)
  },
};

export type Gender = 'male' | 'female';
export type Education = 'below' | 'junior' | 'senior' | 'university';
export type JobType = 'unstable' | 'stable';

export interface Person {
  age: number;
  gender: Gender;
  education: Education;
  jobType: JobType;
}

export function calculateSalary(person: Person): number {
  let salary = COEFFICIENTS.intercept;
  
  // Age effect
  salary += COEFFICIENTS.age * person.age;
  
  // Gender effect (female = 1)
  if (person.gender === 'female') {
    salary += COEFFICIENTS.sex;
  }
  
  // Education effects
  switch (person.education) {
    case 'junior':
      salary += COEFFICIENTS.education.junior;
      break;
    case 'senior':
      salary += COEFFICIENTS.education.senior;
      break;
    case 'university':
      salary += COEFFICIENTS.education.university;
      break;
  }
  
  // Job stability effect
  if (person.jobType === 'stable') {
    salary += COEFFICIENTS.job;
    
    // Interaction effects
    switch (person.education) {
      case 'junior':
        salary += COEFFICIENTS.interaction.dptDE2;
        break;
      case 'senior':
        salary += COEFFICIENTS.interaction.dptDE3;
        break;
      case 'university':
        salary += COEFFICIENTS.interaction.dptDE4;
        break;
    }
  }
  
  return Math.round(salary);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getEducationLabel(edu: Education): string {
  const labels: Record<Education, string> = {
    below: '初中以下',
    junior: '初中',
    senior: '高中',
    university: '大学',
  };
  return labels[edu];
}

export function getGenderLabel(gender: Gender): string {
  return gender === 'male' ? '男性' : '女性';
}

export function getJobTypeLabel(job: JobType): string {
  return job === 'stable' ? '铁饭碗' : '非稳定工作';
}

// Generate chart data for salary vs age
export function generateChartData(
  gender: Gender,
  education: Education,
  jobType: JobType,
  ageRange: [number, number] = [20, 60]
): { age: number; salary: number }[] {
  const data = [];
  for (let age = ageRange[0]; age <= ageRange[1]; age += 2) {
    data.push({
      age,
      salary: calculateSalary({ age, gender, education, jobType }),
    });
  }
  return data;
}

// Calculate the effect breakdown
export function getSalaryBreakdown(person: Person): {
  component: string;
  value: number;
  description: string;
}[] {
  const breakdown = [
    { component: '基础常数', value: COEFFICIENTS.intercept, description: 'β₀' },
    { component: '年龄效应', value: COEFFICIENTS.age * person.age, description: `${COEFFICIENTS.age} × ${person.age}岁` },
  ];
  
  if (person.gender === 'female') {
    breakdown.push({
      component: '性别效应',
      value: COEFFICIENTS.sex,
      description: '女性',
    });
  }
  
  if (person.education !== 'below') {
    const eduValues: Record<Exclude<Education, 'below'>, number> = {
      junior: COEFFICIENTS.education.junior,
      senior: COEFFICIENTS.education.senior,
      university: COEFFICIENTS.education.university,
    };
    breakdown.push({
      component: '学历效应',
      value: eduValues[person.education as Exclude<Education, 'below'>],
      description: getEducationLabel(person.education),
    });
  }
  
  if (person.jobType === 'stable') {
    breakdown.push({
      component: '铁饭碗效应',
      value: COEFFICIENTS.job,
      description: '稳定工作',
    });
    
    if (person.education !== 'below') {
      const interactionValues: Record<Exclude<Education, 'below'>, number> = {
        junior: COEFFICIENTS.interaction.dptDE2,
        senior: COEFFICIENTS.interaction.dptDE3,
        university: COEFFICIENTS.interaction.dptDE4,
      };
      breakdown.push({
        component: '交互效应',
        value: interactionValues[person.education as Exclude<Education, 'below'>],
        description: `铁饭碗 × ${getEducationLabel(person.education)}`,
      });
    }
  }
  
  return breakdown;
}

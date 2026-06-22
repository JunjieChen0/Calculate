export const CONSTANTS = [
  {
    name: '圆周率',
    symbol: 'pi',
    value: '3.14159265359',
    category: '数学',
    insert: 'pi'
  },
  {
    name: '自然常数',
    symbol: 'e',
    value: '2.71828182846',
    category: '数学',
    insert: 'e'
  },
  {
    name: '黄金比例',
    symbol: 'phi',
    value: '1.61803398875',
    category: '数学',
    insert: '1.61803398875'
  },
  {
    name: '虚数单位',
    symbol: 'i',
    value: 'sqrt(-1)',
    category: '数学',
    insert: 'i'
  },
  {
    name: '光速',
    symbol: 'c',
    value: '299792458 m/s',
    category: '物理',
    insert: '299792458',
    unit: 'm/s'
  },
  {
    name: '引力常数',
    symbol: 'G',
    value: '6.67430e-11 m³/(kg·s²)',
    category: '物理',
    insert: '6.67430e-11',
    unit: 'm³/(kg·s²)'
  },
  {
    name: '普朗克常数',
    symbol: 'h',
    value: '6.62607015e-34 J·s',
    category: '物理',
    insert: '6.62607015e-34',
    unit: 'J·s'
  },
  {
    name: '约化普朗克常数',
    symbol: 'ℏ',
    value: '1.054571817e-34 J·s',
    category: '物理',
    insert: '1.054571817e-34',
    unit: 'J·s'
  },
  {
    name: '玻尔兹曼常数',
    symbol: 'k',
    value: '1.380649e-23 J/K',
    category: '物理',
    insert: '1.380649e-23',
    unit: 'J/K'
  },
  {
    name: '阿伏伽德罗常数',
    symbol: 'N_A',
    value: '6.02214076e23 mol⁻¹',
    category: '物理',
    insert: '6.02214076e23',
    unit: 'mol⁻¹'
  },
  {
    name: '元电荷',
    symbol: 'e⁻',
    value: '1.602176634e-19 C',
    category: '物理',
    insert: '1.602176634e-19',
    unit: 'C'
  },
  {
    name: '电子质量',
    symbol: 'm_e',
    value: '9.1093837015e-31 kg',
    category: '物理',
    insert: '9.1093837015e-31',
    unit: 'kg'
  },
  {
    name: '质子质量',
    symbol: 'm_p',
    value: '1.67262192369e-27 kg',
    category: '物理',
    insert: '1.67262192369e-27',
    unit: 'kg'
  },
  {
    name: '中子质量',
    symbol: 'm_n',
    value: '1.67492749804e-27 kg',
    category: '物理',
    insert: '1.67492749804e-27',
    unit: 'kg'
  },
  {
    name: '真空磁导率',
    symbol: 'μ₀',
    value: '1.25663706212e-6 N/A²',
    category: '物理',
    insert: '1.25663706212e-6',
    unit: 'N/A²'
  },
  {
    name: '真空介电常数',
    symbol: 'ε₀',
    value: '8.8541878128e-12 F/m',
    category: '物理',
    insert: '8.8541878128e-12',
    unit: 'F/m'
  },
  {
    name: '标准重力加速度',
    symbol: 'g',
    value: '9.80665 m/s²',
    category: '物理',
    insert: '9.80665',
    unit: 'm/s²'
  },
  {
    name: '气体常数',
    symbol: 'R',
    value: '8.314462618 J/(mol·K)',
    category: '物理',
    insert: '8.314462618',
    unit: 'J/(mol·K)'
  },
  {
    name: '地球质量',
    symbol: 'M⊕',
    value: '5.9722e24 kg',
    category: '天文',
    insert: '5.9722e24',
    unit: 'kg'
  },
  {
    name: '太阳质量',
    symbol: 'M☉',
    value: '1.98847e30 kg',
    category: '天文',
    insert: '1.98847e30',
    unit: 'kg'
  },
  {
    name: '天文单位',
    symbol: 'AU',
    value: '1.495978707e11 m',
    category: '天文',
    insert: '1.495978707e11',
    unit: 'm'
  },
  {
    name: '秒差距',
    symbol: 'pc',
    value: '3.08567758149e16 m',
    category: '天文',
    insert: '3.08567758149e16',
    unit: 'm'
  },
  {
    name: '朗伯 W 函数',
    symbol: 'Ω',
    value: '0.56714329041',
    category: '数学',
    insert: '0.56714329041'
  },
  {
    name: '根号 2',
    symbol: '√2',
    value: '1.41421356237',
    category: '数学',
    insert: 'sqrt(2)'
  },
  {
    name: '根号 3',
    symbol: '√3',
    value: '1.73205080757',
    category: '数学',
    insert: 'sqrt(3)'
  }
];

export function searchConstants(query) {
  if (!query || query.trim() === '') {
    return CONSTANTS;
  }
  const trimmed = query.trim();
  const lowerQuery = trimmed.toLowerCase();

  // Single-character queries: exact symbol match only
  if (trimmed.length === 1) {
    return CONSTANTS.filter(c => c.symbol.toLowerCase() === lowerQuery);
  }

  return CONSTANTS.filter(
    c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.symbol.toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery)
  );
}

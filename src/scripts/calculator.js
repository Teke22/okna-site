/**
 * Pure pricing logic for the window cost calculator.
 *
 * No dependencies, no DOM access — every function is a side-effect-free helper
 * so it can be unit-tested and reused on the server or in the browser.
 *
 * @see AGENTS.md -> Performance / Security (no external libs, no eval)
 */

/** Option keys that are grouped into the "Дополнительные опции" line. */
const INSTALLATION_KEY = 'installation';

/** Round a number to the nearest `step` (default 10 ₽) for realistic pricing. */
export function roundTo(value, step = 10) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / step) * step;
}

/** Area of a construction in square meters from millimeters. */
export function getArea(widthMm, heightMm) {
  return (Number(widthMm) / 1000) * (Number(heightMm) / 1000);
}

/** Compute the price of a single option given the shared calculation context. */
function computeOption(option, ctx) {
  switch (option.type) {
    case 'fixed':
      return option.price;
    case 'perMeter':
      return option.price * ctx.widthM;
    case 'perM2':
      return option.price * ctx.area;
    default:
      return 0;
  }
}

/**
 * Validate user input against the price configuration.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateInput(params, config) {
  const min = config.limits.minSize;
  const max = config.limits.maxSize;
  const errors = {};

  const checkSize = (value, field) => {
    const num = Number(value);
    if (value === '' || value == null || Number.isNaN(num)) {
      errors[field] = 'Укажите значение в миллиметрах.';
      return;
    }
    if (num < min || num > max) {
      errors[field] = `Допустимый размер: от ${min} до ${max} мм.`;
    }
  };

  checkSize(params.width, 'width');
  checkSize(params.height, 'height');

  if (!config.construction[params.construction]) {
    errors.construction = 'Выберите тип конструкции.';
  }
  if (!config.profiles[params.profile]) {
    errors.profile = 'Выберите тип профиля.';
  }
  if (!config.glazing[params.glazing]) {
    errors.glazing = 'Выберите тип стеклопакета.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Calculate the preliminary cost and its breakdown.
 *
 * @param {object} params  Form values (width, height, construction, profile, glazing, options).
 * @param {object} config  Parsed prices.json.
 * @returns {{
 *   area: number,
 *   widthM: number,
 *   lines: Array<{ key: string, label: string, amount: number }>,
 *   optionDetails: Array<{ key: string, label: string, amount: number }>,
 *   total: number
 * }}
 */
export function calculateCost(params, config) {
  const width = Number(params.width) || 0;
  const height = Number(params.height) || 0;
  const area = getArea(width, height);
  const widthM = width / 1000;
  const ctx = { area, widthM };

  const construction = config.construction[params.construction] ?? { sashes: 1, base: 0 };
  const profile = config.profiles[params.profile] ?? { pricePerM2: 0 };
  const glazing = config.glazing[params.glazing] ?? { pricePerM2: 0 };

  const profileCost = profile.pricePerM2 * area;
  const glazingCost = glazing.pricePerM2 * area;
  const furnitureCost =
    construction.base +
    config.furniture.pricePerM2 * area +
    construction.sashes * config.furniture.pricePerSash;

  const selected = params.options ?? {};
  let optionsCost = 0;
  let installationCost = 0;
  const optionDetails = [];

  for (const key of Object.keys(config.options)) {
    if (!selected[key]) continue;
    const option = config.options[key];
    const amount = computeOption(option, ctx);

    if (key === INSTALLATION_KEY) {
      installationCost += amount;
      continue;
    }

    optionsCost += amount;
    optionDetails.push({ key, label: option.label, amount: roundTo(amount) });
  }

  const lines = [
    { key: 'profile', label: 'Профильная система', amount: roundTo(profileCost) },
    { key: 'glazing', label: 'Стеклопакет', amount: roundTo(glazingCost) },
    { key: 'furniture', label: 'Фурнитура и комплектующие', amount: roundTo(furnitureCost) },
    { key: 'options', label: 'Дополнительные опции', amount: roundTo(optionsCost) },
    { key: 'installation', label: 'Монтаж', amount: roundTo(installationCost) },
  ];

  const total = roundTo(lines.reduce((sum, line) => sum + line.amount, 0));

  return { area, widthM, lines, optionDetails, total };
}

/** Format a number as Russian rubles, e.g. `12 345 ₽`. */
export function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/** Format an area in square meters, e.g. `1,44 м²`. */
export function formatArea(value) {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
  return `${formatted} м²`;
}

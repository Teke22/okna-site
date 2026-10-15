/**
 * Pure pricing logic for the window cost calculator.
 *
 * No dependencies, no DOM access — every function is a side-effect-free helper
 * so it can be unit-tested and reused on the server or in the browser.
 *
 * Model: multiplicative. A standard 1 m² window (Decco profile + Reze hardware
 * + double-chamber glazing) costs `config.basePricePerM2` (2000 lei). Every other
 * choice is expressed as a coefficient relative to that base, and the coefficients
 * compose: `base × constructionFactor × profileFactor × glazingFactor × hardwareFactor`.
 *
 * @see AGENTS.md -> Performance / Security (no external libs, no eval)
 */

/** Option key that is presented as a separate "Монтаж" line. */
const INSTALLATION_KEY = 'installation';

/** Round a number to the nearest `step` (default 10 lei) for realistic pricing. */
export function roundTo(value, step = 10) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / step) * step;
}

/** Area of a construction in square meters from millimeters. */
export function getArea(widthMm, heightMm) {
  return (Number(widthMm) / 1000) * (Number(heightMm) / 1000);
}

/**
 * Resolve the accepted width/height range for a construction type.
 * Falls back to the global `limits` block when no type is selected yet.
 *
 * @returns {{ minWidth: number, maxWidth: number, minHeight: number, maxHeight: number }}
 */
export function getConstructionLimits(constructionKey, config) {
  const construction = config?.construction?.[constructionKey];
  const fallback = {
    minWidth: config?.limits?.minSize ?? 0,
    maxWidth: config?.limits?.maxSize ?? Infinity,
    minHeight: config?.limits?.minSize ?? 0,
    maxHeight: config?.limits?.maxSize ?? Infinity,
  };

  if (!construction) return fallback;

  return {
    minWidth: construction.minWidth ?? fallback.minWidth,
    maxWidth: construction.maxWidth ?? fallback.maxWidth,
    minHeight: construction.minHeight ?? fallback.minHeight,
    maxHeight: construction.maxHeight ?? fallback.maxHeight,
  };
}

/** Option keys that make sense for a given construction type. */
export function getAvailableOptions(constructionKey, config) {
  const options = config?.options ?? {};
  return Object.keys(options).filter((key) => {
    const excluded = options[key]?.exclude ?? [];
    return !excluded.includes(constructionKey);
  });
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
 * Size ranges are taken from the selected construction type when available.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateInput(params, config) {
  const errors = {};
  const limits = getConstructionLimits(params.construction, config);

  const checkSize = (value, field, min, max, noun) => {
    const num = Number(value);
    if (value === '' || value == null || Number.isNaN(num)) {
      errors[field] = 'Укажите значение в миллиметрах.';
      return;
    }
    if (num < min || num > max) {
      errors[field] = `Допустимая ${noun}: от ${min} до ${max} мм.`;
    }
  };

  checkSize(params.width, 'width', limits.minWidth, limits.maxWidth, 'ширина');
  checkSize(params.height, 'height', limits.minHeight, limits.maxHeight, 'высота');

  if (!config.construction[params.construction]) {
    errors.construction = 'Выберите тип конструкции.';
  }
  if (!config.profiles[params.profile]) {
    errors.profile = 'Выберите тип профиля.';
  }
  if (!config.glazing[params.glazing]) {
    errors.glazing = 'Выберите тип стеклопакета.';
  }
  if (!config.hardware[params.hardware]) {
    errors.hardware = 'Выберите тип фурнитуры.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Calculate the preliminary cost and its breakdown.
 *
 * @param {object} params  Form values (width, height, construction, profile, glazing, hardware, options).
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

  const basePricePerM2 = Number(config.basePricePerM2) || 0;

  const construction = config.construction[params.construction] ?? { factor: 1, label: '—' };
  const profile = config.profiles[params.profile] ?? { factor: 1, label: '—' };
  const glazing = config.glazing[params.glazing] ?? { factor: 1, label: '—' };
  const hardware = config.hardware[params.hardware] ?? { factor: 1, label: '—' };

  const constructionFactor = construction.factor ?? 1;
  const profileFactor = profile.factor ?? 1;
  const glazingFactor = glazing.factor ?? 1;
  const hardwareFactor = hardware.factor ?? 1;

  // Base construction at the standard configuration, scaled by complexity.
  const baseCost = basePricePerM2 * area * constructionFactor;

  // Surcharges compose multiplicatively; each line is the delta of its coefficient.
  const profileExtra = baseCost * (profileFactor - 1);
  const afterProfile = baseCost + profileExtra;
  const glazingExtra = afterProfile * (glazingFactor - 1);
  const afterGlazing = afterProfile + glazingExtra;
  const hardwareExtra = afterGlazing * (hardwareFactor - 1);

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
    {
      key: 'base',
      label: `Базовое окно — ${construction.label}`,
      amount: roundTo(baseCost),
    },
    { key: 'profile', label: `Профиль — ${profile.label}`, amount: roundTo(profileExtra) },
    { key: 'glazing', label: `Стеклопакет — ${glazing.label}`, amount: roundTo(glazingExtra) },
    { key: 'hardware', label: `Фурнитура — ${hardware.label}`, amount: roundTo(hardwareExtra) },
    { key: 'options', label: 'Дополнительные опции', amount: roundTo(optionsCost) },
    { key: 'installation', label: 'Монтаж', amount: roundTo(installationCost) },
  ];

  const total = roundTo(lines.reduce((sum, line) => sum + line.amount, 0));

  return { area, widthM, lines, optionDetails, total };
}

/** Format a number as Moldovan lei, e.g. `5 300 lei`. */
export function formatMoney(value) {
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );
  return `${number} lei`;
}

/** Format an area in square meters, e.g. `1,44 м²`. */
export function formatArea(value) {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
  return `${formatted} м²`;
}

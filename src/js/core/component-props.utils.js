import { getSiteContentValue } from '../config/site-content.config.js';
import { getValueByPath, isObject } from './value.utils.js';

const EMPTY_PROPS = Object.freeze({});

function mergeConfig(baseConfig, overrideConfig) {
  if (!isObject(baseConfig)) {
    return isObject(overrideConfig) ? { ...overrideConfig } : {};
  }

  if (!isObject(overrideConfig)) {
    return { ...baseConfig };
  }

  const merged = { ...baseConfig };

  Object.entries(overrideConfig).forEach(([key, value]) => {
    if (isObject(value) && isObject(merged[key])) {
      merged[key] = mergeConfig(merged[key], value);
      return;
    }

    merged[key] = value;
  });

  return merged;
}

export function getComponentProps(root) {
  if (!(root instanceof HTMLElement)) {
    return EMPTY_PROPS;
  }

  const rawProps = root.dataset.props;

  if (typeof rawProps !== 'string' || rawProps.trim().length === 0) {
    return EMPTY_PROPS;
  }

  try {
    const parsed = JSON.parse(rawProps);
    return isObject(parsed) ? parsed : EMPTY_PROPS;
  } catch {
    return EMPTY_PROPS;
  }
}

export function getComponentConfig(root, defaultContentPath, fallback = {}) {
  const props = getComponentProps(root);

  const contentPath =
    typeof props.contentPath === 'string' && props.contentPath.length > 0
      ? props.contentPath
      : defaultContentPath;

  const baseConfig = getSiteContentValue(contentPath, fallback);
  const normalizedBaseConfig = isObject(baseConfig) ? baseConfig : fallback;
  const valuesOverride = isObject(props.values) ? props.values : null;

  if (!valuesOverride) {
    return normalizedBaseConfig;
  }

  return mergeConfig(normalizedBaseConfig, valuesOverride);
}

export function getComponentValue(root, defaultContentPath, valuePath, fallback) {
  const props = getComponentProps(root);
  const valuesOverride = isObject(props.values) ? props.values : null;

  if (valuesOverride) {
    const overrideValue = getValueByPath(valuesOverride, valuePath);

    if (overrideValue !== undefined) {
      return overrideValue;
    }
  }

  const contentPath =
    typeof props.contentPath === 'string' && props.contentPath.length > 0
      ? props.contentPath
      : defaultContentPath;

  const scopedPath =
    typeof valuePath === 'string' && valuePath.length > 0
      ? `${contentPath}.${valuePath}`
      : contentPath;

  return getSiteContentValue(scopedPath, fallback);
}

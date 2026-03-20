import { addListener, cloneNode } from '@finsweet/attributes-utils';
import { shallowRef } from '@vue/reactivity';

import type { List } from '../../components/List';
import { getElementSelector, queryElement } from '../../utils/selectors';
import { handleFiltersForm } from '../elements';
import type { FilterMatch, FiltersCondition } from '../types';
import { type ConditionGroup, initConditionGroup, initConditionGroupsAdd, initConditionGroupsMatch } from './groups';
import { getFilterMatchValue } from './utils';

/**
 * Inits dynamic filters for a list.
 * Supports one or more filter forms — each form with a `condition-group` element
 * is initialized independently, sharing a single clear-button handler.
 * @param list
 * @param forms
 * @returns A cleanup function
 */
export const initDynamicFilters = (list: List, forms: HTMLFormElement[]) => {
  const cleanups = new Set<() => void>();

  // Handle global clear buttons once — shared across all dynamic forms
  cleanups.add(handleClearButtons(list));

  for (const form of forms) {
    const cleanup = initDynamicFiltersForm(list, form);
    if (cleanup) cleanups.add(cleanup);
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }

    cleanups.clear();
  };
};

/**
 * Inits dynamic filters for a single filter form.
 * @param list
 * @param form
 * @returns A cleanup function
 */
const initDynamicFiltersForm = (list: List, form: HTMLFormElement) => {
  const conditionGroupElement = queryElement('condition-group', { scope: form });
  if (!conditionGroupElement) return;

  const conditionGroupsWrapper = conditionGroupElement.parentElement;
  if (!conditionGroupsWrapper) return;

  const conditionGroupTemplate = cloneNode(conditionGroupElement);
  const conditionGroups = shallowRef<ConditionGroup[]>([]);

  const cleanups = new Set<() => void>();

  // Handle submissions
  cleanups.add(handleFiltersForm(form));

  // Handle adding condition groups
  const conditionGroupAddButton =
    queryElement('condition-group-add', { scope: form }) || queryElement('condition-groups-add', { scope: form });

  if (conditionGroupAddButton) {
    cleanups.add(
      initConditionGroupsAdd(list, conditionGroupAddButton, conditionGroupTemplate, conditionGroupsWrapper, conditionGroups)
    );
  }

  // Handle condition groups matching
  const conditionGroupMatchSelect =
    queryElement<HTMLSelectElement>('condition-group-match', { scope: form }) ||
    queryElement<HTMLSelectElement>('condition-groups-match', { scope: form });

  if (conditionGroupMatchSelect) {
    // First form's groupsMatch wins (||=), same behaviour as Standard mode
    list.filters.value.groupsMatch ||= getFilterMatchValue(conditionGroupMatchSelect);

    cleanups.add(initConditionGroupsMatch(list, conditionGroupMatchSelect, conditionGroups));
  } else {
    list.filters.value.groupsMatch ||= 'and';
  }

  // Init default condition group
  initConditionGroup(list, conditionGroupElement, conditionGroups);

  return () => {
    for (const conditionGroup of conditionGroups.value) {
      conditionGroup.cleanup();
    }

    for (const cleanup of cleanups) {
      cleanup();
    }

    cleanups.clear();
  };
};

/**
 * Handles the clear buttons.
 * @param list
 * @returns A cleanup function.
 */
const handleClearButtons = (list: List) => {
  return addListener(window, 'click', (e) => {
    const { target } = e;

    if (!(target instanceof Element)) return;

    const { instance, filters } = list;

    const clearElementSelector = getElementSelector('clear', { instance });
    const clearElement = target?.closest(clearElementSelector);
    if (!clearElement) return;

    list.settingFilters = true;

    // Remove extra dynamic groups only — standard groups use numeric string ids
    // (e.g. "1", "2") while dynamic groups use crypto.randomUUID() which is not
    // parseable as a finite number.  Iterating in reverse keeps the splice safe.
    const groups = filters.value.groups;
    let firstDynamicFound = false;

    for (let i = groups.length - 1; i >= 0; i--) {
      const isDynamic = isNaN(Number(groups[i].id));
      if (!isDynamic) continue;

      if (!firstDynamicFound) {
        // Mark the first dynamic group (the last one we encounter in reverse)
        // so we keep it and reset it below.
        firstDynamicFound = true;
      } else {
        // Extra dynamic group — remove it.
        groups.splice(i, 1);
      }
    }

    const firstDynamicGroup = groups.find((g) => isNaN(Number(g.id)));
    if (!firstDynamicGroup) {
      list.settingFilters = false;
      return;
    }

    firstDynamicGroup.conditions.splice(1);

    const firstCondition = firstDynamicGroup.conditions[0];
    if (!firstCondition) {
      list.settingFilters = false;
      return;
    }

    const updated: Partial<FiltersCondition> = {
      value: Array.isArray(firstCondition.value) ? [] : '',
      interacted: false,
    };

    Object.assign(firstCondition, updated);

    list.settingFilters = false;
  });
};

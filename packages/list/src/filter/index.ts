import { watch } from '@vue/reactivity';
import debounce from 'just-debounce';

import type { List } from '../components/List';
import { getAttribute, queryElement } from '../utils/selectors';
import { initDynamicFilters } from './dynamic';
import { handleFilterElements } from './elements';
import { filterItems } from './filter';
import { initStandardFilters } from './standard';
import { getListFiltersQuery, setListFiltersQuery } from './standard/query';
import { initTags } from './tags';

/**
 * Inits loading functionality for the list.
 * @param list
 * @param forms
 */
export const initListFiltering = (list: List, forms: HTMLFormElement[]) => {
  const filteringClass = getAttribute(list.listElement, 'filteringclass');

  // Init hooks
  const filterHookCleanup = list.addHook('filter', async (items) => {
    const filteredItems = await filterItems(list.filters.value, items, list.highlight);
    return filteredItems;
  });

  const beforeRenderHookCleanup = list.addHook('beforeRender', async (items) => {
    if (list.triggeredHook === 'filter') {
      list.wrapperElement.classList.add(filteringClass);

      const animations = list.wrapperElement.getAnimations({ subtree: true });

      try {
        await Promise.all(animations.map((a) => a.finished));
      } catch {
        //
      }
    }

    return items;
  });

  const afterRenderHookCleanup = list.addHook('afterRender', (items) => {
    list.wrapperElement.classList.remove(filteringClass);

    return items;
  });

  // Handle elements
  const elementsCleanup = handleFilterElements(list);

  // Init filters
  const dynamicForms = forms.filter((form) => !!queryElement('condition-group', { scope: form }));
  const standardForms = forms.filter((form) => !queryElement('condition-group', { scope: form }));
  const isDynamic = dynamicForms.length > 0;

  const dynamicCleanup = isDynamic ? initDynamicFilters(list, dynamicForms) : undefined;
  // In mixed mode, standard forms start after the dynamic groups so indices don't overlap
  const standardCleanup = isDynamic && standardForms.length > 0
    ? initStandardFilters(list, standardForms, dynamicForms.length)
    : !isDynamic
      ? initStandardFilters(list, forms)
      : undefined;

  const filteringCleanup = () => {
    dynamicCleanup?.();
    standardCleanup?.();
  };

  // Init Tags
  const tagsCleanup = initTags(list, isDynamic);

  // Trigger the hook when the filters change
  const filtersCleanup = watch(
    list.filters,
    debounce(() => {
      list.triggerHook('filter', {
        scrollToAnchor: list.hasInteracted.value,
        resetCurrentPage: list.hasInteracted.value,
      });

      // Handle query params
      if (list.showQuery) {
        setListFiltersQuery(list);
      }
    }, 16),
    { deep: true, immediate: true }
  );

  // Read query params
  getListFiltersQuery(list);

  return () => {
    filterHookCleanup();
    beforeRenderHookCleanup();
    afterRenderHookCleanup();
    elementsCleanup();
    tagsCleanup?.();
    filtersCleanup();
    filteringCleanup?.();
  };
};

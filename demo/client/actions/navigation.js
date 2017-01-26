import { menuSections } from 'data/menu.json';

export const RECEIVE_MENU_SECTIONS = 'RECEIVE_MENU_SECTIONS';
export const TOGGLE_MENU = 'TOGGLE_MENU';
export const SELECT_MENU_SECTION = 'SELECT_MENU_SECTION';

export function toggleMenu() {
  return (dispatch, getState) => dispatch({
    type: TOGGLE_MENU,
    menuVisible: !getState().navigation.menu.menuVisible
  });
}

export function loadMenuData() {
  return dispatch => dispatch({
    type: RECEIVE_MENU_SECTIONS,
    menuSections
  });
}

export function selectMenuSection(menuSection) {
  return dispatch => dispatch({
    type: SELECT_MENU_SECTION,
    menuSection
  });
}

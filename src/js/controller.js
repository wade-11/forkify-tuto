import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
  module.hot.accept();
}

const showRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0. Update result view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // 2. Rendering Recipe
    recipeView.render(model.state.recipe);
    // controlServings();
  } catch (err) {
    //alert(err);
    recipeView.renderError();
  }
};

const controllerSearch = async function () {
  try {
    resultsView.renderSpinner();

    // Get Search Query
    const query = searchView.getQuery();
    if (!query) return;

    // Load Search Results
    await model.loadSearchResult(query);

    // Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // Render specific pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goTo) {
  // Render NEW Results
  resultsView.render(model.getSearchResultsPage(goTo));

  // Render NEW specific pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe servings in view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmarks(model.state.recipe);
  else model.deleteBookmarks(model.state.recipe.id);

  // Update recipe View
  recipeView.update(model.state.recipe);

  // Render Bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render spinner
    addRecipeView.renderSpinner();

    // Upoad the new Recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Succes Message
    addRecipeView.renderMessage();

    // Render the bokkmark view
    bookmarksView.render(model.state.bookmarks);

    // Change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close Form Window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(showRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controllerSearch);
  paginationView._addHandlerClick(controlPagination);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome');
};

init();

// window.addEventListener('hashchange', showRecipe);
// window.addEventListener('load', showRecipe);

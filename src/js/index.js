import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likeView from "./views/likesView";
import { clearLoader, elements, renderLoader } from "./views/base";


//                                       Global State
const state = {};
window.state = state;

//                                       Search controller
const controlSearch = async () => {
  //Get query from view
  const query = searchView.getInput();

  if (query) {
    //new Search object and add to state
    state.search = new Search(query);
  }

  // clearing UI for next search result
  searchView.clearInput();
  searchView.clearResult();
  renderLoader(elements.searchRes);

  try {
    //search for recipes
    await state.search.getResults();

    clearLoader();
    // Showing result in UI
    searchView.renderResults(state.search.result);
  } catch (e) {
    alert('Something went wrong!');
    clearLoader();
  }

};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto);
    searchView.clearResult();
    searchView.renderResults(state.search.result, goToPage);
  }
});


//                                        Recipe controller

const controlRecipe = async () => {
  // get ID
  const id = window.location.hash.replace('#', '');

  if (id) {
    // prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // highlight selected search item
    // console.log(state.search.result.map(el => el.recipe_id === '35628'));
    // if (state.search && state.search.result.map(el => el.recipe_id === id)) searchView.highlightSelected(id);
    //create new recipe object
    state.recipe = new Recipe(id);

    try {
      //Get recipe data
      await state.recipe.getRecipe();

      // Calculate time, servings and parse ingredients
      state.recipe.calcTime();
      state.recipe.calcServings();
      state.recipe.parseIngredients();

      // render recipe to UI
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

    } catch (e) {
      alert("Error processing Recipe!");
    }
  }
};


//                                          Shopping List controller

const controlList = () => {
    // Create a list if there is no list available
    if (!state.list) state.list = new List();

    // add each ingredients to the shopping in UI
    state.recipe.ingredients.forEach(el => {
      const item = state.list.addItem(el.count, el.unit, el.ingredient);
      listView.renderListItem(item);
    });

    // update and delete ingredients from UI and state
  elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
      state.list.deleteItem(id); //delete from state
      listView.deleteListItem(id); // delete from state
    }

    // handle update count
    else if (e.target.matches('.shopping__count--value')) {
      const count = parseFloat(e.target.value);
      if (count > 0) state.list.updateItem(id, count);
    }

  })
};



//                                        Likes Controller
const controlLikes = () => {
  // creating new likes array if there is no likes array before
  if (!state.likes) state.likes = new Likes();
  // checking if current recipe is already liked
  if (state.likes.isLiked(state.recipe.id)) {
    // remove from likes array
    state.likes.deleteLike(state.recipe.id);
    // change like button
    likeView.toggleLikeButton(false);
    // update UI
    likeView.deleteLikes(state.recipe.id);
  }
  //if current recipe is not liked
  else {
    // add to likes array
    const newLike = state.likes.addLike(state.recipe.id, state.recipe.title, state.recipe.author, state.recipe.img);
    // change like button
    likeView.toggleLikeButton(true);
    // update UI
    likeView.renderLikes(newLike);
  }
  likeView.toggleLikeMenu(state.likes.getNumLikes());
};


window.addEventListener('load', () => {
  state.likes = new Likes();
  //restore likes
  state.likes.readStorageData();
  //toggle Liked item menu
  likeView.toggleLikeMenu(state.likes.getNumLikes());
  // rendering liked item into UI
  state.likes.likes.forEach(like => likeView.renderLikes(like));
});

// Recipe Change and Load event
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Click on recipe section event
elements.recipe.addEventListener('click', e => {

  // Click on '+' and '-' sign event
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServsIngs(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')){
    state.recipe.updateServings('inc');
    recipeView.updateServsIngs(state.recipe);
  }
  // Click on Add shopping List event
  else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {controlList()}

  // Click on LIKE button event
  else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLikes();
  }

});

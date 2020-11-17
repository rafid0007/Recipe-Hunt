import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe(id) {
    try {
      const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (e) {
        alert(e);
    }
  }

  calcTime() {
    const periods = Math.ceil(this.ingredients.length / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = ["tablespoons", "tablespoon", "teaspoons", "teaspoon", "ounces", "ounce", "cups", "pounds"];
    const unitsShort = ["tbsp", "tbsp", "tsp", "tsp", "oz", "oz", "cup", "pound", "kg", "g"];
    const newIngredients = this.ingredients.map(el => {
      // Uniform units
      let ingredients = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredients = ingredients.replace(unit, unitsShort[i]);
      });
      // Remove parentheses
      ingredients = ingredients.replace(/ *\([^)]*\) */g, ' ');
      ingredients = ingredients.trim();

      // Parse ingredients into count, unit and ingredients
      let objIng;
      const arrIng = ingredients.split(' ');
      const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));

      if (unitIndex > -1) {
        let count;
        const arrCount = arrIng.slice(0, unitIndex);
        if (arrCount.length > 1) {
          count = eval(arrCount.join('+'));
        } else if (arrCount.length === 1) {
          count = eval(arrCount[0].replace('-', '+'));
        } else {
          count = 1;
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        }
      } else if(parseInt(arrIng[0])) {
        objIng = {
          count: parseInt(arrIng[0]),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        }
      } else if (unitIndex === -1) {
        objIng = {
          count: 1,
          unit: '',
          ingredient: arrIng.join(' ')
        }
      }

      return objIng;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    //servings
    const newServings = type === 'dec'? this.servings -1: this.servings +1;

    //ingredients
    this.ingredients.forEach(ing => {
      ing.count *= newServings / this.servings;
    });
    this.servings = newServings;
  }

}
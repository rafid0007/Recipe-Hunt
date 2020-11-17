import uniqid from 'uniqid'

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id:uniqid(),
            count: count,
            unit: unit,
            ingredient: ingredient
        };
        this.items.push(item);
        return item;
    };

    deleteItem(id) {
        const index = this.items.findIndex(item => item.id === id);
        this.items.splice(index, 1);
    }

    updateItem(id, count) {
        this.items.find(item => item.id === id).count = count;
    }

};
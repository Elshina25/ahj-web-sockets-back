const { v4 } = require('uuid');

const users = [];

class User {
    constructor(name) {
        this.name = name;
        this.id = v4();
    }

    static getUsers() {
        return users;
    }

    static getByName(name) {
        const allUsers = User.getUsers();
        return allUsers.find(el => el.name === name);
    }

    static deleteUser(name) {
        const allUsers = User.getUsers();
        const elToDeleteIndex = allUsers.findIndex(el => el.name === name);

        if (elToDeleteIndex !== -1) {
            allUsers.splice(elToDeleteIndex, 1);
        }

        return allUsers;
    }

    save() {
        const allUsers = User.getUsers();
        allUsers.push(this.toJSON());

        return allUsers;

    }

    toJSON() {
        return {
            name: this.name,
            id: this.id
        }
    }
}

module.exports = User;
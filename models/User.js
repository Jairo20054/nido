class User {
  constructor(id, name, email, role, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.password = password;
  }

  // Método para obtener la representación JSON del objeto
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role
    };
  }

  // Método para crear una instancia de User desde un objeto JSON
  static fromJSON(json) {
    return new User(
      json.id,
      json.name,
      json.email,
      json.role,
      json.password
    );
  }
}

module.exports = User;

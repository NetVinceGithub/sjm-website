// models/associations.js
import User from './User.js';
import LoginHistory from './LoginHistory.js';





export default function setupAssociations() {
  User.hasMany(LoginHistory, { foreignKey: 'userId' });
  LoginHistory.belongsTo(User, { foreignKey: 'userId' });
}

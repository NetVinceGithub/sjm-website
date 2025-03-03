import Employee from "./Employee.js";
import PayrollInformation from "./PayrollInformation.js";

export default function setupAssociations() {


  Employee.hasOne(PayrollInformation, { foreignKey: "ecode", sourceKey: "ecode" });
  PayrollInformation.belongsTo(Employee, { foreignKey: "ecode", targetKey: "ecode" });

  console.log("✅ Associations Set Up Successfully");
}

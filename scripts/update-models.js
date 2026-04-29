const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find "export default mongoose.model('ModelName', schemaName);"
  // Replace with "export default mongoose.models.ModelName || mongoose.model('ModelName', schemaName);"
  
  const regex = /export default mongoose\.model\('([^']+)',\s*([^)]+)\);?/g;
  content = content.replace(regex, (match, modelName, schemaName) => {
    return `export default mongoose.models.${modelName} || mongoose.model('${modelName}', ${schemaName});`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});

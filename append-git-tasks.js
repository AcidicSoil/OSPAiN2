const fs = require('fs');
const path = require('path');

// Read the git visualization task entries
const gitVizTasks = fs.readFileSync('git-viz-todo-entry.md', 'utf8');

// Read the @master-todo.mdc file
const masterTodoPath = path.resolve('./@master-todo.mdc');
const masterTodo = fs.readFileSync(masterTodoPath, 'utf8');

// Find a suitable location to insert the new tasks
// We'll look for the "High Priority Tasks" section
const insertPoint = masterTodo.indexOf('## High Priority Tasks');

if (insertPoint === -1) {
  console.error('Could not find "High Priority Tasks" section in @master-todo.mdc');
  process.exit(1);
}

// Find the end of the frontend migration section to insert after it
const frontendMigrationEnd = masterTodo.indexOf('State Management Migration', insertPoint);
const insertAfterPoint = masterTodo.indexOf('\n\n', frontendMigrationEnd);

if (insertAfterPoint === -1) {
  console.error('Could not find a good insertion point after frontend migration');
  process.exit(1);
}

// Split the file and insert the new tasks
const beforeInsert = masterTodo.substring(0, insertAfterPoint + 2);
const afterInsert = masterTodo.substring(insertAfterPoint + 2);

// Combine the sections with the new tasks
const updatedMasterTodo = beforeInsert + gitVizTasks + '\n\n' + afterInsert;

// Write the updated file
fs.writeFileSync(masterTodoPath, updatedMasterTodo, 'utf8');

console.log('Successfully added Git visualization tasks to @master-todo.mdc'); 
#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const TODO_FILE = 'todo.json';

// Helper to read the todo list
function readTodoList(callback) {
  fs.readFile(TODO_FILE, 'utf8', (readErr, data) => {
    if (readErr) {
      // If file does not exist, assume an empty list
      if (readErr.code === 'ENOENT') {
        return callback(null, { tasks: [] });
      }
      return callback(readErr);
    }
    let todoData;
    try {
      todoData = JSON.parse(data);
    } catch (parseErr) {
      return callback(parseErr);
    }
    callback(null, todoData);
  });
}

// Helper to write the todo list back to the file
function writeTodoList(todoData, callback) {
  fs.writeFile(TODO_FILE, JSON.stringify(todoData, null, 2), 'utf8', callback);
}

// Command: List all tasks
program
  .command('list')
  .description('List all todo items')
  .action(() => {
    readTodoList((err, todoData) => {
      if (err) {
        console.error('Error reading todo list:', err);
        return;
      }
      console.log('Todo List:');
      if (todoData.tasks.length === 0) {
        console.log('  (No tasks found)');
      } else {
        todoData.tasks.forEach((task, index) => {
          console.log(`${index + 1}. ${task}`);
        });
      }
    });
  });

// Command: Add a new task
program
  .command('add <task>')
  .description('Add a new todo item')
  .action((task) => {
    readTodoList((readErr, todoData) => {
      if (readErr) {
        console.error('Error reading todo list:', readErr);
        return;
      }
      // Ensure the tasks array exists
      if (!Array.isArray(todoData.tasks)) {
        todoData.tasks = [];
      }
      todoData.tasks.push(task);
      writeTodoList(todoData, (writeErr) => {
        if (writeErr) {
          console.error('Error writing todo list:', writeErr);
          return;
        }
        console.log(`Task "${task}" added!`);
      });
    });
  });

// Command: Remove a task by its number
program
  .command('remove <taskNumber>')
  .description('Remove a todo item by its number')
  .action((taskNumber) => {
    readTodoList((readErr, todoData) => {
      if (readErr) {
        console.error('Error reading todo list:', readErr);
        return;
      }
      const index = parseInt(taskNumber, 10) - 1;
      if (isNaN(index) || index < 0 || index >= todoData.tasks.length) {
        console.error('Invalid task number.');
        return;
      }
      const removed = todoData.tasks.splice(index, 1);
      writeTodoList(todoData, (writeErr) => {
        if (writeErr) {
          console.error('Error writing todo list:', writeErr);
          return;
        }
        console.log(`Removed task: "${removed[0]}"`);
      });
    });
  });

program.parse(process.argv);

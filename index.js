#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer"); // Importing inquirer for user input

// Function to prompt user for the project name
const askProjectName = async () => {
  const prompt = inquirer.createPromptModule(); // Create prompt instance
  const answers = await prompt([
    {
      type: "input",
      name: "projectName",
      message: "What would you like to name your project?",
      default: "my-next-app", // Default project name
    },
  ]);
  return answers.projectName;
};

const setupProject = async () => {
  // Ask for the project name
  const projectName = await askProjectName();

  const templateDir = path.join(__dirname, "template");
  const targetDir = path.join(process.cwd(), projectName);

  console.log("🚀 Creating a new Next.js project...");

  // Create the new project directory
  try {
    fs.ensureDirSync(targetDir);
    console.log(`🛠 Created directory: ${targetDir}`);
  } catch (err) {
    console.error(`❌ Failed to create directory: ${err.message}`);
    return;
  }

  // Copy template files into the new project directory
  try {
    fs.copySync(templateDir, targetDir);
    console.log("📂 Copied template files.");
  } catch (err) {
    console.error(`❌ Failed to copy template files: ${err.message}`);
    return;
  }

  // Update the name in package.json
  const packageJsonPath = path.join(targetDir, "package.json");
  try {
    const packageJson = fs.readJsonSync(packageJsonPath);
    packageJson.name = projectName; // Set the name in package.json
    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
    console.log("✅ Updated package.json with project name.");
  } catch (err) {
    console.error(`❌ Failed to update package.json: ${err.message}`);
    return;
  }

  // Rename .gitignore (because NPM publishes it as .npmignore)
  try {
    fs.renameSync(
      path.join(targetDir, ".npmignore"),
      path.join(targetDir, ".gitignore")
    );
    console.log("✅ Renamed .npmignore to .gitignore");
  } catch (err) {
    console.error(`❌ Failed to rename .npmignore: ${err.message}`);
  }

  // Install dependencies inside the new project folder
  console.log("📦 Installing dependencies...");
  try {
    execSync("npm install", { cwd: targetDir, stdio: "inherit" });
    console.log("✅ Dependencies installed successfully.");
  } catch (err) {
    console.error(`❌ Failed to install dependencies: ${err.message}`);
    return;
  }

  console.log("✅ Project setup complete.");
  console.log(`\nTo get started, run the following commands:\n`);
  console.log(`   cd ${projectName}`);
  console.log(`   npm run dev`);
};

// Run the setup function
setupProject();

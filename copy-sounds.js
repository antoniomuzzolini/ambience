// Utility script to copy sound files to public directory
import fs from 'fs';
import path from 'path';

function copyFileSync(source, target) {
  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach((file) => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

// Create public/sounds directory if it doesn't exist
if (!fs.existsSync('./public/sounds')) {
  fs.mkdirSync('./public/sounds', { recursive: true });
}

// Copy ambience sounds
if (fs.existsSync('./sounds/ambience')) {
  if (!fs.existsSync('./public/sounds/ambience')) {
    fs.mkdirSync('./public/sounds/ambience', { recursive: true });
  }
  const ambienceFiles = fs.readdirSync('./sounds/ambience');
  ambienceFiles.forEach(file => {
    copyFileSync(`./sounds/ambience/${file}`, `./public/sounds/ambience/${file}`);
    console.log(`✅ Copied ambience: ${file}`);
  });
}

// Copy effects sounds
if (fs.existsSync('./sounds/effects')) {
  if (!fs.existsSync('./public/sounds/effects')) {
    fs.mkdirSync('./public/sounds/effects', { recursive: true });
  }
  const effectFiles = fs.readdirSync('./sounds/effects');
  effectFiles.forEach(file => {
    copyFileSync(`./sounds/effects/${file}`, `./public/sounds/effects/${file}`);
    console.log(`✅ Copied effect: ${file}`);
  });
}

console.log('\n🎵 All sound files copied to public/sounds/');
console.log('💡 You can now start the dev server to test audio loading!');
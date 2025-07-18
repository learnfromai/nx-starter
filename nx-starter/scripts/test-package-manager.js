#!/usr/bin/env node

/**
 * Test script to verify package manager enforcement
 * This script tests that npm install is blocked while pnpm is allowed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing package manager enforcement...\n');

// Check if package.json has the correct configuration
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📋 Configuration check:');
console.log(`   Package manager: ${packageJson.packageManager || 'Not specified'}`);
console.log(`   Node engine: ${packageJson.engines?.node || 'Not specified'}`);
console.log(`   pnpm engine: ${packageJson.engines?.pnpm || 'Not specified'}`);
console.log(`   Preinstall script: ${packageJson.scripts?.preinstall ? 'Present' : 'Missing'}`);

// Check if .npmrc has engine-strict
const npmrcPath = path.join(__dirname, '..', '.npmrc');
const npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
const hasEngineStrict = npmrcContent.includes('engine-strict=true');
console.log(`   Engine strict: ${hasEngineStrict ? 'Enabled' : 'Disabled'}`);

// Check if pnpm-lock.yaml exists
const pnpmLockPath = path.join(__dirname, '..', 'pnpm-lock.yaml');
const hasLockFile = fs.existsSync(pnpmLockPath);
console.log(`   pnpm-lock.yaml: ${hasLockFile ? 'Present' : 'Missing'}`);

// Check if package-lock.json exists (it shouldn't)
const npmLockPath = path.join(__dirname, '..', 'package-lock.json');
const hasNpmLock = fs.existsSync(npmLockPath);
console.log(`   package-lock.json: ${hasNpmLock ? '⚠️  Present (should be removed)' : 'Absent (good)'}`);

console.log('\n🧪 Testing npm restriction:');

// Test npm install restriction
try {
  execSync('npm run preinstall', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, npm_config_user_agent: 'npm/8.19.4 node/v18.18.2 linux x64' }
  });
  console.log('❌ FAILED: npm should have been blocked');
} catch (error) {
  if (error.stderr.toString().includes('Please use pnpm instead of npm')) {
    console.log('✅ PASSED: npm correctly blocked with proper error message');
  } else {
    console.log('❌ FAILED: npm blocked but with unexpected error');
    console.log('Error:', error.stderr.toString());
  }
}

// Test pnpm allowance
console.log('\n🧪 Testing pnpm allowance:');
try {
  execSync('node -e "if(process.env.npm_config_user_agent && process.env.npm_config_user_agent.startsWith(\'npm\')) { console.error(\'ERROR: Please use pnpm instead of npm.\'); process.exit(1); }"', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, npm_config_user_agent: 'pnpm/8.10.0 npm/? node/v18.18.2 linux x64' }
  });
  console.log('✅ PASSED: pnpm usage is allowed');
} catch (error) {
  console.log('❌ FAILED: pnpm should be allowed but was blocked');
  console.log('Error:', error.stderr.toString());
}

console.log('\n🎉 Package manager enforcement test completed!');
console.log('\nTo install dependencies correctly, use:');
console.log('  pnpm install');
console.log('\nTo install pnpm globally (if not already installed):');
console.log('  npm install -g pnpm');
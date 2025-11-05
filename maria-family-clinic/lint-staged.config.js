export default {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  
  // CSS and SCSS files
  '*.{css,scss}': [
    'prettier --write',
    'git add'
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
    'git add'
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
    'git add'
  ],
  
  // Package.json (run type checking after changes)
  'package.json': [
    'npm run type-check'
  ],
  
  // TypeScript files (additional type checking)
  '*.{ts,tsx}': [
    'npm run type-check'
  ]
}
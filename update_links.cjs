const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Home.tsx',
  'src/pages/Services.tsx',
  'src/pages/ServiceDetail.tsx',
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add useParams import if it doesn't exist
  if (!content.includes('useParams')) {
    content = content.replace(/import \{ Link \}/g, 'import { Link, useParams }');
    if (!content.includes('useParams')) {
      content = content.replace(/import \{ Link, ([^\}]+) \}/g, 'import { Link, useParams, $1 }');
    }
    // if Link is imported from react-router-dom, make sure useParams is too
    if (!content.includes('useParams')) {
      content = content.replace(/import (.*?) from 'react-router-dom';/g, 'import $1, { useParams } from \'react-router-dom\';');
    }
  }

  // 2. Add const { slug } = useParams(); inside the component
  const componentRegex = /(export default function [A-Za-z]+\([^\)]*\)\s*\{)/;
  content = content.replace(componentRegex, '$1\n  const { slug } = useParams();\n');

  // Also do it for sub-components in Home.tsx like ServiceCard
  if (file.includes('Home.tsx')) {
    content = content.replace(/function ServiceCard\(\{ service \}: \{ service: Service \}\) \{/, 'function ServiceCard({ service }: { service: Service }) {\n  const { slug } = useParams();\n');
  }

  if (file.includes('Services.tsx')) {
    content = content.replace(/function ServiceCard\(\{ service \}: \{ service: Service \}\) \{/, 'function ServiceCard({ service }: { service: Service }) {\n  const { slug } = useParams();\n');
  }

  // 3. Replace Links
  content = content.replace(/to="\/services"/g, 'to={`/${slug}/services`}');
  content = content.replace(/to="\/book"/g, 'to={`/${slug}/book`}');
  content = content.replace(/to="\/book\?service=/g, 'to={`/${slug}/book?service=');
  content = content.replace(/to=\{\`\/services\//g, 'to={`/${slug}/services/');
  content = content.replace(/to=\{\`\/book\?service=/g, 'to={`/${slug}/book?service=');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

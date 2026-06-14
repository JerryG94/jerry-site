// Post-build script: add GitHub Pages required files
import { writeFileSync } from 'fs'

// .nojekyll — prevents GitHub from ignoring underscored files
writeFileSync('docs/.nojekyll', '')

// 404.html — SPA fallback for client-side routing
writeFileSync('docs/404.html', `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GLJ 资源导航</title>
  <script>sessionStorage.redirect=location.href</script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body></body>
</html>
`)

console.log('✓ Post-build: .nojekyll + 404.html created')

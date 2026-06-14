// 测试脚本 - 诊断页面空白问题
// 在浏览器控制台中运行此脚本

console.log('=== GLJ 资源导航 - 诊断脚本 ===')

// 1. 检查 React 是否正确加载
console.log('1. 检查 React...')
if (window.React) {
  console.log('✅ React 已加载')
} else {
  console.log('❌ React 未加载')
}

// 2. 检查根元素
console.log('2. 检查根元素...')
const root = document.getElementById('root')
console.log('根元素:', root)
console.log('根元素内容:', root?.innerHTML)

// 3. 检查是否有 JavaScript 错误
console.log('3. 检查错误...')
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.log('❌ JavaScript 错误:', msg, 'at', url, ':', lineNo)
  return false
}

// 4. 检查网络请求
console.log('4. 检查 API 请求...')
fetch('http://localhost:3002/api/resources')
  .then(res => {
    console.log('API 响应状态:', res.status)
    return res.json()
  })
  .then(data => {
    console.log('API 数据:', data)
  })
  .catch(err => {
    console.log('❌ API 请求失败（这是正常的，如果没有运行后端）:', err.message)
    console.log('应用应该 fallback 到本地数据')
  })

// 5. 检查数据加载
setTimeout(() => {
  console.log('5. 3秒后检查应用状态...')
  const appElement = root?.querySelector('[class*="min-h"]')
  console.log('应用根元素:', appElement)
  
  if (!root || root.children.length === 0) {
    console.log('❌ 根元素为空！React 可能没有正确渲染。')
  } else {
    console.log('✅ 根元素有内容')
  }
}, 3000)

console.log('=== 诊断脚本结束 ===')
console.log('如果有错误，请截图控制台输出并发送给我。')

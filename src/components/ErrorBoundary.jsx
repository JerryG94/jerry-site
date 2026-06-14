import { Component } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    // Log error to error reporting service
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-[100dvh] flex items-center justify-center p-4 
                     bg-gray-50 dark:bg-slate-950"
        >
          <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full 
                              bg-red-100 dark:bg-red-900/30 
                              flex items-center justify-center"
            >
              <AlertTriangle size={40} className="text-red-600 dark:text-red-400" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">出错了</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              抱歉，应用程序遇到了意外错误。请尝试刷新页面。
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 
                              rounded-xl text-left overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 
                           bg-blue-500 text-white rounded-xl 
                           hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} />
                重试
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 
                           rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 
                           transition-colors text-sm font-medium"
              >
                刷新页面
              </motion.button>
            </div>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

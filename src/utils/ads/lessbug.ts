// /**
//  * 错误处理器 - 拦截并分类处理 JavaScript 错误
//  */
// class ErrorHandler {
//   constructor(options = {}) {
//     // 默认配置
//     this.options = {
//       logToConsole: true,
//       sendToServer: false,
//       serverEndpoint: "/api/errors",
//       ...options,
//     };

//     // 错误类型映射
//     this.errorTypes = {
//       EvalError,
//       RangeError,
//       ReferenceError,
//       SyntaxError,
//       TypeError,
//       URIError,
//     };

//     // 初始化错误拦截
//     this.initialize();
//   }

//   /**
//    * 初始化各种错误监听器
//    */
//   initialize() {
//     // 捕获未处理的 Promise 错误
//     window.addEventListener("unhandledrejection", (event) => {
//       this.handleError(event.reason, "UnhandledPromiseRejection");
//     });

//     // 捕获全局错误
//     window.addEventListener(
//       "error",
//       (event) => {
//         // 区分资源加载错误和脚本错误
//         const isResourceError =
//           event.target &&
//           (event.target.tagName === "IMG" ||
//             event.target.tagName === "SCRIPT" ||
//             event.target.tagName === "LINK");

//         if (isResourceError) {
//           this.handleError(
//             new Error(
//               `Failed to load ${event.target.tagName}: ${
//                 event.target.src || event.target.href
//               }`
//             ),
//             "ResourceError"
//           );
//         } else {
//           this.handleError(
//             event.error || new Error(event.message),
//             "RuntimeError"
//           );
//         }

//         // 防止错误显示在控制台（如果需要）
//         // event.preventDefault();
//       },
//       true
//     );

//     // 覆盖原生 console.error
//     if (this.options.interceptConsoleErrors) {
//       const originalConsoleError = console.error;
//       console.error = (...args) => {
//         this.handleError(args[0], "ConsoleError");
//         originalConsoleError.apply(console, args);
//       };
//     }
//   }

//   /**
//    * 处理捕获的错误
//    * @param {Error|any} error - 捕获的错误对象或信息
//    * @param {string} source - 错误来源
//    */
//   handleError(error, source) {
//     // 确保错误是 Error 对象
//     const errorObj = error instanceof Error ? error : new Error(String(error));

//     // 识别错误类型
//     const errorType = this.identifyErrorType(errorObj);

//     // 构建错误信息对象
//     const errorInfo = {
//       type: errorType,
//       message: errorObj.message,
//       stack: errorObj.stack,
//       source: source,
//       timestamp: new Date().toISOString(),
//       url: window.location.href,
//       userAgent: navigator.userAgent,
//     };

//     // 根据配置处理错误
//     if (this.options.logToConsole) {
//       this.logError(errorInfo);
//     }

//     if (this.options.sendToServer) {
//       this.sendErrorToServer(errorInfo);
//     }

//     // 触发自定义事件
//     this.triggerErrorEvent(errorInfo);

//     return errorInfo;
//   }

//   /**
//    * 识别错误的具体类型
//    * @param {Error} error - 错误对象
//    * @returns {string} - 错误类型名称
//    */
//   identifyErrorType(error) {
//     // 遍历已知错误类型进行匹配
//     for (const [typeName, ErrorClass] of Object.entries(this.errorTypes)) {
//       if (error instanceof ErrorClass) {
//         return typeName;
//       }
//     }

//     // 自定义错误或未知类型
//     return error.name || "UnknownError";
//   }

//   /**
//    * 将错误信息输出到控制台
//    * @param {Object} errorInfo - 错误信息对象
//    */
//   logError(errorInfo) {
//     console.group(
//       `%c${errorInfo.type}: ${errorInfo.message}`,
//       "color: red; font-weight: bold"
//     );
//     console.log("Source:", errorInfo.source);
//     console.log("URL:", errorInfo.url);
//     console.log("Timestamp:", errorInfo.timestamp);
//     console.log("Stack:", errorInfo.stack);
//     console.groupEnd();
//   }

//   /**
//    * 将错误信息发送到服务器
//    * @param {Object} errorInfo - 错误信息对象
//    */
//   sendErrorToServer(errorInfo) {
//     try {
//       fetch(this.options.serverEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(errorInfo),
//         // 使用 keepalive 确保请求在页面卸载时仍能完成
//         keepalive: true,
//       }).catch((err) => console.warn("Failed to send error to server:", err));
//     } catch (e) {
//       console.warn("Failed to send error to server:", e);
//     }
//   }

//   /**
//    * 触发自定义错误事件
//    * @param {Object} errorInfo - 错误信息对象
//    */
//   triggerErrorEvent(errorInfo) {
//     const event = new CustomEvent("applicationError", {
//       detail: errorInfo,
//       bubbles: true,
//       cancelable: true,
//     });
//     window.dispatchEvent(event);
//   }
// }

// // 创建全局错误处理器实例
// const errorHandler = new ErrorHandler({
//   logToConsole: true,
//   sendToServer: true,
//   serverEndpoint: "/api/log/errors",
//   interceptConsoleErrors: true,
// });

// // 导出实例以便在其他模块中使用
// export default errorHandler;

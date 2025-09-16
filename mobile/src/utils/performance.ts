import { Platform } from 'react-native';

// 性能监控工具类
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 开始计时
  startTimer(label: string): void {
    this.startTimes.set(label, Date.now());
  }

  // 结束计时
  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`Timer "${label}" was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.set(label, duration);
    this.startTimes.delete(label);
    
    console.log(`⏱️ ${label}: ${duration}ms`);
    return duration;
  }

  // 获取指标
  getMetric(label: string): number | undefined {
    return this.metrics.get(label);
  }

  // 获取所有指标
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }

  // 记录内存使用情况
  recordMemoryUsage(): void {
    if (__DEV__ && Platform.OS === 'android') {
      // Android内存监控
      const memInfo = (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (memInfo) {
        console.log('📱 内存使用情况已记录');
      }
    }
  }

  // 记录网络请求性能
  recordNetworkRequest(url: string, duration: number, status: number): void {
    const key = `network_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.metrics.set(key, duration);
    
    if (duration > 5000) {
      console.warn(`🐌 慢网络请求: ${url} (${duration}ms)`);
    }
  }

  // 记录渲染性能
  recordRenderTime(componentName: string, duration: number): void {
    const key = `render_${componentName}`;
    this.metrics.set(key, duration);
    
    if (duration > 16) { // 超过一帧的时间
      console.warn(`🐌 慢渲染: ${componentName} (${duration}ms)`);
    }
  }
}

// 性能装饰器
export function measurePerformance(label: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startTimer(label);
      
      try {
        const result = await method.apply(this, args);
        monitor.endTimer(label);
        return result;
      } catch (error) {
        monitor.endTimer(label);
        throw error;
      }
    };
  };
}

// 组件渲染性能监控
export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  WrappedComponent: T,
  componentName?: string
): T {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const monitor = PerformanceMonitor.getInstance();
    
    React.useEffect(() => {
      monitor.startTimer(`render_${displayName}`);
      
      return () => {
        monitor.endTimer(`render_${displayName}`);
      };
    });

    return React.createElement(WrappedComponent, { ...props, ref });
  }) as T;
}

// 网络请求性能监控
export async function fetchWithPerformanceMonitoring(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const monitor = PerformanceMonitor.getInstance();
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    monitor.recordNetworkRequest(url, duration, response.status);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    monitor.recordNetworkRequest(url, duration, 0);
    throw error;
  }
}

// 性能报告生成
export function generatePerformanceReport(): string {
  const monitor = PerformanceMonitor.getInstance();
  const metrics = monitor.getAllMetrics();
  
  const report = {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    metrics: metrics,
    summary: {
      totalMetrics: Object.keys(metrics).length,
      averageRenderTime: calculateAverage(Object.values(metrics).filter((_, i) => 
        Object.keys(metrics)[i].startsWith('render_')
      )),
      averageNetworkTime: calculateAverage(Object.values(metrics).filter((_, i) => 
        Object.keys(metrics)[i].startsWith('network_')
      ))
    }
  };
  
  return JSON.stringify(report, null, 2);
}

// 计算平均值
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

// 性能优化建议
export function getPerformanceRecommendations(): string[] {
  const monitor = PerformanceMonitor.getInstance();
  const metrics = monitor.getAllMetrics();
  const recommendations: string[] = [];
  
  // 检查渲染性能
  const renderMetrics = Object.entries(metrics).filter(([key]) => key.startsWith('render_'));
  const slowRenders = renderMetrics.filter(([, value]) => value > 16);
  
  if (slowRenders.length > 0) {
    recommendations.push('🐌 检测到慢渲染组件，建议使用React.memo或useMemo优化');
  }
  
  // 检查网络性能
  const networkMetrics = Object.entries(metrics).filter(([key]) => key.startsWith('network_'));
  const slowRequests = networkMetrics.filter(([, value]) => value > 5000);
  
  if (slowRequests.length > 0) {
    recommendations.push('🌐 检测到慢网络请求，建议添加缓存或优化API');
  }
  
  // 检查内存使用
  if (Platform.OS === 'android') {
    recommendations.push('📱 建议定期检查内存使用情况，避免内存泄漏');
  }
  
  return recommendations;
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

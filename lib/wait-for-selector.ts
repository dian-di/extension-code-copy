interface WaitForElementOptions {
  maxAttempts?: number;
  interval?: number;
  parent?: Document | HTMLElement;
  timeout?: number;
  shouldStop?: () => boolean;
}

export async function waitForElement<T extends Element>(
  selector: string,
  options: WaitForElementOptions = {}
): Promise<T | null> {
  const {
    maxAttempts = 5,
    interval = 300,
    parent = document,
    timeout = maxAttempts * interval + 500, // 额外增加 500ms 作为 buffer
    shouldStop = () => false,
  } = options;

  let attempts = 0;

  // 立即检查一次
  const element = parent.querySelector<T>(selector);
  if (element) {
    return element;
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      attempts++;
      const currentElement = parent.querySelector<T>(selector);

      const isConditionMet = shouldStop();
      const isTimeout = Date.now() - startTime > timeout;

      if (currentElement) {
        clearInterval(timer);
        resolve(currentElement);
      } else if (attempts >= maxAttempts || isConditionMet || isTimeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}

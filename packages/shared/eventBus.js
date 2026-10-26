import { logger } from './logger.js';

class InMemoryEventBus {
  constructor() {
    this.handlers = new Map();
  }

  subscribe(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type).add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  async publish(type, payload) {
    logger.debug({ type, payload }, `[EventBus] Publishing event: ${type}`);
    const registered = this.handlers.get(type);
    if (!registered || registered.size === 0) {
      return;
    }

    const promises = Array.from(registered).map(async (handler) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error({ err, type }, `[EventBus] Error executing subscriber for ${type}`);
      }
    });

    await Promise.allSettled(promises);
  }
}

export const eventBus = new InMemoryEventBus();

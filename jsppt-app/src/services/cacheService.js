/**
 * 缓存服务
 * 使用IndexedDB管理模型缓存
 */
class CacheService {
  /**
   * 构造函数
   */
  constructor() {
    this.dbName = 'jsPPT-ModelCache';
    this.storeName = 'models';
    this.db = null;
  }

  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>} IndexedDB数据库实例
   */
  async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB初始化失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * 检查模型是否已缓存
   * @param {String} modelId 模型ID
   * @returns {Promise<Boolean>} 是否已缓存
   */
  async hasModel(modelId) {
    try {
      await this.initDB();

      return new Promise((resolve) => {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(modelId);

        request.onsuccess = () => {
          resolve(!!request.result);
        };

        request.onerror = () => {
          console.error('检查模型缓存失败:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('检查模型缓存失败:', error);
      return false;
    }
  }

  /**
   * 保存模型到缓存
   * @param {String} modelId 模型ID
   * @param {*} modelData 模型数据
   * @returns {Promise<Boolean>} 是否保存成功
   */
  async saveModel(modelId, modelData) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(modelData, modelId);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('保存模型到缓存失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('保存模型到缓存失败:', error);
      return false;
    }
  }

  /**
   * 从缓存获取模型
   * @param {String} modelId 模型ID
   * @returns {Promise<*>} 模型数据
   */
  async getModel(modelId) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(modelId);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('从缓存获取模型失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('从缓存获取模型失败:', error);
      throw error;
    }
  }

  /**
   * 从缓存删除模型
   * @param {String} modelId 模型ID
   * @returns {Promise<Boolean>} 是否删除成功
   */
  async deleteModel(modelId) {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(modelId);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('从缓存删除模型失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('从缓存删除模型失败:', error);
      return false;
    }
  }

  /**
   * 清空缓存
   * @returns {Promise<Boolean>} 是否清空成功
   */
  async clearCache() {
    try {
      await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('清空缓存失败:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const cacheService = new CacheService();
export default cacheService;

class BaseTransformer {
  // Transform single item
  item(data) {
    return data;
  }

  // Transform collection
  collection(data) {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(item => this.item(item));
  }
}

export default BaseTransformer;

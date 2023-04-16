export function saveToLocalStorage(key: string, value: any) {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("Error saving data to local storage:", error);
  }
}

export function loadFromLocalStorage(key: string) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return null;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error("Error loading data from local storage:", error);
    return null;
  }
}

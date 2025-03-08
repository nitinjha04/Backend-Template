export const mergeNestedObject = (existingObj, newObj) => {
    if (
      typeof newObj === "object" &&
      existingObj &&
      typeof existingObj === "object"
    ) {
      Object.keys(newObj).forEach((key) => {
        // Check if both existing and new values are arrays
        if (Array.isArray(newObj[key]) && Array.isArray(existingObj[key])) {
          // Remove items in existing array that are not in new array
          existingObj[key] = existingObj[key].filter((item) =>
            newObj[key].includes(item)
          );
  
          // Add new items from new array that aren't in the existing array
          newObj[key].forEach((item) => {
            if (!existingObj[key].includes(item)) {
              existingObj[key].push(item);
            }
          });
        }
        // If both are objects, recursively merge them
        else if (typeof newObj[key] === "object" && existingObj[key]) {
          existingObj[key] = mergeNestedObject(existingObj[key], newObj[key]);
        } else {
          // Directly update the value if it's a primitive or if it's changed
          existingObj[key] = newObj[key];
        }
      });
    }
    return existingObj;
  };
  
  export const updateNestedObject = (existingObject, dataToSave) => {
    Object.keys(dataToSave).forEach((item) => {
      if (typeof dataToSave[item] === "object" && existingObject[item]) {
        if (
          Array.isArray(dataToSave[item]) &&
          Array.isArray(existingObject[item])
        ) {
          // Handle array merging if it's an array
          existingObject[item] = mergeNestedObject(
            existingObject[item],
            dataToSave[item]
          );
        } else {
          // For other objects, merge recursively
          existingObject[item] = mergeNestedObject(
            existingObject[item],
            dataToSave[item]
          );
        }
      } else if (dataToSave[item] !== undefined && dataToSave[item] !== null) {
        // Update directly if it's a primitive
        existingObject[item] = dataToSave[item];
      }
    });
    return existingObject;
  };
  
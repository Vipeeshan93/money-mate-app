let currentUserId = null;

export const setUser = (id) => {
  currentUserId = id;
};

export const getUser = () => {
  return currentUserId;
};


export const clearUser = () => {
  currentUserId = null;
};
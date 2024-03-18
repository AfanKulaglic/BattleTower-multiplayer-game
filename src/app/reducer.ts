const initialState = {
  username: '',
  enemy: '', // Dodavanje nove varijable enemy
};

const userReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'SET_USER_NAME':
      return {
        ...state,
        username: action.payload,
      };
    case 'SET_ENEMY': // Dodavanje nove akcije SET_ENEMY
      return {
        ...state,
        enemy: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;

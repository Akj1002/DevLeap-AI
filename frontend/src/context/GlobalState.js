import React, { createContext, useReducer, useContext } from 'react';

const initialState = {
  user: {
    _id: "CURRENT_USER_ID_HERE", // Replaced via auth in production
    name: "Abhinav",
    role: "Data Science",
    globalRating: 1850,
    totalSolved: 142,
    solvedProblems: []
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'MARK_PROBLEM_SOLVED':
      if (state.user.solvedProblems.includes(action.payload)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          totalSolved: state.user.totalSolved + 1,
          globalRating: state.user.globalRating + 15,
          solvedProblems: [...state.user.solvedProblems, action.payload]
        }
      };
    default: return state;
  }
};

const GlobalContext = createContext();
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <GlobalContext.Provider value={{ state, dispatch }}>{children}</GlobalContext.Provider>;
};
export const useGlobalState = () => useContext(GlobalContext);
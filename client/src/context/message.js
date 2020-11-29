import { createContext, useContext, useReducer } from "react";

const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

let initialState = {
  users: null,
  selectedUser: null,
};

const messageReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };
    case "SET_SELECTED_USER":
      return {
        ...state,
        selectedUser: action.payload,
      };
    case "SET_USER_MESSAGES":
      const users = [...state.users];

      const usersIndex = users.findIndex(
        u => u.username === state.selectedUser
      );

      users[usersIndex] = { ...users[usersIndex], messages: action.payload };
      return { ...state, users };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export function MessageProvider({ children }) {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  return (
    <MessageStateContext.Provider value={state}>
      <MessageDispatchContext.Provider value={dispatch}>
        {children}
      </MessageDispatchContext.Provider>
    </MessageStateContext.Provider>
  );
}

export function useMessageState() {
  const context = useContext(MessageStateContext);

  if (context === undefined) {
    throw new Error("useMessageState must be used within a MessageProvider");
  }

  return context;
}

export function useMessageDispatch() {
  const context = useContext(MessageDispatchContext);

  if (context === undefined) {
    throw new Error("useMessageDispatch must be used within a MessageProvider");
  }

  return context;
}

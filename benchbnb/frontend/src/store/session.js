import csrfFetch from './csrf'

const SET_CURRENT_USER = 'session/setCurrentUser'
const REMOVE_CURRENT_USER = 'session/removeCurrentUser'

const setCurrentUser = user => ({
    type: SET_CURRENT_USER,
    payload: user
})

const removeCurrentUser = userId => ({
    type: REMOVE_CURRENT_USER,
})

function storeCSRFToken(res) {
  const csrfToken = res.headers.get('X-CSRF-Token')
  if (csrfToken) sessionStorage.setItem('X-CSRF-Token', csrfToken)
}

const storeCurrentUser = user => {
  if (user) sessionStorage.setItem("currentUser", JSON.stringify(user));
  else sessionStorage.removeItem("currentUser")
}

export const login = ({ credential, password }) => async dispatch => {
    const res = await csrfFetch('/api/session', {
        method: 'POST',
        body: JSON.stringify({
            credential,
            password
        })
    })
    const data = await res.json();
    storeCurrentUser(data.user)
    dispatch(setCurrentUser(data.user))
    return res
}

export const restoreSession = () => async dispatch => {
  const res = await csrfFetch('/api/session');
  storeCSRFToken(res);
  const data = await res.json();
  storeCurrentUser(data.user);
  dispatch(setCurrentUser(data.user));
  return res
}

export const signup = ({ username, email, password }) => async dispatch => {
  const res = await csrfFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password
    })
  })
  const data = await res.json();
  storeCurrentUser(data.user);
  dispatch(setCurrentUser(data.user));
  return res;
}

  export const logout = () => async dispatch => {
    const res = await csrfFetch('/api/session', {
      method: 'DELETE'
    })
    storeCurrentUser(null)
    dispatch(removeCurrentUser())
    return res
  }

// const sessionReducer = (state = {}, action) => {
//     const nextState = { ...state }

//     switch (action.type) {
//         case SET_CURRENT_USER:
//             nextState[action.payload.id] = action.payload
//             return nextState
//         case REMOVE_CURRENT_USER:
//             delete nextState[action.payload.userId]
//             return nextState
//         default:
//             return state
//     }
// }

const initialState = { user: JSON.parse(sessionStorage.getItem('currentUser')) };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      return { ...state, user: action.payload };
    case REMOVE_CURRENT_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default sessionReducer;
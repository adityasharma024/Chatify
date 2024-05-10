

import Chatting from "./components/Chat/Chatting"
import Details from "./components/details/Details"
import List from "./components/list/List"
import Login from "./components/login/Login";
import { ToastContainer } from 'react-toastify';
import Notifications from "./components/notifications/Notifications";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
const App = () => {
  const user=false;
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  useEffect(()=>{
    const unSub = onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid)
    });
    return ()=>{
      unSub();
    }
  },[fetchUserInfo]);
  if(isLoading) return <div className="loading">Loading...</div>

  return (
    <div className='container'>
      {currentUser?
      <>
      <List/>
     {chatId && <Chatting/>}
      {chatId &&<Details/>}</>
      :<Login/>}
        <Notifications />

     
    </div>
  )
}

export default App
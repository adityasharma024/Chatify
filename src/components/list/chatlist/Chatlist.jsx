import React, { useEffect, useState } from 'react';
import './chatlist.css';
import AddUser from '../../addUser/AddUser';
import { getDocs, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'; // Import updateDoc from firebase/firestore
import { useUserStore } from '../../../lib/userStore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

const Chatlist = () => {
    const [chats, setChats] = useState([]);
    const [input,setInput]=useState("");
    const [addMode, setAddMode] = useState(false);
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore(); // Removed 'chatId', assuming it's not needed here

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, "userchats", currentUser.id),
            async (res) => {
                const items = res.data().chats;

                const promises = items.map(async (item) => {
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        return { ...item, user: userData };
                    } else {
                        console.error("User document not found for ID:", item.receiverId);
                        return null;
                    }
                });

                const chatData = await Promise.all(promises);

                setChats(chatData.filter(chat => chat !== null).sort((a, b) => b.updatedAt - a.updatedAt));
            }
        );

        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex(
            (item) => item.chatId === chat.chatId
        );

        if (chatIndex !== -1) {
            userChats[chatIndex].isSeen = true;

            const userChatsRef = doc(db, "userchats", currentUser.id);

            try {
                await updateDoc(userChatsRef, {
                    chats: userChats,
                });
                changeChat(chat.chatId, chat.user);
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log("Chat not found in userChats array.");
        }
    };
    const filteredChats = chats.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className='chatlist'>
            <div className="search">
                <div className="searchbar">
                    <img src='/search.png' alt="Search Icon" />
                    <input type='text' placeholder='Search' onChange={(e)=>setInput(e.target.value)} />
                </div>
                <img
                    className='add'
                    src={addMode ? './minus.png' : './plus.png'}
                    alt={addMode ? 'Minus Icon' : 'Plus Icon'}
                    onClick={() => setAddMode(prev => !prev)}
                />
            </div>
            {filteredChats.map(chat => (
                <div className="item" key={chat.id} onClick={() => handleSelect(chat)}>
                    <img src={chat.user.avatar} alt="User Avatar" />
                    <div className="texts">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastmessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddUser />}
        </div>
    );
};

export default Chatlist;

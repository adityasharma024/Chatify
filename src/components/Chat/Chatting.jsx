import React, { useEffect, useState, useRef } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chatting = () => {
  const [chat, setChat] = useState({});
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { currentUser } = useUserStore();
  const [img, setImg] = useState({
    file: null,
    url: "",
  })
  const { isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();


  const endRef = useRef(null);
  const { chatId, user } = useChatStore(); // Assuming useChatStore returns the user details

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleSent = async () => {
    if (text === '') return;
    let imgUrl = null


    try {
      if (img.file) {
        imgUrl = await upload(img.file);

      }
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date().toISOString(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

    } catch (err) {
      console.log(err);
    }
    setImg({
      file: null,
      url: ""
    })
    setText('');
  };

  return (
    <div className="chat">
      {user && (
        <div className="top">
          <div className="user">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <div className="texts">
              <span>{user.username}</span>
              <p>{user.status}</p>
            </div>
          </div>
        </div>
      )}

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} key={index}>
            <div className="texts">
              {message.img && <img src={message.img} alt="Image" />}
              <p>{message.text}</p>
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} alt="" />
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" />
          </label>
          <input type='file' id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" />
          <img src="./mic.png" />
        </div>
        <input value={text} className="input" type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You can not send message..." : "Type a message..."} onChange={(e) => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
        <div className="emoji">
          <img src="./emoji.png" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSent} disabled={isCurrentUserBlocked || isReceiverBlocked} >Send</button>
      </div>
    </div>
  );
};

export default Chatting;

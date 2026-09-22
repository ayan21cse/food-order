// =====================================================
// MRIGANKA FOOD ZONE
// AI CHATBOT - N8N CONNECTION
// =====================================================


// =====================================================
// N8N CHAT TRIGGER URL
// =====================================================

const N8N_CHAT_URL =
  "https://mrigankabanik.app.n8n.cloud/webhook/3b555e6c-11ed-40ae-b95e-824e60fcf954/chat";


// =====================================================
// GET CHAT ELEMENTS
// =====================================================

const chatBox =
  document.getElementById("chatBox");

const messages =
  document.getElementById("messages");

const userInput =
  document.getElementById("userInput");


// =====================================================
// OPEN / CLOSE CHAT
// =====================================================

function toggleChat() {

  if (chatBox.style.display === "flex") {

    chatBox.style.display = "none";

  } else {

    chatBox.style.display = "flex";

    setTimeout(() => {

      userInput.focus();

    }, 100);

  }

}


// =====================================================
// CREATE UNIQUE SESSION ID
// =====================================================

function getSessionId() {

  let sessionId =
    localStorage.getItem(
      "mrigankaFoodZoneSession"
    );


  if (!sessionId) {

    sessionId =
      "customer_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 10);


    localStorage.setItem(
      "mrigankaFoodZoneSession",
      sessionId
    );

  }


  return sessionId;

}


// =====================================================
// ADD MESSAGE TO CHAT
// =====================================================

function addMessage(
  text,
  type
) {

  const message =
    document.createElement("div");


  message.classList.add(
    "message"
  );


  if (type === "user") {

    message.classList.add(
      "user-message"
    );

  } else {

    message.classList.add(
      "bot-message"
    );

  }


  message.innerHTML =
    formatMessage(text);


  messages.appendChild(
    message
  );


  messages.scrollTop =
    messages.scrollHeight;


  return message;

}


// =====================================================
// FORMAT AI MESSAGE
// =====================================================

function formatMessage(text) {

  if (!text) {

    return "";

  }


  return String(text)

    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    )

    .replace(
      /\n/g,
      "<br>"
    );

}


// =====================================================
// TYPING INDICATOR
// =====================================================

function showTyping() {

  const typing =
    document.createElement("div");


  typing.className =
    "message bot-message";

  typing.id =
    "typingIndicator";


  typing.innerHTML = `

    <div class="typing">

      <span></span>
      <span></span>
      <span></span>

    </div>

  `;


  messages.appendChild(
    typing
  );


  messages.scrollTop =
    messages.scrollHeight;

}


// =====================================================
// REMOVE TYPING INDICATOR
// =====================================================

function removeTyping() {

  const typing =
    document.getElementById(
      "typingIndicator"
    );


  if (typing) {

    typing.remove();

  }

}


// =====================================================
// SEND MESSAGE
// =====================================================

async function sendMessage() {

  const message =
    userInput.value.trim();


  // Don't send empty messages

  if (!message) {

    return;

  }


  // Display user's message

  addMessage(
    message,
    "user"
  );


  // Clear input

  userInput.value = "";


  // Show typing

  showTyping();


  try {

    // Get customer session

    const sessionId =
      getSessionId();


    // Send message to n8n

    const response =
      await fetch(
        N8N_CHAT_URL,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              action:
                "sendMessage",

              sessionId:
                sessionId,

              chatInput:
                message

            })

        }
      );


    // Check HTTP status

    if (!response.ok) {

      throw new Error(
        "HTTP Error: " +
        response.status
      );

    }


    // Read response

    const data =
      await response.json();


    console.log(
      "n8n response:",
      data
    );


    // Remove typing

    removeTyping();


    // Get AI response

    const aiReply =
      data.output ||
      data.reply ||
      data.text ||
      data.message;


    if (aiReply) {

      addMessage(
        aiReply,
        "bot"
      );

    } else {

      addMessage(
        "Sorry, I didn't receive a response from the assistant.",
        "bot"
      );

      console.warn(
        "Unexpected n8n response:",
        data
      );

    }


  } catch (error) {

    console.error(
      "Chatbot Error:",
      error
    );


    // Remove typing

    removeTyping();


    // Show error

    addMessage(

      "⚠️ I'm having trouble connecting to the restaurant assistant. Please try again.",

      "bot"

    );

  }

}


// =====================================================
// ENTER KEY SUPPORT
// =====================================================

userInput.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);
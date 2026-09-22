// =====================================================
// MRIGANKA FOOD ZONE
// AI CHATBOT - N8N PRODUCTION CONNECTION
// =====================================================


// =====================================================
// N8N PRODUCTION CHAT URL
// =====================================================

const N8N_CHAT_URL =
  "https://mrigankabanik.app.n8n.cloud/webhook/3b555e6c-11ed-40ae-b95e-824e60fcf954/chat";


// =====================================================
// GET CHAT ELEMENTS
// =====================================================

const chatBox = document.getElementById("chatBox");
const messages = document.getElementById("messages");
const userInput = document.getElementById("userInput");


// =====================================================
// CREATE NEW SESSION
// NO localStorage
// NO sessionStorage
// =====================================================

const sessionId =
  "customer_" +
  Date.now() +
  "_" +
  Math.random().toString(36).substring(2, 10);

console.log("NEW CHAT SESSION:", sessionId);


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
// ADD MESSAGE
// =====================================================

function addMessage(text, type) {

  const message =
    document.createElement("div");

  message.classList.add("message");

  if (type === "user") {

    message.classList.add("user-message");

  } else {

    message.classList.add("bot-message");

  }

  message.innerHTML =
    formatMessage(text);

  messages.appendChild(message);

  messages.scrollTop =
    messages.scrollHeight;

  return message;
}


// =====================================================
// FORMAT MESSAGE
// =====================================================

function formatMessage(text) {

  if (text === null || text === undefined) {
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

  removeTyping();

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

  messages.appendChild(typing);

  messages.scrollTop =
    messages.scrollHeight;
}


// =====================================================
// REMOVE TYPING
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
// EXTRACT AI RESPONSE
// =====================================================

function extractAIResponse(data) {

  console.log(
    "RAW N8N DATA:",
    data
  );


  // -----------------------------------------------
  // Direct string
  // -----------------------------------------------

  if (typeof data === "string") {

    return data;

  }


  // -----------------------------------------------
  // Array response
  // -----------------------------------------------

  if (Array.isArray(data)) {

    for (const item of data) {

      if (!item) continue;

      if (typeof item === "string") {
        return item;
      }

      if (item.output) {
        return item.output;
      }

      if (item.reply) {
        return item.reply;
      }

      if (item.text) {
        return item.text;
      }

      if (item.message) {

        if (typeof item.message === "string") {
          return item.message;
        }

        if (item.message.content) {
          return item.message.content;
        }

      }

    }

  }


  // -----------------------------------------------
  // Standard n8n response
  // -----------------------------------------------

  if (data.output) {
    return data.output;
  }

  if (data.reply) {
    return data.reply;
  }

  if (data.text) {
    return data.text;
  }


  // -----------------------------------------------
  // message object/string
  // -----------------------------------------------

  if (data.message) {

    if (typeof data.message === "string") {

      return data.message;

    }

    if (data.message.content) {

      return data.message.content;

    }

  }


  // -----------------------------------------------
  // response field
  // -----------------------------------------------

  if (data.response) {

    if (typeof data.response === "string") {
      return data.response;
    }

    if (data.response.output) {
      return data.response.output;
    }

  }


  return null;

}


// =====================================================
// SEND MESSAGE
// =====================================================

async function sendMessage() {

  const message =
    userInput.value.trim();


  // Don't send empty message
  if (!message) {
    return;
  }


  // Show user message
  addMessage(
    message,
    "user"
  );


  // Clear input
  userInput.value = "";


  // Show typing
  showTyping();


  try {

    console.log(
      "================================="
    );

    console.log(
      "SENDING MESSAGE TO N8N"
    );

    console.log(
      "Message:",
      message
    );

    console.log(
      "Session:",
      sessionId
    );

    console.log(
      "URL:",
      N8N_CHAT_URL
    );


    // =================================================
    // SEND REQUEST
    // =================================================

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


    console.log(
      "HTTP STATUS:",
      response.status
    );

    console.log(
      "HTTP OK:",
      response.ok
    );


    // =================================================
    // READ RESPONSE AS TEXT FIRST
    // =================================================

    const rawResponse =
      await response.text();


    console.log(
      "RAW N8N RESPONSE:",
      rawResponse
    );


    // =================================================
    // HTTP ERROR
    // =================================================

    if (!response.ok) {

      throw new Error(
        "n8n HTTP " +
        response.status +
        ": " +
        rawResponse
      );

    }


    // =================================================
    // EMPTY RESPONSE
    // =================================================

    if (!rawResponse.trim()) {

      removeTyping();

      addMessage(
        "⚠️ n8n received the message but returned an empty response.",
        "bot"
      );

      console.error(
        "EMPTY RESPONSE FROM N8N"
      );

      return;

    }


    // =================================================
    // TRY JSON
    // =================================================

    let data;

    try {

      data =
        JSON.parse(rawResponse);

    } catch (jsonError) {

      // n8n returned plain text
      data =
        rawResponse;

    }


    console.log(
      "PARSED N8N RESPONSE:",
      data
    );


    // =================================================
    // EXTRACT AI MESSAGE
    // =================================================

    const aiReply =
      extractAIResponse(data);


    removeTyping();


    // =================================================
    // SHOW AI RESPONSE
    // =================================================

    if (aiReply) {

      addMessage(
        aiReply,
        "bot"
      );

    } else {

      addMessage(
        "⚠️ n8n responded, but I couldn't find the AI response in the returned data.",
        "bot"
      );

      console.error(
        "UNKNOWN N8N RESPONSE FORMAT:",
        data
      );

    }


    console.log(
      "================================="
    );


  } catch (error) {

    removeTyping();


    console.error(
      "================================="
    );

    console.error(
      "CHATBOT ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );


    // =================================================
    // SHOW ACTUAL ERROR
    // =================================================

    addMessage(
      "⚠️ Chat error: " +
      error.message,
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

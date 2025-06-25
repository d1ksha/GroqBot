import openai
import gradio as gr


openai.api_key = "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"

messages = [{"role": "system", "content": "You are a helpful backup chatbot."}]

# Chatbot function
def chatbot(user_input, history):
    global messages
    messages.append({"role": "user", "content": user_input})

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # ✅ Use this model
            messages=messages,
            temperature=0.7
        )

        reply = response.choices[0].message.content.strip()
        messages.append({"role": "assistant", "content": reply})
        history.append((user_input, reply))
        return history, history

    except Exception as e:
        error_message = f"Error: {str(e)}"
        history.append((user_input, error_message))
        return history, history

# Reset the chat
def reset_chat():
    global messages
    messages = [{"role": "system", "content": "You are a helpful backup chatbot."}]
    return [], []

# Gradio UI
with gr.Blocks() as demo:
    gr.Markdown(
        "<h1 style='text-align: center; color: #6366f1;'>GPT-3.5 Backup Chatbot</h1>")

    chatbot_ui = gr.Chatbot(label="Chatbot")
    user_input = gr.Textbox(placeholder="Ask your question here...", label="Your Message")
    
    with gr.Row():
        send_button = gr.Button("Send")
        clear_button = gr.Button("Clear Chat")

    state = gr.State([])

    send_button.click(fn=chatbot, inputs=[user_input, state], outputs=[chatbot_ui, state])
    user_input.submit(fn=chatbot, inputs=[user_input, state], outputs=[chatbot_ui, state])
    clear_button.click(fn=reset_chat, outputs=[chatbot_ui, state])

demo.launch()

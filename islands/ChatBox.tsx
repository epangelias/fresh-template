import { useSignal } from '@preact/signals';
import { sendSSE, syncSSE, watchSSE } from '../lib/sse.ts';
import { AIMessage, ChatData } from '@/lib/types.ts';
import { useEffect, useRef } from 'preact/hooks';
import { useGlobal } from './Global.tsx';

function insertLoader(html?: string) {
  return html?.replace(/<\/([^>]+)>\n+$/, `&nbsp;&nbsp;<span class="loader"></span></$1>`);
}

const endpoint = '/api/chat';

export default function ChatBox({ data }: { data: ChatData }) {
  const global = useGlobal();
  const chatData = useSignal<ChatData>(data);
  const generating = useSignal(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  if (!global?.value.user) {
    return (
      <p>
        <a href='/user/signin'>Sign in</a> to chat
      </p>
    );
  }

  useEffect(() => syncSSE(endpoint, chatData), []);

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!global.value.user) return;

    if (global.value.user.tokens! <= 0 && !global.value.user.isSubscribed) {
      return alert('Your out of tokens now pay');
    }

    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('message') as HTMLInputElement;

    generating.value = true;
    chatData.value.messages.push({ role: 'user', content: input.value });
    chatData.value = { ...chatData.value };
    input.value = '';
    setTimeout(() => scrollToBottom());

    await sendSSE(endpoint, chatData.value);
    generateResponse();
  }

  function generateResponse() {
    const loader = '<span class="loader"></span>';

    const message: AIMessage = {
      role: 'assistant',
      content: '',
      html: loader,
    };

    chatData.value.messages.push(message);
    chatData.value = { ...chatData.value };
    generating.value = true;

    watchSSE(`${endpoint}?ai=1`, (newMessage: AIMessage) => {
      if (newMessage == null) return generating.value = false;
      message.content = newMessage.content;
      message.html = insertLoader(newMessage.html);
      chatData.value = { ...chatData.value };
      scrollToBottom();
    });
  }

  function scrollToBottom() {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
  }

  return (
    <div class='chat-box'>
      {!global.value.user?.isSubscribed && (
        <small class='text-center'>
          You have <b>{global.value.user?.tokens}</b>
          {global.value.user?.tokens == 1 ? ' token' : ' tokens'} left.
          {!global.value.user.hasVerifiedEmail && global.value.user.tokens! <= 0 &&
            (
              <p>
                <a href='/user/resend-email'>Verify your email</a> for more tokens.
              </p>
            )}
        </small>
      )}
      <div class='messages' ref={messagesRef}>
        {chatData.value.messages.map((message: AIMessage) => (
          <div
            data-role={message.role}
            dangerouslySetInnerHTML={message.html ? { __html: message.html } : undefined}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit}>
        <input type='text' autofocus name='message' required autocomplete='off' />
        <button disabled={generating.value}>➢</button>
      </form>
    </div>
  );
}

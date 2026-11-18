'use strict';

const form = document.querySelector('[data-contact-endpoint]');
if (form) {
  const ko = document.documentElement.lang === 'ko';
  const status = form.querySelector('[role="status"]');
  const button = form.querySelector('button[type="submit"]');
  const copy = ko ? {
    preview: '공개 홈페이지에서 보내실 수 있습니다.',
    sending: '보내는 중입니다…',
    success: '접수됐습니다. 작성하신 이메일로 답변드릴 수 있습니다.',
    rate: '잠시 후 다시 시도해 주세요.',
    fields: '이름, 이메일, 문의 내용을 확인해 주세요.',
    error: '접수를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  } : {
    preview: 'Submissions are available on the public website.',
    sending: 'Sending…',
    success: 'Your message was received. We may reply to the email address you provided.',
    rate: 'Please try again later.',
    fields: 'Please check your name, email address, and message.',
    error: 'We could not confirm receipt. Please try again in a moment.'
  };
  if (location.origin !== 'https://one1ab.github.io') {
    status.textContent = copy.preview;
  } else {
    let token;
    let previous;
    button.disabled = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const snapshot = JSON.stringify(data);
      if (snapshot !== previous) {
        token = crypto.randomUUID();
        previous = snapshot;
      }
      button.disabled = true;
      status.textContent = copy.sending;
      try {
        const response = await fetch(form.dataset.contactEndpoint, {
          method: 'POST',
          credentials: 'omit',
          headers: {'Content-Type': 'application/json', 'X-Requested-With': 'portal'},
          body: JSON.stringify({...data, token})
        });
        if (response.ok && (await response.json()).ok) {
          if (JSON.stringify(Object.fromEntries(new FormData(form))) === snapshot) form.reset();
          previous = undefined;
          status.textContent = copy.success;
        } else {
          status.textContent = response.status === 429 ? copy.rate :
            response.status === 400 ? copy.fields : copy.error;
        }
      } catch {
        status.textContent = copy.error;
      } finally {
        button.disabled = false;
      }
    });
  }
}

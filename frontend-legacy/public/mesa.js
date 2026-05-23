const params = new URLSearchParams(location.search);
const mesaInput = document.getElementById('mesaId');
const messagesEl = document.getElementById('messages');

if (params.get('id')) mesaInput.value = params.get('id');

function addMsg(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

document.getElementById('btnAbrirSessao').onclick = async () => {
  const id = mesaInput.value.trim();
  if (!id) return alert('Informe o ID da mesa');
  const res = await fetch(`/api/mesas/${id}/abrir-sessao`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) return alert(data.message || JSON.stringify(data));
  addMsg('assistant', 'Sessão aberta. Pode conversar com o assistente.');
};

document.getElementById('send').onclick = async () => {
  const id = mesaInput.value.trim();
  const texto = document.getElementById('input').value.trim();
  if (!id || !texto) return;
  addMsg('user', texto);
  document.getElementById('input').value = '';
  const res = await fetch(`/api/chat/${id}/mensagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensagem: texto }),
  });
  const data = await res.json();
  addMsg('assistant', data.resposta || data.message || JSON.stringify(data));
};

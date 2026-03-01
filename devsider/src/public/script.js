const form = document.getElementById("import-form");
const btnUpload = document.getElementById("btn-upload");
const fileInput = document.getElementById("csv-file");
const fileInfo = document.getElementById("file-info");
const btnSubmit = document.getElementById("btn-submit");
const formMessage = document.getElementById("form-message");
const emptyState = document.getElementById("empty-state");
const tableContainer = document.getElementById("table-container");
const previewTbody = document.getElementById("preview-tbody");

let csvContentPayload = ""; 
let parsedRows = []; 
let ignoredCount = 0; // Guarda a quantidade de linhas sem telefone

btnUpload.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // VALIDAÇÃO: só aceita CSV pela extensão
  if (!file.name.toLowerCase().endsWith(".csv")) {
    showError("Apenas arquivos CSV são permitidos.");
    fileInput.value = "";
    fileInfo.style.display = "none";
    return;
  }

  fileInfo.style.display = "block";
  fileInfo.textContent = `Arquivo selecionado: ${file.name} (${Math.round(file.size / 1024)} KB)`;
  formMessage.textContent = "";
  formMessage.style.color = "var(--danger)";

  const reader = new FileReader();
  reader.onload = (ev) => {
    processCSV(ev.target.result);
  };
  reader.readAsText(file);
});

function processCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    showError("O arquivo CSV está vazio.");
    return;
  }

  parsedRows = [];
  ignoredCount = 0; // Zera a contagem a cada novo arquivo
  let backendCsvContent = "nome;email;telefone\n"; 

  // Detecta delimitador com base na primeira linha
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Tenta usar cabeçalho para mapear colunas
  const headerCols = firstLine.split(delimiter).map(c => c.trim());
  const normalizedHeader = headerCols.map(h => h.toLowerCase());

  const findIndexByAliases = (aliases) => {
    return normalizedHeader.findIndex(h =>
      aliases.some(alias => h.includes(alias))
    );
  };

  // Possíveis nomes de coluna
  const nameIndexFromHeader = findIndexByAliases(["nome", "name", "contato", "cliente"]);
  const emailIndexFromHeader = findIndexByAliases(["email", "e-mail", "mail"]);
  const phoneIndexFromHeader = findIndexByAliases(["telefone", "fone", "phone", "celular", "whatsapp", "whats", "tel"]);

  let nameIndex = nameIndexFromHeader;
  let emailIndex = emailIndexFromHeader;
  let phoneIndex = phoneIndexFromHeader;

  let hasHeader = (nameIndexFromHeader !== -1) || (emailIndexFromHeader !== -1) || (phoneIndexFromHeader !== -1);
  let startIndex = 0;

  if (hasHeader) {
    // Se identificou pelo menos uma coluna por nome, considera que a primeira linha é cabeçalho
    startIndex = 1;
  } else {
    // FALLBACK: comportamento antigo, sem cabeçalho identificado
    const parts = firstLine.split(delimiter);
    const len = parts.length;

    if (len === 1) {
      // Só telefone
      nameIndex = -1;
      emailIndex = -1;
      phoneIndex = 0;
    } else if (len === 2) {
      // nome;telefone
      nameIndex = 0;
      emailIndex = -1;
      phoneIndex = 1;
    } else {
      // nome;email;telefone
      nameIndex = 0;
      emailIndex = 1;
      phoneIndex = 2;
    }

    startIndex = 0; // primeira linha já é dado
  }

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(delimiter);
    
    let nome = "";
    let email = "";
    let telefone = "";

    if (nameIndex >= 0 && parts[nameIndex] !== undefined) {
      nome = (parts[nameIndex] || "").trim();
    }

    if (emailIndex >= 0 && parts[emailIndex] !== undefined) {
      email = (parts[emailIndex] || "").trim();
    }

    if (phoneIndex >= 0 && parts[phoneIndex] !== undefined) {
      telefone = (parts[phoneIndex] || "").trim();
    }

    // Se por algum motivo não achou índice de telefone, tenta fallback final
    if (!telefone) {
      // Tenta achar algo que pareça telefone na linha, como último campo
      const last = parts[parts.length - 1] || "";
      if (!telefone && last && last.length >= 8) {
        telefone = last.trim();
      }
    }

    if (telefone) {
      parsedRows.push({ nome, email, telefone });
      backendCsvContent += `${nome};${email};${telefone}\n`;
    } else {
      ignoredCount++;
    }
  }

  csvContentPayload = backendCsvContent;

  if (parsedRows.length > 0) {
    renderPreview();
    btnSubmit.disabled = false;
    
    if (ignoredCount > 0) {
       formMessage.style.color = "var(--danger)";
       formMessage.textContent = `Atenção: ${ignoredCount} linha(s) sem telefone encontrada(s).`;
    }
  } else {
    showError("Nenhum contato com telefone foi encontrado no arquivo.");
    btnSubmit.disabled = true;
  }
}

function renderPreview() {
  emptyState.style.display = "none";
  tableContainer.style.display = "block";
  previewTbody.innerHTML = "";

  const rowsToShow = parsedRows.slice(0, 30);

  rowsToShow.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">${row.nome || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">${row.email || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">${row.telefone}</td>
    `;
    previewTbody.appendChild(tr);
  });

  if (parsedRows.length > 30) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3" style="text-align: center; padding: 15px; color: var(--accent-2); font-weight: bold;">+ ${parsedRows.length - 30} contatos ocultos na visualização...</td>`;
    previewTbody.appendChild(tr);
  }
}

function showError(msg) {
  formMessage.textContent = msg;
  formMessage.style.color = "var(--danger)";
  emptyState.style.display = "block";
  tableContainer.style.display = "none";
  btnSubmit.disabled = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const listName = document.getElementById("list-name").value.trim();
  if (!listName || !csvContentPayload) return;

  // VERIFICAÇÃO: Se houver telefones vazios, emite o alerta confirmando o envio
  if (ignoredCount > 0) {
    const userWantsToProceed = confirm(`Aviso: Encontramos ${ignoredCount} linha(s) sem telefone. Elas serão ignoradas. Deseja criar a lista apenas com os dados válidos?`);
    if (!userWantsToProceed) {
      return; // Interrompe o envio se o usuário clicar em "Cancelar"
    }
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Processando...";
  formMessage.textContent = "";

  try {
    const resLista = await fetch("/api/listas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: listName })
    });

    if (!resLista.ok) throw new Error("Erro ao criar a lista. Verifique se a API está rodando.");
    const listaData = await resLista.json();
    const listaId = listaData.id;

    const resImport = await fetch(`/api/listas/${listaId}/importar-csv`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvContentPayload })
    });

    if (!resImport.ok) throw new Error("Erro ao importar contatos para o banco de dados.");
    const importData = await resImport.json();

    formMessage.style.color = "var(--accent-2)";
    formMessage.textContent = `Sucesso! Lista criada. ${importData.importados} importados e ${importData.ignorados || ignoredCount} ignorados.`;
    
    setTimeout(() => {
      form.reset();
      emptyState.style.display = "block";
      tableContainer.style.display = "none";
      fileInfo.style.display = "none";
      btnSubmit.textContent = "Criar e Importar";
      parsedRows = [];
      ignoredCount = 0;
      csvContentPayload = "";
      formMessage.textContent = "";
    }, 4000);

  } catch (err) {
    showError(err.message);
    btnSubmit.textContent = "Criar e Importar";
    btnSubmit.disabled = false;
  }
});
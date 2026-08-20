"use strict";

const STAGES = ["Prospect", "Contacted", "Meeting", "Proposal", "Closed"];
const STORAGE_KEY = "pipeline.deals.v1";

const DEMO_DEALS = [
  { company: "Acme Logistics", contact: "Dana Whitfield", value: 12000, stage: "Prospect", notes: "Found via trade show list. Fleet of 40 vans." },
  { company: "Bluegrass Medical Group", contact: "Sam Ortega", value: 28500, stage: "Contacted", notes: "Replied to second email. Asked for pricing overview." },
  { company: "Peachtree Catering Co.", contact: "Renee Alvarez", value: 9800, stage: "Contacted", notes: "Cold call went well. Books vendors in Q4." },
  { company: "Ironclad Storage", contact: "Marcus Bell", value: 22000, stage: "Meeting", notes: "Demo scheduled Thursday 10am. Bring ROI sheet." },
  { company: "Savannah Tours LLC", contact: "Priya Nair", value: 15400, stage: "Proposal", notes: "Proposal sent 8/12. Follow up if quiet by Friday." },
  { company: "Copperline Builders", contact: "Joe Tran", value: 31000, stage: "Closed", notes: "Signed. Kickoff next month — ask for referral." }
];

let deals = load();

// --- Persistence ---

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupted storage — fall through to demo data */ }
  return seedDemo();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

function seedDemo() {
  return DEMO_DEALS.map((d, i) => ({ ...d, id: "demo-" + i }));
}

// --- Rendering ---

const board = document.getElementById("board");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function render() {
  board.innerHTML = "";

  STAGES.forEach((stage) => {
    const column = document.createElement("section");
    column.className = "column";
    column.dataset.stage = stage;

    const inStage = deals.filter((d) => d.stage === stage);
    const sum = inStage.reduce((t, d) => t + (Number(d.value) || 0), 0);

    const head = document.createElement("div");
    head.className = "column-head";
    head.innerHTML =
      '<span class="column-title">' + stage +
      ' <span class="count">' + inStage.length + "</span></span>" +
      '<span class="column-sum">' + (sum ? money.format(sum) : "") + "</span>";
    column.appendChild(head);

    if (inStage.length === 0) {
      const empty = document.createElement("p");
      empty.className = "column-empty";
      empty.textContent = "Drop deals here";
      column.appendChild(empty);
    }

    inStage.forEach((deal) => column.appendChild(renderCard(deal)));

    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      const deal = deals.find((d) => d.id === id);
      if (deal && deal.stage !== stage) {
        deal.stage = stage;
        save();
        render();
      }
    });

    board.appendChild(column);
  });

  const total = deals.reduce((t, d) => t + (Number(d.value) || 0), 0);
  document.getElementById("pipelineTotal").innerHTML =
    deals.length + " deals · <strong>" + money.format(total) + "</strong>";
}

function renderCard(deal) {
  const card = document.createElement("article");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = deal.id;

  const top = document.createElement("div");
  top.className = "card-top";

  const company = document.createElement("span");
  company.className = "card-company";
  company.textContent = deal.company;
  top.appendChild(company);

  if (Number(deal.value) > 0) {
    const value = document.createElement("span");
    value.className = "card-value";
    value.textContent = money.format(Number(deal.value));
    top.appendChild(value);
  }
  card.appendChild(top);

  if (deal.contact) {
    const contact = document.createElement("p");
    contact.className = "card-contact";
    contact.textContent = deal.contact;
    card.appendChild(contact);
  }

  if (deal.notes) {
    const notes = document.createElement("p");
    notes.className = "card-notes";
    notes.textContent = deal.notes;
    card.appendChild(notes);
  }

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", deal.id);
    e.dataTransfer.effectAllowed = "move";
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));
  card.addEventListener("click", () => openDialog(deal));

  return card;
}

// --- Dialog (add / edit) ---

const dialog = document.getElementById("dealDialog");
const form = document.getElementById("dealForm");
const stageSelect = document.getElementById("stageSelect");
const deleteBtn = document.getElementById("deleteBtn");
let editingId = null;

STAGES.forEach((s) => {
  const opt = document.createElement("option");
  opt.value = s;
  opt.textContent = s;
  stageSelect.appendChild(opt);
});

function openDialog(deal) {
  editingId = deal ? deal.id : null;
  document.getElementById("dialogTitle").textContent = deal ? "Edit deal" : "New deal";
  deleteBtn.hidden = !deal;
  form.company.value = deal ? deal.company : "";
  form.contact.value = deal ? deal.contact || "" : "";
  form.value.value = deal && deal.value ? deal.value : "";
  form.stage.value = deal ? deal.stage : STAGES[0];
  form.notes.value = deal ? deal.notes || "" : "";
  dialog.showModal();
  form.company.focus();
}

form.addEventListener("submit", () => {
  const data = {
    company: form.company.value.trim(),
    contact: form.contact.value.trim(),
    value: Number(form.value.value) || 0,
    stage: form.stage.value,
    notes: form.notes.value.trim()
  };
  if (!data.company) return;

  if (editingId) {
    const deal = deals.find((d) => d.id === editingId);
    Object.assign(deal, data);
  } else {
    deals.push({ ...data, id: crypto.randomUUID() });
  }
  save();
  render();
});

deleteBtn.addEventListener("click", () => {
  deals = deals.filter((d) => d.id !== editingId);
  save();
  render();
  dialog.close();
});

document.getElementById("cancelBtn").addEventListener("click", () => dialog.close());
document.getElementById("addDealBtn").addEventListener("click", () => openDialog(null));

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Replace the current board with the demo data?")) {
    deals = seedDemo();
    save();
    render();
  }
});

render();

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="codigo-overlay" @click.self="fechar">
      <section
        class="codigo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="codigo-titulo"
      >
        <header class="codigo-header">
          <div class="codigo-heading">
            <span class="codigo-eyebrow">PRIMEIRO ACESSO</span>
            <h3 id="codigo-titulo">Código de primeiro acesso</h3>
            <p>
              Repasse o código abaixo para <strong>{{ nome }}</strong
              >.
            </p>
          </div>
          <button class="codigo-close" type="button" aria-label="Fechar" @click="fechar">
            <i class="pi pi-times"></i>
          </button>
        </header>

        <div class="codigo-body">
          <div class="codigo-box">
            <span class="codigo-valor">{{ codigo }}</span>
            <button class="btn-copiar" type="button" @click="copiar">
              <i :class="copiado ? 'pi pi-check' : 'pi pi-copy'"></i>
              {{ copiado ? "Copiado" : "Copiar" }}
            </button>
          </div>

          <p v-if="erroCopia" class="codigo-erro">
            Não foi possível copiar automaticamente. Selecione o código e copie
            manualmente.
          </p>

          <div class="codigo-aviso">
            <i class="pi pi-exclamation-triangle"></i>
            <p>
              Este código é exibido somente agora e não pode ser consultado depois. Se for
              perdido ou expirar, gere um novo código.
            </p>
          </div>

          <div class="codigo-info">
            <div class="info-item">
              <span>Válido até</span>
              <strong>{{ expiraEmFormatado }}</strong>
            </div>
            <div class="info-item">
              <span>Como usar</span>
              <strong>
                Na tela de login, o colaborador escolhe "Primeiro acesso de colaborador" e
                informa CPF, código e a nova senha.
              </strong>
            </div>
          </div>
        </div>

        <footer class="codigo-footer">
          <button class="btn-concluir" type="button" @click="fechar">Concluir</button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from "vue";
import { formatarDataHora } from "@/utils/datas";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  nome: {
    type: String,
    default: "",
  },
  codigo: {
    type: String,
    default: "",
  },
  expiraEm: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

const copiado = ref(false);
const erroCopia = ref(false);
let copiadoTimeout;

const expiraEmFormatado = computed(() =>
  props.expiraEm ? formatarDataHora(props.expiraEm) : "Indisponível"
);

watch(
  () => props.isOpen,
  (aberto) => {
    if (aberto) {
      copiado.value = false;
      erroCopia.value = false;
    }
  }
);

async function copiar() {
  if (copiadoTimeout) clearTimeout(copiadoTimeout);

  try {
    await navigator.clipboard.writeText(props.codigo);
    copiado.value = true;
    erroCopia.value = false;
    copiadoTimeout = setTimeout(() => {
      copiado.value = false;
    }, 2500);
  } catch {
    copiado.value = false;
    erroCopia.value = true;
  }
}

function fechar() {
  emit("close");
}

onUnmounted(() => {
  if (copiadoTimeout) clearTimeout(copiadoTimeout);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.codigo-overlay {
  position: fixed;
  inset: 0;
  padding: 16px;
  box-sizing: border-box;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
  font-family: "Inter", sans-serif;
}
.codigo-modal {
  background-color: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
}
.codigo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
}
.codigo-heading {
  min-width: 0;
}
.codigo-eyebrow {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #2dd4bf;
}
.codigo-header h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.4;
  font-weight: 600;
  color: #fff;
}
.codigo-header p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
}
.codigo-header p strong {
  color: #e2e8f0;
  font-weight: 600;
}
.codigo-close {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.codigo-close:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}
.codigo-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
.codigo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px dashed var(--cor-primaria, #1ca4a7);
  border-radius: 14px;
  background: #f0fdfa;
}
.codigo-valor {
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #0f766e;
  user-select: all;
  overflow-wrap: anywhere;
}
.btn-copiar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #99f6e4;
  border-radius: 12px;
  background: #fff;
  color: #0f766e;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-copiar:hover {
  background: #f0fdfa;
  border-color: var(--cor-primaria, #1ca4a7);
  transform: translateY(-1px);
}
.codigo-erro {
  margin: 0;
  font-size: 11px;
  color: #ef4444;
}
.codigo-aviso {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #fde68a;
  border-radius: 12px;
  background: #fffbeb;
  color: #92400e;
}
.codigo-aviso i {
  margin-top: 2px;
}
.codigo-aviso p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
}
.codigo-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-item + .info-item {
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}
.info-item span {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.info-item strong {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.codigo-footer {
  display: flex;
  justify-content: flex-end;
  padding: 18px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}
.btn-concluir {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 22px;
  border-radius: 12px;
  border: none;
  background-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-concluir:hover {
  background-color: #158a8d;
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
  transform: translateY(-2px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .codigo-overlay {
    padding: 8px;
  }
  .codigo-header,
  .codigo-body {
    padding: 18px;
  }
  .codigo-footer {
    padding: 16px 18px;
  }
}
@media (max-width: 520px) {
  .codigo-box {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  .codigo-valor {
    font-size: 1.35rem;
  }
  .btn-copiar {
    justify-content: center;
  }
  .btn-concluir {
    width: 100%;
  }
}
</style>

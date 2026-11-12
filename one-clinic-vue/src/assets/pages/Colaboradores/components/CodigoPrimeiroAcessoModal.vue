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
  padding: 1rem;
  background-color: rgb(15 23 42 / 45%);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
  font-family: "Inter", sans-serif;
}

.codigo-modal {
  background-color: #fff;
  border: 1px solid rgb(226 232 240 / 85%);
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 60px -15px rgb(15 23 42 / 30%);
  overflow: hidden;
  max-height: min(90vh, 700px);
  display: flex;
  flex-direction: column;
}

.codigo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.6rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%);
  border-bottom: 1px solid #e2e8f0;
}

.codigo-heading {
  min-width: 0;
}

.codigo-eyebrow {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #0f999b;
}

.codigo-header h3 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 600;
  color: #1e293b;
}

.codigo-header p {
  margin: 0.4rem 0 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #64748b;
}

.codigo-close {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.codigo-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.codigo-body {
  padding: 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.codigo-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  border: 1px dashed #1ca4a7;
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
  gap: 0.45rem;
  flex-shrink: 0;
  height: 38px;
  padding: 0 1rem;
  border: 1px solid #ccfbf1;
  border-radius: 10px;
  background: #fff;
  color: #0f766e;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn-copiar:hover {
  background: #f0fdfa;
  border-color: #1ca4a7;
}

.codigo-erro {
  margin: 0;
  font-size: 0.78rem;
  color: #b91c1c;
}

.codigo-aviso {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border: 1px solid #fde68a;
  border-radius: 10px;
  background: #fffbeb;
  color: #92400e;
}

.codigo-aviso i {
  margin-top: 0.1rem;
}

.codigo-aviso p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.55;
}

.codigo-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item span {
  color: #94a3b8;
  font-size: 0.73rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-item strong {
  color: #334155;
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1.5;
}

.codigo-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.6rem 1.4rem;
  border-top: 1px solid #e2e8f0;
}

.btn-concluir {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.4rem;
  border-radius: 10px;
  border: 1px solid #1ca4a7;
  background-color: #1ca4a7;
  color: #fff;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.22s ease, transform 0.22s ease;
}

.btn-concluir:hover {
  background-color: #158a8d;
  border-color: #158a8d;
  transform: translateY(-1px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
